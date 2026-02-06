import {
  Header,
  HeroSection,
  AlternatingFeatures,
  CTASection,
  Footer,
} from "../components/landing";
import { DotPattern } from "@/components/ui/dot-pattern";

interface LandingPageProps {
  onNavigate?: (screen: string) => void;
}

// Hero-only gradient: 3 distinct color orbs behind headline
const HERO_GRADIENT = `
  radial-gradient(circle 500px at 30% 20%, color-mix(in srgb, var(--jade-9) 20%, transparent) 0%, transparent 60%),
  radial-gradient(circle 500px at 50% 15%, color-mix(in srgb, var(--blue-9) 20%, transparent) 0%, transparent 60%),
  radial-gradient(circle 500px at 70% 20%, color-mix(in srgb, var(--iris-9) 20%, transparent) 0%, transparent 60%),
  linear-gradient(180deg, var(--sand-1) 0%, transparent 5%, transparent 95%, var(--sand-1) 100%)
`.replace(/\s+/g, ' ').trim();

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header />

      <main>
        <div
          className="relative overflow-hidden bg-[var(--sand-2)]"
          style={{ transform: "translateZ(0)" }}
        >
          {/* Unified gradient layer */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: HERO_GRADIENT, opacity: 0.8 }}
          />

          <DotPattern
            width={20}
            height={20}
            cr={1.2}
            className="opacity-20 [mask-image:linear-gradient(to_bottom,transparent_0%,black_5%,black_95%,transparent_100%)]"
          />

          <HeroSection />

          <AlternatingFeatures />
        </div>

        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
