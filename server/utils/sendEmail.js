import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const statusMessages = {
  'Reviewed': {
    subject: 'Your application is being reviewed! 👀',
    color: '#3b82f6', emoji: '👀',
    message: 'Great news! A recruiter is currently reviewing your application.',
    subtext: 'They are looking at your profile and resume. Stay tuned!'
  },
  'Shortlisted': {
    subject: 'Congratulations! You have been shortlisted! 🎉',
    color: '#22c55e', emoji: '🎉',
    message: 'Excellent news! You have been shortlisted for this position!',
    subtext: 'The recruiter was impressed with your profile. Expect to hear from them soon.'
  },
  'Rejected': {
    subject: 'Application Update — MployNow',
    color: '#ef4444', emoji: '📋',
    message: 'Thank you for your interest in this position.',
    subtext: 'Unfortunately, the recruiter has decided to move forward with other candidates. Keep applying!'
  }
};

export const sendStatusEmail = async (applicantEmail, applicantName, jobTitle, company, status) => {
  const info = statusMessages[status];
  if (!info) return;

  try {
    await resend.emails.send({
      from: 'MployNow <onboarding@resend.dev>',
      to: applicantEmail,
      subject: info.subject,
      html: `
        <div style="background:#0f172a;padding:40px;font-family:sans-serif;color:white;max-width:600px;margin:0 auto;">
          <h1 style="color:white;">Mploy<span style="color:#60a5fa;">Now</span></h1>
          <div style="background:#1e293b;border-radius:12px;padding:24px;margin-top:20px;">
            <h2 style="color:${info.color};">${info.emoji} ${status}</h2>
            <p>Hi ${applicantName}!</p>
            <p>${info.message}</p>
            <div style="background:#0f172a;border-radius:8px;padding:16px;margin:16px 0;">
              <h3 style="color:white;margin:0;">${jobTitle}</h3>
              <p style="color:#60a5fa;margin:4px 0;">${company}</p>
            </div>
            <p style="color:#94a3b8;">${info.subtext}</p>
            <a href="${process.env.FRONTEND_URL}/dashboard"
              style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#3b82f6,#7c3aed);color:white;text-decoration:none;border-radius:8px;font-weight:bold;margin-top:16px;">
              View My Applications →
            </a>
          </div>
          <p style="color:#475569;font-size:12px;margin-top:20px;">© 2025 MployNow. All rights reserved.</p>
        </div>
      `
    });
    console.log('✅ Email sent to:', applicantEmail);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};