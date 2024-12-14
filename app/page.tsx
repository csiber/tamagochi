// app/page.tsx

"use client"; // Add this line to mark the component as a Client Component

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [petState, setPetState] = useState({
    hunger: 50,
    happiness: 50,
    animation: "idle",
  });
  const [lastFed, setLastFed] = useState(null);

  // Alap interakciókhoz szükséges értékek
  const maxStat = 100;
  const minStat = 0;

  const feedPet = () => {
    if (petState.hunger < maxStat) {
      setPetState((prevState) => ({
        ...prevState,
        hunger: Math.min(prevState.hunger + 10, maxStat),
        animation: "eating",
      }));
      setTimeout(
        () => setPetState((prevState) => ({ ...prevState, animation: "idle" })),
        2000
      );
    }
  };

  const playWithPet = () => {
    if (petState.happiness < maxStat) {
      setPetState((prevState) => ({
        ...prevState,
        happiness: Math.min(prevState.happiness + 10, maxStat),
        animation: "playing",
      }));
      setTimeout(
        () => setPetState((prevState) => ({ ...prevState, animation: "idle" })),
        2000
      );
    }
  };

  const reduceStatsOverTime = () => {
    setPetState((prevState) => ({
      ...prevState,
      hunger: Math.max(prevState.hunger - 1, minStat),
      happiness: Math.max(prevState.happiness - 1, minStat),
    }));
  };

  useEffect(() => {
    const interval = setInterval(reduceStatsOverTime, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full text-center">
        <h1 className="text-3xl mb-4">Virtuális Tamagotchi</h1>
        <p>
          Gondozd a virtuális állatkád, és figyeld, hogy boldog és jóllakott
          legyen!
        </p>

        <div className="mt-6">
          <p>Hunger: {petState.hunger}</p>
          <p>Happiness: {petState.happiness}</p>
        </div>

        <div className="mt-6 mb-6">
          <button
            onClick={feedPet}
            className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2"
          >
            Etetés
          </button>
          <button
            onClick={playWithPet}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Játék
          </button>
        </div>

        <div className="mt-4 text-xl">
          {petState.animation === "idle" && <p>Az állatkád pihen...</p>}
          {petState.animation === "eating" && <p>Az állatkád épp eszik!</p>}
          {petState.animation === "playing" && <p>Az állatkád épp játszik!</p>}
        </div>

        <div className="relative mt-12 mb-4">
          <Image
            src="/next.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
            className="mx-auto"
          />
        </div>

        <div className="text-sm text-gray-500">
          <p>Cloudflare-kompatibilis alkalmazás</p>
        </div>
      </div>
    </main>
  );
}
