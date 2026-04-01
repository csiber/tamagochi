"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PetDisplay = dynamic(
  () => import("@/components/PetDisplay").then((mod) => mod.PetDisplay),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[520px] items-center justify-center flex-col gap-4">
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "2px solid rgba(124,111,247,0.2)",
          borderTopColor: "#7c6ff7",
          animation: "spin 0.9s linear infinite"
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", color: "#475569", textTransform: "uppercase" }}>
          3D entitás ébredése...
        </span>
      </div>
    ),
  }
);

import { StatCard } from "@/components/StatCard";
import { ActionButtons } from "@/components/ActionButtons";
import { ActivityLog } from "@/components/ActivityLog";
import { MoodSelector } from "@/components/MoodSelector";
import { MiniGames } from "@/components/MiniGames";
import { PartnerLinks } from "@/components/PartnerLinks";
import { useSoundEffects } from "@/lib/sound-effects";

type PetAnimation = "idle" | "eat" | "play" | "sleep" | "alert";

interface ActivityItem { id: number; message: string; createdAt: string; }
interface MoodOption { id: string; label: string; emoji: string; gradient: string; }

const STORAGE_KEY = "tamagochi-state-v5";
const MAX_LOG = 10;

const moodOptions: MoodOption[] = [
  { id: "vidam",       label: "Vidám",       emoji: "🌞", gradient: "from-amber-400 to-orange-500" },
  { id: "kreativ",     label: "Kreatív",     emoji: "🎨", gradient: "from-fuchsia-500 to-purple-600" },
  { id: "nyugodt",     label: "Nyugodt",     emoji: "🌙", gradient: "from-emerald-400 to-teal-500" },
  { id: "nosztalgikus",label: "Nosztalgikus",emoji: "📼", gradient: "from-sky-400 to-indigo-500" },
];

