# Gigal Backend (Minimal)

This folder contains a minimal Node/Express backend for the Gilgal Parish Church platform.

Quick start (Docker):

```powershell
docker-compose up --build
```

Seed the database (after services are up):

```powershell
docker-compose exec backend npm run seed
```

Dev (if Node installed locally):

```powershell
cd server
npm install
npm run seed
npm run dev
```

API endpoints:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/about`
- `PATCH /api/about` (admin)
- `GET /api/users` (auth)

Media uploads:
- `POST /api/media/upload` — multipart form upload (local storage)
- `POST /api/media/presign` — request S3 presigned URL (requires S3 env vars)

Articles & Posts:
- `GET /api/articles` — list
- `POST /api/articles` — create (admin)
- `GET /api/posts` — social feed
- `POST /api/posts` — create post (auth)

TURN server (for WebRTC):
- `docker-compose.yml` includes a `turn` service (coturn). Set `TURN_USER` and `TURN_PASS` env vars when running in prod, or override in your environment.

Production notes:
- Configure `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` in environment to enable presigned uploads.
- Use a secure `JWT_SECRET` and set `DB_URI` to your production database.
- For TURN in production, use a managed TURN provider or set up `coturn` with secure credentials and TLS.

