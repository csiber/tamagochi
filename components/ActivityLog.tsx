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
    <div className="bento-card flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Aktivitási Napló</h3>
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-slate-800" />
          <div className="h-2 w-2 rounded-full bg-slate-800" />
        </div>
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-slate-800">
        {activities.length === 0 ? (
          <p className="text-sm text-slate-500 italic">Még nincsenek bejegyzések...</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="group flex flex-col gap-1 border-l-2 border-slate-800 pl-4 py-1 hover:border-emerald-500/50 transition-colors">
              <p className="text-sm font-medium text-slate-200">{activity.message}</p>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">{activity.timeAgo}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
