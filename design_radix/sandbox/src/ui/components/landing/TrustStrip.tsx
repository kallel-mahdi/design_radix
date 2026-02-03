import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";

const universities = [
  "Stanford",
  "MIT",
  "Oxford",
  "Harvard",
  "Caltech",
  "ETH Zürich",
  "Cambridge",
  "Berkeley",
];

function UniversityLogo({ name }: { name: string }) {
  return (
    <span className="font-serif font-semibold text-lg text-[var(--text-muted)] opacity-70 hover:opacity-100 transition-opacity whitespace-nowrap px-4">
      {name}
    </span>
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
          className="[--duration:45s] [--gap:2rem]"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          {universities.map((uni) => (
            <UniversityLogo key={uni} name={uni} />
          ))}
        </Marquee>
      </div>
    </BlurFade>
  );
}
