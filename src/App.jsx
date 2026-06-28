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

export default function App() {
  const [page, setPage] = useState("login");
  const [player, setPlayer] = useState(null);
  const [myPredictions, setMyPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [knockoutUnlocked, setKnockoutUnlocked] = useState(false);
  const [knockoutTeams, setKnockoutTeams] = useState({});

  // ── Admin route ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (window.location.hash === "#admin") setPage("admin");
  }, []);

  // ── Sync results from API every 15 mins ───────────────────────────────────
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

  // ── Listen to knockout unlock flag + knockout teams from Firebase ──────────
  useEffect(() => {
    const u1 = getKnockoutUnlocked(setKnockoutUnlocked);
    const u2 = getKnockoutTeams(setKnockoutTeams);
    return () => {
      if (typeof u1 === "function") u1();
      if (typeof u2 === "function") u2();
    };
  }, []);

  // ── Auto-sync knockoutTeams whenever group results change ─────────────────
  useEffect(() => {
    const unsub = getResults((results) => {
      syncKnockoutTeams(results);
    });
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleLogin = async (name, avatarFlag) => {
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
      } else {
        setPage("predict");
      }
    } catch (e) {
      setPage("predict");
    }
    setLoading(false);
  };

  const handleViewLeaderboard = () => {
    setPlayer({
      name: "Guest",
      avatarFlag: { flag: "🏳️", name: "Guest", code: "GST", iso: "un" },
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
      onBack={() => setPage("login")}
      onGoKnockout={() => setPage("knockout")}
    />
  );

  return null;
}
