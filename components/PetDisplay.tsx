interface PetDisplayProps {
  animation: "idle" | "eat" | "play" | "sleep" | "alert";
  moodGradient: string;
}

export const PetDisplay = ({ animation, moodGradient }: PetDisplayProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div 
        className={`tamagochi-orb bg-gradient-to-br ${moodGradient}`}
        data-animation={animation}
      >
        <div className="tamagochi-screen">
          <div className={`tamagochi-pet transition-all duration-500 ${
            animation === 'sleep' ? 'saturate-[0.5] brightness-75' : ''
          }`}>
            <div className="flex w-full justify-around px-2">
              <div className="eye" />
              <div className="eye" />
            </div>
            <div className={`mouth transition-all duration-300 ${
              animation === 'eat' ? 'h-3 w-4' : 
              animation === 'play' ? 'h-2 w-8' : 
              'h-1 w-6'
            }`} />
            
            {/* Action Indicators */}
            {animation === 'play' && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl animate-bounce">✨</span>
            )}
            {animation === 'eat' && (
              <span className="absolute -right-4 top-1/2 -translate-y-1/2 text-2xl animate-bounce">🍬</span>
            )}
            {animation === 'sleep' && (
              <span className="absolute -top-4 -right-2 text-xl animate-pulse">💤</span>
            )}
            {animation === 'alert' && (
              <span className="absolute -top-6 left-0 text-xl animate-ping">⚠️</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
