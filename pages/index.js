// Virtuális Tamagotchi kezdése: Cloudflare-kompatibilis Next.js projekt

// pages/index.js
import { useState, useEffect } from 'react';

export default function Home() {
  const [petState, setPetState] = useState({
    hunger: 50,
    happiness: 50,
    animation: 'idle',
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
        animation: 'eating',
      }));
      setTimeout(() => setPetState((prevState) => ({ ...prevState, animation: 'idle' })), 2000);
    }
  };

  const playWithPet = () => {
    if (petState.happiness < maxStat) {
      setPetState((prevState) => ({
        ...prevState,
        happiness: Math.min(prevState.happiness + 10, maxStat),
        animation: 'playing',
      }));
      setTimeout(() => setPetState((prevState) => ({ ...prevState, animation: 'idle' })), 2000);
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
    <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', marginTop: '50px' }}>
      <h1>Virtuális Tamagotchi</h1>
      <p>Gondozd a virtuális állatkád, és figyeld, hogy boldog és jóllakott legyen!</p>

      <div>
        <p>Hunger: {petState.hunger}</p>
        <p>Happiness: {petState.happiness}</p>
      </div>

      <div style={{ margin: '20px' }}>
        <button
          onClick={feedPet}
          style={{ padding: '10px 20px', marginRight: '10px', cursor: 'pointer' }}
        >
          Etetés
        </button>
        <button
          onClick={playWithPet}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          Játék
        </button>
      </div>

      <div style={{ marginTop: '30px', fontSize: '20px' }}>
        {petState.animation === 'idle' && <p>Az állatkád pihen...</p>}
        {petState.animation === 'eating' && <p>Az állatkád épp eszik!</p>}
        {petState.animation === 'playing' && <p>Az állatkád épp játszik!</p>}
      </div>

      <div style={{ fontSize: '14px', marginTop: '50px', color: 'gray' }}>
        <p>Cloudflare-kompatibilis alkalmazás</p>
      </div>
    </div>
  );
}
