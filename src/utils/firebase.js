import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  update,
  query,
  orderByKey,
  limitToLast,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCj30D6Td_opvPLg2OW_VCE94CPnP6sVoY",
  authDomain: "wc2026-predictions-2d543.firebaseapp.com",
  projectId: "wc2026-predictions-2d543",
  storageBucket: "wc2026-predictions-2d543.firebasestorage.app",
  messagingSenderId: "313025551801",
  appId: "1:313025551801:web:d0e2b3a99af4d2773c6a68",
  measurementId: "G-3TF686S9ZM",
  databaseURL:
    "https://wc2026-predictions-2d543-default-rtdb.asia-southeast1.firebasedatabase.app",
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

const sanitize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "_");

// ── Group stage predictions ───────────────────────────────────────────────────

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

export const getPlayerData = async (playerName) => {
  if (!db) return demoGet(playerName);
  const snap = await get(ref(db, `players/${sanitize(playerName)}`));
  return snap.exists() ? snap.val() : null;
};

export const getAllPlayers = (callback) => {
  if (!db) return demoGetAll(callback);
  const playersRef = ref(db, "players");
  return onValue(playersRef, (snap) => {
    callback(snap.exists() ? snap.val() : {});
  });
};

// ── Group stage results ───────────────────────────────────────────────────────

export const getResults = (callback) => {
  if (!db) return demoResults(callback);
  const resultsRef = ref(db, "results");
  return onValue(resultsRef, (snap) => {
    callback(snap.exists() ? snap.val() : {});
  });
};

export const setResult = async (matchId, winner, homeScore, awayScore) => {
  if (!db) return;
  await update(ref(db, "results"), {
    [matchId]: { winner, homeScore, awayScore },
  });
};

// ── Knockout predictions ──────────────────────────────────────────────────────

export const saveKnockoutPredictions = async (playerName, predictions, avatarFlag) => {
  if (!db) return demoSaveKnockout(playerName, predictions);
  await update(ref(db, `players/${sanitize(playerName)}`), {
    knockoutPredictions: predictions,
    knockoutLocked: true,
    knockoutSubmittedAt: Date.now(),
  });
};

// ── Knockout results ──────────────────────────────────────────────────────────

export const getKnockoutResults = (callback) => {
  if (!db) return demoKnockoutResults(callback);
  return onValue(ref(db, "knockoutResults"), (snap) => {
    callback(snap.exists() ? snap.val() : {});
  });
};

export const setKnockoutResult = async (matchId, winner) => {
  if (!db) return;
  await update(ref(db, "knockoutResults"), { [matchId]: { winner } });
};

// ── Knockout unlock setting ───────────────────────────────────────────────────

export const getKnockoutUnlocked = (callback) => {
  if (!db) {
    callback(false);
    return () => {};
  }
  return onValue(ref(db, "settings/knockoutUnlocked"), (snap) => {
    callback(snap.exists() ? snap.val() : false);
  });
};

export const setKnockoutUnlocked = async (value) => {
  if (!db) return;
  await update(ref(db, "settings"), { knockoutUnlocked: value });
};

// ── Knockout teams (resolved group standings → R32 slots) ────────────────────

export const getKnockoutTeams = (callback) => {
  if (!db) {
    callback({});
    return () => {};
  }
  return onValue(ref(db, "knockoutTeams"), (snap) => {
    callback(snap.exists() ? snap.val() : {});
  });
};

// ── Chat ──────────────────────────────────────────────────────────────────────

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

export const getChat = (callback) => {
  if (!db) return demoGetChat(callback);
  const chatQuery = query(ref(db, "chat"), orderByKey(), limitToLast(50));
  return onValue(chatQuery, (snap) => {
    if (!snap.exists()) return callback([]);
    const msgs = Object.values(snap.val()).sort(
      (a, b) => a.timestamp - b.timestamp
    );
    callback(msgs);
  });
};

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

// ── DEMO MODE (localStorage fallback) ────────────────────────────────────────

const demoSave = (playerName, predictions, avatarFlag) => {
  const all = JSON.parse(localStorage.getItem("wc_players") || "{}");
  all[sanitize(playerName)] = {
    name: playerName,
    avatarFlag,
    predictions,
    submittedAt: Date.now(),
    locked: true,
  };
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
  const interval = setInterval(() => {
    const r = JSON.parse(localStorage.getItem("wc_results") || "{}");
    callback(r);
  }, 5000);
  return () => clearInterval(interval);
};

const demoSaveKnockout = (playerName, predictions) => {
  const all = JSON.parse(localStorage.getItem("wc_players") || "{}");
  const key = sanitize(playerName);
  if (all[key]) {
    all[key].knockoutPredictions = predictions;
    all[key].knockoutLocked = true;
    all[key].knockoutSubmittedAt = Date.now();
  }
  localStorage.setItem("wc_players", JSON.stringify(all));
};

const demoKnockoutResults = (callback) => {
  callback(JSON.parse(localStorage.getItem("wc_knockout_results") || "{}"));
  const interval = setInterval(() => {
    callback(
      JSON.parse(localStorage.getItem("wc_knockout_results") || "{}")
    );
  }, 5000);
  return () => clearInterval(interval);
};

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