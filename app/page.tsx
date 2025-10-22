"use client";

import type { ChangeEvent, FormEvent } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { pressStart } from "./fonts";

type FeedbackType = "success" | "error" | "info";

interface FeedbackMessage {
  type: FeedbackType;
  message: string;
}

interface MoodOption {
  id: string;
  label: string;
  description: string;
  emoji: string;
  gradient: string;
}

interface ActivityItem {
  id: number;
  message: string;
  timeAgo: string;
}

interface TamagochiInfo {
  name: string;
  createdAt: string;
}

const MAX_LOG_ITEMS = 7;
const INITIAL_STATUS = "A tamagochi kíváncsian pislog a világra.";

const moodOptions: MoodOption[] = [
  {
    id: "vidam",
    label: "Vidám",
    description: "Neonfényű park, sok kacagás és pattogó pixel labdák.",
    emoji: "🌞",
    gradient: "from-amber-400/80 to-orange-400/40",
  },
  {
    id: "kreativ",
    label: "Kreatív",
    description: "Rajztábla, csillámos sprite-ok és végtelen fantázia.",
    emoji: "🎨",
    gradient: "from-fuchsia-500/70 to-purple-500/40",
  },
  {
    id: "nyugodt",
    label: "Nyugodt",
    description: "Csillagos ég, halk lo-fi és lassú szuszogás.",
    emoji: "🌙",
    gradient: "from-emerald-400/70 to-teal-500/30",
  },
  {
    id: "nosztalgikus",
    label: "Nosztalgikus",
    description: "8-bites emlékek, kazettás magnó és békebeli játékok.",
    emoji: "📼",
    gradient: "from-sky-400/70 to-indigo-500/40",
  },
];

const initialActivity: ActivityItem[] = [
  {
    id: 1,
    message: "A tojás megrepedt és egy kíváncsi tamagochi bukkant elő!",
    timeAgo: "néhány perce",
  },
  {
    id: 2,
    message: "Megsimogattad a pixel bundáját.",
    timeAgo: "nemrég",
  },
  {
    id: 3,
    message: "A tamagochi megfigyelte a neonfényű eget.",
    timeAgo: "nemrég",
  },
];

const slugifyHungarian = (value: string) => {
  const normalised = value
    .trim()
    .toLocaleLowerCase("hu-HU")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalised || "pixel-tamagochi";
};

const initialsFromName = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "TG";
  }

  if (words.length === 1) {
    return words[0]!.slice(0, 2).toUpperCase();
  }

  return `${words[0]!.charAt(0)}${words[words.length - 1]!.charAt(0)}`.toUpperCase();
};

const namesEqual = (first: string, second: string) =>
  first.trim().toLocaleLowerCase("hu-HU") === second.trim().toLocaleLowerCase("hu-HU");

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const formatElapsedTime = (createdAt: string, nowMs: number) => {
  const createdTime = Date.parse(createdAt);

  if (Number.isNaN(createdTime)) {
    return "Ismeretlen ideje";
  }

  const diffMs = Math.max(0, nowMs - createdTime);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  const formatQuantity = (value: number, singular: string, plural: string) =>
    value === 1 ? singular : `${value} ${plural}`;

  if (diffMs < minute) {
    return "Néhány másodperce";
  }

  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return formatQuantity(minutes, "1 perce", `${minutes} perce`);
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return formatQuantity(hours, "1 órája", `${hours} órája`);
  }

  if (diffMs < month) {
    const days = Math.floor(diffMs / day);
    return formatQuantity(days, "1 napja", `${days} napja`);
  }

  if (diffMs < year) {
    const months = Math.floor(diffMs / month);
    return formatQuantity(months, "1 hónapja", `${months} hónapja`);
  }

  const years = Math.floor(diffMs / year);
  return formatQuantity(years, "1 éve", `${years} éve`);
};

