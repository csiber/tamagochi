import { VRMPet } from "./VRMPet";

interface PetDisplayProps {
  animation: "idle" | "eat" | "play" | "sleep" | "alert";
  moodGradient: string;
}

export const PetDisplay = ({ animation }: PetDisplayProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px]">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* VRM Character Container */}
        <div className="relative z-10 w-full max-w-[400px]">
          <VRMPet animation={animation} />
        </div>
        
        {/* Soft background glow that matches the mood */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-white/5 to-transparent rounded-full blur-3xl opacity-30" />
      </div>
      
      {/* 3D Platform/Shadow */}
      <div className="h-4 w-48 rounded-[100%] bg-black/40 blur-lg -mt-10" />
    </div>
  );
};
