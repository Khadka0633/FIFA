# ⚽ FIFA World Cup 2026 — Prediction Tournament

A friend prediction tournament app for the FIFA World Cup 2026.

## Features
- 🌍 Enter your name + pick a country flag as your avatar
- ⚽ Predict all 48 group stage matches (home win / draw / away win)
- 🔒 Predictions lock permanently after submission
- 🏆 Live leaderboard with points and rankings
- 📊 See everyone's picks after they submit
- 🔜 Knockout stage shown as TBD until group stage finishes
- ⚙️ Admin panel to enter match results at `/#admin`

## Scoring
- ✅ Correct result prediction = **2 points**
- ❌ Wrong prediction = **0 points**

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Firebase (required for multi-browser/friend sharing)

1. Go to https://console.firebase.google.com
2. Create a new project (e.g. `wc2026-predictions`)
3. Enable **Realtime Database** (start in test mode)
4. Go to Project Settings → Your apps → Add web app
5. Copy the config object
6. Open `src/utils/firebase.js` and replace the `firebaseConfig` values

```js
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456",
  appId: "1:123:web:abc"
};
```

> **Demo mode:** Without Firebase, the app runs locally using `localStorage`. Only works in the same browser — Firebase is needed to share with friends.

### 3. Change the admin password

In `src/pages/AdminPage.jsx`, change:
```js
const ADMIN_PASSWORD = "wc2026admin"; // ← change this!
```

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy (so friends can access it)

**Option A: Vercel (easiest)**
```bash
npm install -g vercel
vercel
```

**Option B: Netlify**
```bash
npm run build
# Upload the `dist/` folder to Netlify
```

**Option C: GitHub Pages**
```bash
npm run build
# Push `dist/` to gh-pages branch
```

---

## Firebase Realtime Database Rules

In Firebase console → Realtime Database → Rules, set:

```json
{
  "rules": {
    "players": {
      ".read": true,
      "$player": {
        ".write": "!data.exists()"
      }
    },
    "results": {
      ".read": true,
      ".write": false
    }
  }
}
```

> This allows anyone to read, but each player can only write once (can't edit after submit). Results can only be written from the admin panel using your Firebase Admin SDK or directly in the console.

---

## Admin Panel

Go to `yoursite.com/#admin` to access the result entry panel.
Default password: `wc2026admin` (change before deploying!)

---

## Project Structure

```
src/
  data/
    matches.js       ← All 48 WC 2026 matches + team flags
  utils/
    firebase.js      ← Firebase config + DB helpers
    scoring.js       ← Point calculation
  components/
    MatchCard.jsx    ← Individual match prediction card
    SubmitPreview.jsx ← Pre-submit review modal
  pages/
    LoginPage.jsx    ← Name + flag avatar entry
    PredictPage.jsx  ← Group stage prediction form
    LeaderboardPage.jsx ← Rankings + everyone's picks
    AdminPage.jsx    ← Result entry (password protected)
  App.jsx            ← Page routing
  main.jsx           ← React entry point
  index.css          ← Tailwind + custom styles
```
