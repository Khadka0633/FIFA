import { useState, useEffect } from "react";
import {
  initFirebase,
  getPlayerData,
  cleanOldMessages,
  getKnockoutUnlocked,
  getKnockoutTeams,
  getResults,
} from "./utils/firebase";
import LoginPage from "./pages/LoginPage";
import PredictPage from "./pages/PredictPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminPage from "./pages/AdminPage";
import KnockoutPredictPage from "./pages/KnockoutPredictPage";
import { syncResults, syncKnockoutResults } from "./utils/resultsSync";
import { syncKnockoutTeams } from "./utils/qualifyTeams";

initFirebase();

const STORAGE_KEY = "wc2026_player";

export default function App() {
  const [page, setPage] = useState("login");
  const [player, setPlayer] = useState(null);
  const [myPredictions, setMyPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [knockoutUnlocked, setKnockoutUnlocked] = useState(false);
  const [knockoutTeams, setKnockoutTeams] = useState({});

  // ── Admin route ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (window.location.hash === "#admin") {
      setLoading(false);
      setPage("admin");
    }
  }, []);

  // ── API sync every 15 mins ────────────────────────────────────────────────
  useEffect(() => {
    syncResults();
    syncKnockoutResults();
    cleanOldMessages();
    const interval = setInterval(() => {
      syncResults();
      syncKnockoutResults();
    }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Firebase listeners ────────────────────────────────────────────────────
  useEffect(() => {
    const u1 = getKnockoutUnlocked(setKnockoutUnlocked);
    const u2 = getKnockoutTeams(setKnockoutTeams);
    return () => {
      if (typeof u1 === "function") u1();
      if (typeof u2 === "function") u2();
    };
  }, []);

  // ── Auto-sync knockoutTeams from group results ────────────────────────────
  useEffect(() => {
    const unsub = getResults((results) => {
      syncKnockoutTeams(results);
    });
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  // ── Auto-login from localStorage on first load ────────────────────────────
  useEffect(() => {
    if (window.location.hash === "#admin") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setLoading(false);
      return;
    }
    try {
      const { name, avatarFlag } = JSON.parse(saved);
      if (name && avatarFlag) {
        autoLogin(name, avatarFlag);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  // ── Core login logic (shared by auto and manual login) ────────────────────
  const autoLogin = async (name, avatarFlag) => {
    setLoading(true);
    const playerObj = { name, avatarFlag };
    setPlayer(playerObj);
    try {
      const existing = await getPlayerData(name);
      if (existing?.locked) {
        setMyPredictions(existing.predictions);
        setPlayer({
          ...playerObj,
          knockoutLocked: existing.knockoutLocked,
          knockoutPredictions: existing.knockoutPredictions,
        });
        setPage("leaderboard");
      } else if (knockoutUnlocked) {
        setPlayer({
          ...playerObj,
          knockoutLocked: existing?.knockoutLocked || false,
          knockoutPredictions: existing?.knockoutPredictions || {},
        });
        setPage("knockout");
      } else {
        setPage("predict");
      }
    } catch {
      setPage(knockoutUnlocked ? "knockout" : "predict");
    }
    setLoading(false);
  };

  // ── Manual login — saves to localStorage then logs in ────────────────────
  const handleLogin = async (name, avatarFlag) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, avatarFlag }));
    await autoLogin(name, avatarFlag);
  };

  const handleViewLeaderboard = () => {
    setPlayer({
      name: "Guest",
      avatarFlag: { flag: "🏳️", name: "Guest", code: "GST", iso: "un" },
      isGuest: true,
    });
    setPage("leaderboard");
  };

  const handleSubmitted = (predictions) => {
    setMyPredictions(predictions);
    setPage("leaderboard");
  };

  const handleKnockoutSubmitted = (preds) => {
    setPlayer((prev) => ({
      ...prev,
      knockoutLocked: true,
      knockoutPredictions: preds,
    }));
    setPage("leaderboard");
  };

  // ── Logout — clears localStorage and goes to login ────────────────────────
  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPlayer(null);
    setMyPredictions(null);
    setPage("login");
  };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#001A3D] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">⚽</div>
          <p className="text-[#7BA3D4] font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // ── Routes ────────────────────────────────────────────────────────────────
  if (page === "admin") return (
    <AdminPage
      onExit={() => setPage(player ? "leaderboard" : "login")}
      knockoutTeams={knockoutTeams}
    />
  );

  if (page === "login") return (
    <LoginPage
      onLogin={handleLogin}
      onViewLeaderboard={handleViewLeaderboard}
    />
  );

  if (page === "predict") return (
    <PredictPage
      player={player}
      onSubmitted={handleSubmitted}
    />
  );

  if (page === "knockout") return (
    <KnockoutPredictPage
      player={player}
      knockoutTeams={knockoutTeams}
      alreadyLocked={!!player?.knockoutLocked}
      existingPredictions={player?.knockoutPredictions || {}}
      onSubmitted={handleKnockoutSubmitted}
    />
  );

  if (page === "leaderboard") return (
    <LeaderboardPage
      player={player}
      myPredictions={myPredictions}
      knockoutUnlocked={knockoutUnlocked}
      knockoutTeams={knockoutTeams}
      onBack={handleLogout}
      onGoKnockout={() => setPage("knockout")}
    />
  );

  return null;
}
