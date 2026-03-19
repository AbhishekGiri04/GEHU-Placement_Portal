const nodemailer = require('nodemailer');

// Only create transporter if credentials are configured
const isEmailConfigured = () =>
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  !process.env.EMAIL_USER.includes('your_gmail');

const getTransporter = () => {
  if (!isEmailConfigured()) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
};

const sendPasswordResetEmail = async (toEmail, resetToken, role) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[Email] Not configured — skipping password reset email to:', toEmail);
    console.warn('[Email] Reset token for dev:', resetToken);
    return;
  }

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/frontend/pages/reset-password.html?token=${resetToken}&role=${role}`;
  await transporter.sendMail({
    from: `"GEHU Placement Portal" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Password Reset Request - GEHU Placement Portal',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#032241;">Password Reset Request</h2>
        <p>You requested a password reset for your GEHU Placement Portal account.</p>
        <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4db8ff;color:#fff;text-decoration:none;border-radius:6px;margin:20px 0;">Reset Password</a>
        <p style="color:#666;font-size:13px;">If you did not request this, please ignore this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
        <p style="color:#999;font-size:12px;">GEHU Placement Portal | Graphic Era Hill University</p>
      </div>
    `
  });
};

const sendNotificationEmail = async (toEmail, subject, message) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[Email] Not configured — skipping notification email to:', toEmail);
    return;
  }

  await transporter.sendMail({
    from: `"GEHU Placement Portal" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#032241;">${subject}</h2>
        <p>${message}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
        <p style="color:#999;font-size:12px;">GEHU Placement Portal | Graphic Era Hill University</p>
      </div>
    `
  });
};

module.exports = { sendPasswordResetEmail, sendNotificationEmail };
