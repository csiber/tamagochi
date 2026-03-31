interface ActionButtonsProps {
  onFeed: () => void;
  onPlay: () => void;
  onRest: () => void;
  disabled?: boolean;
}

export const ActionButtons = ({ onFeed, onPlay, onRest, disabled }: ActionButtonsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <button 
        onClick={onFeed}
        disabled={disabled}
        className="pixel-btn bento-card flex flex-col items-center gap-2 hover:bg-amber-500/10 hover:border-amber-500/50"
      >
        <span className="text-3xl">🍽️</span>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Etetés</span>
      </button>
      <button 
        onClick={onPlay}
        disabled={disabled}
        className="pixel-btn bento-card flex flex-col items-center gap-2 hover:bg-pink-500/10 hover:border-pink-500/50"
      >
        <span className="text-3xl">🎉</span>
        <span className="text-xs font-bold uppercase tracking-wider text-pink-500">Játék</span>
      </button>
      <button 
        onClick={onRest}
        disabled={disabled}
        className="pixel-btn bento-card flex flex-col items-center gap-2 hover:bg-emerald-500/10 hover:border-emerald-500/50"
      >
        <span className="text-3xl">⚡</span>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Pihenés</span>
      </button>
    </div>
  );
};
