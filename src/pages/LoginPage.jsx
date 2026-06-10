import { useState } from "react";
import { WC_TEAMS } from "../data/matches";
import FlagImg from "../components/FlagImg";

export default function LoginPage({ onLogin, onViewLeaderboard  }) {
  const [name, setName] = useState("");
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const filtered = WC_TEAMS.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleJoin = () => {
    if (!name.trim()) return setError("Enter your name to continue.");
    if (!selectedFlag) return setError("Pick a country flag as your avatar.");
    if (name.trim().length < 2) return setError("Name must be at least 2 characters.");
    onLogin(name.trim(), selectedFlag);
  };

  return (
    <div className="min-h-screen bg-[#001A3D] flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Pitch lines background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 border-[40px] border-white rounded-none" />
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-[2px] border-white" />
      </div>

      {/* Trophy glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FFD700] opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏆</div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none">
            WORLD CUP
            <span className="block text-[#FFD700]">2026</span>
          </h1>
          <p className="text-[#7BA3D4] mt-2 text-sm font-medium uppercase tracking-widest">
            Prediction Tournament
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#002657] border border-[#003F88] rounded-2xl p-6 shadow-2xl">
          <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
            <span className="w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center text-[#001A3D] text-xs font-black">1</span>
            Your name
          </h2>
          <p className="text-[#4A6B8A] text-xs mb-3">
  Already played? Enter the same name to continue.
</p>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="E.g. Aarav, Priya, Siddharth..."
            maxLength={24}
            className="w-full bg-[#001A3D] border border-[#003F88] rounded-xl px-4 py-3 text-white placeholder-[#4A6B8A] focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all text-sm"
          />

          <h2 className="text-white font-bold text-lg mt-6 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center text-[#001A3D] text-xs font-black">2</span>
            Your country avatar
          </h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country..."
            className="w-full bg-[#001A3D] border border-[#003F88] rounded-xl px-4 py-2.5 text-white placeholder-[#4A6B8A] focus:outline-none focus:border-[#FFD700] transition-all text-sm mb-3"
          />

          {selectedFlag && (
            <div className="mb-3 flex items-center gap-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl px-4 py-2">
              <FlagImg iso={selectedFlag.iso} size={28} />
              <span className="text-[#FFD700] font-bold text-sm">{selectedFlag.name} selected</span>
              <button onClick={() => setSelectedFlag(null)} className="ml-auto text-[#7BA3D4] hover:text-white text-xs">✕ change</button>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
            {filtered.map((team) => (
              <button
                key={team.code}
                onClick={() => { setSelectedFlag(team); setError(""); }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-center ${
                  selectedFlag?.code === team.code
                    ? "border-[#FFD700] bg-[#FFD700]/15 scale-95"
                    : "border-[#003F88] bg-[#001A3D] hover:border-[#7BA3D4] hover:bg-[#002657]"
                }`}
              >
                <FlagImg iso={team.iso} size={36} className="rounded-sm" />
                <span className="text-[10px] text-[#7BA3D4] font-medium leading-tight">{team.code}</span>
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-3 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              ⚠️ {error}
            </p>
          )}

         <button
  onClick={handleJoin}
  className="mt-6 w-full bg-[#FFD700] hover:bg-[#FFC200] text-[#001A3D] font-black text-lg py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#FFD700]/20 tracking-wide"
>
  {name.trim() ? "CONTINUE ⚽" : "ENTER THE TOURNAMENT ⚽"}
</button>
          <button
  onClick={onViewLeaderboard}
  className="mt-3 w-full border border-[#003F88] text-[#7BA3D4] font-bold py-3 rounded-xl hover:border-[#7BA3D4] hover:text-white transition-all"
>
  🏆 View Leaderboard
</button>

          <p className="text-center text-[#4A6B8A] text-xs mt-3">
            Predictions lock after you submit — choose wisely!
          </p>
        </div>

      </div>
    </div>
  );
}