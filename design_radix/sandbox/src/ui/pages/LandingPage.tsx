import { useState } from "react";
import {
  Header,
  HeroSection,
  TrustStrip,
  BentoFeatures,
  AlternatingFeatures,
  TabbedFeatures,
  StatsSection,
  Testimonials,
  CTASection,
  Footer,
} from "../components/landing";
import { cn } from "@/lib/utils";

type LayoutType = "bento" | "alternating" | "tabs";

interface LandingPageProps {
  onNavigate?: (screen: string) => void;
}

const layoutLabels: Record<LayoutType, string> = {
  bento: "A: Bento",
  alternating: "B: Alternating",
  tabs: "C: Tabs",
};

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [layout, setLayout] = useState<LayoutType>("bento");

  const handleStartFree = () => {
    onNavigate?.("home");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Layout Toggle - Fixed top right */}
      <div className="fixed top-4 right-4 z-[100] flex gap-1 p-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg shadow-xl">
        {(Object.keys(layoutLabels) as LayoutType[]).map((key) => (
          <button
            key={key}
            onClick={() => setLayout(key)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              layout === key
                ? "bg-[var(--biblio)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            )}
          >
            {layoutLabels[key]}
          </button>
        ))}
      </div>

      {/* Layout Label - Fixed bottom right */}
      <div className="fixed bottom-4 right-4 z-[100] px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-md shadow-md text-xs font-medium text-[var(--text-secondary)]">
        Layout {layoutLabels[layout]}
      </div>

      <Header onStartFree={handleStartFree} />

      <main>
        <HeroSection />
        <div className="container mx-auto px-6">
          <TrustStrip />
        </div>

        {/* Features Section - switches based on layout */}
        {layout === "bento" && <BentoFeatures />}
        {layout === "alternating" && <AlternatingFeatures />}
        {layout === "tabs" && <TabbedFeatures />}

        <StatsSection />
        <Testimonials />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
