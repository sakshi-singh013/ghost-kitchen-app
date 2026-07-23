// Sends password reset emails using Resend's HTTP API (https://resend.com).
// We use Resend instead of SMTP because outbound SMTP connections are
// unreliable/blocked on many free hosting tiers (including Render's free
// plan) — Resend works over plain HTTPS instead, so it isn't affected by
// that.
//
// Required env var: RESEND_API_KEY (see backend/.env.example)
// Optional: RESEND_FROM — defaults to Resend's shared test sender, which
// only works for accounts still on Resend's free/sandbox tier.

async function sendResetPasswordEmail(toEmail, resetUrl) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // No API key configured — don't fail the request, just make the link
    // visible in the server logs so the flow still works end-to-end
    // during local development.
    console.log(`[mailer] RESEND_API_KEY not configured. Password reset link for ${toEmail}:`);
    console.log(`[mailer] ${resetUrl}`);
    return { delivered: false };
  }

  const fromAddress = process.env.RESEND_FROM || 'Ghost Kitchen <onboarding@resend.dev>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
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
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[mailer] Resend API error:', response.status, errorBody);
    console.log(`[mailer] Password reset link for ${toEmail}: ${resetUrl}`);
    return { delivered: false };
  }

  return { delivered: true };
}

module.exports = { sendResetPasswordEmail };
