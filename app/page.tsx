"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const PetDisplay = dynamic(
  () => import("@/components/PetDisplay").then((mod) => mod.PetDisplay),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[480px] items-center justify-center flex-col gap-3">
        <div className="h-12 w-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-600">3D entitás ébredése...</span>
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

interface ActivityItem {
  id: number;
  message: string;
  createdAt: string;
}

interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  gradient: string;
}

const STORAGE_KEY = "tamagochi-state-v4";
const MAX_LOG_ITEMS = 10;

const moodOptions: MoodOption[] = [
  { id: "vidam", label: "Vidám", emoji: "🌞", gradient: "from-amber-400 to-orange-500" },
  { id: "kreativ", label: "Kreatív", emoji: "🎨", gradient: "from-fuchsia-500 to-purple-600" },
  { id: "nyugodt", label: "Nyugodt", emoji: "🌙", gradient: "from-emerald-400 to-teal-500" },
  { id: "nosztalgikus", label: "Nosztalgikus", emoji: "📼", gradient: "from-sky-400 to-indigo-500" },
];

const clamp = (v: number) => Math.min(100, Math.max(0, v));

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [selectedMood, setSelectedMood] = useState("vidam");
  const [petAnimation, setPetAnimation] = useState<PetAnimation>("idle");
  const [stats, setStats] = useState({ hunger: 75, energy: 75, happiness: 75 });
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([]);
  const [now, setNow] = useState(Date.now());

  const { playSuccess, playError, playNotification } = useSoundEffects();
  const animationTimeoutRef = useRef<number | null>(null);

  const addActivity = useCallback((message: string) => {
    setActivityLog((prev) => [
      { id: Date.now(), message, createdAt: new Date().toISOString() },
      ...prev.slice(0, MAX_LOG_ITEMS - 1),
    ]);
  }, []);

  const triggerAnimation = useCallback((anim: PetAnimation, duration = 2500) => {
    if (animationTimeoutRef.current) window.clearTimeout(animationTimeoutRef.current);
    setPetAnimation(anim);
    animationTimeoutRef.current = window.setTimeout(() => setPetAnimation("idle"), duration);
  }, []);

  const handleFeed = () => {
    setStats((prev) => ({ ...prev, hunger: clamp(prev.hunger + 20), energy: clamp(prev.energy + 5) }));
    addActivity("Meg etetted a kis kedvencedet. 🍬");
    playNotification();
    triggerAnimation("eat", 3000);
  };

  const handlePlay = () => {
    setStats((prev) => ({ ...prev, happiness: clamp(prev.happiness + 15), energy: clamp(prev.energy - 10) }));
    addActivity("Játszottál egy jót! ✨");
    playNotification();
    triggerAnimation("play", 3000);
  };

  const handleRest = () => {
    setStats((prev) => ({ ...prev, energy: clamp(prev.energy + 25), hunger: clamp(prev.hunger - 5) }));
    addActivity("A tamagochi elszenderedett... 💤");
    playNotification();
    triggerAnimation("sleep", 4000);
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStats(parsed.stats || { hunger: 75, energy: 75, happiness: 75 });
        setProfileName(parsed.profileName || "");
        setSelectedMood(parsed.selectedMood || "vidam");
        setActivityLog(parsed.activityLog || []);
      } catch (e) { console.error("Load failed", e); }
    }
    setIsHydrated(true);
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ stats, profileName, selectedMood, activityLog }));
    }
  }, [stats, profileName, selectedMood, activityLog, isHydrated]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        hunger: clamp(prev.hunger - 2),
        energy: clamp(prev.energy - 1.5),
        happiness: clamp(prev.happiness - 1),
      }));
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (iso: string) => {
    const diff = Math.floor((now - new Date(iso).getTime()) / 1000);
    if (diff < 60) return "Most";
    if (diff < 3600) return `${Math.floor(diff / 60)}p`;
    return `${Math.floor(diff / 3600)}ó`;
  };

  const activeMood = useMemo(
    () => moodOptions.find((m) => m.id === selectedMood) || moodOptions[0],
    [selectedMood]
  );

  if (!isHydrated) return null;

  const overallHealth = Math.round((stats.hunger + stats.energy + stats.happiness) / 3);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Header */}
      <header className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-4">
          <div className="avatar-initials text-base">
            {profileName ? profileName.slice(0, 2).toUpperCase() : "TG"}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {profileName || "Névtelen Tamagochi"}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                Gondozói Napló · LVL 1
              </p>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                {overallHealth}% Egészség
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Adj nevet neki..."
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

        {/* Left: Stats & Actions */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          <StatCard label="Éhség" value={stats.hunger} icon="🍬" colorClass="bg-amber-500" />
          <StatCard label="Boldogság" value={stats.happiness} icon="🎉" colorClass="bg-pink-500" />
          <StatCard label="Energia" value={stats.energy} icon="⚡" colorClass="bg-emerald-500" />
          <ActionButtons
            onFeed={handleFeed}
            onPlay={handlePlay}
            onRest={handleRest}
            disabled={petAnimation !== "idle"}
          />
          <PartnerLinks />
        </div>

        {/* Center: The Pet */}
        <div className="lg:col-span-4">
          <div className="bento-card flex h-full items-center justify-center min-h-[560px] bg-gradient-to-b from-indigo-500/[0.03] to-transparent">
            <PetDisplay animation={petAnimation} moodGradient={activeMood.gradient} />
          </div>
        </div>

        {/* Right: Mood, Games, Log */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          <MoodSelector
            options={moodOptions}
            selectedId={selectedMood}
            onSelect={(id) => {
              setSelectedMood(id);
              triggerAnimation("alert", 1200);
              const mood = moodOptions.find(m => m.id === id);
              addActivity(`Aura váltás: ${mood?.label} ${mood?.emoji}`);
            }}
          />
          <MiniGames
            onSuccess={(msg) => {
              addActivity(msg);
              setStats((prev) => ({ ...prev, happiness: clamp(prev.happiness + 10) }));
              playSuccess();
              triggerAnimation("play");
            }}
            onMistake={(msg) => {
              addActivity(msg);
              setStats((prev) => ({ ...prev, happiness: clamp(prev.happiness - 5) }));
              playError();
              triggerAnimation("alert");
            }}
          />
          <ActivityLog
            activities={activityLog.map((a) => ({ ...a, timeAgo: formatTime(a.createdAt) }))}
          />
        </div>
      </div>

      <footer className="mt-10 text-center">
        <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-widest">
          Tipp: Az <span className="text-indigo-500">Aura</span> hangulata befolyásolja a kedvenced lelkiállapotát
        </p>
      </footer>
    </main>
  );
}
