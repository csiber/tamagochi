"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { PetDisplay } from "@/components/PetDisplay";
import { StatCard } from "@/components/StatCard";
import { ActionButtons } from "@/components/ActionButtons";
import { ActivityLog } from "@/components/ActivityLog";
import { MoodSelector } from "@/components/MoodSelector";
import { MiniGames } from "@/components/MiniGames";
import { CommunityList } from "@/components/CommunityList";
import { useSoundEffects } from "@/lib/sound-effects";

// Types
type PetAnimation = "idle" | "eat" | "play" | "sleep" | "alert";
type GameType = "reflex" | "hangulat" | "kincs";

interface TamagochiInfo {
  name: string;
  createdAt: string;
}

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

// Constants
const STORAGE_KEY = "tamagochi-state-v2";
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
  const [community, setCommunity] = useState<TamagochiInfo[]>([]);
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(true);
  const [now, setNow] = useState(Date.now());

  const { playSuccess, playError, playNotification } = useSoundEffects();
  const animationTimeoutRef = useRef<number | null>(null);

  // Helper: Add activity
  const addActivity = useCallback((message: string) => {
    setActivityLog((prev) => [
      { id: Date.now(), message, createdAt: new Date().toISOString() },
      ...prev.slice(0, MAX_LOG_ITEMS - 1)
    ]);
  }, []);

  // Helper: Trigger Animation
  const triggerAnimation = useCallback((anim: PetAnimation, duration = 2000) => {
    if (animationTimeoutRef.current) window.clearTimeout(animationTimeoutRef.current);
    setPetAnimation(anim);
    animationTimeoutRef.current = window.setTimeout(() => setPetAnimation("idle"), duration);
  }, []);

  // Actions
  const handleFeed = () => {
    setStats(prev => ({ ...prev, hunger: clamp(prev.hunger + 20), energy: clamp(prev.energy + 5) }));
    addActivity("Meg etetted a kis kedvencedet. 🍬");
    playNotification();
    triggerAnimation("eat");
  };

  const handlePlay = () => {
    setStats(prev => ({ ...prev, happiness: clamp(prev.happiness + 15), energy: clamp(prev.energy - 10) }));
    addActivity("Játszottál egy jót! ✨");
    playNotification();
    triggerAnimation("play");
  };

  const handleRest = () => {
    setStats(prev => ({ ...prev, energy: clamp(prev.energy + 25), hunger: clamp(prev.hunger - 5) }));
    addActivity("A tamagochi elszenderedett... 💤");
    playNotification();
    triggerAnimation("sleep", 3000);
  };

  // Hydration & Persistence
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStats(parsed.stats);
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

  // Tick logic
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        hunger: clamp(prev.hunger - 2),
        energy: clamp(prev.energy - 1.5),
        happiness: clamp(prev.happiness - 1)
      }));
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Community Sync
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const res = await fetch("/api/tamagotchis");
        const data = await res.json();
        if (data.tamagotchis) setCommunity(data.tamagotchis);
      } catch (e) { console.error("Sync failed", e); }
      finally { setIsLoadingCommunity(false); }
    };
    fetchCommunity();
    const interval = setInterval(fetchCommunity, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (iso: string) => {
    const diff = Math.floor((now - new Date(iso).getTime()) / 1000);
    if (diff < 60) return "Most";
    if (diff < 3600) return `${Math.floor(diff/60)}p`;
    return `${Math.floor(diff/3600)}ó`;
  };

  const activeMood = useMemo(() => moodOptions.find(m => m.id === selectedMood) || moodOptions[0], [selectedMood]);

  if (!isHydrated) return null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Header Section */}
      <header className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-4">
          <div className="avatar-initials text-xl">
            {profileName ? profileName.slice(0, 2).toUpperCase() : "TG"}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {profileName || "Névtelen Tamagochi"}
            </h1>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
              Gondozói Napló • LVL 1
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Adj nevet neki..."
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>
      </header>

      {/* Main Grid: Bento Style */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Column: Stats & Actions */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <StatCard 
            label="Éhség" 
            value={stats.hunger} 
            icon="🍽️" 
            colorClass="bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
          />
          <StatCard 
            label="Boldogság" 
            value={stats.happiness} 
            icon="🎉" 
            colorClass="bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]" 
          />
          <StatCard 
            label="Energia" 
            value={stats.energy} 
            icon="⚡" 
            colorClass="bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
          />
          <ActionButtons 
            onFeed={handleFeed} 
            onPlay={handlePlay} 
            onRest={handleRest} 
            disabled={petAnimation !== 'idle'}
          />
          <CommunityList tamagotchis={community} isLoading={isLoadingCommunity} />
        </div>

        {/* Center Column: The Pet */}
        <div className="lg:col-span-4">
          <div className="bento-card flex h-full items-center justify-center bg-gradient-to-b from-white/[0.05] to-transparent">
            <PetDisplay animation={petAnimation} moodGradient={activeMood.gradient} />
          </div>
        </div>

        {/* Right Column: Mood & Log */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <MoodSelector 
            options={moodOptions} 
            selectedId={selectedMood} 
            onSelect={(id) => {
              setSelectedMood(id);
              triggerAnimation("alert", 1000);
              addActivity(`Aura váltás: ${id} 🌈`);
            }} 
          />
          <MiniGames 
            onSuccess={(msg) => {
              addActivity(msg);
              setStats(prev => ({ ...prev, happiness: clamp(prev.happiness + 10) }));
              playSuccess();
              triggerAnimation("play");
            }}
            onMistake={(msg) => {
              addActivity(msg);
              setStats(prev => ({ ...prev, happiness: clamp(prev.happiness - 5) }));
              playError();
              triggerAnimation("alert");
            }}
          />
          <ActivityLog 
            activities={activityLog.map(a => ({ ...a, timeAgo: formatTime(a.createdAt) }))} 
          />
        </div>
      </div>

      {/* Footer / Tip Section */}
      <footer className="mt-12 text-center">
        <p className="text-sm font-medium text-slate-600">
          Tipp: A kiválasztott <span className="text-emerald-500">Aura</span> befolyásolja a kedvenced hangulatát!
        </p>
      </footer>
    </main>
  );
}
