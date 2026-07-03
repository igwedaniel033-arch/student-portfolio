# Gigal Parish RCCG — Website

This repository contains a professional, responsive static site for Gigal Parish RCCG with an optional contact backend and deployment configs for Netlify and GitHub Pages.

Files of interest
- `index.html` — main site
- `css/styles.css` — design and responsive rules
- `js/script.js` — interaction logic; posts contact data to a serverless function or local API
- `netlify/functions/contact.js` — Netlify serverless function using `nodemailer`
- `server/` — optional Express backend (`/api/contact`) with `nodemailer`
- `logo.svg` — site logo used as favicon

Quick local preview (static)

PowerShell:

```powershell
cd "c:\Users\User\CHURCH PROGRAMS"
python -m http.server 8000
# Open http://localhost:8000
```

Netlify (recommended)

- Connect this repository to Netlify.
- The `netlify/functions/contact.js` function sends contact emails using SMTP — configure the following environment variables in your Netlify site settings:
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` (`true`/`false`), `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`, `TO_EMAIL`.
- Netlify will serve the site and the serverless function; `js/script.js` tries `/.netlify/functions/contact` first.

GitHub Pages (static only)

- GitHub Pages can serve the static files directly from the `main` branch or `gh-pages` branch.
- Contact functionality is not available on GitHub Pages by itself — use the Netlify function or deploy the `server/` app separately and update the API endpoint in `js/script.js`.

SendGrid and SMTP configuration
- The contact handlers (Netlify function and local Express server) support both SendGrid API and SMTP. Recommended: use SendGrid for better deliverability.
- Environment variables for SendGrid:
  - `SENDGRID_API_KEY` — your SendGrid API key
  - `SENDGRID_FROM` — sender email used when using SendGrid (optional, or set `FROM_EMAIL`)
- Environment variables for SMTP (fallback):
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`, `TO_EMAIL`

Message logging
- The Express server writes incoming messages (after anti-spam checks) to `server/messages.json`. Do not commit sensitive logs; add `server/messages.json` to `.gitignore` if you add the file.

Admin UI
- A simple admin UI is available at `/admin` on the Express server. It's protected by the `ADMIN_TOKEN` environment variable. To use:
  1. Set `ADMIN_TOKEN` in `server/.env` (or your hosting env).
  2. Start the server and open `http://localhost:3000/admin`.
  3. Enter the token to load and view messages stored in `server/messages.json`.

reCAPTCHA
- To enable reCAPTCHA v3, set `branding.json` fields `recaptchaEnabled: true` and `recaptchaSiteKey` (site key). Also set `RECAPTCHA_SECRET` in your Netlify environment (and server `.env`) to allow server-side verification.
- The contact handlers will verify the token with Google before delivering the message.

Express backend (optional)

The `server/` folder contains an Express app that exposes `POST /api/contact`. To run locally:

```powershell
cd "c:\Users\User\CHURCH PROGRAMS\server"
npm install
# copy .env.example to .env and fill SMTP_* values
node index.js
# Server listens on PORT (default 3000)
```

Once running, the static site (served via `python -m http.server` or by opening the file) will use the `/api/contact` endpoint as a fallback if the Netlify function is not available.

Security & environment

- Never commit real SMTP credentials. Use Netlify environment variables or a local `.env` (kept out of source control).
- The server and function both rely on `nodemailer` and SMTP; you can also adapt them to use transactional email APIs (SendGrid, Mailgun) if preferred.

Next steps I can do for you
- Apply your branding (colors, copy, logo files).
- Add pages for Events, Staff, Calendar, or an events management UI.
- Configure a production deploy (Netlify site setup, GitHub Actions for Pages, or a Render/Fly deployment for the Express backend).

Branding customization
- A new `branding.json` file is included at the repository root. Edit it to set `siteTitle`, `brandText`, `logoPath`, `primaryColor`, `accentColor`, and contact details. The site loads `branding.json` at runtime via `js/branding.js` and applies the colors and text.

- Theme presets and switcher:
  - `branding.json` now contains a `themes` array with preset palettes (including a `rainbow` preset and multiple professional palettes). The site shows a theme selector in the header which persists your selection in the browser.
  - To add or change themes, edit `branding.json` and provide CSS variable mappings in each theme's `vars` object (e.g. `"--primary": "#1f6feb"`).

CI / Deploy
- A GitHub Actions workflow `./github/workflows/deploy-netlify.yml` is provided to deploy the static site to Netlify.
- To use it, add two repository secrets in GitHub: `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` (provided by Netlify). The workflow installs `netlify-cli` and runs a production deploy on pushes to `main`.

Notes
- Do not commit real SMTP credentials. Use Netlify environment variables or local `.env` for the Express server.
- If you want a different deploy flow (e.g. automatic Pages publish + functions via Netlify), tell me which target you prefer and I will adapt the workflows.

Tell me which next step you want and I will continue.
