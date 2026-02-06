import {
  Header,
  HeroSection,
  AlternatingFeatures,
  CTASection,
  Footer,
} from "../components/landing";

interface LandingPageProps {
  onNavigate?: (screen: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header />

      <main>
        <div className="relative bg-white overflow-hidden">
          <HeroSection />

          <AlternatingFeatures />

          <CTASection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
