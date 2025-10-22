// app/page.tsx

"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type AnimationState = "idle" | "eating" | "playing";
type GameChoice = "kő" | "papír" | "olló";
type GameOutcome = "win" | "lose" | "draw";

interface PetState {
  hunger: number;
  happiness: number;
  animation: AnimationState;
}

interface GameState {
  isOpen: boolean;
  playerChoice: GameChoice | null;
  dinoChoice: GameChoice | null;
  result: GameOutcome | null;
}

type FeedbackType = "success" | "error" | "info";

interface FeedbackMessage {
  type: FeedbackType;
  message: string;
}

const MAX_STAT = 100;
const MIN_STAT = 0;
const GAME_CHOICES: GameChoice[] = ["kő", "papír", "olló"];
const WIN_MAP: Record<GameChoice, GameChoice> = {
  kő: "olló",
  papír: "kő",
  olló: "papír",
};

const INITIAL_GAME_STATE: GameState = {
  isOpen: false,
  playerChoice: null,
  dinoChoice: null,
  result: null,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function Home() {
  const [petState, setPetState] = useState<PetState>({
    hunger: 50,
    happiness: 50,
    animation: "idle",
  });
  const [petName, setPetName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [nameMessage, setNameMessage] = useState<FeedbackMessage | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isClearingName, setIsClearingName] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    ...INITIAL_GAME_STATE,
  });

  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAnimationTimeout = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  };

  const feedPet = () => {
    if (petState.hunger >= MAX_STAT) {
      return;
    }

    setPetState((prevState) => ({
      ...prevState,
      hunger: clamp(prevState.hunger + 12, MIN_STAT, MAX_STAT),
      animation: "eating",
    }));

    clearAnimationTimeout();
    animationTimeoutRef.current = setTimeout(() => {
      setPetState((prevState) => ({ ...prevState, animation: "idle" }));
      animationTimeoutRef.current = null;
    }, 2000);
  };

  const startMiniGame = () => {
    setGameState({
      ...INITIAL_GAME_STATE,
      isOpen: true,
    });

    setPetState((prevState) => ({
      ...prevState,
      animation: "playing",
    }));

    clearAnimationTimeout();
    animationTimeoutRef.current = setTimeout(() => {
      setPetState((prevState) => ({ ...prevState, animation: "idle" }));
      animationTimeoutRef.current = null;
    }, 1200);
  };

  const resetGameRound = () => {
    setGameState((prevState) => ({
      ...prevState,
      playerChoice: null,
      dinoChoice: null,
      result: null,
    }));
  };

  const closeMiniGame = () => {
    setGameState({ ...INITIAL_GAME_STATE });
  };

  const handleGameChoice = (choice: GameChoice) => {
    if (!gameState.isOpen || gameState.result) {
      return;
    }

    const dinoChoice =
      GAME_CHOICES[Math.floor(Math.random() * GAME_CHOICES.length)];

    let result: GameOutcome = "draw";
    if (choice !== dinoChoice) {
      result = WIN_MAP[choice] === dinoChoice ? "win" : "lose";
    }

    const happinessDelta =
      result === "win" ? 15 : result === "draw" ? 5 : -8;

    setGameState({
      isOpen: true,
      playerChoice: choice,
      dinoChoice,
      result,
    });

    setPetState((prevState) => ({
      ...prevState,
      happiness: clamp(prevState.happiness + happinessDelta, MIN_STAT, MAX_STAT),
      animation: "playing",
    }));

    clearAnimationTimeout();
    animationTimeoutRef.current = setTimeout(() => {
      setPetState((prevState) => ({ ...prevState, animation: "idle" }));
      animationTimeoutRef.current = null;
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const reduceStatsOverTime = () => {
      setPetState((prevState) => ({
        ...prevState,
        hunger: Math.max(prevState.hunger - 2, MIN_STAT),
        happiness: Math.max(prevState.happiness - 2, MIN_STAT),
      }));
    };

    const interval = setInterval(reduceStatsOverTime, 5000);
    return () => clearInterval(interval);
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
          setPetName(data.name);
          setNameInput(data.name);
          setNameMessage({
            type: "info",
            message: "A korábban megadott név betöltve a sessionből.",
          });
        }
      } catch (error) {
        console.error("Nem sikerült betölteni a tamagochi nevét", error);
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
        setPetName(data.name);
        setNameInput(data.name);
      }

      setNameMessage({
        type: "success",
        message: "Siker! A név elmentve a sessionbe.",
      });
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

      setPetName("");
      setNameInput("");
      setNameMessage({
        type: "info",
        message: "A név törölve lett a sessionből.",
      });
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

  const hungerPercent = Math.round((petState.hunger / MAX_STAT) * 100);
  const happinessPercent = Math.round((petState.happiness / MAX_STAT) * 100);

  const statusMessage = useMemo(() => {
    const sentenceName = petName || "A dínó";

    if (petState.animation === "eating") {
      return `${sentenceName} jóízűen falatozik.`;
    }
    if (petState.animation === "playing") {
      return `${sentenceName} lelkes ugrálásba kezdett!`;
    }
    if (petState.hunger <= 20) {
      return `${sentenceName} nagyon éhes, ideje etetni!`;
    }
    if (petState.happiness <= 20) {
      return `${sentenceName} unatkozik, játssz vele!`;
    }
    return `${sentenceName} elégedetten szemlélődik.`;
  }, [petName, petState]);

  const gameResultMessage = useMemo(() => {
    if (!gameState.isOpen) {
      return "";
    }

    const sentenceName = petName || "A dínó";
    const inlineName = petName || "a dínó";

    if (!gameState.result) {
      return `${sentenceName} kíváncsian várja a választásodat. Válassz egy jelet!`;
    }

    if (gameState.result === "win") {
      return `Győztél! ${sentenceName} csillogó szemmel tapsol, a vidámságod nőtt.`;
    }

    if (gameState.result === "draw") {
      return `Döntetlen! ${sentenceName} még egy körre bíztat.`;
    }

    return `Most ${inlineName} nyert, de ne add fel: kér még egy visszavágót!`;
  }, [gameState.isOpen, gameState.result, petName]);

  const animationClass = useMemo(() => {
    return {
      idle: "dino-idle",
      eating: "dino-eat",
      playing: "dino-play",
    }[petState.animation];
  }, [petState.animation]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <div className="tamagotchi-shell w-full max-w-3xl">
        <header className="text-center">
          <h1 className="pixel-font text-2xl tracking-[0.35em] text-slate-900 drop-shadow-[0_4px_0_#0f172a] sm:text-3xl">
            Retro Tamagochi Dínó
          </h1>
          <p className="mt-4 text-sm text-slate-800 sm:text-base">
            Gondozd a digitális kis kedvencedet, adj neki egyedi nevet, és figyeld,
            hogyan reagál az etetésre és a játékra a mini képernyőn!
          </p>
        </header>

        <section className="mt-6 rounded-3xl border-4 border-slate-900 bg-slate-100/90 p-6 text-slate-900 shadow-[0_12px_0_#0f172a] sm:p-8">
          <form onSubmit={handleSaveName} className="space-y-4">
            <div className="text-center">
              <label
                htmlFor="pet-name"
                className="pixel-font text-xs uppercase tracking-[0.35em] text-slate-800"
              >
                Nevezd el a kedvencedet
              </label>
              <p className="mt-3 text-xs text-slate-700 sm:text-sm">
                A név a session cookie-ban tárolódik, így visszatéréskor is felismer
                majd a kis dínó.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                id="pet-name"
                name="pet-name"
                value={nameInput}
                onChange={handleNameInputChange}
                maxLength={24}
                placeholder="Írd be a nevet"
                className="w-full rounded-2xl border-4 border-slate-900 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-900 shadow-[0_6px_0_#0f172a] transition focus:outline-none focus:ring-4 focus:ring-amber-300"
              />
              <div className="flex flex-1 flex-wrap justify-center gap-3 sm:justify-end">
                <button
                  type="submit"
                  disabled={isSavingName}
                  className="rounded-2xl border-4 border-slate-900 bg-amber-300 px-4 py-3 font-bold uppercase tracking-[0.25em] text-slate-900 shadow-[0_6px_0_#0f172a] transition hover:-translate-y-1 hover:bg-amber-200 hover:shadow-[0_4px_0_#0f172a] focus:outline-none focus:ring-4 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingName ? "Mentés..." : "Mentés"}
                </button>
                {petName && (
                  <button
                    type="button"
                    onClick={handleClearName}
                    disabled={isClearingName}
                    className="rounded-2xl border-4 border-slate-900 bg-rose-300 px-4 py-3 font-bold uppercase tracking-[0.25em] text-rose-950 shadow-[0_6px_0_#0f172a] transition hover:-translate-y-1 hover:bg-rose-200 hover:shadow-[0_4px_0_#0f172a] focus:outline-none focus:ring-4 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isClearingName ? "Törlés..." : "Név törlése"}
                  </button>
                )}
              </div>
            </div>
          </form>

          <p className="pixel-font mt-5 text-[0.55rem] uppercase tracking-[0.35em] text-slate-700">
            Aktuális név: {petName ? petName : "nincs megadva"}
          </p>
          {nameMessage && (
            <p
              className={`mt-3 text-xs sm:text-sm ${
                nameMessage.type === "error"
                  ? "text-rose-600"
                  : nameMessage.type === "success"
                    ? "text-emerald-600"
                    : "text-amber-600"
              }`}
            >
              {nameMessage.message}
            </p>
          )}
        </section>

        <section className="tamagotchi-screen mt-6">
          <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 px-6 py-8">
            <p className="pixel-font text-center text-[0.55rem] uppercase tracking-[0.35em] text-amber-200">
              {petName ? `${petName} kalandra kész!` : "Adj nevet a dínónak, hogy még barátságosabb legyen!"}
            </p>
            <svg
              viewBox="0 0 96 96"
              role="img"
              aria-label="Retro 8 bites dínó"
              className={`dino-svg ${animationClass}`}
            >
              <rect width="96" height="96" fill="transparent" />
              <polygon
                points="12,36 12,28 20,28 20,20 36,20 36,12 60,12 60,20 68,20 68,28 76,28 76,44 68,44 68,52 60,52 60,60 36,60 36,52 28,52 28,44 20,44 20,36"
                fill="#4ade80"
              />
              <polygon
                points="20,36 28,36 28,44 36,44 36,52 28,52 28,44 20,44"
                fill="#16a34a"
              />
              <polygon
                points="36,36 52,36 52,44 44,44 44,52 36,52"
                fill="#bbf7d0"
              />
              <rect x="28" y="24" width="8" height="8" fill="#22d3ee" />
              <rect x="60" y="24" width="8" height="8" fill="#0f172a" />
              <rect x="52" y="28" width="8" height="8" fill="#f97316" />
              <rect x="20" y="44" width="8" height="12" fill="#16a34a" />
              <rect x="36" y="60" width="8" height="12" fill="#16a34a" />
              <rect x="44" y="60" width="8" height="12" fill="#16a34a" />
              <rect x="60" y="60" width="12" height="12" fill="#16a34a" />
              <rect x="8" y="60" width="12" height="8" fill="#22d3ee" />
              <rect x="76" y="44" width="12" height="8" fill="#22d3ee" />
              <polygon
                points="12,36 12,28 20,28 20,20 36,20 36,12 60,12 60,20 68,20 68,28 76,28 76,44 68,44 68,52 60,52 60,60 36,60 36,52 28,52 28,44 20,44 20,36"
                fill="none"
                stroke="#0f172a"
                strokeWidth="4"
              />
            </svg>

            <div className="w-full space-y-5">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-300">
                  <span className="pixel-font text-[0.6rem]">Éhség</span>
                  <span className="pixel-font text-[0.6rem]">{hungerPercent}%</span>
                </div>
                <div className="stat-bar">
                  <div
                    className="stat-fill hunger"
                    style={{ width: `${hungerPercent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-300">
                  <span className="pixel-font text-[0.6rem]">Vidámság</span>
                  <span className="pixel-font text-[0.6rem]">{happinessPercent}%</span>
                </div>
                <div className="stat-bar">
                  <div
                    className="stat-fill happiness"
                    style={{ width: `${happinessPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="pixel-font text-center text-[0.65rem] uppercase tracking-[0.25em] text-amber-200">
              {statusMessage}
            </p>
          </div>
        </section>

        {gameState.isOpen && (
          <section className="mt-6 w-full max-w-xl self-center rounded-3xl border-4 border-slate-900 bg-slate-900/70 p-6 text-center text-slate-100 shadow-[inset_0_0_0_4px_rgba(15,23,42,0.55)]">
            <h2 className="pixel-font text-xs uppercase tracking-[0.35em] text-amber-200">
              Mini-játék: Kő · Papír · Olló
            </h2>
            <p className="mt-4 text-sm text-slate-100 sm:text-base">{gameResultMessage}</p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {GAME_CHOICES.map((choice) => (
                <button
                  key={choice}
                  onClick={() => handleGameChoice(choice)}
                  disabled={Boolean(gameState.result)}
                  className={`rounded-2xl border-4 border-slate-900 bg-slate-100 px-4 py-3 font-bold uppercase tracking-[0.25em] text-slate-900 transition hover:-translate-y-1 hover:bg-amber-100 hover:shadow-[0_4px_0_#0f172a] focus:outline-none focus:ring-4 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                    gameState.playerChoice === choice ? "shadow-[0_4px_0_#0f172a] ring-4 ring-amber-300" : "shadow-[0_6px_0_#0f172a]"
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>

            {gameState.result && (
              <div className="mt-5 space-y-3 text-sm sm:text-base">
                <p>
                  Te: <span className="font-semibold uppercase">{gameState.playerChoice}</span> · {petName || "a dínó"}:
                  {" "}
                  <span className="font-semibold uppercase">{gameState.dinoChoice}</span>
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={resetGameRound}
                    className="rounded-2xl border-4 border-slate-900 bg-emerald-300 px-4 py-3 font-bold uppercase tracking-[0.25em] text-emerald-950 shadow-[0_6px_0_#0f172a] transition hover:-translate-y-1 hover:bg-emerald-200 hover:shadow-[0_4px_0_#0f172a] focus:outline-none focus:ring-4 focus:ring-emerald-300"
                  >
                    Új kör
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <button
                onClick={closeMiniGame}
                className="rounded-2xl border-4 border-slate-900 bg-slate-100 px-5 py-3 font-bold uppercase tracking-[0.25em] text-slate-900 shadow-[0_6px_0_#0f172a] transition hover:-translate-y-1 hover:bg-slate-200 hover:shadow-[0_4px_0_#0f172a] focus:outline-none focus:ring-4 focus:ring-slate-200"
              >
                Bezárás
              </button>
            </div>
          </section>
        )}

        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={feedPet}
            className="pixel-button bg-emerald-400 text-emerald-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={petState.hunger >= MAX_STAT}
          >
            Etetés
          </button>
          <button
            onClick={startMiniGame}
            className="pixel-button bg-sky-400 text-sky-950 hover:bg-sky-300"
          >
            Mini-játék
          </button>
        </div>

        <footer className="mt-6 text-center">
          <p className="pixel-font text-[0.55rem] uppercase tracking-[0.4em] text-slate-600">
            Cloudflare-kompatibilis retro élmény
          </p>
        </footer>
      </div>
    </main>
  );
}
