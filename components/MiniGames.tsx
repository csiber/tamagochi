import { useState, useRef, useCallback } from "react";

interface MiniGamesProps {
  onSuccess: (msg: string) => void;
  onMistake: (msg: string) => void;
}

export const MiniGames = ({ onSuccess, onMistake }: MiniGamesProps) => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [reflexStatus, setReflexStatus] = useState<"idle" | "waiting" | "ready">("idle");
  const reflexTimeoutRef = useRef<number | null>(null);
  const reflexStartRef = useRef<number | null>(null);

  const startReflex = useCallback(() => {
    setReflexStatus("waiting");
    const delay = Math.random() * 2000 + 1000;
    reflexTimeoutRef.current = window.setTimeout(() => {
      reflexStartRef.current = performance.now();
      setReflexStatus("ready");
    }, delay);
  }, []);

  const handleReflexClick = () => {
    if (reflexStatus === "waiting") {
      clearTimeout(reflexTimeoutRef.current!);
      setReflexStatus("idle");
      onMistake("Túl korai! 🛑");
    } else if (reflexStatus === "ready") {
      const time = Math.round(performance.now() - reflexStartRef.current!);
      setReflexStatus("idle");
      onSuccess(`Villámgyors! (${time}ms) ⚡`);
    } else {
      startReflex();
    }
  };

  return (
    <div className="bento-card flex flex-col gap-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Mini-Játékok</h3>
      
      {!activeGame ? (
        <div className="grid grid-cols-1 gap-2">
          <button 
            onClick={() => setActiveGame("reflex")}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 text-left transition-all hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">⚡</span>
              <span className="text-sm font-bold">Reflex Próba</span>
            </div>
            <span className="text-[10px] text-slate-500">START</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-emerald-500">Reflex Próba</span>
            <button onClick={() => setActiveGame(null)} className="text-[10px] text-slate-500 hover:text-white">BEZÁRÁS</button>
          </div>
          
          <button 
            onClick={handleReflexClick}
            className={`flex h-32 w-full flex-col items-center justify-center rounded-2xl border-2 transition-all ${
              reflexStatus === "ready" ? "border-emerald-500 bg-emerald-500/20 animate-pulse" :
              reflexStatus === "waiting" ? "border-amber-500/50 bg-amber-500/5" :
              "border-white/10 bg-white/5"
            }`}
          >
            <span className="text-sm font-bold">
              {reflexStatus === "ready" ? "MOST KATTINTS!" :
               reflexStatus === "waiting" ? "Várj a jelre..." :
               "Kattints az indításhoz"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
