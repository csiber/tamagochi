interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  colorClass: string;
}

export const StatCard = ({ label, value, icon, colorClass }: StatCardProps) => {
  const clamped = Math.min(100, Math.max(0, value));
  const isLow = clamped < 25;
  const isMed = clamped < 50;

  return (
    <div className={`bento-card flex flex-col gap-3 ${isLow ? "border-red-500/30" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>{icon}</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</span>
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
          isLow ? "bg-red-500/20 text-red-400" :
          isMed ? "bg-amber-500/20 text-amber-400" :
          "bg-emerald-500/20 text-emerald-400"
        }`}>
          {isLow ? "Alacsony" : isMed ? "Közepes" : "Jó"}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black tracking-tight tabular-nums">{Math.round(clamped)}</span>
        <span className="text-slate-500 text-sm font-medium">%</span>
      </div>
      <div className="stat-track">
        <div
          className={`stat-fill ${colorClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
