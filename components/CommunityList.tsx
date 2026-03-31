interface TamagochiInfo {
  name: string;
  createdAt: string;
}

interface CommunityListProps {
  tamagotchis: TamagochiInfo[];
  isLoading: boolean;
}

export const CommunityList = ({ tamagotchis, isLoading }: CommunityListProps) => {
  return (
    <div className="bento-card flex flex-col gap-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Közösségi Tér</h3>
      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="animate-pulse flex flex-col gap-2">
            <div className="h-10 w-full rounded-xl bg-white/5" />
            <div className="h-10 w-full rounded-xl bg-white/5" />
          </div>
        ) : tamagotchis.length === 0 ? (
          <p className="text-sm text-slate-500 italic">Még nincsenek lakótársak...</p>
        ) : (
          tamagotchis.slice(0, 5).map((t, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-white/5 p-3">
              <span className="text-sm font-medium text-slate-200">{t.name}</span>
              <span className="text-[10px] text-emerald-500/70">AKTÍV</span>
            </div>
          ))
        )}
      </div>
      {tamagotchis.length > 5 && (
        <p className="text-center text-[10px] text-slate-600">...és még {tamagotchis.length - 5} lakó</p>
      )}
    </div>
  );
};
