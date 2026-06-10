import { useState, useEffect } from "react";
import { initFirebase, getPlayerData } from "./utils/firebase";
import LoginPage from "./pages/LoginPage";
import PredictPage from "./pages/PredictPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import { syncResults } from "./utils/resultsSync";
import AdminPage from "./pages/AdminPage";

initFirebase();

export default function App() {
  const [page, setPage] = useState("login");
  const [player, setPlayer] = useState(null);
  const [myPredictions, setMyPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.location.hash === "#admin") setPage("admin");
  }, []);

  useEffect(() => {
    syncResults();
    const interval = setInterval(syncResults, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (name, avatarFlag) => {
    const playerObj = { name, avatarFlag };
    setPlayer(playerObj);
    setPage("predict");

    try {
      const existing = await getPlayerData(name);
      if (existing?.locked) {
        setMyPredictions(existing.predictions);
        setPage("leaderboard");
      }
    } catch (e) {}
  };

  const handleViewLeaderboard = () => {
    setPlayer({ name: "Guest", avatarFlag: { flag: "🏳️", name: "Guest", code: "GST", iso: "un" } });
    setPage("leaderboard");
  };

  const handleSubmitted = (predictions) => {
    setMyPredictions(predictions);
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

  if (page === "admin") {
    return <AdminPage onExit={() => setPage(player ? "leaderboard" : "login")} />;
  }

  if (page === "login") {
    return <LoginPage onLogin={handleLogin} onViewLeaderboard={handleViewLeaderboard} />;
  }

  if (page === "predict") {
    return <PredictPage player={player} onSubmitted={handleSubmitted} />;
  }

  if (page === "leaderboard") {
    return <LeaderboardPage player={player} myPredictions={myPredictions} onBack={() => {}} />;
  }

  return null;
}