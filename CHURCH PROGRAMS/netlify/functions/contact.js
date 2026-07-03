const nodemailer = require('nodemailer');
// Optional SendGrid support via @sendgrid/mail when SENDGRID_API_KEY is set
let sendgrid;
try { sendgrid = require('@sendgrid/mail'); } catch (e) { sendgrid = null; }

const sanitize = (str) => (str || '').toString().replace(/[<>]/g, '');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // Basic honeypot check: if hidden field present and filled, treat as spam
  if (data && data._hp && data._hp.trim()) {
    return { statusCode: 200, body: 'Message received' };
  }

  const name = sanitize(data && data.name);
  const email = sanitize(data && data.email);
  const message = sanitize(data && data.message);

  if (!email || !message) {
    return { statusCode: 400, body: 'Missing required fields' };
  }

  const subject = `New contact from ${name || 'Website visitor'}`;
  const text = `Name: ${name}\nEmail: ${email}\n\n${message}`;
  const html = `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message}</p>`;

  // If reCAPTCHA token provided, validate it with Google
  if (data && data.recaptchaToken) {
    try {
      const resp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${encodeURIComponent(process.env.RECAPTCHA_SECRET || '')}&response=${encodeURIComponent(data.recaptchaToken)}`
      });
      const v = await resp.json();
      if (!v.success) {
        console.warn('reCAPTCHA validation failed', v);
        return { statusCode: 400, body: 'reCAPTCHA validation failed' };
      }
    } catch (err) {
      console.error('reCAPTCHA verify error', err);
      return { statusCode: 500, body: 'reCAPTCHA verify error' };
    }
  }

  // Prefer SendGrid if configured
  if (process.env.SENDGRID_API_KEY && sendgrid) {
    try {
      sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
      const from = process.env.FROM_EMAIL || process.env.SENDGRID_FROM;
      const to = process.env.TO_EMAIL;
      if (!to) return { statusCode: 500, body: 'Recipient not configured' };
      await sendgrid.send({
        to,
        from,
        subject,
        text,
        html,
      });
      return { statusCode: 200, body: 'Message sent' };
    } catch (err) {
      console.error('SendGrid error', err);
      // fallthrough to SMTP
    }
  }

  // Fallback to SMTP via nodemailer
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });

    const from = process.env.FROM_EMAIL || process.env.SMTP_USER || `no-reply@${process.env.SITE_DOMAIN || 'example.com'}`;
    const to = process.env.TO_EMAIL || process.env.SMTP_USER;

    const mailOptions = { from: `${name || 'Website'} <${from}>`, to, subject, text, html };
    await transporter.sendMail(mailOptions);
    return { statusCode: 200, body: 'Message sent' };
  } catch (err) {
    console.error('Mail error', err);
    return { statusCode: 500, body: 'Failed to send message' };
  }
};
