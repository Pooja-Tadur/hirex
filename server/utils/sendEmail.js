import nodemailer from 'nodemailer';

const statusMessages = {
  'Reviewed': {
    subject: 'Your application is being reviewed! 👀',
    color: '#3b82f6',
    emoji: '👀',
    message: 'Great news! A recruiter is currently reviewing your application.',
    subtext: 'They are looking at your profile and resume. Stay tuned!'
  },
  'Shortlisted': {
    subject: 'Congratulations! You have been shortlisted! 🎉',
    color: '#22c55e',
    emoji: '🎉',
    message: 'Excellent news! You have been shortlisted for this position!',
    subtext: 'The recruiter was impressed with your profile. Expect to hear from them soon for next steps.'
  },
  'Rejected': {
    subject: 'Application Update — JobPortal',
    color: '#ef4444',
    emoji: '📋',
    message: 'Thank you for your interest in this position.',
    subtext: 'Unfortunately, the recruiter has decided to move forward with other candidates. Keep applying!'
  }
};

export const sendStatusEmail = async (applicantEmail, applicantName, jobTitle, company, status) => {
  const info = statusMessages[status];
  if (!info) return;

  console.log('Sending email to:', applicantEmail);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

        <div style="background:linear-gradient(135deg,#1e3a5f,#2d1b69);border-radius:16px 16px 0 0;padding:40px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:28px;font-weight:800;">
            Job<span style="color:#60a5fa;">Portal</span>
          </h1>
          <p style="color:rgba(255,255,255,0.6);margin:8px 0 0;font-size:14px;">Your Career Platform</p>
        </div>

        <div style="background:#111827;padding:30px;text-align:center;border-left:1px solid rgba(255,255,255,0.08);border-right:1px solid rgba(255,255,255,0.08);">
          <div style="display:inline-block;background:${info.color}20;border:1px solid ${info.color}40;border-radius:50px;padding:10px 24px;margin-bottom:20px;">
            <span style="color:${info.color};font-weight:700;font-size:16px;">${info.emoji} ${status}</span>
          </div>
          <h2 style="color:white;margin:0 0 10px;font-size:24px;font-weight:700;">Hi ${applicantName}!</h2>
          <p style="color:#94a3b8;margin:0;font-size:16px;">${info.message}</p>
        </div>

        <div style="background:#1a2234;padding:24px 30px;border-left:1px solid rgba(255,255,255,0.08);border-right:1px solid rgba(255,255,255,0.08);">
          <div style="background:#0f172a;border-radius:12px;padding:20px;border:1px solid rgba(255,255,255,0.06);">
            <p style="color:#64748b;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Application Details</p>
            <h3 style="color:white;margin:0 0 6px;font-size:20px;font-weight:700;">${jobTitle}</h3>
            <p style="color:#60a5fa;margin:0;font-size:15px;font-weight:600;">${company}</p>
          </div>
          <p style="color:#94a3b8;margin:20px 0 0;font-size:14px;line-height:1.7;">${info.subtext}</p>
        </div>

        <div style="background:#111827;padding:30px;text-align:center;border-left:1px solid rgba(255,255,255,0.08);border-right:1px solid rgba(255,255,255,0.08);">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard"
            style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#7c3aed);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;">
            View My Applications →
          </a>
        </div>

        <div style="background:#0a0f1a;border-radius:0 0 16px 16px;padding:24px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
          <p style="color:#475569;font-size:13px;margin:0;">
            You received this email because you applied for a job on JobPortal.<br/>
            © 2025 HireX. All rights reserved.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: '"HireX" <' + process.env.EMAIL_USER + '>',
    to: applicantEmail,
    subject: info.subject,
    html
  });

  console.log('✅ Email sent to:', applicantEmail);
};