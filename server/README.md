# Community Hub — API

Express + MongoDB backend for Community Hub. Every piece of app data (logins,
clubs, posts, reactions, notifications) is stored in MongoDB — see the root
[`README.md`](../README.md) for full setup and deployment instructions.

Quick start:

```bash
cd server
npm install
cp .env.example .env   # set MONGODB_URI
npm run seed           # creates admin + demo clubs + demo posts
npm run dev            # starts the API (default http://localhost:5174)
```

## Endpoints

- **Auth:** `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/clubs` (admin-only, creates a club login)
- **Clubs:** `GET /api/clubs`, `POST /api/clubs/:clubId/delete` (admin-only), `POST /api/clubs/:clubId/emoji`
- **Posts:** `GET /api/posts`, `POST /api/posts` (club-only), `POST /api/posts/:id/approve` / `/reject` (admin-only), `POST /api/posts/:id/delete` (owning club or admin), `POST /api/posts/:id/react`
- **Notifications:** `GET /api/notifications`, `POST /api/notifications`, `POST /api/notifications/mark-read`

## Data

- **users** — one document per admin/club account (bcrypt password hash, role, and for clubs: name/icon/description/category/status/custom emoji)
- **sessions** — one row per logged-in session; deleted on logout, auto-expires after 7 days (TTL index)
- **posts** — announcements and promotions, with status, category, reactions, optional poster
- **notifications** — system notifications targeted by audience (`admin`, `public`, or a specific club id)

Passwords are always hashed with bcrypt — never stored in plain text.
