import { BlurFade } from "@/components/ui/blur-fade";
import { WordRotate } from "@/components/ui/word-rotate";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Button } from "@/components/ui/button";
import { TrustStrip } from "./TrustStrip";

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex flex-col pt-24 pb-8">
      {/* Gradient handled by parent LandingPage - no local gradient */}

      <div className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Headline - delay={0} for immediate visibility */}
            <BlurFade delay={0} inView>
              <div className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                <span className="text-[var(--text-primary)]">Your research</span>
                <br />
                <WordRotate
                  words={["One home", "Organized", "Connected", "Simplified"]}
                  duration={2500}
                  className="bg-gradient-to-r from-[var(--biblio)] via-[var(--manu)] to-[var(--discover)] bg-clip-text text-transparent"
                />
              </div>
            </BlurFade>

            {/* Subheadline - punchy 5-word tagline */}
            <BlurFade delay={0.1} inView>
              <p className="text-xl sm:text-2xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8 tracking-wide">
                <strong className="text-[var(--text-primary)] font-semibold">Read.</strong>{" "}
                <strong className="text-[var(--text-primary)] font-semibold">Write.</strong>{" "}
                <strong className="text-[var(--text-primary)] font-semibold">Cite.</strong>{" "}
                <span className="text-[var(--text-secondary)] font-normal">All here</span>
              </p>
            </BlurFade>

            {/* CTA Buttons */}
            <BlurFade delay={0.15} inView>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <InteractiveHoverButton>
                  Start free
                </InteractiveHoverButton>
                <Button size="lg" variant="outline" className="gap-2">
                  Join Discord
                </Button>
              </div>
            </BlurFade>
          </div>
        </div>
      </div>

      {/* Trust strip at bottom of hero viewport */}
      <div className="container mx-auto px-6 relative z-10">
        <TrustStrip />
      </div>
    </section>
  );
}
