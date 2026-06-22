import User from '../models/User.js';
import Job from '../models/Job.js';
import { generateText } from '../services/aiService.js';
import { createRequire } from 'module';
import { createWorker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import mammoth from 'mammoth';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// Extract text from any PDF — text-based first, OCR fallback
const extractTextFromPDF = async (buffer) => {
  // Step 1: Try normal text extraction
  try {
    const data = await pdfParse(buffer);
    const text = data.text?.trim();
    if (text && text.length > 50) {
      console.log('✅ Text extracted directly, length:', text.length);
      return text;
    }
  } catch (e) {
    console.log('Direct parse failed:', e.message);
  }

  // Step 2: OCR fallback using tesseract on raw buffer
  console.log('🔍 Falling back to OCR...');
  try {
    // Save buffer to temp file
    const tmpDir = os.tmpdir();
    const tmpPdf = path.join(tmpDir, `resume_${Date.now()}.pdf`);
    const tmpPng = path.join(tmpDir, `resume_${Date.now()}.png`);
    fs.writeFileSync(tmpPdf, buffer);

    // Convert PDF to image using pdf-poppler
    const poppler = require('pdf-poppler');
    const opts = {
      format: 'png',
      out_dir: tmpDir,
      out_prefix: path.basename(tmpPng, '.png'),
      page: 1,
      scale: 2048,
    };

    await poppler.convert(tmpPdf, opts);

    // Find the generated image
    const files = fs.readdirSync(tmpDir).filter(f =>
      f.startsWith(path.basename(tmpPng, '.png')) && f.endsWith('.png')
    );

    if (files.length === 0) throw new Error('No image generated from PDF');

    const imagePath = path.join(tmpDir, files[0]);

    // Run OCR
    const worker = await createWorker('eng');
    const { data } = await worker.recognize(imagePath);
    await worker.terminate();

    // Cleanup temp files
    try { fs.unlinkSync(tmpPdf); } catch {}
    try { fs.unlinkSync(imagePath); } catch {}

    const text = data.text?.trim();
    console.log('✅ OCR text length:', text?.length);
    return text || '';
  } catch (ocrErr) {
    console.error('OCR failed:', ocrErr.message);
    return '';
  }
};

const extractDriveFileId = (url) => {
  if (!url || !url.includes('drive.google.com')) return null;
  let match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return null;
};

const isHtmlBuffer = (buffer, contentType) => {
  return (
    contentType.includes('text/html') ||
    buffer.slice(0, 30).toString().toLowerCase().includes('<!doctype') ||
    buffer.slice(0, 30).toString().toLowerCase().includes('<html')
  );
};

const extractTextFromResume = async (buffer, resumeUrl, contentType) => {
  const urlLower = (resumeUrl || '').toLowerCase();
  const ct = (contentType || '').toLowerCase();
  const isDocx = urlLower.endsWith('.docx') || ct.includes('officedocument.wordprocessingml');

  if (isDocx) {
    console.log('📄 Detected DOCX file');
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value?.trim();
      if (text && text.length > 50) {
        console.log('✅ DOCX text extracted, length:', text.length);
        return text;
      }
    } catch (e) {
      console.log('DOCX parse failed:', e.message);
    }
    return '';
  }

  // Default: treat as PDF (handles both text PDFs and scanned PDFs via OCR)
  return await extractTextFromPDF(buffer);
};

