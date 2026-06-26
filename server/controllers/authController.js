import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// ✅ Create transporter ONCE at module level (not per-request)
// This avoids re-creating the SMTP connection on every forgot-password call
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',   // Explicit host instead of service:'gmail' — more reliable on Render
    port: 587,
    secure: false,             // SSL on port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    family:4,
    tls: {
      rejectUnauthorized: false, // Prevents TLS cert errors on Render
    },
    // ✅ Generous timeouts to survive Render cold starts
    connectionTimeout: 30000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
  });

  return transporter;
};

export const forgotPassword = async (req, res) => {
  // ✅ Set a hard timeout so Render never hangs past 45 seconds
  const TIMEOUT_MS = 40000;
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('EMAIL_TIMEOUT')), TIMEOUT_MS)
  );

  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // ✅ Always return 200 — don't reveal if email exists
    if (!user) {
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"MployNow" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Reset your MployNow password',
      html: `
        <div style="background:#020817;padding:40px;font-family:Arial,sans-serif;color:white;max-width:600px;margin:0 auto;border-radius:16px;">
          <h2 style="color:#60a5fa;margin-top:0;">Reset Your Password</h2>
          <p style="color:#cbd5e1;">Click the button below to reset your MployNow password. This link expires in <strong>30 minutes</strong>.</p>
          <a href="${resetUrl}"
            style="display:inline-block;margin-top:16px;padding:14px 28px;background:linear-gradient(135deg,#3b82f6,#7c3aed);color:white;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;">
            Reset Password
          </a>
          <p style="margin-top:24px;color:#64748b;font-size:12px;">
            Or copy and paste this link:<br/>
            <a href="${resetUrl}" style="color:#60a5fa;word-break:break-all;">${resetUrl}</a>
          </p>
          <p style="margin-top:16px;color:#475569;font-size:12px;border-top:1px solid #1e293b;padding-top:16px;">
            If you didn't request this, you can safely ignore this email. Your password won't change.
          </p>
        </div>
      `,
    };

    // ✅ Race against timeout so the request never hangs forever
    await Promise.race([
      getTransporter().sendMail(mailOptions),
      timeoutPromise,
    ]);

    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });

  } catch (error) {
    console.error('Forgot password error:', error.message);

    // ✅ Reset cached transporter on auth/connection errors so next request retries fresh
    if (
      error.message?.includes('Invalid login') ||
      error.message?.includes('Username and Password not accepted') ||
      error.message?.includes('BadCredentials') ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('ETIMEDOUT') ||
      error.message?.includes('ENOTFOUND') ||
      error.message === 'EMAIL_TIMEOUT'
    ) {
      transporter = null; // Force re-create on next attempt
    }

    if (
      error.message?.includes('Invalid login') ||
      error.message?.includes('Username and Password not accepted') ||
      error.message?.includes('BadCredentials')
    ) {
      return res.status(500).json({
        message: 'Email service configuration error. Please contact support.',
      });
    }

    if (error.message === 'EMAIL_TIMEOUT') {
      return res.status(500).json({
        message: 'Email service timed out. Please try again in a moment.',
      });
    }

    if (
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('ETIMEDOUT') ||
      error.message?.includes('ENOTFOUND')
    ) {
      return res.status(500).json({
        message: 'Could not connect to email service. Please try again shortly.',
      });
    }

    return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully! You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Failed to reset password. Please try again.' });
  }
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const userFields =
  '_id name email role profilePicture bio skills resume company location website linkedin github experience education createdAt';

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword, role });
    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const fullUser = await User.findById(user._id).select(userFields);
    res.status(201).json({ success: true, user: fullUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const fullUser = await User.findById(user._id).select(userFields);
    res.status(200).json({ success: true, user: fullUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 0,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(userFields);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      name, bio, skills, company, location,
      website, linkedin, github, experience,
      education, profilePicture, resume,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          name, bio, skills, company, location,
          website, linkedin, github, experience,
          education, profilePicture, resume,
        },
      },
      { returnDocument: 'after', runValidators: true }
    ).select(userFields);

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};