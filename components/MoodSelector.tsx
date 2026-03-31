interface MoodOption {
  id: string;
  label: string;
  emoji: string;
}

interface MoodSelectorProps {
  options: MoodOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const MoodSelector = ({ options, selectedId, onSelect }: MoodSelectorProps) => {
  return (
    <div className="bento-card flex flex-col gap-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Hangulat Aurák</h3>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-all ${
              selectedId === option.id
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                : "border-white/5 bg-white/5 text-slate-400 hover:border-white/10 hover:bg-white/10"
            }`}
          >
            <span className="text-xl">{option.emoji}</span>
            <span className="text-xs font-bold uppercase">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
