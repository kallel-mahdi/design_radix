import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { DotPattern } from "@/components/ui/dot-pattern";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { cn } from "@/lib/utils";

const SURVEY_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScgLAQGyrGBjs7YHPnUu2D-AxNacgDFFm1hBe64HbUhZixkaw/viewform";

export function CTASection() {
  return (
    <section className="relative z-10 py-20">
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
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
                  Help us build the perfect research tool
                </h2>
                <p className="text-[var(--text-secondary)] text-lg max-w-md mb-8">
                  We're shaping Citable around real researcher needs.
                  Help us build better tools for you.
                </p>
                <a
                  href={SURVEY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InteractiveHoverButton>
                    Take our survey
                  </InteractiveHoverButton>
                </a>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
