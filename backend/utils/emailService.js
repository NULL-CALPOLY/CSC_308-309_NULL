import nodemailer from 'nodemailer';

function createTransport() {
  if (!process.env.SMTP_HOST) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = process.env.SMTP_FROM || '"Findr" <noreply@findr.page>';

export async function sendVerificationEmail(to, name, token) {
  const transport = createTransport();
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;

  if (!transport) {
    console.warn(
      `[email] SMTP not configured — skipping verification email to ${to}.\n  Token: ${token}\n  Link:  ${url}`
    );
    return;
  }

  await transport.sendMail({
    from: FROM,
    to,
    subject: 'Verify your Findr account',
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#111111;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#1a0a2e,#0d1420);padding:32px 40px;text-align:center;border-bottom:1px solid rgba(124,58,237,0.25)">
      <h1 style="margin:0;font-size:2rem;font-weight:800;letter-spacing:2px;color:#fff">Findr<span style="color:#7c3aed">.</span></h1>
    </div>
    <div style="padding:40px">
      <h2 style="margin:0 0 8px;font-size:1.4rem;font-weight:700;color:#f8fafc">Verify your email</h2>
      <p style="margin:0 0 24px;color:rgba(248,250,252,0.6);line-height:1.6">
        Hi ${name || 'there'}, welcome to Findr! Click the button below to verify your email address and activate your account.
      </p>
      <a href="${url}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;font-weight:700;font-size:1rem;padding:14px 32px;border-radius:9999px;letter-spacing:0.02em">
        Verify Email Address
      </a>
      <p style="margin:24px 0 0;color:rgba(248,250,252,0.35);font-size:0.8rem;line-height:1.6">
        This link expires in 24 hours. If you didn't create a Findr account, you can safely ignore this email.
      </p>
      <p style="margin:12px 0 0;color:rgba(248,250,252,0.25);font-size:0.75rem;word-break:break-all">
        Or copy this link: ${url}
      </p>
    </div>
  </div>
</body>
</html>`,
    text: `Welcome to Findr, ${name || 'there'}!\n\nVerify your email by clicking this link:\n${url}\n\nThis link expires in 24 hours.`,
  });
}

export async function sendPasswordResetEmail(to, name, token) {
  const transport = createTransport();
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

  if (!transport) {
    console.warn(`[email] SMTP not configured — skipping reset email to ${to}.`);
    return;
  }

  await transport.sendMail({
    from: FROM,
    to,
    subject: 'Reset your Findr password',
    html: `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:40px 0;background:#0a0a0f;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#111111;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px">
    <h1 style="margin:0 0 24px;font-size:2rem;font-weight:800;letter-spacing:2px;color:#fff">Findr<span style="color:#7c3aed">.</span></h1>
    <h2 style="margin:0 0 8px;font-size:1.4rem;color:#f8fafc">Reset your password</h2>
    <p style="color:rgba(248,250,252,0.6);line-height:1.6">Hi ${name || 'there'}, click the button below to reset your password. This link expires in 1 hour.</p>
    <a href="${url}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;font-weight:700;padding:14px 32px;border-radius:9999px">Reset Password</a>
    <p style="margin-top:24px;color:rgba(248,250,252,0.3);font-size:0.8rem">If you didn't request this, ignore this email.</p>
  </div>
</body>
</html>`,
    text: `Reset your Findr password:\n${url}\n\nExpires in 1 hour. Ignore if you didn't request this.`,
  });
}
