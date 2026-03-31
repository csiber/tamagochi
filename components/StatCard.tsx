interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  colorClass: string;
}

export const StatCard = ({ label, value, icon, colorClass }: StatCardProps) => {
  return (
    <div className="bento-card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-2xl" aria-hidden>{icon}</span>
        <span className="text-sm font-medium text-slate-400">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold tracking-tight">{Math.round(value)}%</span>
      </div>
      <div className="stat-track">
        <div 
          className={`stat-fill ${colorClass}`} 
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
};
