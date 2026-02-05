import {
  Header,
  HeroSection,
  TrustStrip,
  AlternatingFeatures,
  StatsSection,
  Testimonials,
  CTASection,
  Footer,
} from "../components/landing";
import { DotPattern } from "@/components/ui/dot-pattern";

interface LandingPageProps {
  onNavigate?: (screen: string) => void;
}

// Locked-in gradient: Soft Orbs hero + Content Spotlight sections @ 70% opacity
const GRADIENT_CSS = `
  radial-gradient(circle 400px at 35% 15%, var(--blue-a3) 0%, transparent 70%),
  radial-gradient(circle 350px at 50% 8%, var(--jade-a3) 0%, transparent 70%),
  radial-gradient(circle 400px at 65% 15%, var(--iris-a3) 0%, transparent 70%),
  radial-gradient(ellipse 60% 30% at 85% 28%, var(--blue-a4) 0%, transparent 55%),
  radial-gradient(ellipse 60% 30% at 15% 50%, var(--jade-a4) 0%, transparent 55%),
  radial-gradient(ellipse 60% 30% at 85% 72%, var(--iris-a4) 0%, transparent 55%),
  linear-gradient(180deg, var(--sand-1) 0%, transparent 5%, transparent 95%, var(--sand-1) 100%)
`.replace(/\s+/g, ' ').trim();

export function LandingPage({ onNavigate }: LandingPageProps) {
  const handleStartFree = () => {
    onNavigate?.("home");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header onStartFree={handleStartFree} />

      <main>
        <div
          className="relative overflow-hidden bg-[var(--sand-2)]"
          style={{ transform: "translateZ(0)" }}
        >
          {/* Unified gradient layer */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: GRADIENT_CSS, opacity: 0.7 }}
          />

          <DotPattern
            width={20}
            height={20}
            cr={1.2}
            className="opacity-20 [mask-image:linear-gradient(to_bottom,transparent_0%,black_5%,black_95%,transparent_100%)]"
          />

          <HeroSection />
          <div className="container mx-auto px-6 relative z-10">
            <TrustStrip />
          </div>

          <AlternatingFeatures />

          <StatsSection />
          <Testimonials />
        </div>

        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
