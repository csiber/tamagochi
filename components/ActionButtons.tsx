interface ActionButtonsProps {
  onFeed: () => void;
  onPlay: () => void;
  onRest: () => void;
  disabled?: boolean;
}

export const ActionButtons = ({ onFeed, onPlay, onRest, disabled }: ActionButtonsProps) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <button
        onClick={onFeed}
        disabled={disabled}
        className="pixel-btn bento-card flex flex-col items-center gap-2 py-4 hover:bg-amber-500/10 hover:border-amber-500/40 group"
      >
        <span className="text-3xl group-hover:scale-110 transition-transform duration-200">🍬</span>
        <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">Etetés</span>
        <span className="text-[9px] text-slate-600 font-medium">+Éhség</span>
      </button>
      <button
        onClick={onPlay}
        disabled={disabled}
        className="pixel-btn bento-card flex flex-col items-center gap-2 py-4 hover:bg-pink-500/10 hover:border-pink-500/40 group"
      >
        <span className="text-3xl group-hover:scale-110 transition-transform duration-200">🎮</span>
        <span className="text-[11px] font-black uppercase tracking-wider text-pink-400">Játék</span>
        <span className="text-[9px] text-slate-600 font-medium">+Boldogság</span>
      </button>
      <button
        onClick={onRest}
        disabled={disabled}
        className="pixel-btn bento-card flex flex-col items-center gap-2 py-4 hover:bg-emerald-500/10 hover:border-emerald-500/40 group"
      >
        <span className="text-3xl group-hover:scale-110 transition-transform duration-200">💤</span>
        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Pihenés</span>
        <span className="text-[9px] text-slate-600 font-medium">+Energia</span>
      </button>
    </div>
  );
};
