"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

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

interface StoryHighlight {
  id: number;
  title: string;
  subtitle: string;
  gradient: string;
}

interface FriendSuggestion {
  id: number;
  name: string;
  handle: string;
  sharedInterest: string;
  mutualCount: number;
}

interface EventCard {
  id: number;
  title: string;
  day: string;
  time: string;
  location: string;
  description: string;
}

interface Post {
  id: number;
  author: string;
  handle: string;
  mood: string;
  timeAgo: string;
  content: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  accent: string;
  topics: string[];
}

interface ActivityItem {
  id: number;
  message: string;
  timeAgo: string;
}

const MAX_LOG_ITEMS = 7;

const moodOptions: MoodOption[] = [
  {
    id: "vidam",
    label: "Vidám",
    description: "Tele vagy energiával és kész vagy inspirálni másokat.",
    emoji: "🌞",
    gradient: "from-amber-400/80 to-orange-400/40",
  },
  {
    id: "kreativ",
    label: "Kreatív",
    description: "Új pixelek születnek a fejedben, rajzold meg őket!",
    emoji: "🎨",
    gradient: "from-fuchsia-500/70 to-purple-500/40",
  },
  {
    id: "nyugodt",
    label: "Nyugodt",
    description: "Lassú esti hangulat, lila égbolt és jó társaság.",
    emoji: "🌙",
    gradient: "from-emerald-400/70 to-teal-500/30",
  },
  {
    id: "nosztalgikus",
    label: "Nosztalgikus",
    description: "Visszatértél a régi konzolokhoz és a kazettás zenékhez.",
    emoji: "📼",
    gradient: "from-sky-400/70 to-indigo-500/40",
  },
];

const storyHighlights: StoryHighlight[] = [
  {
    id: 1,
    title: "Dínó Klub",
    subtitle: "Pixel jam ma 20:00",
    gradient: "from-pink-400 via-fuchsia-500 to-violet-500",
  },
  {
    id: 2,
    title: "Kódsarok",
    subtitle: "Refaktor kihívás",
    gradient: "from-amber-300 via-orange-400 to-rose-400",
  },
  {
    id: 3,
    title: "Futó csapat",
    subtitle: "5 km napfelkeltekor",
    gradient: "from-sky-400 via-cyan-400 to-teal-400",
  },
  {
    id: 4,
    title: "Hangár",
    subtitle: "Chill synthwave mix",
    gradient: "from-emerald-400 via-lime-400 to-teal-500",
  },
];

const friendSuggestions: FriendSuggestion[] = [
  {
    id: 1,
    name: "Pixel Panni",
    handle: "@pixelpanni",
    sharedInterest: "Retro illusztráció",
    mutualCount: 4,
  },
  {
    id: 2,
    name: "Render Róka",
    handle: "@renderroka",
    sharedInterest: "Shader varázslat",
    mutualCount: 2,
  },
  {
    id: 3,
    name: "Beat Bence",
    handle: "@beatbence",
    sharedInterest: "Lo-fi zenék",
    mutualCount: 5,
  },
];

const upcomingEvents: EventCard[] = [
  {
    id: 1,
    title: "Közös sprite rajzolás",
    day: "Május 14.",
    time: "18:30",
    location: "Digitális stúdió · Hangcsatorna",
    description:
      "Együtt polírozzuk a karaktereinket és megosztjuk a legjobb tippeket.",
  },
  {
    id: 2,
    title: "Retro konzol est",
    day: "Május 17.",
    time: "20:00",
    location: "Nappali szoba · VR-lobby",
    description: "Mini-verseny és nosztalgikus beszélgetések a kedvenc játékokról.",
  },
];

const accentPalette = [
  "from-orange-400/80 to-rose-500/60",
  "from-sky-400/80 to-indigo-500/60",
  "from-emerald-400/80 to-teal-500/60",
  "from-fuchsia-500/80 to-purple-600/60",
];

const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    author: "Kódoló Karcsi",
    handle: "@karcsikod",
    mood: "lelkes",
    timeAgo: "12 perce",
    content:
      "Új layoutot kapott a dínó közösség! A kedvenc retro színeimet vittem bele, kíváncsi vagyok, nektek hogy tetszik.",
    likes: 48,
    comments: 9,
    isLiked: false,
    accent: accentPalette[1],
    topics: ["#design", "#retrohangulat"],
  },
  {
    id: 2,
    author: "Távkapcs Timi",
    handle: "@timistreams",
    mood: "közösségi",
    timeAgo: "36 perce",
    content:
      "Ma esti élő adásban közösen fejlesztjük tovább a mini közösségi funkciókat. Miket látnátok szívesen?",
    likes: 31,
    comments: 7,
    isLiked: false,
    accent: accentPalette[0],
    topics: ["#livestream", "#kozosmunka"],
  },
  {
    id: 3,
    author: "Synth Sanyi",
    handle: "@synthsanyi",
    mood: "kreatív",
    timeAgo: "1 órája",
    content:
      "Felkértek, hogy írjak egy rövid synthwave intrót a DinoNet következő eseményéhez. Alig várom, hogy meghallgassátok!",
    likes: 54,
    comments: 12,
    isLiked: false,
    accent: accentPalette[2],
    topics: ["#zene", "#synthwave"],
  },
];

