import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";

const universities = [
  { name: "École Normale Supérieure", logo: "/logos/ens-paris.png" },
  { name: "EURECOM", logo: "/logos/eurecom.svg" },
  { name: "Télécom Paris", logo: "/logos/telecom-paris.svg" },
  { name: "Politecnico di Milano", logo: "/logos/polimi.svg" },
  { name: "University of Würzburg", logo: "/logos/uni-wurzburg.svg" },
  { name: "TU Darmstadt", logo: "/logos/tu-darmstadt.svg" },
  { name: "KTH", logo: "/logos/kth.svg" },
  { name: "Université de Montréal", logo: "/logos/udem.svg" },
  { name: "Université du Québec", logo: "/logos/uq.svg" },
];

function UniversityLogo({ name, logo }: { name: string; logo: string }) {
  return (
    <div className="flex items-center justify-center w-[150px] h-[44px] px-2">
      <img
        src={logo}
        alt={name}
        className="max-w-full max-h-full object-contain grayscale opacity-50 hover:opacity-80 transition-opacity duration-300"
      />
    </div>
  );
}

export function TrustStrip() {
  return (
    <BlurFade delay={0.4} inView>
      <div className="pt-10 pb-6">
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
            />
          ))}
        </Marquee>
      </div>
    </BlurFade>
  );
}
