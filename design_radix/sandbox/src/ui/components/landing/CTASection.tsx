import { ArrowRight } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { DotPattern } from "@/components/ui/dot-pattern";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

export function CTASection() {
  return (
    <section className="py-20 bg-[var(--bg-primary)]">
      <div className="container mx-auto px-6">
        <BlurFade inView>
          <div className="relative rounded-3xl overflow-hidden border border-[var(--border-subtle)]">
            {/* Border beam effect */}
            <BorderBeam
              size={120}
              duration={10}
              colorFrom="var(--biblio)"
              colorTo="var(--manu)"
              borderWidth={2}
            />

            {/* Card content */}
            <div className="relative bg-[var(--bg-secondary)] rounded-3xl px-6 py-16 sm:py-24">
              {/* Dot pattern background */}
              <DotPattern
                className={cn(
                  "absolute inset-0 opacity-40",
                  "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
                )}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
                  Start writing better papers today
                </h2>
                <p className="text-[var(--text-secondary)] text-lg max-w-md mb-8">
                  Free forever for individuals. No credit card required. Import your
                  existing library in seconds.
                </p>
                <ShimmerButton
                  shimmerColor="rgba(255,255,255,0.3)"
                  background="var(--biblio)"
                  borderRadius="10px"
                  className="gap-2 font-medium text-white"
                >
                  Start free
                  <ArrowRight className="size-4" />
                </ShimmerButton>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
