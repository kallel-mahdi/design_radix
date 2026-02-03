import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";

const universities = [
  { name: "Stanford", short: "SU" },
  { name: "MIT", short: "MIT" },
  { name: "Oxford", short: "OX" },
  { name: "Harvard", short: "H" },
  { name: "Caltech", short: "CT" },
  { name: "ETH Zürich", short: "ETH" },
  { name: "Cambridge", short: "CAM" },
  { name: "Berkeley", short: "UCB" },
];

function UniversityBadge({ name, short }: { name: string; short: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] opacity-70 hover:opacity-100 transition-all hover:shadow-sm whitespace-nowrap group">
      {/* Shield/crest icon placeholder */}
      <div className="flex items-center justify-center size-8 rounded bg-gradient-to-br from-[var(--sand-5)] to-[var(--sand-7)] text-[var(--text-muted)] text-xs font-bold tracking-tight">
        {short}
      </div>
      <span className="font-serif font-semibold text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
        {name}
      </span>
    </div>
  );
}

export function TrustStrip() {
  return (
    <BlurFade delay={0.4} inView>
      <div className="border-t border-[var(--border-subtle)] pt-10 pb-6">
        <p className="text-center text-xs uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-6">
          Trusted by researchers at
        </p>
        <Marquee
          pauseOnHover
          className="[--duration:50s] [--gap:1rem]"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          {universities.map((uni) => (
            <UniversityBadge key={uni.name} name={uni.name} short={uni.short} />
          ))}
        </Marquee>
      </div>
    </BlurFade>
  );
}