export const gradeResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);
    if (!user?.resume) {
      return res.status(400).json({
        message: 'No resume found. Please upload a PDF resume from your Profile page.'
      });
    }

    let buffer;
    try {
      const { buffer, contentType } = await fetchResumeBuffer(user.resume);
    } catch (fetchErr) {
      if (fetchErr.message === 'GOT_HTML' || fetchErr.message === 'INVALID_DRIVE_URL') {
        return res.status(400).json({
          message: '❌ Could not access your resume. Please upload your resume as a PDF directly from Profile page.'
        });
      }
      return res.status(400).json({
        message: 'Could not fetch your resume. Please re-upload from Profile page.'
      });
    }

    const resumeText = await extractTextFromResume(buffer, user.resume, contentType);

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        message: '❌ Could not extract text from your resume even with OCR. Please ensure your PDF is not password-protected and re-upload.'
      });
    }

    const prompt = `You are an expert ATS resume reviewer for tech job seekers in India.
Analyze this resume and respond ONLY in valid JSON, no markdown, no extra text:
{
  "score": <number 0-100>,
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "missingKeywords": ["...", "...", "..."],
  "summary": "<one paragraph overall verdict>"
}

Resume text:
"""
${resumeText.slice(0, 6000)}
"""`;

    const aiResponse = await generateText(prompt);
    const cleaned = aiResponse.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    res.json({ result: parsed });
  } catch (err) {
    console.error('Resume grading error:', err.message);
    res.status(500).json({ message: 'Failed to grade resume. Please try again.' });
  }
};

export const semanticMatch = async (req, res) => {
  try {
    const { jobId } = req.body;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const user = await User.findById(req.user.id || req.user._id);

    const prompt = `You are a career advisor AI. Assess this candidate's fit for this job — consider transferable skills and experience level, not just keyword overlap.

Job Title: ${job.title}
Company: ${job.company}
Required Skills: ${job.skills.join(', ')}
Experience Required: ${job.experience}
Description: ${job.description}

Candidate Skills: ${(user.skills || []).join(', ') || 'Not specified'}
Candidate Experience: ${user.experience || 'Not specified'}
Candidate Bio: ${user.bio || 'Not specified'}

Respond ONLY in valid JSON, no markdown:
{
  "fitScore": <number 0-100>,
  "verdict": "<one sentence verdict>",
  "reasoning": "<2-3 sentence explanation>",
  "suggestion": "<one actionable tip>"
}`;

    const aiResponse = await generateText(prompt);
    const cleaned = aiResponse.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    res.json({ result: parsed });
  } catch (err) {
    console.error('Semantic match error:', err.message);
    res.status(500).json({ message: 'Failed to generate AI insight.' });
  }
};

export const chatReply = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

    const historyText = (history || []).slice(-6)
      .map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');

    const prompt = `You are HireX Assistant, a friendly career & job-search helper inside a job portal called HireX. Help with resume tips, interview prep, and job search strategy. Keep replies short (2-4 sentences) and practical. Don't invent specific job listings you don't have.

${historyText ? 'Conversation so far:\n' + historyText + '\n' : ''}
User: ${message}
Assistant:`;

    const aiResponse = await generateText(prompt);
    res.json({ reply: aiResponse.trim() });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ message: 'AI assistant unavailable right now.' });
  }
};
export const interviewPrep = async (req, res) => {
  try {
    const { jobId } = req.body;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const user = await User.findById(req.user.id || req.user._id);

    const prompt = `You are a senior technical interviewer preparing a candidate for a real interview.

Job Title: ${job.title}
Company: ${job.company}
Required Skills: ${job.skills.join(', ')}
Experience Level: ${job.experience}
Job Description: ${job.description}

Candidate's Skills: ${(user.skills || []).join(', ') || 'Not specified'}
Candidate's Experience: ${user.experience || 'Not specified'}

Generate exactly 5 likely interview questions for this specific role — mix of technical and behavioral, tailored to the required skills and experience level. For each question, give a concise model answer outline (not a full essay, just key points a strong candidate would cover).

Respond ONLY in valid JSON, no markdown:
{
  "questions": [
    {
      "question": "...",
      "type": "Technical" or "Behavioral",
      "modelAnswer": "2-3 sentence outline of key points to cover"
    }
  ],
  "generalTip": "one practical tip specific to this role/company"
}`;

    const aiResponse = await generateText(prompt);
    const cleaned = aiResponse.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    res.json({ result: parsed });
  } catch (err) {
    console.error('Interview prep error:', err.message);
    res.status(500).json({ message: 'Failed to generate interview prep. Please try again.' });
  }
};