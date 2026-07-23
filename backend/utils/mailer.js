const nodemailer = require('nodemailer');

// Reads SMTP config from environment variables. See backend/.env.example
// for what needs to be set. If SMTP isn't configured (e.g. in local dev),
// we fall back to logging the reset link to the console instead of
// throwing, so the rest of the flow can still be tested.
function buildTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendResetPasswordEmail(toEmail, resetUrl) {
  const transporter = buildTransport();

  if (!transporter) {
    // No SMTP configured — don't fail the request, just make the link
    // visible in the server logs so the flow still works end-to-end
    // during local development.
    console.log(`[mailer] SMTP not configured. Password reset link for ${toEmail}:`);
    console.log(`[mailer] ${resetUrl}`);
    return { delivered: false };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Ghost Kitchen" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Reset your Ghost Kitchen password',
    text: `We received a request to reset your Ghost Kitchen password.\n\nClick the link below to choose a new one (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#111827;">Reset your password</h2>
        <p style="color:#4b5563;">We received a request to reset your Ghost Kitchen password. This link expires in 1 hour.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #f97316, #dc2626); color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Reset password
          </a>
        </p>
        <p style="color:#9ca3af; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  return { delivered: true };
}

module.exports = { sendResetPasswordEmail };
