interface ActionButtonsProps {
  onFeed: () => void;
  onPlay: () => void;
  onRest: () => void;
  disabled?: boolean;
}

export const ActionButtons = ({ onFeed, onPlay, onRest, disabled }: ActionButtonsProps) => {
  const buttons = [
    { onClick: onFeed, icon: "🍬", label: "Etetés", color: "amber", desc: "+Éhség" },
    { onClick: onPlay, icon: "🎮", label: "Játék", color: "pink", desc: "+Boldogság" },
    { onClick: onRest, icon: "💤", label: "Pihenés", color: "emerald", desc: "+Energia" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {buttons.map(({ onClick, icon, label, color, desc }) => (
        <button
          key={label}
          onClick={onClick}
          disabled={disabled}
          className={`pixel-btn bento-card flex flex-col items-center gap-2 py-4 hover:bg-${color}-500/10 hover:border-${color}-500/40 group`}
        >
          <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{icon}</span>
          <span className={`text-[11px] font-black uppercase tracking-wider text-${color}-400`}>{label}</span>
          <span className="text-[9px] text-slate-600 font-medium">{desc}</span>
        </button>
      ))}
    </div>
  );
};
