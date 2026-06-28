import { Resend } from 'resend';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save();

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const { error } = await resend.emails.send({
      from: 'MployNow <noreply@mploynow.abrdns.com>',
      to: user.email,
      subject: '🔐 Reset your MployNow password',
      html: `
        <div style="background:#020817;padding:40px;font-family:Arial,sans-serif;color:white;max-width:600px;margin:0 auto;border-radius:16px;">
          <h2 style="color:white;margin-top:0;">Mploy<span style="color:#60a5fa;">Now</span></h2>
          <h3 style="color:white;">Reset Your Password</h3>
          <p style="color:#94a3b8;">Hi <strong style="color:white;">${user.name}</strong>, click the button below to reset your MployNow password. This link expires in <strong style="color:#60a5fa;">30 minutes</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#3b82f6,#7c3aed);color:white;text-decoration:none;border-radius:8px;font-weight:bold;margin-top:16px;font-size:15px;">Reset Password →</a>
          <p style="margin-top:24px;color:#64748b;font-size:12px;">Or copy this link:<br/><a href="${resetUrl}" style="color:#60a5fa;word-break:break-all;">${resetUrl}</a></p>
          <p style="color:#475569;font-size:12px;margin-top:16px;border-top:1px solid #1e293b;padding-top:16px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }

    console.log(`✅ Password reset email sent to: ${user.email}`);
    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });

  } catch (error) {
    console.error('Forgot password error:', error.message);
    return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const userFields = '_id name email role profilePicture bio skills resume company location website linkedin github experience education createdAt';

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
      maxAge: 7 * 24 * 60 * 60 * 1000
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
      maxAge: 7 * 24 * 60 * 60 * 1000
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
    maxAge: 0
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
      education, profilePicture, resume
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          name, bio, skills, company, location,
          website, linkedin, github, experience,
          education, profilePicture, resume
        }
      },
      { returnDocument: 'after', runValidators: true }
    ).select(userFields);

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};