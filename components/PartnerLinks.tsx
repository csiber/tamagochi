interface PartnerLink {
  title: string;
  url: string;
  description: string;
  icon: string;
}

const partners: PartnerLink[] = [
  {
    title: "AIKA Search",
    url: "https://start.aika.hu",
    description: "Okos kezdőlap és kereső.",
    icon: "🔍"
  },
  {
    title: "AIKA Lab",
    url: "https://aika.hu",
    description: "Generatív AI megoldások.",
    icon: "🧠"
  },
  {
    title: "Vroid Studio",
    url: "https://vroid.com/en/studio",
    description: "Készíts saját 3D avatárt.",
    icon: "🎭"
  },
  {
    title: "Three.js Journey",
    url: "https://threejs-journey.com",
    description: "Tanulj 3D webfejlesztést.",
    icon: "🚀"
  }
];

export const PartnerLinks = () => {
  return (
    <div className="bento-card flex flex-col gap-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 italic">Ökoszisztéma</h3>
      <div className="grid grid-cols-1 gap-2">
        {partners.map((partner, i) => (
          <a
            key={i}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">{partner.icon}</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                {partner.title}
              </span>
              <span className="text-[10px] text-slate-500">{partner.description}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
