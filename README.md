# Count Me In 🎤

A mobile-first song queue management app for karaoke nights, open mics, and jam sessions.

## Features

- **Host a Room**: Create a room with unique code and QR code for guests to scan
- **Real-time Queue**: See song requests appear instantly with Firebase real-time sync
- **Guest Submissions**: Guests can submit song requests with optional YouTube links
- **Queue Management**: Mark songs as Next, Ongoing, or Completed
- **Dark Mode**: Full dark/light theme support
- **Mobile-First**: Optimized for mobile devices

## Tech Stack

- Vue 3 (Composition API)
- TypeScript
- Vite
- Vue Router
- Pinia
- PrimeVue
- Firebase Firestore
- Vitest

## Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Firebase Setup (Free Tier)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Go to **Build > Firestore Database** and create a database
4. Start in **test mode** for development (or configure security rules)
5. Go to **Project Settings > General > Your apps**
6. Click **Add app** and select **Web**
7. Copy the config values

### 3. Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Firestore Security Rules

For production, update your Firestore rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      // Anyone can read rooms
      allow read: if true;
      // Anyone can create rooms
      allow create: if true;
      // Anyone can update rooms (add song requests)
      allow update: if true;
    }
  }
}
```

## Development

```bash
# Start dev server
yarn dev

# Run tests
yarn test

# Run tests once
yarn test:run

# Lint files
yarn lint

# Type check
yarn type-check

# Build for production
yarn build
```

## Usage

### As Host

1. Click **Create Room** on the home page
2. Share the QR code or room code with your guests
3. Watch requests appear in real-time
4. Use the action buttons to manage the queue:
   - **Next**: Mark as up next
   - **Start**: Currently singing
   - **Complete**: Finished singing

### As Guest

1. Scan the QR code or enter the room code
2. Fill in your name and song
3. Optionally add a YouTube link
4. Submit and wait for your turn!

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   └── QueueItem.vue    # Queue item with controls
├── firebase/            # Firebase configuration
│   └── index.ts
├── router/              # Vue Router setup
│   └── index.ts
├── stores/              # Pinia stores
│   └── roomStore.ts     # Room & queue state
├── types/               # TypeScript interfaces
│   └── index.ts
├── views/               # Page components
│   ├── HomeView.vue
│   ├── HostRoomView.vue
│   ├── GuestView.vue
│   └── GuestSubmittedView.vue
├── App.vue              # Root component
├── main.ts              # App entry point
└── style.css            # Global styles
```

## Deployment

### GitHub Pages Setup

1. Push your code to GitHub
2. Go to **Settings > Secrets and variables > Actions**
3. Add these secrets:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
4. Go to **Settings > Pages**
5. Set Source to **GitHub Actions**
6. Push to `main` branch to trigger deployment

Your app will be available at `https://yourusername.github.io/countmein/`

### CI/CD Workflows

- **CI** (`.github/workflows/ci.yml`): Runs on PRs - type check, lint, tests
- **Deploy** (`.github/workflows/deploy.yml`): Runs on push to main - builds and deploys to GitHub Pages

## Firebase Free Tier Limits

- **Storage**: 1 GB
- **Reads**: 50,000/day
- **Writes**: 20,000/day
- **Deletes**: 20,000/day

This is more than enough for typical karaoke sessions!
