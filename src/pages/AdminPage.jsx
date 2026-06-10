import { useState } from "react";
import { GROUP_STAGE_MATCHES, GROUPS, getTeam } from "../data/matches";
import { setResult } from "../utils/firebase";

const ADMIN_PASSWORD = "wc2026admin"; // Change this!

export default function AdminPage({ onExit }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [results, setResults] = useState({});
  const [saved, setSaved] = useState({});
  const [activeGroup, setActiveGroup] = useState("A");

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) setAuthed(true);
    else alert("Wrong password");
  };

  const handleSetResult = async (matchId, value) => {
    setResults((prev) => ({ ...prev, [matchId]: value }));
    try {
      await setResult(matchId, value);
      setSaved((prev) => ({ ...prev, [matchId]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [matchId]: false })), 1500);
    } catch (e) {
      alert("Failed to save result.");
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#001A3D] flex items-center justify-center px-4">
        <div className="bg-[#002657] border border-[#003F88] rounded-2xl p-8 w-full max-w-sm">
          <h1 className="text-white font-black text-2xl mb-1">Admin Panel</h1>
          <p className="text-[#4A6B8A] text-sm mb-6">Enter admin password to update results</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Password"
            className="w-full bg-[#001A3D] border border-[#003F88] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-[#FFD700] text-[#001A3D] font-black py-3 rounded-xl hover:bg-[#FFC200] transition-all"
          >
            Enter
          </button>
          <button onClick={onExit} className="w-full mt-3 text-[#4A6B8A] hover:text-white text-sm transition-colors">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const groupMatches = GROUP_STAGE_MATCHES.filter((m) => m.group === activeGroup);

  return (
    <div className="min-h-screen bg-[#001A3D]">
      <div className="sticky top-0 z-20 bg-[#001A3D]/95 backdrop-blur border-b border-[#003F88]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-white font-black text-xl">⚙️ Admin — Enter Results</h1>
          <button onClick={onExit} className="text-[#4A6B8A] hover:text-white text-sm transition-colors">
            ← Exit
          </button>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-1.5 overflow-x-auto">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeGroup === g ? "bg-[#FFD700] text-[#001A3D]" : "bg-[#002657] text-[#7BA3D4] hover:bg-[#003F88]"
              }`}
            >
              Group {g}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5">
        <p className="text-[#4A6B8A] text-xs mb-4">
          Click the winning team or Draw for each match. Results save instantly to Firebase.
        </p>
        <div className="space-y-3">
          {groupMatches.map((match) => {
            const home = getTeam(match.home);
            const away = getTeam(match.away);
            const currentResult = results[match.id];
            const options = [
              { value: match.home, label: `${home.flag} ${home.code}` },
              { value: "DRAW", label: "🤝 Draw" },
              { value: match.away, label: `${away.flag} ${away.code}` },
            ];
            return (
              <div key={match.id} className="bg-[#002657] border border-[#003F88] rounded-xl px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-bold">
                    {home.flag} {home.name} vs {away.name} {away.flag}
                  </span>
                  <span className="text-[#4A6B8A] text-[10px]">{match.date}</span>
                </div>
                <div className="flex gap-2">
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSetResult(match.id, opt.value)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        currentResult === opt.value
                          ? "bg-green-500/20 border border-green-500 text-green-400"
                          : "bg-[#001A3D] border border-[#003F88] text-[#7BA3D4] hover:border-[#7BA3D4]"
                      }`}
                    >
                      {opt.label}
                      {saved[match.id] && currentResult === opt.value && " ✓"}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
