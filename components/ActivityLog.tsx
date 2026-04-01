interface ActivityItem {
  id: number;
  message: string;
  timeAgo: string;
}

interface ActivityLogProps {
  activities: ActivityItem[];
}

export const ActivityLog = ({ activities }: ActivityLogProps) => {
  return (
    <div className="bento-card flex flex-col gap-4 flex-1 min-h-[200px]">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Napló</h3>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Élő</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[280px] pr-1 scrollbar-thin">
        {activities.length === 0 ? (
          <p className="text-sm text-slate-600 italic text-center py-6">Még semmi sem történt...</p>
        ) : (
          activities.map((activity, i) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-white/[0.08]"
              style={{ opacity: Math.max(0.4, 1 - i * 0.08) }}
            >
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400/60" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="text-sm font-medium text-slate-200 leading-tight">{activity.message}</p>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">{activity.timeAgo}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
