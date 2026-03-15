# TwiXter Backend (Firebase Functions)

NestJS API running on Firebase Functions (Cloud Run). Handles auth, users, posts, comments, reactions, and search (Algolia with Firestore fallback).

## Technologies

- **NestJS** 11 – API framework
- **Firebase Admin SDK** – Auth verification, Firestore, Storage
- **Firebase Functions** (Node.js 22) – Serverless hosting
- **Passport + Firebase JWT** – Token-based auth guard
- **Class Validator / Class Transformer** – DTO validation and serialization
- **Resend** – Email (verification, password reset)
- **Algolia** – Post search (optional; falls back to Firestore if unavailable)
- **Express + CORS + Helmet** – HTTP layer and security

## Project Structure

```
functions/
├── src/
│   ├── main.ts           # Express + Nest bootstrap, CORS, Firebase init
│   ├── app.module.ts     # Root module
│   ├── auth/             # Signup, signin, Google auth, password reset
│   ├── user/             # User CRUD, profile
│   ├── post/             # Posts, search (Algolia + Firestore)
│   ├── comment/          # Comments
│   ├── reaction/          # Likes/reactions
│   ├── email/            # Resend email service
│   ├── algolia/          # Algolia search service
│   └── storage/          # Firebase Storage helpers
├── test/                 # E2E tests (Firebase emulators)
├── .env.example
└── package.json
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description | Required |
|----------|-------------|----------|
| `CORS_ORIGIN` | Comma-separated allowed origins (include `https://`) | Yes (prod) |
| `PROJECT_ID` | Firebase project ID | Yes |
| `CLIENT_EMAIL` | Service account `client_email` | Yes |
| `PRIVATE_KEY` | Service account `private_key` (with `\n` for newlines) | Yes |
| `STORAGE_BUCKET` | Firebase Storage bucket (default: `{project}.appspot.com`) | Optional |
| `RESEND_API_KEY` | Resend API key for emails | Yes |
| `RESEND_FROM` | Sender email (e.g. `onboarding@resend.dev`) | Yes |
| `ALGOLIA_APP_ID` | Algolia app ID (search) | Optional |
| `ALGOLIA_ADMIN_API_KEY` | Algolia admin API key | Optional |
| `ALGOLIA_INDEX_NAME` | Algolia index name (default: `posts`) | Optional |

### Local (.env)

```env
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5000

PROJECT_ID=your-project-id
CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

RESEND_API_KEY=re_xxx
RESEND_FROM=onboarding@resend.dev

ALGOLIA_APP_ID=xxx
ALGOLIA_ADMIN_API_KEY=xxx
```

### Production (Cloud Run / Google Cloud Console)

Set variables under **Cloud Run** → **api** service → **Variables & Secrets**.

**CORS for production:**

```
https://your-project.web.app,https://your-project.firebaseapp.com
```

Use full URLs including `https://`. Do not truncate values.

## Local Development

### With Firebase Emulators

```bash
# Start emulators + built functions
npm run serve

# Watch mode (rebuild on change)
npm run serve:watch
```

Functions run at `http://127.0.0.1:5001/<project-id>/us-central1/api`.

### Without emulators (standalone Nest)

```bash
npm run build
npm run start:prod
```

Uses real Firebase services. Set `.env` accordingly.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run serve` | Build + start emulators (functions, firestore, auth, storage) |
| `npm run serve:watch` | Watch build + emulators |
| `npm run lint` | ESLint with auto-fix |
| `npm run test` | Unit tests |
| `npm run test:e2e` | E2E tests (with emulators) |
| `npm run deploy` | Deploy to Firebase Functions |

## API Overview

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/signup` | POST | No | Register (email/password) |
| `/auth/signin` | POST | No | Login (email/password) |
| `/auth/signin-with-google` | POST | No | Login with Google token |
| `/auth/forgot-password` | POST | No | Send password reset email |
| `/auth/resend-verification-email` | POST | No | Resend verification email |
| `/user/:id` | GET | Yes | Get user by ID |
| `/user/:id` | PATCH | Yes | Update user |
| `/post` | GET | No | List posts (cursor pagination) |
| `/post/search` | GET | No | Search posts |
| `/post` | POST | Yes | Create post |
| `/post/:id` | GET | No | Get post |
| `/post/:id` | PATCH | Yes | Update post |
| `/post/:id` | DELETE | Yes | Delete post |
| `/comment` | GET | No | List comments |
| `/comment` | POST | Yes | Create comment |
| `/reaction` | POST | Yes | Set reaction (like/unlike) |

## Deploy

From the project root:

```bash
npm run deploy:functions
```

Or from `functions/`:

```bash
firebase deploy --only functions
```

Predeploy runs `npm run build`. Lint runs from the root `npm run deploy` script.

## E2E Tests

```bash
# Start emulators, run E2E tests, stop emulators
npm run test:e2e
```

Do not run `npm run serve` in another terminal; the test command manages the emulators.
