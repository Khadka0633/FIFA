import { useState, useEffect } from "react";
import { initFirebase, getPlayerData, cleanOldMessages } from "./utils/firebase";
import LoginPage from "./pages/LoginPage";
import PredictPage from "./pages/PredictPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import { syncResults, syncKnockoutResults } from "./utils/resultsSync";
import AdminPage from "./pages/AdminPage";
import KnockoutPredictPage from "./pages/KnockoutPredictPage";
import { getKnockoutUnlocked, getKnockoutTeams } from "./utils/firebase";
import { getKnockoutTeams as listenKnockoutTeams } from "./utils/qualifyTeams";
import { getResults } from "./utils/firebase";
import { syncKnockoutTeams } from "./utils/qualifyTeams";

initFirebase();

export default function App() {
  const [page, setPage] = useState("login");
  const [player, setPlayer] = useState(null);
  const [myPredictions, setMyPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [knockoutUnlocked, setKnockoutUnlocked] = useState(false);
  const [knockoutTeams, setKnockoutTeams] = useState({});

  useEffect(() => {
    if (window.location.hash === "#admin") setPage("admin");
  }, []);

  useEffect(() => {
    syncResults();
    cleanOldMessages();
    const interval = setInterval(syncResults, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const u1 = getKnockoutUnlocked(setKnockoutUnlocked);
    const u2 = listenKnockoutTeams(setKnockoutTeams);
    return () => {
      if (typeof u1 === "function") u1();
      if (typeof u2 === "function") u2();
    };
  }, []);

  useEffect(() => {
  const unsub = getResults((results) => {
    syncKnockoutTeams(results);
  });
  return () => { if (typeof unsub === "function") unsub(); };
}, []);


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

  const handleLogin = async (name, avatarFlag) => {
    setLoading(true);
    const playerObj = { name, avatarFlag };
    setPlayer(playerObj);
    try {
      const existing = await getPlayerData(name);
      if (existing?.locked) {
        setMyPredictions(existing.predictions);
        // Merge knockout data into player object
        setPlayer({ ...playerObj, knockoutLocked: existing.knockoutLocked, knockoutPredictions: existing.knockoutPredictions });
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
    setPlayer({ name: "Guest", avatarFlag: { flag: "🏳️", name: "Guest", code: "GST", iso: "un" } });
    setPage("leaderboard");
  };

  const handleSubmitted = (predictions) => {
    setMyPredictions(predictions);
    setPage("leaderboard");
  };

  const handleKnockoutSubmitted = (preds) => {
    setPlayer(prev => ({ ...prev, knockoutLocked: true, knockoutPredictions: preds }));
    setPage("leaderboard");
  };

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

  if (page === "admin") return (
    <AdminPage
      onExit={() => setPage(player ? "leaderboard" : "login")}
      knockoutTeams={knockoutTeams}
    />
  );
  if (page === "login") return (
    <LoginPage onLogin={handleLogin} onViewLeaderboard={handleViewLeaderboard} />
  );
  if (page === "predict") return (
    <PredictPage player={player} onSubmitted={handleSubmitted} />
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
      onBack={() => setPage("login")}
      onGoKnockout={() => setPage("knockout")}
    />
  );

  return null;
}