import { VRMPet } from "./VRMPet";

interface PetDisplayProps {
  animation: "idle" | "eat" | "play" | "sleep" | "alert";
  moodGradient: string;
  petName?: string;
}

const animLabels: Record<string, { text: string; color: string }> = {
  idle:  { text: "Pihenő",   color: "#10b981" },
  eat:   { text: "Eszik...", color: "#f59e0b" },
  play:  { text: "Játszik!", color: "#ec4899" },
  sleep: { text: "Álmodik", color: "#818cf8" },
  alert: { text: "Figyel!",  color: "#f87171" },
};

export const PetDisplay = ({ animation, moodGradient }: PetDisplayProps) => {
  const anim = animLabels[animation] ?? animLabels.idle;

  return (
    <div className="pet-display-root">
      {/* Ambient mood glow */}
      <div className="pet-glow" style={{
        background: `radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.18) 0%, transparent 70%)`
      }} />

      {/* The 3D canvas fills the space */}
      <div className="pet-canvas-wrap">
        <VRMPet animation={animation} />
      </div>

      {/* Status pill */}
      <div className="pet-status-pill">
        <span className="pet-status-dot" style={{ background: anim.color }} />
        <span className="pet-status-text">{anim.text}</span>
      </div>

      {/* Ground shadow */}
      <div className="pet-ground-shadow" />
    </div>
  );
};
