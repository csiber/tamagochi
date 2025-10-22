// app/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";

type AnimationState = "idle" | "eating" | "playing";

interface PetState {
  hunger: number;
  happiness: number;
  animation: AnimationState;
}

const MAX_STAT = 100;
const MIN_STAT = 0;

export default function Home() {
  const [petState, setPetState] = useState<PetState>({
    hunger: 50,
    happiness: 50,
    animation: "idle",
  });

  const feedPet = () => {
    if (petState.hunger >= MAX_STAT) {
      return;
    }

    setPetState((prevState) => ({
      ...prevState,
      hunger: Math.min(prevState.hunger + 12, MAX_STAT),
      animation: "eating",
    }));

    setTimeout(() => {
      setPetState((prevState) => ({ ...prevState, animation: "idle" }));
    }, 2000);
  };

  const playWithPet = () => {
    if (petState.happiness >= MAX_STAT) {
      return;
    }

    setPetState((prevState) => ({
      ...prevState,
      happiness: Math.min(prevState.happiness + 12, MAX_STAT),
      animation: "playing",
    }));

    setTimeout(() => {
      setPetState((prevState) => ({ ...prevState, animation: "idle" }));
    }, 2000);
  };

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

  const hungerPercent = Math.round((petState.hunger / MAX_STAT) * 100);
  const happinessPercent = Math.round((petState.happiness / MAX_STAT) * 100);

  const statusMessage = useMemo(() => {
    if (petState.animation === "eating") {
      return "A dínó jóízűen falatozik.";
    }
    if (petState.animation === "playing") {
      return "A dínó lelkes ugrálásba kezdett!";
    }
    if (petState.hunger <= 20) {
      return "A dínó nagyon éhes, ideje etetni!";
    }
    if (petState.happiness <= 20) {
      return "A dínó unatkozik, játssz vele!";
    }
    return "A dínó elégedetten szemlélődik.";
  }, [petState]);

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
            Gondozd a digitális kis kedvencedet, és figyeld, hogyan reagál az
            etetésre és a játékra a mini képernyőn!
          </p>
        </header>

        <section className="tamagotchi-screen mt-6">
          <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 px-6 py-8">
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

        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={feedPet}
            className="pixel-button bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
          >
            Etetés
          </button>
          <button
            onClick={playWithPet}
            className="pixel-button bg-sky-400 text-sky-950 hover:bg-sky-300"
          >
            Játék
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
