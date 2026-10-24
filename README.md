# TogetherPlay 🎮
> **Play Together. Compete Anywhere.**  
> *Your personal multiplayer gaming space.*

TogetherPlay is a private online gaming platform where two people can connect from different devices, create game rooms, and play multiplayer games together in real time.

---

## 🚀 Features

- **Private Multiplayer Rooms**: Create a room with a 6-character room code, share with a friend, and play instantly.
- **Real-Time Synchronization**: Powered by Firebase Firestore listeners with optimistic updates and turn validation.
- **Three Multiplayer Games**:
  1. **Tic-Tac-Toe**: Classic 3×3 grid with turn management, winning line highlights, and instant restart.
  2. **Connect Four**: 7×6 grid with gravity drops, 4-in-a-row detection (horizontal, vertical, diagonal), and turn validation.
  3. **Player Quiz**: Head-to-head quiz with 10 questions, real-time score comparison, and podium result showcase.
- **Live Room Chat**: Integrated chat with player avatars, timestamps, self vs. opponent styling, and auto-scroll.
- **Gaming Dashboard**: Player profile, avatar customization, win/loss stats, match history, and quick join.
- **Seamless Fallback / Demo Mode**: Full real-time demo mode using BroadcastChannel & localStorage sync across browser tabs/windows if Firebase environment variables are not yet configured.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Multiplayer & Auth**: Firebase Auth + Firestore
- **Styling**: Modern CSS with glassmorphism, electric gaming accents, and dark navy aesthetics
- **FX**: Web Audio API Sound Effects + Canvas Confetti

---

## ⚡ Getting Started

### 1. Clone & Install
```bash
npm install
```

### 2. Configure Firebase (Optional but Recommended for Multi-Device Play)
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Authentication** (Email/Password & Anonymous auth).
3. Enable **Cloud Firestore** in test mode or deploy `firestore.rules`.
4. Copy your web app config and create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run Locally
```bash
npm run dev
```

Open `http://localhost:5173` in two browser windows or different devices on your network to test multiplayer synchronization!

---

## 🛡️ Firestore Security Rules
Deploy `firestore.rules` using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```
