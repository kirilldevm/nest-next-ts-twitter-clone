# TwiXter – Twitter Clone

A full-stack Twitter-like application built with NestJS, Next.js, and Firebase. Users can sign up, post content, react (like), comment, search posts, and manage their profiles.

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Next.js SPA   │────▶│  Firebase Functions   │────▶│  Firestore       │
│   (client/)     │     │  NestJS API (functions/)│     │  Auth            │
│   Static Export │     │  Cloud Run             │     │  Storage         │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

- **Client**: Next.js 16 (App Router) with static export, deployed to Firebase Hosting
- **Backend**: NestJS API running on Firebase Functions (Cloud Run)
- **Database**: Firestore
- **Auth**: Firebase Authentication (email/password, Google)
- **Storage**: Firebase Storage (profile images, post images)
- **Search**: Algolia (with Firestore fallback)

---

## Prerequisites

- Node.js 22+
- npm
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project

---

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Enable **Authentication** (Email/Password, Google provider)
4. Create a **Firestore** database (choose region, e.g. `eur3`)
5. Create **Storage** bucket

### 2. Connect the CLI

```bash
firebase login
firebase use <your-project-id>
# or
firebase use --add
```

### 3. Service Account (for backend)

1. Firebase Console → Project Settings → Service Accounts
2. Generate a new private key (JSON)
3. Copy `project_id`, `client_email`, `private_key` into `functions/.env` (see [functions/README.md](functions/README.md))

### 4. Web App Config (for client)

1. Firebase Console → Project Settings → General → Your apps → Web app
2. Copy the config (`apiKey`, `authDomain`, etc.) into `client/.env` (see [client/README.md](client/README.md))

---

## Deploy Rules & Indexes

Before deploying the app, deploy security rules and Firestore indexes:

```bash
# Deploy Firestore rules only
firebase deploy --only firestore:rules

# Deploy Firestore indexes only
firebase deploy --only firestore:indexes

# Deploy Storage rules only
firebase deploy --only storage

# Or deploy all rules + indexes
firebase deploy --only firestore,storage
```

### Firestore Rules

- Located in `firestore.rules`
- Default rules allow read/write until `2026-04-01` (temporary for development)
- **Production**: Replace with proper security rules (authenticate by user, validate fields, etc.)

### Storage Rules

- Located in `storage.rules`
- `profile-images/`: Public read; unauthenticated create allowed (for signup); update/delete require auth
- `post-images/`: Require authentication for all operations

### Firestore Indexes

- Defined in `firestore.indexes.json`
- Required for:
  - Posts by `authorId` + `createdAt`
  - Posts by `likesCount` / `commentsCount` + `createdAt`
  - Comments by `postId` + `parentId` + `createdAt`
  - Reactions by `targetType` + `targetId`

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/kirilldevm/nest-next-ts-twitter-clone
cd nest-next-ts-twitter-clone
npm install
npm install --prefix client
npm install --prefix functions
```

### 2. Configure environment

- Copy `functions/.env.example` → `functions/.env`
- Copy `client/.env.example` → `client/.env` or `client/.env.local`
- Fill in your Firebase and API keys (see READMEs in each folder)

### 3. Local development (with emulators)

```bash
# Terminal 1: Start Firebase emulators + backend
cd functions && npm run serve

# Terminal 2: Start client
cd client && npm run dev
```

- Auth: http://127.0.0.1:9099
- Functions: http://127.0.0.1:5001
- Firestore: http://127.0.0.1:8080
- Storage: http://127.0.0.1:9199
- Hosting (static): http://127.0.0.1:5000
- Emulator UI: http://127.0.0.1:4000

### 4. Deploy

```bash
# Deploy everything
npm run deploy

# Deploy only functions
npm run deploy:functions

# Deploy only hosting (client)
npm run deploy:hosting
```

---

## Scripts (root)

| Script                     | Description                                                              |
| -------------------------- | ------------------------------------------------------------------------ |
| `npm run deploy`           | Lint functions, then deploy all (functions, firestore, storage, hosting) |
| `npm run deploy:functions` | Deploy only Firebase Functions                                           |
| `npm run deploy:hosting`   | Clean build client + deploy to Firebase Hosting                          |

---

## Project Structure

```
nest-next-ts-twitter-clone/
├── client/                 # Next.js frontend
├── functions/              # NestJS backend (Firebase Functions)
├── firebase.json           # Firebase config
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore composite indexes
├── storage.rules           # Storage security rules
└── package.json
```

---

## Documentation

- [client/README.md](client/README.md) – Frontend setup, env, deploy
- [functions/README.md](functions/README.md) – Backend setup, env, deploy, API

---

## License

Private / Unlicensed
