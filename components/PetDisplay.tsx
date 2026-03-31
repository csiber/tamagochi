interface PetDisplayProps {
  animation: "idle" | "eat" | "play" | "sleep" | "alert";
  moodGradient: string;
}

export const PetDisplay = ({ animation, moodGradient }: PetDisplayProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div 
        className="tamagochi-orb"
        data-animation={animation}
      >
        <div className={`tamagochi-pet transition-all duration-700 ${
          animation === 'sleep' ? 'saturate-[0.4] brightness-50' : ''
        }`}>
          {/* 3D Depth Eyes */}
          <div className="flex w-full justify-around px-2 translate-z-10">
            <div className="eye" />
            <div className="eye" />
          </div>
          
          {/* 3D Depth Mouth */}
          <div className={`mouth transition-all duration-300 ${
            animation === 'eat' ? 'h-4 w-6' : 
            animation === 'play' ? 'h-3 w-10' : 
            'h-2 w-8'
          }`} />
          
          {/* Particle Effects */}
          {animation === 'play' && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1">
              <span className="text-2xl animate-bounce">✨</span>
              <span className="text-xl animate-bounce delay-75">⭐</span>
            </div>
          )}
          {animation === 'eat' && (
            <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-3xl animate-pulse">🍭</span>
          )}
          {animation === 'sleep' && (
            <div className="absolute -top-10 -right-4 flex flex-col items-center">
              <span className="text-xl animate-pulse">Z</span>
              <span className="text-sm animate-pulse delay-150">z</span>
            </div>
          )}
        </div>
        
        {/* Glow Shadow beneath the pet */}
        <div className={`absolute bottom-[15%] h-4 w-1/2 rounded-full bg-black/40 blur-md transition-all duration-700 ${
          animation === 'sleep' ? 'scale-x-125 opacity-20' : 'scale-x-100 opacity-40'
        }`} />
      </div>
    </div>
  );
};
