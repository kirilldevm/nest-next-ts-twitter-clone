# TwiXter Client (Next.js)

Next.js 16 frontend for the TwiXter Twitter clone. Static export for Firebase Hosting, with Firebase Auth and Storage integration.

## Technologies

- **Next.js** 16 – App Router, static export
- **React** 19
- **TypeScript**
- **Material UI (MUI)** 7 – Components and theming
- **Tailwind CSS** 4 – Utility styling
- **TanStack React Query** – Server state and mutations
- **React Hook Form** – Forms
- **Zod** – Schema validation
- **Axios** – HTTP client with auth interceptor
- **Firebase SDK** – Auth, Storage (Auth emulator supported)
- **Sonner** – Toasts

## Project Structure

```
client/
├── src/
│   ├── app/
│   │   ├── (auth)/        # Signin, signup, reset-password
│   │   ├── (protected)/   # Feed, profile, settings, posts
│   │   └── layout.tsx
│   ├── components/        # UI, forms, providers
│   ├── config/            # Routes, endpoints, pages
│   ├── context/           # Auth context
│   ├── hooks/             # React Query hooks
│   ├── lib/               # API client
│   ├── schemas/           # Zod schemas
│   ├── services/          # API services
│   └── types/
├── public/
├── .env.example
├── next.config.ts
└── package.json
```

## Environment Variables

Copy `.env.example` to `.env` or `.env.local`:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | Yes |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Analytics (optional) | No |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |
| `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` | `true` when using emulators | No |

### Local development (emulators)

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:5001/<project-id>/us-central1/api
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
```

### Production

```env
NEXT_PUBLIC_API_URL=https://us-central1-<project-id>.cloudfunctions.net/api
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
```

Values from Firebase Console → Project Settings → General → Your apps (Web app).

## Local Development

```bash
npm run dev
```

- App: http://localhost:3000  
- API requests are proxied to `/api` (see `next.config.ts` rewrites) or sent directly to `NEXT_PUBLIC_API_URL`

With emulators:

1. Set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`
2. Set `NEXT_PUBLIC_API_URL` to the functions emulator URL
3. Run `npm run serve` in `functions/`
4. Run `npm run dev` in `client/`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (static export when `NODE_ENV=production`) |
| `npm run start` | Serve production build (local) |
| `npm run lint` | ESLint |

## Build & Deploy (Hosting)

From project root:

```bash
npm run deploy:hosting
```

This will:

1. Remove `client/.next` and `client/out`
2. Run `NODE_ENV=production npm run build` (static export)
3. Deploy `client/out` to Firebase Hosting

Static export is configured in `next.config.ts` (`output: 'export'` when `NODE_ENV=production`).

## Key Features

- **Auth**: Email/password signup and signin, Google sign-in, password reset, email verification
- **Feed**: Infinite scroll, search, reactions, comments
- **Profile**: View/edit profile, profile images, user posts
- **Posts**: Create, edit, delete; images; reactions
- **Settings**: Profile settings, delete account
- **Protected routes**: Redirect to signin when not authenticated
- **Token validation**: Auto-logout on invalid token (e.g. after emulator restart)