const formatBirthDate = (createdAt: string) => {
  const createdTime = Date.parse(createdAt);

  if (Number.isNaN(createdTime)) {
    return null;
  }

  return new Date(createdTime).toLocaleString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Home() {
  const [profileName, setProfileName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [nameMessage, setNameMessage] = useState<FeedbackMessage | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isClearingName, setIsClearingName] = useState(false);

  const [selectedMood, setSelectedMood] = useState<string>(moodOptions[0]!.id);
  const [tamagochiStatus, setTamagochiStatus] = useState<string>(INITIAL_STATUS);
  const [tamagotchiStats, setTamagotchiStats] = useState({
    hunger: 68,
    energy: 72,
    happiness: 70,
  });
  const [careStats, setCareStats] = useState({
    meals: 0,
    plays: 0,
    rests: 0,
  });
  const [activityLog, setActivityLog] = useState<ActivityItem[]>(initialActivity);

  const [tamagotchis, setTamagotchis] = useState<TamagochiInfo[]>([]);
  const [tamagotchiError, setTamagotchiError] = useState<string | null>(null);
  const [isLoadingTamagotchis, setIsLoadingTamagotchis] = useState(true);
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());

  const warningRef = useRef({ hunger: false, energy: false, happiness: false });

  const addActivity = useCallback((message: string) => {
    setActivityLog((prev) => [
      { id: Date.now(), message, timeAgo: "épp most" },
      ...prev.slice(0, MAX_LOG_ITEMS - 1),
    ]);
  }, []);

  const applyStatChanges = useCallback(
    (changes: Partial<{ hunger: number; energy: number; happiness: number }>) => {
      setTamagotchiStats((previous) => ({
        hunger: clamp(previous.hunger + (changes.hunger ?? 0)),
        energy: clamp(previous.energy + (changes.energy ?? 0)),
        happiness: clamp(previous.happiness + (changes.happiness ?? 0)),
      }));
    },
    [],
  );

  const refreshTamagotchis = useCallback(async () => {
    setIsLoadingTamagotchis(true);
    setTamagotchiError(null);

    try {
      const response = await fetch("/api/tamagotchis", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Hibás válaszkód: ${response.status}`);
      }

      const data: { tamagotchis?: TamagochiInfo[]; error?: string } =
        await response.json();

      if (!data.tamagotchis) {
        throw new Error(data.error ?? "Hiányzó tamagochi adatok.");
      }

      setTamagotchis(data.tamagotchis);
    } catch (error) {
      console.error("Nem sikerült frissíteni a tamagochi listát", error);
      setTamagotchiError("Nem sikerült betölteni a tamagochi társakat.");
    } finally {
      setIsLoadingTamagotchis(false);
    }
  }, []);

  useEffect(() => {
    const fetchStoredName = async () => {
      try {
        const response = await fetch("/api/pet-name", {
          credentials: "include",
        });

        if (!response.ok) {
          return;
        }

        const data: { name?: string | null } = await response.json();
        if (data.name && data.name.trim().length > 0) {
          setProfileName(data.name);
          setNameInput(data.name);
          setNameMessage({
            type: "info",
            message: "A tamagochi neve betöltve a sessionből.",
          });
        }
      } catch (error) {
        console.error("Nem sikerült betölteni a tamagochi nevét", error);
      }
    };

    void fetchStoredName();
    void refreshTamagotchis();
  }, [refreshTamagotchis]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowTimestamp(Date.now());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const delta = { hunger: -3, energy: -2, happiness: -2 };

      if (selectedMood === "vidam") {
        delta.hunger -= 1;
        delta.happiness += 0.5;
      } else if (selectedMood === "nyugodt") {
        delta.energy += 0.7;
      } else if (selectedMood === "nosztalgikus") {
        delta.happiness += 0.8;
      }

      applyStatChanges(delta);
    }, 12_000);

    return () => window.clearInterval(interval);
  }, [applyStatChanges, selectedMood]);

  useEffect(() => {
    const selectedMoodOption =
      moodOptions.find((option) => option.id === selectedMood) ?? moodOptions[0]!;

    const averageMood =
      (tamagotchiStats.hunger + tamagotchiStats.energy + tamagotchiStats.happiness) / 3;

    if (averageMood >= 75) {
      setTamagochiStatus(
        `${selectedMoodOption.emoji} ${selectedMoodOption.label} üzemmód: boldogan csillog a kis pixel lény!`,
      );
    } else if (averageMood >= 55) {
      setTamagochiStatus(
        `${selectedMoodOption.emoji} A tamagochi kiegyensúlyozott és kíváncsian figyel.`,
      );
    } else if (averageMood >= 35) {
      setTamagochiStatus(
        `${selectedMoodOption.emoji} Kicsit nyűgös, jólesne neki egy kis törődés.`,
      );
    } else {
      setTamagochiStatus(
        `${selectedMoodOption.emoji} Vészjelzés! A tamagochi sürgősen gondoskodásra vágyik.`,
      );
    }
  }, [selectedMood, tamagotchiStats.happiness, tamagotchiStats.energy, tamagotchiStats.hunger]);

  useEffect(() => {
    const warnings: string[] = [];

    if (tamagotchiStats.hunger <= 25 && !warningRef.current.hunger) {
      warnings.push("A tamagochi éhesen morog.");
      warningRef.current.hunger = true;
    } else if (tamagotchiStats.hunger > 40 && warningRef.current.hunger) {
      warningRef.current.hunger = false;
    }

    if (tamagotchiStats.energy <= 25 && !warningRef.current.energy) {
      warnings.push("A tamagochi kezd lemerülni, ideje pihenni.");
      warningRef.current.energy = true;
    } else if (tamagotchiStats.energy > 40 && warningRef.current.energy) {
      warningRef.current.energy = false;
    }

    if (tamagotchiStats.happiness <= 30 && !warningRef.current.happiness) {
      warnings.push("A tamagochi hiányolja a játékot.");
      warningRef.current.happiness = true;
    } else if (tamagotchiStats.happiness > 45 && warningRef.current.happiness) {
      warningRef.current.happiness = false;
    }

    warnings.forEach((warning) => addActivity(warning));
  }, [addActivity, tamagotchiStats.energy, tamagotchiStats.happiness, tamagotchiStats.hunger]);

  const handleNameInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNameInput(event.target.value);
  };

  const handleSaveName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = nameInput.trim();

    if (!trimmedName) {
      setNameMessage({
        type: "error",
        message: "Adj meg egy nevet a tamagochinak!",
      });
      return;
    }

    setIsSavingName(true);
    setNameMessage(null);

    try {
      const response = await fetch("/api/pet-name", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      const data: { name?: string; error?: string } = await response.json();

      if (!response.ok) {
        setNameMessage({
          type: "error",
          message: data.error ?? "Nem sikerült elmenteni a tamagochi nevét.",
        });
        return;
      }

      if (data.name) {
        setProfileName(data.name);
        setNameInput(data.name);
      }

      setNameMessage({
        type: "success",
        message: "Siker! A tamagochi neve elmentve.",
      });
      addActivity("Nevet adtál a tamagochinak.");
      void refreshTamagotchis();
    } catch (error) {
      console.error("Nem sikerült menteni a tamagochi nevét", error);
      setNameMessage({
        type: "error",
        message: "Ismeretlen hiba történt mentés közben.",
      });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleClearName = async () => {
    setIsClearingName(true);
    setNameMessage(null);

    try {
      const response = await fetch("/api/pet-name", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        setNameMessage({
          type: "error",
          message: "Nem sikerült törölni a tamagochi nevét.",
        });
        return;
      }

      setProfileName("");
      setNameInput("");
      setNameMessage({
        type: "info",
        message: "A tamagochi neve törlésre került a sessionből.",
      });
      addActivity("Eltávolítottad a tamagochi nevét.");
      void refreshTamagotchis();
    } catch (error) {
      console.error("Nem sikerült törölni a tamagochi nevét", error);
      setNameMessage({
        type: "error",
        message: "Váratlan hiba történt a törlés közben.",
      });
    } finally {
      setIsClearingName(false);
    }
  };

  const handleMoodSelection = (moodId: string) => {
    if (moodId === selectedMood) {
      return;
    }

    const selected = moodOptions.find((option) => option.id === moodId);
    setSelectedMood(moodId);

    if (selected) {
      addActivity(`Hangulat mód: ${selected.label}.`);
    }
  };

  const handleFeed = () => {
    const hungerBoost = selectedMood === "vidam" ? 20 : 18;
    const happinessBoost = selectedMood === "nosztalgikus" ? 8 : 6;
    applyStatChanges({ hunger: hungerBoost, happiness: happinessBoost, energy: 4 });
    setCareStats((previous) => ({
      ...previous,
      meals: previous.meals + 1,
    }));
    addActivity("Finom pixel-ebédet kapott a tamagochi.");
  };

  const handlePlay = () => {
    const energyCost = selectedMood === "kreativ" ? -3 : -6;
    const happinessBoost = selectedMood === "vidam" ? 14 : 12;
    applyStatChanges({ happiness: happinessBoost, energy: energyCost, hunger: -4 });
    setCareStats((previous) => ({
      ...previous,
      plays: previous.plays + 1,
    }));
    addActivity("Játékra hívtad a tamagochit.");
  };

  const handleRest = () => {
    const energyBoost = selectedMood === "nyugodt" ? 22 : 16;
    applyStatChanges({ energy: energyBoost, hunger: -3, happiness: 4 });
    setCareStats((previous) => ({
      ...previous,
      rests: previous.rests + 1,
    }));
    addActivity("Lefektetted egy kis pihenésre.");
  };

  const selectedMoodOption = useMemo(
    () => moodOptions.find((option) => option.id === selectedMood) ?? moodOptions[0]!,
    [selectedMood],
  );

  const displayName = profileName || "Névtelen tamagochi";
  const profileInitials = useMemo(() => initialsFromName(displayName), [displayName]);
  const tamagochiHandle = useMemo(() => slugifyHungarian(displayName), [displayName]);

  const myTamagochi = useMemo(
    () =>
      tamagotchis.find((record) => profileName && namesEqual(record.name, profileName)) ?? null,
    [profileName, tamagotchis],
  );

  const tamagochiAgeText = useMemo(() => {
    if (!myTamagochi) {
      return "A névadás után indul a közös történet.";
    }

    return formatElapsedTime(myTamagochi.createdAt, nowTimestamp);
  }, [myTamagochi, nowTimestamp]);

  const tamagochiBirthDate = useMemo(() => {
    if (!myTamagochi) {
      return null;
    }

    return formatBirthDate(myTamagochi.createdAt);
  }, [myTamagochi]);

  const otherTamagotchis = useMemo(
    () =>
      tamagotchis.filter((record) =>
        profileName ? !namesEqual(record.name, profileName) : true,
      ),
    [profileName, tamagotchis],
  );

  const statItems = useMemo(
    () => [
      {
        id: "hunger",
        label: "Jóllakottság",
        value: tamagotchiStats.hunger,
        accent: "from-amber-300/80 to-orange-500/80",
        icon: "🍽️",
      },
      {
        id: "happiness",
        label: "Kedv",
        value: tamagotchiStats.happiness,
        accent: "from-pink-300/80 to-fuchsia-500/80",
        icon: "🎉",
      },
      {
        id: "energy",
        label: "Energia",
        value: tamagotchiStats.energy,
        accent: "from-emerald-300/80 to-teal-500/80",
        icon: "⚡",
      },
    ],
    [tamagotchiStats.energy, tamagotchiStats.happiness, tamagotchiStats.hunger],
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="community-gradient">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 lg:grid lg:grid-cols-[280px_1fr_320px] lg:px-6">
          <aside className="space-y-6">
            <section className="community-card space-y-6">
              <header className="flex items-center gap-4">
                <div className="avatar-ring">
                  <span>{profileInitials}</span>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">
                    {pressStart.className ? (
                      <span className={pressStart.className}>Gondozó</span>
                    ) : (
                      "Gondozó"
                    )}
                  </p>
                  <h2 className="text-xl font-semibold text-slate-50">{displayName}</h2>
                  <p className="text-xs text-slate-400">@{tamagochiHandle}</p>
                  <p className="mt-1 text-xs text-emerald-200">Mióta él: {tamagochiAgeText}</p>
                  {tamagochiBirthDate && (
                    <p className="text-xs text-slate-400">Kikelés: {tamagochiBirthDate}</p>
                  )}
                </div>
              </header>

              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  Nevezd el a tamagochit, hogy a történetetek bekerüljön a naplóba.
                </p>
                <form onSubmit={handleSaveName} className="space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={handleNameInputChange}
                      placeholder="Tamagochi neve"
                      className="flex-1 rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                      maxLength={32}
                    />
                    <button
                      type="submit"
                      className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
                      disabled={isSavingName}
                    >
                      {isSavingName ? "Mentés..." : "Mentés"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearName}
                    className="w-full rounded-2xl border border-emerald-400/40 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-400/10"
                    disabled={isClearingName}
                  >
                    {isClearingName ? "Törlés folyamatban..." : "Név törlése"}
                  </button>
                </form>
                {nameMessage && (
                  <p
                    className={`text-sm ${
                      nameMessage.type === "success"
                        ? "text-emerald-300"
                        : nameMessage.type === "error"
                        ? "text-rose-300"
                        : "text-slate-300"
                    }`}
                  >
                    {nameMessage.message}
                  </p>
                )}
              </div>
            </section>

            <section className="community-card space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">
                Hangulat modulok
              </h3>
              <p className="text-sm text-slate-300">
                Válaszd ki, milyen aurába burkoljuk a tamagochit ma este.
              </p>
              <div className="grid gap-3">
                {moodOptions.map((option) => {
                  const isActive = option.id === selectedMood;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleMoodSelection(option.id)}
                      className={`flex w-full items-start gap-3 rounded-2xl border bg-slate-900/30 p-3 text-left transition hover:border-emerald-400/50 hover:bg-slate-900/60 ${
                        isActive
                          ? "border-emerald-400/70"
                          : "border-slate-800/70"
                      }`}
                    >
                      <span className="text-2xl" aria-hidden>
                        {option.emoji}
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-100">{option.label}</p>
                        <p className="text-xs text-slate-400">{option.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>

          <section className="space-y-6">
            <article className="community-card space-y-6">
              <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.35em] text-emerald-200">
                    {pressStart.className ? (
                      <span className={pressStart.className}>Tamagochi</span>
                    ) : (
                      "Tamagochi"
                    )}
                  </p>
                  <h1 className="text-2xl font-semibold text-slate-50">{displayName}</h1>
                  <p className="text-sm text-slate-300">{tamagochiStatus}</p>
                </div>
                <div
                  className={`tamagochi-orb bg-gradient-to-br ${selectedMoodOption.gradient}`}
                  aria-hidden
                >
                  <div className="tamagochi-screen">
                    <div className="tamagochi-pet">
                      <span className="tamagochi-eye" />
                      <span className="tamagochi-eye" />
                      <span className="tamagochi-mouth" />
                    </div>
                  </div>
                </div>
              </header>

              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handleFeed}
                    className="rounded-2xl border border-amber-300/60 bg-amber-400/20 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/30"
                  >
                    Etetés
                  </button>
                  <button
                    type="button"
                    onClick={handlePlay}
                    className="rounded-2xl border border-fuchsia-300/60 bg-fuchsia-400/20 px-4 py-3 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-400/30"
                  >
                    Játék
                  </button>
                  <button
                    type="button"
                    onClick={handleRest}
                    className="rounded-2xl border border-teal-300/60 bg-teal-400/20 px-4 py-3 text-sm font-semibold text-teal-100 transition hover:bg-teal-400/30"
                  >
                    Pihenés
                  </button>
                </div>

                <div className="grid gap-4">
                  {statItems.map((stat) => {
                    const safeValue = clamp(stat.value);
                    return (
                      <div key={stat.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 font-semibold text-slate-100">
                            <span aria-hidden>{stat.icon}</span>
                            {stat.label}
                          </span>
                          <span className="text-slate-300">{Math.round(safeValue)}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-slate-900/60">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${stat.accent}`}
                            style={{ width: `${safeValue}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-3 text-xs text-slate-300 sm:grid-cols-3">
                  <div className="rounded-2xl border border-amber-400/30 bg-slate-900/40 p-3">
                    <p className="font-semibold text-slate-100">Etetések</p>
                    <p className="text-lg font-semibold text-amber-200">{careStats.meals}</p>
                  </div>
                  <div className="rounded-2xl border border-fuchsia-400/30 bg-slate-900/40 p-3">
                    <p className="font-semibold text-slate-100">Játékok</p>
                    <p className="text-lg font-semibold text-fuchsia-200">{careStats.plays}</p>
                  </div>
                  <div className="rounded-2xl border border-teal-400/30 bg-slate-900/40 p-3">
                    <p className="font-semibold text-slate-100">Pihenések</p>
                    <p className="text-lg font-semibold text-teal-200">{careStats.rests}</p>
                  </div>
                </div>
              </div>
            </article>

            <section className="community-card space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">
                Környezet jelentés
              </h2>
              <p className="text-sm text-slate-300">
                {selectedMoodOption.emoji} {selectedMoodOption.description}
              </p>
              <p className="text-sm text-slate-300">
                A kiválasztott hangulat befolyásolja, milyen gyorsan regenerálódik a tamagochi lelke.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>Vidám mód extra kedvet ad, de gyorsabban éhezik.</li>
                <li>Kreatív módban lassabban fogy az energia, ha játszol vele.</li>
                <li>Nyugodt módban a pihenés hatékonyabb.</li>
                <li>Nosztalgikus módban a boldogság tovább tart.</li>
              </ul>
            </section>
          </section>

          <aside className="space-y-6">
            <section className="community-card space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">
                Társ tamagochik
              </h3>
              {isLoadingTamagotchis ? (
                <p className="text-sm text-slate-400">Betöltés alatt...</p>
              ) : tamagotchiError ? (
                <p className="text-sm text-rose-300">{tamagotchiError}</p>
              ) : otherTamagotchis.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Még nincsenek más tamagochik a listán. Adj nevet a sajátodnak a kezdéshez!
                </p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {otherTamagotchis.map((tamagotchi) => {
                    const ageText = formatElapsedTime(tamagotchi.createdAt, nowTimestamp);
                    const birthDate = formatBirthDate(tamagotchi.createdAt);
                    return (
                      <li
                        key={`${tamagotchi.name}-${tamagotchi.createdAt}`}
                        className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-3"
                      >
                        <p className="font-semibold text-slate-100">{tamagotchi.name}</p>
                        <p className="text-xs text-emerald-200">Mióta él: {ageText}</p>
                        {birthDate && (
                          <p className="text-xs text-slate-400">Kikelés: {birthDate}</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="community-card space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">
                Napló
              </h3>
              <ul className="space-y-3 text-sm text-slate-300">
                {activityLog.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-3"
                  >
                    <p className="font-semibold text-slate-100">{item.message}</p>
                    <p className="text-xs text-slate-500">{item.timeAgo}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="community-card space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">
                Gondozási tippek
              </h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li>
                  Figyeld a mutatókat: ha bármelyik 30% alá esik, gyorsan cselekedj, különben a
                  tamagochi elszomorodik.
                </li>
                <li>
                  Kombináld a tevékenységeket: egy játék után jöhet egy rövid pihenés, hogy ne fogyjon ki az energia.
                </li>
                <li>
                  A hangulat modulok között váltogatva egyedi animációkat és reakciókat figyelhetsz meg.
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
