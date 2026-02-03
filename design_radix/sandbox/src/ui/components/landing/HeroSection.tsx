import { ArrowRight, Play } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { WordRotate } from "@/components/ui/word-rotate";
import { DotPattern } from "@/components/ui/dot-pattern";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-24 pb-12">
      {/* Background: Dot Pattern with radial fade */}
      <DotPattern
        width={24}
        height={24}
        cr={1}
        className="opacity-40 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_40%,black_20%,transparent_70%)]"
      />

      {/* Mesh gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, var(--blue-a4) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 85% 30%, var(--iris-a3) 0%, transparent 45%),
            radial-gradient(ellipse 50% 35% at 15% 40%, var(--jade-a3) 0%, transparent 45%),
            radial-gradient(ellipse 40% 30% at 50% 80%, var(--blue-a2) 0%, transparent 50%)
          `,
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Headline */}
          <BlurFade delay={0.1} inView>
            <div className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              <span className="text-[var(--text-primary)]">Your research.</span>
              <br />
              <WordRotate
                words={["One home.", "Organized.", "Connected.", "Simplified."]}
                duration={2500}
                className="bg-gradient-to-r from-[var(--biblio)] via-[var(--manu)] to-[var(--discover)] bg-clip-text text-transparent"
              />
            </div>
          </BlurFade>

          {/* Subheadline */}
          <BlurFade delay={0.2} inView>
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8 leading-relaxed">
              <strong className="text-[var(--text-primary)] font-medium">
                Read, write, and discover
              </strong>{" "}
              — finally in one place. The unified platform for academics who are done
              juggling Zotero, Overleaf, and endless browser tabs.
            </p>
          </BlurFade>

          {/* CTA Buttons */}
          <BlurFade delay={0.3} inView>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <ShimmerButton
                shimmerColor="rgba(255,255,255,0.3)"
                background="var(--biblio)"
                borderRadius="10px"
                className="gap-2 font-medium text-white"
              >
                Start for free
                <ArrowRight className="size-4" />
              </ShimmerButton>
              <Button size="lg" variant="outline" className="gap-2">
                <Play className="size-4" />
                Watch demo
              </Button>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
