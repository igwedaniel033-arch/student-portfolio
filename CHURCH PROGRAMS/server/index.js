require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
let sendgrid = null;
try { sendgrid = require('@sendgrid/mail'); } catch (e) { sendgrid = null; }

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Rate limiter for contact endpoint: 6 requests per minute per IP
const contactLimiter = rateLimit({ windowMs: 60 * 1000, max: 6, standardHeaders: true, legacyHeaders: false });

const sanitize = (str) => (str || '').toString().replace(/[<>]/g, '');

const LOG_PATH = path.join(__dirname, 'messages.json');
function logMessage(entry){
  const data = {
    ts: new Date().toISOString(),
    ...entry
  };
  try{
    let arr = [];
    if (fs.existsSync(LOG_PATH)){
      const raw = fs.readFileSync(LOG_PATH, 'utf8');
      arr = raw ? JSON.parse(raw) : [];
    }
    arr.push(data);
    fs.writeFileSync(LOG_PATH, JSON.stringify(arr, null, 2));
  }catch(err){
    console.error('Logging failed', err);
  }
}

app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, message, _hp } = req.body || {};

  // Honeypot
  if (_hp && _hp.trim()) return res.status(200).json({ ok: true });

  const sName = sanitize(name);
  const sEmail = sanitize(email);
  const sMessage = sanitize(message);

  if (!sEmail || !sMessage) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // If reCAPTCHA token present, validate with Google
  const recaptchaToken = req.body.recaptchaToken;
  if (recaptchaToken && process.env.RECAPTCHA_SECRET) {
    try {
      const resv = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${encodeURIComponent(process.env.RECAPTCHA_SECRET)}&response=${encodeURIComponent(recaptchaToken)}`
      });
      const v = await resv.json();
      if (!v.success) return res.status(400).json({ error: 'reCAPTCHA validation failed' });
    } catch (err) {
      console.error('reCAPTCHA verify error', err);
      return res.status(500).json({ error: 'reCAPTCHA verify error' });
    }
  }

  const subject = `New contact from ${sName || 'Website visitor'}`;
  const text = `Name: ${sName}\nEmail: ${sEmail}\n\n${sMessage}`;
  const html = `<p><strong>Name:</strong> ${sName}</p><p><strong>Email:</strong> ${sEmail}</p><p>${sMessage}</p>`;

  // Try SendGrid if available
  if (process.env.SENDGRID_API_KEY && sendgrid) {
    try{
      sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
      const from = process.env.FROM_EMAIL || process.env.SENDGRID_FROM;
      const to = process.env.TO_EMAIL;
      if (!to) return res.status(500).json({ error: 'Recipient not configured' });
      await sendgrid.send({ to, from, subject, text, html });
      logMessage({ name: sName, email: sEmail, message: sMessage, method: 'sendgrid' });
      return res.json({ ok: true });
    }catch(err){
      console.error('SendGrid error', err);
      // fallthrough to SMTP
    }
  }

  // Fallback to SMTP
  try{
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });

    const from = process.env.FROM_EMAIL || process.env.SMTP_USER || `no-reply@${process.env.SITE_DOMAIN || 'example.com'}`;
    const to = process.env.TO_EMAIL || process.env.SMTP_USER;

    await transporter.sendMail({ from: `${sName || 'Website'} <${from}>`, to, subject, text, html });
    logMessage({ name: sName, email: sEmail, message: sMessage, method: 'smtp' });
    return res.json({ ok: true });
  }catch(err){
    console.error('Mail error', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Admin messages endpoint - protected by ADMIN_TOKEN env variable
app.get('/admin/messages', (req, res) => {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!process.env.ADMIN_TOKEN || !token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try{
    if (!fs.existsSync(LOG_PATH)) return res.json([]);
    const raw = fs.readFileSync(LOG_PATH, 'utf8');
    const arr = raw ? JSON.parse(raw) : [];
    res.json(arr);
  }catch(err){
    console.error('Read messages failed', err);
    res.status(500).json({ error: 'Failed to read messages' });
  }
});

// Serve admin UI page (simple) from server
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});
