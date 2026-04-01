interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  gradient: string;
}

interface MoodSelectorProps {
  options: MoodOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const MoodSelector = ({ options, selectedId, onSelect }: MoodSelectorProps) => {
  return (
    <div className="bento-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Hangulat Aura</h3>
        <span className="text-lg">{options.find(o => o.id === selectedId)?.emoji}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`group relative flex items-center gap-2.5 overflow-hidden rounded-2xl border px-3 py-2.5 text-left transition-all duration-200 ${
                isSelected
                  ? "border-white/20 bg-white/10 text-white shadow-lg"
                  : "border-white/[0.05] bg-white/[0.03] text-slate-400 hover:border-white/10 hover:bg-white/[0.06]"
              }`}
            >
              {isSelected && (
                <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-10`} />
              )}
              <span className={`relative text-xl transition-transform duration-200 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}>
                {option.emoji}
              </span>
              <span className="relative text-[11px] font-black uppercase tracking-wider leading-tight">
                {option.label}
              </span>
              {isSelected && (
                <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-white/60" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
