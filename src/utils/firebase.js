// ============================================================
// FIREBASE CONFIGURATION
// Replace these values with your actual Firebase project config
// after you set up Firebase at https://console.firebase.google.com
// ============================================================
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue, update, query, orderByKey, limitToLast } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCj30D6Td_opvPLg2OW_VCE94CPnP6sVoY",
  authDomain: "wc2026-predictions-2d543.firebaseapp.com",
  projectId: "wc2026-predictions-2d543",
  storageBucket: "wc2026-predictions-2d543.firebasestorage.app",
  messagingSenderId: "313025551801",
  appId: "1:313025551801:web:d0e2b3a99af4d2773c6a68",
  measurementId: "G-3TF686S9ZM",
  databaseURL: "https://wc2026-predictions-2d543-default-rtdb.asia-southeast1.firebasedatabase.app",
};

let app, db;

export const initFirebase = () => {
  try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    return true;
  } catch (e) {
    console.warn("Firebase not configured yet. Running in demo mode.");
    return false;
  }
};

// Save a player's predictions (locked once submitted)
export const savePredictions = async (playerName, predictions, avatarFlag) => {
  if (!db) return demoSave(playerName, predictions, avatarFlag);
  const playerRef = ref(db, `players/${sanitize(playerName)}`);
  await set(playerRef, {
    name: playerName,
    avatarFlag,
    predictions,
    submittedAt: Date.now(),
    locked: true,
  });
};

// Check if a player already submitted
export const getPlayerData = async (playerName) => {
  if (!db) return demoGet(playerName);
  const snap = await get(ref(db, `players/${sanitize(playerName)}`));
  return snap.exists() ? snap.val() : null;
};

// Get all players (for leaderboard)
export const getAllPlayers = (callback) => {
  if (!db) return demoGetAll(callback);
  const playersRef = ref(db, "players");
  return onValue(playersRef, (snap) => {
    callback(snap.exists() ? snap.val() : {});
  });
};

// Get match results (admin updates these)
export const getResults = (callback) => {
  if (!db) return demoResults(callback);
  const resultsRef = ref(db, "results");
  return onValue(resultsRef, (snap) => {
    callback(snap.exists() ? snap.val() : {});
  });
};

// Admin: set match result
export const setResult = async (matchId, winner, homeScore, awayScore) => {
  if (!db) return;
  await update(ref(db, "results"), { [matchId]: { winner, homeScore, awayScore } });
};
const sanitize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "_");

// ─── DEMO MODE (localStorage fallback until Firebase is set up) ───────────────
const demoSave = (playerName, predictions, avatarFlag) => {
  const all = JSON.parse(localStorage.getItem("wc_players") || "{}");
  all[sanitize(playerName)] = { name: playerName, avatarFlag, predictions, submittedAt: Date.now(), locked: true };
  localStorage.setItem("wc_players", JSON.stringify(all));
};

const demoGet = (playerName) => {
  const all = JSON.parse(localStorage.getItem("wc_players") || "{}");
  return all[sanitize(playerName)] || null;
};

const demoGetAll = (callback) => {
  const all = JSON.parse(localStorage.getItem("wc_players") || "{}");
  callback(all);
  return () => {};
};

const demoResults = (callback) => {
  const results = JSON.parse(localStorage.getItem("wc_results") || "{}");
  callback(results);
  // Poll every 5s in demo mode for admin updates in same browser
  const interval = setInterval(() => {
    const r = JSON.parse(localStorage.getItem("wc_results") || "{}");
    callback(r);
  }, 5000);
  return () => clearInterval(interval);
};



// Send a chat message
export const sendChatMessage = async (playerName, avatarFlag, message) => {
  if (!db) return demoSendChat(playerName, avatarFlag, message);
  const chatRef = ref(db, `chat/${Date.now()}_${sanitize(playerName)}`);
  await set(chatRef, {
    name: playerName,
    avatarFlag,
    message,
    timestamp: Date.now(),
  });
};

// Listen to chat messages (latest 50)


export const getChat = (callback) => {
  if (!db) return demoGetChat(callback);
  
  const chatQuery = query(
    ref(db, "chat"),
    orderByKey(),        // order by timestamp_username key
    limitToLast(50)      // Firebase only sends last 50 — saves reads!
  );

  return onValue(chatQuery, (snap) => {
    if (!snap.exists()) return callback([]);
    const msgs = Object.values(snap.val())
      .sort((a, b) => a.timestamp - b.timestamp);
    callback(msgs);
  });
};

// ── Demo mode chat ─────────────────────────────────────────────────────────────
const demoSendChat = (playerName, avatarFlag, message) => {
  const all = JSON.parse(localStorage.getItem("wc_chat") || "[]");
  all.push({ name: playerName, avatarFlag, message, timestamp: Date.now() });
  localStorage.setItem("wc_chat", JSON.stringify(all.slice(-50)));
};

const demoGetChat = (callback) => {
  const all = JSON.parse(localStorage.getItem("wc_chat") || "[]");
  callback(all);
  const interval = setInterval(() => {
    const msgs = JSON.parse(localStorage.getItem("wc_chat") || "[]");
    callback(msgs);
  }, 3000);
  return () => clearInterval(interval);
};

// Delete chat messages older than 7 days
export const cleanOldMessages = async () => {
  if (!db) return;
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const chatRef = ref(db, "chat");
  const snap = await get(chatRef);
  if (!snap.exists()) return;

  const updates = {};
  Object.entries(snap.val()).forEach(([key, msg]) => {
    if (msg.timestamp < cutoff) updates[key] = null;
  });

  await update(chatRef, updates);
  console.log("🧹 Old chat messages cleaned!");
};