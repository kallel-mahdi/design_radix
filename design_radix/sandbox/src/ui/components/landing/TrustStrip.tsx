import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";

// Per-logo scale factors to normalize visual weight.
// Wide wordmarks get full width; bold/compact logos get scaled down.
const universities = [
  { name: "École Polytechnique", logo: "/logos/ecole-polytechnique.svg", scale: 0.85 },
  { name: "École Normale Supérieure", logo: "/logos/ens-paris.svg", scale: 0.7 },
  { name: "EURECOM", logo: "/logos/eurecom.svg", scale: 0.9 },
  { name: "Télécom Paris", logo: "/logos/telecom-paris.svg", scale: 0.75 },
  { name: "Politecnico di Milano", logo: "/logos/polimi.svg", scale: 0.9 },
  { name: "University of Würzburg", logo: "/logos/uni-wurzburg.svg", scale: 0.9 },
  { name: "TU Darmstadt", logo: "/logos/tu-darmstadt.svg", scale: 0.85 },
  { name: "KTH", logo: "/logos/kth.svg", scale: 0.55 },
  { name: "Université de Montréal", logo: "/logos/udem.svg", scale: 0.9 },
  { name: "Université du Québec", logo: "/logos/uq.svg", scale: 0.85 },
];

function UniversityLogo({
  name,
  logo,
  scale,
}: {
  name: string;
  logo: string;
  scale: number;
}) {
  return (
    <div className="flex items-center justify-center w-[150px] h-[44px] px-2">
      <img
        src={logo}
        alt={name}
        className="max-w-full max-h-full object-contain opacity-50 hover:opacity-80 transition-opacity duration-300"
        style={{
          filter: "grayscale(100%) brightness(0.4)",
          transform: `scale(${scale})`,
        }}
      />
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
          className="[--duration:50s] [--gap:1.5rem]"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          {universities.map((uni) => (
            <UniversityLogo
              key={uni.name}
              name={uni.name}
              logo={uni.logo}
              scale={uni.scale}
            />
          ))}
        </Marquee>
      </div>
    </BlurFade>
  );
}
