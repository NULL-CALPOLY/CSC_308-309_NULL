import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import userModel from './UserSchema.js';

const router = express.Router();

const resetTokens = new Map();

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a reset link has been sent.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 1000 * 60 * 60;

    resetTokens.set(token, { userId: user._id.toString(), expires });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Findr" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Reset your Findr password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #6c63ff;">Reset your password</h2>
          <p>Hey ${user.name},</p>
          <p>We got a request to reset your Findr password. Click the button below to reset it.</p>
          <a href="${resetUrl}" style="
            display: inline-block;
            background: linear-gradient(135deg, #6c63ff, #4facfe);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            margin: 16px 0;
          ">Reset Password</a>
          <p style="color: #888; font-size: 13px;">This link expires in 1 hour.</p>
          <p style="color: #888; font-size: 13px;">If you didn't request this, just ignore this email.</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Token and new password are required' });
  }

  const record = resetTokens.get(token);

  if (!record) {
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }

  if (Date.now() > record.expires) {
    resetTokens.delete(token);
    return res.status(400).json({ success: false, message: 'Token has expired' });
  }

  try {
    const user = await userModel.findById(record.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();
    

    resetTokens.delete(token);

    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;