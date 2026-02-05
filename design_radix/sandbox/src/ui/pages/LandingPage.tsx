import { useState } from "react";
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

type GradientDynamic = "spotlight" | "diagonal" | "center-depth" | "breathing";

const gradientDynamics: Record<GradientDynamic, { label: string; description: string; css: string }> = {
  // Gradients emanate from behind mockup positions (RIGHT, LEFT, RIGHT pattern)
  spotlight: {
    label: "Content Spotlight",
    description: "Glows behind each mockup, following the layout",
    css: `
      radial-gradient(ellipse 80% 35% at 50% 8%, var(--blue-a4) 0%, transparent 60%),
      radial-gradient(ellipse 60% 30% at 85% 28%, var(--blue-a4) 0%, transparent 55%),
      radial-gradient(ellipse 60% 30% at 15% 50%, var(--jade-a4) 0%, transparent 55%),
      radial-gradient(ellipse 60% 30% at 85% 72%, var(--iris-a4) 0%, transparent 55%),
      linear-gradient(180deg, var(--sand-1) 0%, transparent 5%, transparent 95%, var(--sand-1) 100%)
    `.replace(/\s+/g, ' ').trim(),
  },

  // Diagonal sweep from top-left to bottom-right
  diagonal: {
    label: "Diagonal Flow",
    description: "Sweeping gradient guides eye down the page",
    css: `
      linear-gradient(135deg, var(--blue-a3) 0%, transparent 30%, transparent 70%, var(--jade-a3) 100%),
      radial-gradient(ellipse 100% 50% at 50% 50%, var(--sand-a2) 0%, transparent 60%),
      linear-gradient(180deg, var(--sand-1) 0%, transparent 5%, transparent 95%, var(--sand-1) 100%)
    `.replace(/\s+/g, ' ').trim(),
  },

  // Vignette - edges colored, center clean
  "center-depth": {
    label: "Center Depth",
    description: "Soft vignette frames the content",
    css: `
      radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, var(--blue-a3) 100%),
      radial-gradient(ellipse 100% 30% at 50% 0%, var(--blue-a3) 0%, transparent 50%),
      linear-gradient(180deg, var(--sand-1) 0%, transparent 5%, transparent 95%, var(--sand-1) 100%)
    `.replace(/\s+/g, ' ').trim(),
  },

  // Soft glows along edges only
  breathing: {
    label: "Breathing Edges",
    description: "Atmospheric color along the margins",
    css: `
      radial-gradient(ellipse 40% 80% at 0% 40%, var(--blue-a3) 0%, transparent 60%),
      radial-gradient(ellipse 40% 80% at 100% 60%, var(--jade-a3) 0%, transparent 60%),
      linear-gradient(180deg, var(--sand-1) 0%, transparent 5%, transparent 95%, var(--sand-1) 100%)
    `.replace(/\s+/g, ' ').trim(),
  },
};

type HeroPosition = "high" | "mid" | "tight";
type HeroColors =
  | "single-blue" | "single-teal" | "single-violet"  // Group A: Single
  | "aurora" | "soft-orbs" | "horizontal" | "vertical"  // Group B: Soft Blends
  | "zones" | "corners" | "conic"  // Group C: Geometric
  | "oklch" | "prismatic";  // Group D: Advanced

const heroPositions: Record<HeroPosition, { label: string; position: string; size: string }> = {
  high: { label: "High (8%)", position: "50% 8%", size: "80% 35%" },
  mid: { label: "Mid (12%)", position: "50% 12%", size: "90% 40%" },
  tight: { label: "Tight (10%)", position: "50% 10%", size: "60% 25%" },
};

const heroColorStyles: Record<HeroColors, { label: string; group: string; description: string }> = {
  // Group A: Single
  "single-blue": { label: "Blue", group: "Single", description: "Classic biblio blue" },
  "single-teal": { label: "Teal", group: "Single", description: "Manu teal" },
  "single-violet": { label: "Violet", group: "Single", description: "Discover violet" },

  // Group B: Soft Blends
  aurora: { label: "Aurora", group: "Blend", description: "Soft mesh of all colors" },
  "soft-orbs": { label: "Soft Orbs", group: "Blend", description: "Large fuzzy circles" },
  horizontal: { label: "Horizontal", group: "Blend", description: "Left→right flow" },
  vertical: { label: "Vertical", group: "Blend", description: "Top→bottom fade" },

  // Group C: Geometric
  zones: { label: "Zones", group: "Geometric", description: "Each in its area" },
  corners: { label: "Corners", group: "Geometric", description: "Colors from corners" },
  conic: { label: "Conic", group: "Geometric", description: "Rotating sweep" },

  // Group D: Advanced
  oklch: { label: "OKLCH", group: "Advanced", description: "Vibrant modern blend" },
  prismatic: { label: "Prismatic", group: "Advanced", description: "Full spectrum" },
};

