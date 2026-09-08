# Doctor Profile & Appointment Booking (MVP)

A lightweight doctor profile and appointment booking website. **Vanilla HTML/CSS/JavaScript** on the frontend (no framework), **Express.js** on the backend, with an **in-memory data store** for this Phase 1 MVP.

> All doctor/review/appointment data in this repo is **sample/demo data**, clearly labeled as such. This is not a real medical practice and does not provide real medical advice or emergency contact.

## Features

- Doctor profile: photo, specialty, bio, skills, experience, server-calculated rating
- Patient reviews with a rating distribution breakdown
- Patient review submission form (client + server validated)
- Appointment booking: date → available times → patient info → confirmation
- Server-side availability logic (working days/hours, lunch break, slot duration) — **the server is the single source of truth**, so double-booking is impossible even if the browser is out of date
- Post-visit patient survey
- Accessible, responsive, semantic HTML with no external UI framework

## Tech stack

| Layer      | Tech |
|------------|------|
| Frontend   | HTML5, CSS3, vanilla JS (ES modules) — no React/Vue/Angular/Bootstrap/Tailwind |
| Backend    | Node.js + Express |
| Storage    | Phase 1: in-memory. Phase 2 (see below): SQLite, no ORM |

## Getting started

```bash
npm install
npm start
```

Then open <http://localhost:3000>.

For development with auto-restart on file changes:

```bash
npm run dev
```

Health check: `GET /api/health`

## Project structure

```text
doctor-website/
├── package.json
├── server.js               # Express app entry point
├── src/
│   ├── config.js            # working hours, slot duration, etc.
│   ├── store.js             # in-memory data (Phase 1) — swap for SQLite in Phase 2
│   ├── validation.js        # server-side validation functions
│   ├── sanitize.js          # input sanitization helpers
│   ├── rating.js            # rating average/distribution calculation
│   ├── availability.js      # appointment slot generation logic
│   ├── middleware/
│   │   ├── requireAdmin.js  # DEV-ONLY placeholder admin auth
│   │   ├── rateLimit.js     # simple in-memory rate limiter
│   │   └── errorHandler.js  # centralized error handler
│   └── routes/
│       ├── doctors.js
│       ├── appointments.js
│       ├── reviews.js
│       └── surveys.js
├── public/                  # static frontend, served directly by Express
│   ├── index.html
│   ├── css/style.css
│   ├── js/
│   │   ├── api.js           # all fetch() calls live here
│   │   ├── ui.js             # toasts / form-status helpers
│   │   ├── booking.js
│   │   ├── reviews.js
│   │   ├── survey.js
│   │   └── app.js            # app init
│   ├── assets/               # placeholder images (no real photos)
│   ├── robots.txt
│   └── sitemap.xml
└── tests/                    # Node's built-in test runner (node:test)
```

## API overview

All responses follow:

```json
{ "success": true, "data": {} }
```

or

```json
{ "success": false, "error": { "message": "..." } }
```

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/doctors` | supports `?specialty=` and `?minRating=` |
| GET | `/api/doctors/:id` | |
| POST/PUT/DELETE | `/api/doctors...` | admin-only (dev placeholder auth) |
| GET | `/api/appointments/availability?doctorId=&date=` | returns free slots for that date |
| GET | `/api/appointments` | supports `?doctorId=&date=` |
| POST | `/api/appointments` | creates a booking; `409` if slot already taken |
| PUT/DELETE | `/api/appointments/:id` | admin-only |
| GET/POST | `/api/reviews` | rating is always server-calculated, never client-supplied |
| PUT/DELETE | `/api/reviews/:id` | admin-only |
| GET/POST | `/api/surveys` | post-visit feedback, references an appointment ID |

### Dev-only admin auth

Some write endpoints (`PUT`/`DELETE` on doctors, appointments, reviews) require:

```text
Authorization: Bearer demo-admin-token
```

This is a **placeholder for development only** — see `src/middleware/requireAdmin.js`. It must be replaced with real authentication (hashed credentials, sessions or signed tokens over HTTPS, HTTP-only cookies) before any production use.

## Configuring clinic hours

Edit `src/config.js`:

```js
WORKING_DAYS: [0, 1, 2, 3, 4, 6],   // Sat–Thu (Fri closed)
WORKING_HOURS: { start: '09:00', end: '17:00' },
BREAK: { start: '13:00', end: '14:00' },
APPOINTMENT_DURATION_MINUTES: 30,
```

## Testing

```bash
npm test
```

Uses Node's built-in test runner (`node --test`) against a real in-process server instance (no mocking of Express). Covers doctors, appointments (including double-booking and validation), reviews (including rating recalculation), and surveys.

## Security notes (MVP-appropriate, not production-grade)

- `helmet` and `cors` are enabled.
- All input is sanitized before storage; review/comment text is rendered with `textContent`, never `innerHTML`.
- The server independently re-validates and re-checks availability on every booking — the browser's calendar UI is a convenience only.
- A simple in-memory rate limiter guards public write endpoints (`/api/appointments`, `/api/reviews`, `/api/surveys`).
- Real patient/medical data requires substantially stronger privacy and security controls than this educational MVP provides (encryption at rest, audit logging, real authentication, HIPAA/GDPR-appropriate handling, etc.) before any real-world use.

## Phase 2 — Persistence (not yet implemented)

Replace `src/store.js`'s internals with `better-sqlite3`-backed functions (same exported function names, so routes don't change). Tables: `doctors`, `patients`, `appointments`, `reviews`, `survey_responses`, with indexes on `appointments(doctor_id, date, time)` and `reviews(doctor_id)`. Use parameterized queries only — no string concatenation of user input into SQL, and no ORM.

## Phase 3 — Advanced features (not yet implemented)

Multi-doctor support and search/filtering (the `specialty`/`minRating` query params already work against the current single doctor), a mock `NotificationService` for booking confirmation/cancellation emails, and an `/admin` dashboard built on top of the existing admin-only routes and real authentication.

## Production build note

Because the frontend is plain HTML/CSS/JS, there is no framework build step. `public/` can be served as-is by Express (as it is now) or by any static file server / CDN in front of the API. If desired, a minification pass (CSS/JS minify + asset copy) can be added later — it does not require introducing a frontend framework.