const initialActivity: ActivityItem[] = [
  {
    id: 1,
    message: "Bekövetetted Pixel Norbit.",
    timeAgo: "2 perce",
  },
  {
    id: 2,
    message: "Visszajelöltél egy közösségi eseményt.",
    timeAgo: "8 perce",
  },
  {
    id: 3,
    message: "Megjegyezted: 'Közös sprite rajzolás' tetszik.",
    timeAgo: "20 perce",
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

  return normalised || "nevtelen-dino";
};

const initialsFromName = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "DK";
  }

  if (words.length === 1) {
    return words[0]!.slice(0, 2).toUpperCase();
  }

  return `${words[0]!.charAt(0)}${words[words.length - 1]!.charAt(0)}`.toUpperCase();
};

const extractTopics = (text: string) => {
  const matches = text.match(/#[\p{L}0-9_-]+/gu) ?? [];
  return matches.map((tag) => tag.toLowerCase());
};

export default function Home() {
  const [profileName, setProfileName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [nameMessage, setNameMessage] = useState<FeedbackMessage | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isClearingName, setIsClearingName] = useState(false);

  const [selectedMood, setSelectedMood] = useState<string>(moodOptions[0]!.id);
  const [composerText, setComposerText] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [activityLog, setActivityLog] = useState<ActivityItem[]>(initialActivity);

  const addActivity = (message: string) => {
    setActivityLog((prev) => [
      { id: Date.now(), message, timeAgo: "épp most" },
      ...prev.slice(0, MAX_LOG_ITEMS - 1),
    ]);
  };

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
            message: "A profilnév betöltve a sessionből.",
          });
        }
      } catch (error) {
        console.error("Nem sikerült betölteni a profilnevet", error);
      }
    };

    fetchStoredName();
  }, []);

  const handleNameInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNameInput(event.target.value);
  };

  const handleSaveName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = nameInput.trim();

    if (!trimmedName) {
      setNameMessage({
        type: "error",
        message: "Adj meg egy nevet, mielőtt elmented!",
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
          message:
            data.error ?? "Nem sikerült elmenteni a nevet. Próbáld újra!",
        });
        return;
      }

      if (data.name) {
        setProfileName(data.name);
        setNameInput(data.name);
      }

      setNameMessage({
        type: "success",
        message: "Siker! A profilnév elmentve a sessionbe.",
      });
      addActivity("Frissítetted a profilnevedet.");
    } catch (error) {
      console.error("Nem sikerült menteni a nevet", error);
      setNameMessage({
        type: "error",
        message: "Ismeretlen hiba történt. Próbáld meg később!",
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
          message: "Nem sikerült törölni a nevet. Próbáld újra!",
        });
        return;
      }

      setProfileName("");
      setNameInput("");
      setNameMessage({
        type: "info",
        message: "A profilnév törölve lett a sessionből.",
      });
      addActivity("Eltávolítottad a profilnevedet.");
    } catch (error) {
      console.error("Nem sikerült törölni a nevet", error);
      setNameMessage({
        type: "error",
        message: "Váratlan hiba történt a törlés közben.",
      });
    } finally {
      setIsClearingName(false);
    }
  };

  const profileHandle = useMemo(() => {
    return `@${slugifyHungarian(profileName || "DinoNet közösségi tag")}`;
  }, [profileName]);

  const displayName = profileName || "Névtelen dinoszaurusz";
  const profileInitials = useMemo(() => initialsFromName(displayName), [displayName]);

  const selectedMoodOption = useMemo(
    () => moodOptions.find((option) => option.id === selectedMood) ?? moodOptions[0]!,
    [selectedMood],
  );

  const totalLikes = useMemo(
    () => posts.reduce((acc, post) => acc + post.likes, 0),
    [posts],
  );

  const totalTopics = useMemo(
    () => new Set(posts.flatMap((post) => post.topics)).size,
    [posts],
  );

  const handleComposerChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setComposerText(event.target.value);
  };

  const handlePublishPost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedText = composerText.trim();

    if (!trimmedText) {
      addActivity("Próbáltál üres bejegyzést megosztani.");
      return;
    }

    const extractedTopics = extractTopics(trimmedText);
    const fallbackTopic = `#${selectedMoodOption.label.toLowerCase()}`;

    const newPost: Post = {
      id: Date.now(),
      author: displayName,
      handle: profileHandle,
      mood: selectedMoodOption.label.toLowerCase(),
      timeAgo: "épp most",
      content: trimmedText,
      likes: 1,
      comments: 0,
      isLiked: true,
      accent: accentPalette[Math.floor(Math.random() * accentPalette.length)]!,
      topics: extractedTopics.length > 0 ? extractedTopics : [fallbackTopic],
    };

    setPosts((prev) => [newPost, ...prev]);
    addActivity("Megosztottál egy új bejegyzést.");
    setComposerText("");
  };

  const toggleLike = (postId: number) => {
    let activityMessage: string | null = null;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const liked = !post.isLiked;
        activityMessage = liked
          ? `Kedvelted ${post.author} bejegyzését.`
          : `Levetted a szívet ${post.author} bejegyzéséről.`;

        return {
          ...post,
          isLiked: liked,
          likes: post.likes + (liked ? 1 : -1),
        };
      }),
    );

    if (activityMessage) {
      addActivity(activityMessage);
    }
  };

  const moodBadges = useMemo(() => {
    return posts
      .slice(0, 6)
      .map((post) => `#${post.mood.replace(/\s+/g, "")}`)
      .filter((value, index, array) => array.indexOf(value) === index);
  }, [posts]);

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
                      <span className={pressStart.className}>Profil</span>
                    ) : (
                      "Profil"
                    )}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-50">{displayName}</h2>
                  <p className="text-sm text-slate-400">{profileHandle}</p>
                </div>
              </header>

              <dl className="grid grid-cols-3 gap-4 text-center text-sm">
                <div className="rounded-2xl border border-slate-700/70 bg-slate-800/40 p-3">
                  <dt className="text-xs uppercase tracking-widest text-slate-400">Bejegyzések</dt>
                  <dd className="mt-1 text-lg font-semibold text-slate-50">{posts.length}</dd>
                </div>
                <div className="rounded-2xl border border-slate-700/70 bg-slate-800/40 p-3">
                  <dt className="text-xs uppercase tracking-widest text-slate-400">Reakciók</dt>
                  <dd className="mt-1 text-lg font-semibold text-slate-50">{totalLikes}</dd>
                </div>
                <div className="rounded-2xl border border-slate-700/70 bg-slate-800/40 p-3">
                  <dt className="text-xs uppercase tracking-widest text-slate-400">Témák</dt>
                  <dd className="mt-1 text-lg font-semibold text-slate-50">{totalTopics}</dd>
                </div>
              </dl>

              <form onSubmit={handleSaveName} className="space-y-3">
                <label htmlFor="profile-name" className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  Válassz közösségi nevet
                </label>
                <input
                  id="profile-name"
                  name="profile-name"
                  value={nameInput}
                  onChange={handleNameInputChange}
                  maxLength={32}
                  placeholder="Írd ide a neved"
                  className="w-full rounded-2xl border border-slate-600 bg-slate-900/50 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={isSavingName}
                    className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSavingName ? "Mentés..." : "Mentés"}
                  </button>
                  {profileName && (
                    <button
                      type="button"
                      onClick={handleClearName}
                      disabled={isClearingName}
                      className="rounded-2xl border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isClearingName ? "Törlés..." : "Törlés"}
                    </button>
                  )}
                </div>
                {nameMessage && (
                  <p
                    className={`text-sm ${
                      nameMessage.type === "error"
                        ? "text-rose-300"
                        : nameMessage.type === "success"
                          ? "text-emerald-300"
                          : "text-amber-300"
                    }`}
                  >
                    {nameMessage.message}
                  </p>
                )}
              </form>
            </section>

            <section className="community-card">
              <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">Hangulatod</h3>
              <p className="mt-2 text-sm text-slate-300">
                Válaszd ki, milyen rezgést közvetítesz ma a DinoNeten.
              </p>

              <div className="mt-4 grid gap-3">
                {moodOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedMood(option.id)}
                    className={`group flex items-start gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/30 p-4 text-left transition ${
                      selectedMood === option.id
                        ? "border-emerald-400/80 bg-emerald-400/10"
                        : "hover:border-emerald-300/60 hover:bg-emerald-400/10"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-gradient-to-br ${option.gradient} text-lg text-slate-900 shadow-lg`}
                      aria-hidden
                    >
                      {option.emoji}
                    </span>
                    <span>
                      <span className="block font-semibold text-slate-50">{option.label}</span>
                      <span className="mt-1 block text-sm text-slate-300">{option.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="community-card">
              <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">Közeli aktivitások</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {activityLog.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/30 p-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full bg-emerald-400" aria-hidden />
                    <span className="text-slate-200">
                      {item.message}
                      <span className="block text-xs text-slate-500">{item.timeAgo}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>

          <section className="space-y-6">
            <div className="community-card">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-50">Kiemelt történetek</h2>
                <span className="text-xs uppercase tracking-[0.35em] text-emerald-200">Ma aktív</span>
              </div>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {storyHighlights.map((story) => (
                  <article
                    key={story.id}
                    className={`story-highlight bg-gradient-to-br ${story.gradient} relative w-[180px] flex-none overflow-hidden rounded-3xl p-4`}
                  >
                    <div className="relative z-10">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-900/70">{story.title}</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">{story.subtitle}</h3>
                    </div>
                    <div className="absolute inset-0 bg-slate-900/20" aria-hidden />
                  </article>
                ))}
              </div>
            </div>

            <div className="community-card">
              <form onSubmit={handlePublishPost} className="space-y-4">
                <div>
                  <label htmlFor="composer" className="text-sm font-semibold text-slate-200">
                    Írj valamit a közösségednek
                  </label>
                  <textarea
                    id="composer"
                    name="composer"
                    value={composerText}
                    onChange={handleComposerChange}
                    rows={4}
                    placeholder="Milyen hangulatot hozol ma a DinoNetre? #hashtag"
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      Aktuális hangulat: {selectedMoodOption.label}
                    </span>
                    {moodBadges.map((badge) => (
                      <span key={badge} className="rounded-full bg-slate-800/60 px-3 py-1 text-xs text-slate-300">
                        {badge}
                      </span>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
                  >
                    Megosztás
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              {posts.map((post) => {
                const initials = initialsFromName(post.author);
                return (
                  <article key={post.id} className="community-card space-y-4">
                    <header className="flex items-start gap-3">
                      <div className={`avatar-ring bg-gradient-to-br ${post.accent}`}>
                        <span>{initials}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                          <h3 className="text-base font-semibold text-slate-50">{post.author}</h3>
                          <span className="text-xs uppercase tracking-[0.35em] text-emerald-200">
                            {post.mood}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">
                          {post.handle} · {post.timeAgo}
                        </p>
                      </div>
                    </header>
                    <p className="text-sm leading-relaxed text-slate-200">{post.content}</p>
                    {post.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 text-xs text-emerald-200">
                        {post.topics.map((topic) => (
                          <span key={topic} className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1">
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <button
                        type="button"
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-2 rounded-2xl px-3 py-1 transition ${
                          post.isLiked
                            ? "bg-emerald-400/20 text-emerald-200"
                            : "hover:bg-emerald-400/10 hover:text-emerald-100"
                        }`}
                      >
                        <span aria-hidden>{post.isLiked ? "💖" : "🤍"}</span>
                        <span>{post.likes} szív</span>
                      </button>
                      <span>{post.comments} hozzászólás</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="community-card">
              <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">Felfedezés</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {posts.slice(0, 4).map((post) => (
                  <li key={post.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800/70 bg-slate-900/30 p-3">
                    <div>
                      <p className="font-semibold text-slate-100">{post.topics[0]}</p>
                      <p className="text-xs text-slate-400">{post.author}</p>
                    </div>
                    <span className="text-xs text-slate-500">{post.timeAgo}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="community-card">
              <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">Barát ajánló</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {friendSuggestions.map((friend) => (
                  <li key={friend.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800/70 bg-slate-900/30 p-3">
                    <div>
                      <p className="font-semibold text-slate-100">{friend.name}</p>
                      <p className="text-xs text-slate-400">{friend.handle}</p>
                      <p className="text-xs text-slate-500">
                        {friend.sharedInterest} · {friend.mutualCount} közös ismerős
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addActivity(`Beköveted ${friend.name} profilját.`)}
                      className="rounded-2xl border border-emerald-400/60 px-3 py-1 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/10"
                    >
                      Követem
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="community-card">
              <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">Közelgő események</h3>
              <ul className="mt-4 space-y-4 text-sm">
                {upcomingEvents.map((event) => (
                  <li key={event.id} className="space-y-2 rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-emerald-200">
                      <span>{event.day}</span>
                      <span>{event.time}</span>
                    </div>
                    <p className="text-base font-semibold text-slate-50">{event.title}</p>
                    <p className="text-xs text-slate-400">{event.location}</p>
                    <p className="text-sm text-slate-300">{event.description}</p>
                    <button
                      type="button"
                      onClick={() => addActivity(`Érdekel: ${event.title}.`)}
                      className="rounded-2xl bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/30"
                    >
                      Jelölöm
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