// Build hero CSS based on position and color style
const buildHeroCss = (position: HeroPosition, colors: HeroColors): string => {
  const { position: pos, size } = heroPositions[position];

  switch (colors) {
    // Group A: Single colors
    case "single-blue":
      return `radial-gradient(ellipse ${size} at ${pos}, var(--blue-a4) 0%, transparent 60%)`;
    case "single-teal":
      return `radial-gradient(ellipse ${size} at ${pos}, var(--jade-a4) 0%, transparent 60%)`;
    case "single-violet":
      return `radial-gradient(ellipse ${size} at ${pos}, var(--iris-a4) 0%, transparent 60%)`;

    // Group B: Soft Blends
    case "aurora":
      return `
        radial-gradient(ellipse ${size} at ${pos}, var(--blue-a4) 0%, transparent 70%),
        radial-gradient(ellipse 70% 40% at 30% 5%, var(--jade-a3) 0%, transparent 60%),
        radial-gradient(ellipse 70% 40% at 70% 5%, var(--iris-a3) 0%, transparent 60%)
      `.replace(/\s+/g, ' ').trim();

    case "soft-orbs":
      return `
        radial-gradient(circle 400px at 35% 15%, var(--blue-a3) 0%, transparent 70%),
        radial-gradient(circle 350px at 50% 8%, var(--jade-a3) 0%, transparent 70%),
        radial-gradient(circle 400px at 65% 15%, var(--iris-a3) 0%, transparent 70%)
      `.replace(/\s+/g, ' ').trim();

    case "horizontal":
      return `
        linear-gradient(90deg, var(--blue-a4) 0%, var(--jade-a4) 50%, var(--iris-a4) 100%),
        radial-gradient(ellipse 100% 50% at 50% 10%, rgba(255,255,255,0.3) 0%, transparent 50%)
      `.replace(/\s+/g, ' ').trim();

    case "vertical":
      return `
        linear-gradient(180deg, var(--blue-a4) 0%, var(--jade-a3) 50%, var(--iris-a3) 100%),
        radial-gradient(ellipse 80% 30% at 50% 0%, rgba(255,255,255,0.2) 0%, transparent 40%)
      `.replace(/\s+/g, ' ').trim();

    // Group C: Geometric
    case "zones":
      return `
        radial-gradient(ellipse 50% 35% at 25% 10%, var(--blue-a4) 0%, transparent 55%),
        radial-gradient(ellipse 50% 35% at 50% 8%, var(--jade-a4) 0%, transparent 55%),
        radial-gradient(ellipse 50% 35% at 75% 10%, var(--iris-a4) 0%, transparent 55%)
      `.replace(/\s+/g, ' ').trim();

    case "corners":
      return `
        radial-gradient(ellipse 60% 50% at 0% 0%, var(--blue-a4) 0%, transparent 60%),
        radial-gradient(ellipse 60% 50% at 100% 0%, var(--iris-a4) 0%, transparent 60%),
        radial-gradient(ellipse 80% 40% at 50% 20%, var(--jade-a3) 0%, transparent 50%)
      `.replace(/\s+/g, ' ').trim();

    case "conic":
      return `
        radial-gradient(ellipse ${size} at ${pos}, transparent 30%, var(--sand-2) 70%),
        conic-gradient(from 180deg at 50% 10%, var(--blue-a4), var(--jade-a4), var(--iris-a4), var(--blue-a4))
      `.replace(/\s+/g, ' ').trim();

    // Group D: Advanced
    case "oklch":
      return `
        linear-gradient(in oklch 90deg, var(--blue-9) 0%, var(--jade-9) 50%, var(--iris-9) 100%),
        radial-gradient(ellipse 100% 50% at 50% 10%, transparent 30%, var(--sand-2) 80%)
      `.replace(/\s+/g, ' ').trim();

    case "prismatic":
      return `
        conic-gradient(from 220deg at 50% 10%, var(--blue-a4), var(--jade-a4), var(--iris-a4), var(--blue-a4)),
        radial-gradient(ellipse 80% 35% at 50% 10%, transparent 20%, var(--sand-2) 60%)
      `.replace(/\s+/g, ' ').trim();
  }
};

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [gradientDynamic, setGradientDynamic] = useState<GradientDynamic>("spotlight");
  const [heroPosition, setHeroPosition] = useState<HeroPosition>("mid");
  const [heroColors, setHeroColors] = useState<HeroColors>("single-blue");
  const [opacity, setOpacity] = useState(50);

  // Build spotlight CSS with selected hero position and color style
  const getSpotlightCss = () => {
    return `
      ${buildHeroCss(heroPosition, heroColors)},
      radial-gradient(ellipse 60% 30% at 85% 28%, var(--blue-a4) 0%, transparent 55%),
      radial-gradient(ellipse 60% 30% at 15% 50%, var(--jade-a4) 0%, transparent 55%),
      radial-gradient(ellipse 60% 30% at 85% 72%, var(--iris-a4) 0%, transparent 55%),
      linear-gradient(180deg, var(--sand-1) 0%, transparent 5%, transparent 95%, var(--sand-1) 100%)
    `.replace(/\s+/g, ' ').trim();
  };

  const handleStartFree = () => {
    onNavigate?.("home");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Gradient Dynamic Toggle - fixed position */}
      <div className="fixed bottom-4 right-4 z-50 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg p-3 shadow-lg text-sm">
        <div className="font-medium text-[var(--text-primary)] mb-2">Gradient Dynamic</div>
        <div className="flex flex-col gap-1 mb-3">
          {(Object.keys(gradientDynamics) as GradientDynamic[]).map((dynamic) => (
            <button
              key={dynamic}
              onClick={() => setGradientDynamic(dynamic)}
              className={`text-left px-2 py-1 rounded transition-colors ${
                gradientDynamic === dynamic
                  ? "bg-[var(--biblio)] text-white"
                  : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
              }`}
            >
              {gradientDynamics[dynamic].label}
            </button>
          ))}
        </div>
        {/* Hero controls - only for spotlight */}
        {gradientDynamic === "spotlight" && (
          <>
            {/* Hero Position */}
            <div className="border-t border-[var(--border-subtle)] pt-2 mb-2">
              <div className="text-[var(--text-secondary)] text-xs mb-1">Hero Position</div>
              <div className="flex gap-1">
                {(Object.keys(heroPositions) as HeroPosition[]).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setHeroPosition(pos)}
                    className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                      heroPosition === pos
                        ? "bg-[var(--manu)] text-white"
                        : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {heroPositions[pos].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero Colors - grouped */}
            <div className="border-t border-[var(--border-subtle)] pt-2 mb-3">
              <div className="text-[var(--text-secondary)] text-xs mb-1">Hero Colors</div>

              {/* Single */}
              <div className="text-[var(--text-muted)] text-[10px] mb-0.5">Single</div>
              <div className="flex gap-1 mb-2">
                {(["single-blue", "single-teal", "single-violet"] as HeroColors[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setHeroColors(c)}
                    className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                      heroColors === c
                        ? "bg-[var(--discover)] text-white"
                        : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                    }`}
                    title={heroColorStyles[c].description}
                  >
                    {heroColorStyles[c].label}
                  </button>
                ))}
              </div>

              {/* Blends */}
              <div className="text-[var(--text-muted)] text-[10px] mb-0.5">Blend</div>
              <div className="flex gap-1 mb-2">
                {(["aurora", "soft-orbs", "horizontal", "vertical"] as HeroColors[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setHeroColors(c)}
                    className={`flex-1 px-1.5 py-1 rounded text-xs transition-colors ${
                      heroColors === c
                        ? "bg-[var(--discover)] text-white"
                        : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                    }`}
                    title={heroColorStyles[c].description}
                  >
                    {heroColorStyles[c].label}
                  </button>
                ))}
              </div>

              {/* Geometric */}
              <div className="text-[var(--text-muted)] text-[10px] mb-0.5">Geometric</div>
              <div className="flex gap-1 mb-2">
                {(["zones", "corners", "conic"] as HeroColors[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setHeroColors(c)}
                    className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                      heroColors === c
                        ? "bg-[var(--discover)] text-white"
                        : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                    }`}
                    title={heroColorStyles[c].description}
                  >
                    {heroColorStyles[c].label}
                  </button>
                ))}
              </div>

              {/* Advanced */}
              <div className="text-[var(--text-muted)] text-[10px] mb-0.5">Advanced</div>
              <div className="flex gap-1">
                {(["oklch", "prismatic"] as HeroColors[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setHeroColors(c)}
                    className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                      heroColors === c
                        ? "bg-[var(--discover)] text-white"
                        : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                    }`}
                    title={heroColorStyles[c].description}
                  >
                    {heroColorStyles[c].label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="border-t border-[var(--border-subtle)] pt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[var(--text-secondary)]">Opacity</span>
            <span className="text-[var(--text-primary)] font-mono">{opacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full accent-[var(--biblio)]"
          />
        </div>
        <div className="text-xs text-[var(--text-muted)] mt-2">
          {gradientDynamics[gradientDynamic].description}
        </div>
      </div>

      <Header onStartFree={handleStartFree} />

      <main>
        {/* Unified background wrapper - single color to avoid subpixel rendering gaps */}
        <div
          className="relative overflow-hidden bg-[var(--sand-2)]"
          style={{
            /* GPU rendering to prevent subpixel gaps */
            transform: "translateZ(0)",
          }}
        >
          {/* SINGLE unified gradient - controlled by toggle */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: gradientDynamic === "spotlight"
                ? getSpotlightCss()
                : gradientDynamics[gradientDynamic].css,
              opacity: opacity / 100,
            }}
          />

          {/* Single continuous DotPattern across entire page */}
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
