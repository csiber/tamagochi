import { VRMPet } from "./VRMPet";

interface PetDisplayProps {
  animation: "idle" | "eat" | "play" | "sleep" | "alert";
  moodGradient: string;
}

export const PetDisplay = ({ animation }: PetDisplayProps) => {
  const animLabel: Record<string, string> = {
    idle: "Pihenő",
    eat: "Eszik...",
    play: "Játszik! 🎉",
    sleep: "Alszik... 💤",
    alert: "Figyel! ⚡",
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[480px] relative">
      {/* Ambient glow behind character */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      {/* VRM Container */}
      <div className="relative z-10 w-full max-w-[420px]">
        <VRMPet animation={animation} />
      </div>

      {/* Animation state badge */}
      <div className="relative z-10 -mt-6 flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full animate-pulse ${
          animation === "idle" ? "bg-emerald-400" :
          animation === "play" ? "bg-pink-400" :
          animation === "eat" ? "bg-amber-400" :
          animation === "sleep" ? "bg-indigo-400" :
          "bg-red-400"
        }`} />
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
          {animLabel[animation] || animation}
        </span>
      </div>

      {/* Platform shadow */}
      <div className="mt-2 h-3 w-40 rounded-[100%] bg-black/50 blur-xl" />
    </div>
  );
};
