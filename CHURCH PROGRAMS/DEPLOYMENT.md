# Deployment & Production Guidance

This document lists recommended steps and best practices for deploying the Gilgal Parish Church platform to production.

1) Infrastructure overview
- Frontend: built static site served by CDN or Nginx (Docker image `client/Dockerfile`).
- Backend: Node.js + Express in Docker.
- Database: MongoDB (managed cluster recommended: Atlas, DigitalOcean DB, or hosted MongoDB).
- Media: AWS S3 (presigned uploads).
- TURN: coturn or managed TURN service.

2) Environment variables (set securely)
- `JWT_SECRET` — secure random value
- `DB_URI` — production MongoDB URI
- `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- `TURN_USER`, `TURN_PASS` for coturn (or provider credentials)

3) TLS & domain
- Use HTTPS with a valid TLS certificate. If using a cloud provider, enable automatic TLS (e.g. Netlify, Vercel, Render).
- Configure CORS `FRONTEND_ORIGIN` to the production origin.

4) TURN
- For production, use a secure coturn deployment with long-term credentials and TLS. Alternatively, use a managed TURN provider.

5) Scaling & reliability
- Use managed DB for reliability.
- Use process manager (PM2) or container orchestration (Kubernetes, ECS) for backend.
- Configure monitoring, logging (structured logs), and alerts.

6) CI/CD
- Use GitHub Actions (CI provided). For deployments, add CD job deploying Docker images to your platform.

7) Security
- Rotate secrets; use a secret manager.
- Use virus scanning for uploaded media.
- Harden coturn and S3 bucket policies.
