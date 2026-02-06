import { BlurFade } from "@/components/ui/blur-fade";
import { WordRotate } from "@/components/ui/word-rotate";
import { Button } from "@/components/ui/button";
import { TrustStrip } from "./TrustStrip";
import { cn } from "@/lib/utils";

const HERO_GRADIENT = "linear-gradient(to right, #34d399, #60a5fa, #a78bfa)";

export type BlobTransition = "mask-fade" | "blob-overflow";

interface HeroSectionProps {
  blobTransition?: BlobTransition;
}

export function HeroSection({ blobTransition = "mask-fade" }: HeroSectionProps) {
  return (
    <section className="hero-section-wrapper relative min-h-screen flex flex-col pt-24 pb-8">
      {/* Background Elements */}
      <div className="hero-grid-bg"></div>
      <div
        className={cn(
          "hero-blobs",
          blobTransition === "mask-fade" && "hero-blobs-mask",
          blobTransition === "blob-overflow" && "hero-blobs-overflow"
        )}
      >
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-5xl mx-auto">
            {/* Headline — Inter Bold */}
            <BlurFade delay={0} inView>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] mb-8 text-[#111827]">
                Your research <br />
                <WordRotate
                  words={["Connected", "Organized", "Simplified", "One home"]}
                  duration={2500}
                  className="hero-gradient-text pb-2"
                  motionProps={{
                    initial: { opacity: 0, y: -50 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: 50 },
                    transition: { duration: 0.25, ease: "easeOut" },
                    style: {
                      backgroundImage: HERO_GRADIENT,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      WebkitTextFillColor: "transparent",
                    },
                  }}
                />
              </h1>
            </BlurFade>

            {/* Subheadline */}
            <BlurFade delay={0.1} inView>
              <p className="text-xl sm:text-2xl text-[#6b7280] font-light mb-10 max-w-lg mx-auto leading-relaxed">
                Read. Write. Cite.{" "}
                <span className="text-[#9ca3af]">All here.</span>
              </p>
            </BlurFade>

            {/* CTA Buttons - Black/White Pills */}
            <BlurFade delay={0.15} inView>
              <div className="flex items-center justify-center gap-4">
                <Button className="rounded-full px-8 h-12 text-lg bg-[#111827] text-white font-medium hover:bg-[#1f2937] hover:shadow-lg transition-all hover:-translate-y-0.5 border-0">
                  Start free
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-8 h-12 text-lg border border-gray-200 bg-white/50 backdrop-blur-sm text-[#4b5563] font-medium hover:bg-white hover:shadow-md hover:text-[#111827] transition-all"
                >
                  Join Discord
                </Button>
              </div>
            </BlurFade>
          </div>
        </div>
      </div>

      {/* Trust strip at bottom of hero viewport */}
      <div className="container mx-auto px-6 relative z-10 mt-12">
        <TrustStrip />
      </div>
    </section>
  );
}