const clamp = (v: number) => Math.min(100, Math.max(0, v));

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [selectedMood, setSelectedMood] = useState("vidam");
  const [petAnim, setPetAnim] = useState<PetAnimation>("idle");
  const [stats, setStats] = useState({ hunger: 75, energy: 75, happiness: 75 });
  const [xp, setXp] = useState(0);
  const [log, setLog] = useState<ActivityItem[]>([]);
  const [now, setNow] = useState(Date.now());
  const [floats, setFloats] = useState<{ id: number; text: string; x: number }[]>([]);

  const { playSuccess, playError, playNotification } = useSoundEffects();
  const animRef = useRef<number | null>(null);

  const addLog = useCallback((msg: string) => {
    setLog(prev => [{ id: Date.now(), message: msg, createdAt: new Date().toISOString() }, ...prev.slice(0, MAX_LOG - 1)]);
  }, []);

  const showFloat = useCallback((text: string) => {
    const id = Date.now();
    const x = 40 + Math.random() * 20;
    setFloats(f => [...f, { id, text, x }]);
    setTimeout(() => setFloats(f => f.filter(i => i.id !== id)), 1500);
  }, []);

  const triggerAnim = useCallback((anim: PetAnimation, ms = 2800) => {
    if (animRef.current) window.clearTimeout(animRef.current);
    setPetAnim(anim);
    animRef.current = window.setTimeout(() => setPetAnim("idle"), ms);
  }, []);

  const gainXp = (amt: number) => setXp(p => p + amt);

  const handleFeed = () => {
    setStats(p => ({ ...p, hunger: clamp(p.hunger + 20), energy: clamp(p.energy + 5) }));
    addLog("Meg etetted a kis kedvencedet. 🍬");
    showFloat("+20 Éhség");
    gainXp(10);
    playNotification();
    triggerAnim("eat", 3200);
  };
  const handlePlay = () => {
    setStats(p => ({ ...p, happiness: clamp(p.happiness + 15), energy: clamp(p.energy - 10) }));
    addLog("Játszottál egy jót! ✨");
    showFloat("+15 Boldogság");
    gainXp(12);
    playNotification();
    triggerAnim("play", 3200);
  };
  const handleRest = () => {
    setStats(p => ({ ...p, energy: clamp(p.energy + 25), hunger: clamp(p.hunger - 5) }));
    addLog("A tamagochi elszenderedett... 💤");
    showFloat("+25 Energia");
    gainXp(8);
    playNotification();
    triggerAnim("sleep", 4200);
  };

  // Hydrate
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setStats(p.stats || { hunger: 75, energy: 75, happiness: 75 });
        setProfileName(p.profileName || "");
        setSelectedMood(p.selectedMood || "vidam");
        setLog(p.log || []);
        setXp(p.xp || 0);
      } catch {}
    }
    setHydrated(true);
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (hydrated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ stats, profileName, selectedMood, log, xp }));
  }, [stats, profileName, selectedMood, log, xp, hydrated]);

  // Tick
  useEffect(() => {
    const iv = setInterval(() => {
      setStats(p => ({
        hunger: clamp(p.hunger - 2),
        energy: clamp(p.energy - 1.5),
        happiness: clamp(p.happiness - 1),
      }));
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  const formatTime = (iso: string) => {
    const d = Math.floor((now - new Date(iso).getTime()) / 1000);
    if (d < 60) return "Most";
    if (d < 3600) return `${Math.floor(d / 60)}p`;
    return `${Math.floor(d / 3600)}ó`;
  };

  const activeMood = useMemo(() => moodOptions.find(m => m.id === selectedMood) || moodOptions[0], [selectedMood]);
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const health = Math.round((stats.hunger + stats.energy + stats.happiness) / 3);
  const healthColor = health >= 60 ? "#10b981" : health >= 30 ? "#f59e0b" : "#f87171";

  if (!hydrated) return null;

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem", position: "relative", zIndex: 1 }}>

      {/* ── Header ── */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div className="avatar-initials">
            {profileName ? profileName.slice(0, 2).toUpperCase() : "TG"}
          </div>
          <div>
            {editingName ? (
              <input
                autoFocus
                type="text"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={e => e.key === "Enter" && setEditingName(false)}
                style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8, padding: "2px 10px", color: "#fff", fontSize: "1.4rem",
                  fontWeight: 800, fontFamily: "inherit", outline: "none", width: 220
                }}
                placeholder="Adj nevet..."
              />
            ) : (
              <h1
                onClick={() => setEditingName(true)}
                style={{ fontSize: "1.5rem", fontWeight: 800, cursor: "pointer", letterSpacing: "-0.01em", margin: 0 }}
                title="Kattints a névhez"
              >
                {profileName || "Névtelen Tamagochi"}
                <span style={{ fontSize: "0.75rem", color: "#7c6ff7", marginLeft: 8 }}>✏️</span>
              </h1>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em", color: "#475569", textTransform: "uppercase" }}>
                Gondozói Napló · LVL {level}
              </span>
              <span className="aura-active-badge">
                {activeMood.emoji} {activeMood.label}
              </span>
              <span style={{
                fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "0.18rem 0.55rem", borderRadius: 99,
                background: `${healthColor}22`, color: healthColor, border: `1px solid ${healthColor}44`
              }}>
                {health}% Egészség
              </span>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, minWidth: 160 }}>
          <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", color: "#475569", textTransform: "uppercase" }}>
            XP · {xp} pont
          </span>
          <div style={{ width: 160, height: 6, borderRadius: 99, background: "rgba(0,0,0,0.4)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              width: `${xpInLevel}%`,
              background: "linear-gradient(90deg,#7c6ff7,#a855f7)",
              boxShadow: "0 0 8px #7c6ff788",
              transition: "width 0.6s ease"
            }} />
          </div>
          <span style={{ fontSize: "0.58rem", color: "#334155", fontWeight: 600 }}>{xpInLevel}/100 → LVL {level + 1}</span>
        </div>
      </header>

      {/* ── Main grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem", alignItems: "start" }}>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <StatCard label="Éhség"    value={stats.hunger}    icon="🍬" colorClass="bg-amber-500" />
          <StatCard label="Boldogság" value={stats.happiness} icon="🎉" colorClass="bg-pink-500" />
          <StatCard label="Energia"  value={stats.energy}    icon="⚡" colorClass="bg-emerald-500" />
          <ActionButtons onFeed={handleFeed} onPlay={handlePlay} onRest={handleRest} disabled={petAnim !== "idle"} />
          <PartnerLinks />
        </div>

        {/* CENTER — Pet */}
        <div className="bento-card" style={{
          padding: 0, overflow: "hidden",
          background: "linear-gradient(180deg, rgba(124,111,247,0.04) 0%, rgba(0,0,0,0) 100%)",
          position: "relative", minHeight: 560
        }}>
          {/* Floating XP notifs */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10, overflow: "hidden" }}>
            {floats.map(f => (
              <div key={f.id} style={{
                position: "absolute", left: `${f.x}%`, bottom: "15%",
                transform: "translateX(-50%)",
                fontSize: "0.75rem", fontWeight: 800, color: "#a5b4fc",
                letterSpacing: "0.08em", textShadow: "0 0 12px #7c6ff7",
                animation: "floatUp 1.4s ease-out forwards",
              }}>
                {f.text}
              </div>
            ))}
          </div>
          <style>{`
            @keyframes floatUp {
              0%   { opacity: 0; transform: translateX(-50%) translateY(0px); }
              15%  { opacity: 1; }
              100% { opacity: 0; transform: translateX(-50%) translateY(-80px); }
            }
          `}</style>
          <PetDisplay animation={petAnim} moodGradient={activeMood.gradient} />
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <MoodSelector
            options={moodOptions}
            selectedId={selectedMood}
            onSelect={id => {
              setSelectedMood(id);
              triggerAnim("alert", 1200);
              const m = moodOptions.find(x => x.id === id);
              addLog(`Aura váltás: ${m?.label} ${m?.emoji}`);
            }}
          />
          <MiniGames
            onSuccess={msg => {
              addLog(msg); gainXp(15);
              setStats(p => ({ ...p, happiness: clamp(p.happiness + 10) }));
              showFloat("+10 Boldogság");
              playSuccess(); triggerAnim("play");
            }}
            onMistake={msg => {
              addLog(msg);
              setStats(p => ({ ...p, happiness: clamp(p.happiness - 5) }));
              playError(); triggerAnim("alert");
            }}
          />
          <ActivityLog activities={log.map(a => ({ ...a, timeAgo: formatTime(a.createdAt) }))} />
        </div>
      </div>

      <footer style={{ marginTop: "2rem", textAlign: "center" }}>
        <p style={{ fontSize: "0.62rem", fontWeight: 600, color: "#1e293b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Tipp: Az <span style={{ color: "#7c6ff7" }}>Aura</span> befolyásolja a kedvenced lelkiállapotát
        </p>
      </footer>
    </main>
  );
}
