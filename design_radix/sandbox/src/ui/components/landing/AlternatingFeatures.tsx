import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  FileEdit,
  Link2,
  Check,
} from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";
import { BiblioMockup } from "./mockups/BiblioMockup";
import { ManuMockup } from "./mockups/ManuMockup";
import { IntegrationMockup } from "./mockups/IntegrationMockup";

function useInView(threshold = 0.3) {
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

interface FeatureSection {
  module: "bibliography" | "manuscripts" | "discover";
  badge: string;
  Icon: React.ElementType;
  title: string;
  description: string;
  bullets: string[];
  reversed?: boolean;
}

const features: FeatureSection[] = [
  {
    module: "bibliography",
    badge: "Bibliography",
    Icon: BookOpen,
    title: "Smart library that organizes itself",
    description:
      "Import papers from anywhere. AI handles the tagging, sorting, and organizing while you focus on what matters — actually reading the papers.",
    bullets: [
      "AI-powered auto-tagging",
      "Smart collections that update themselves",
      "One-click import from any source",
    ],
    reversed: false,
  },
  {
    module: "manuscripts",
    badge: "Manuscripts",
    Icon: FileEdit,
    title: "LaTeX editor built for researchers",
    description:
      "A powerful editor with live preview, real-time collaboration, and seamless citation insertion as you write. No more copy-pasting BibTeX entries.",
    bullets: [
      "Side-by-side live preview",
      "Insert citations from your library",
      "Auto-save & version history",
    ],
    reversed: true,
  },
  {
    module: "discover",
    badge: "Integration",
    Icon: Link2,
    title: "Bibliography meets manuscript",
    description:
      "Your references are one click away. Link a folder, type \\cite{}, and watch autocomplete pull from your library.",
    bullets: [
      "One-click folder linking",
      "Smart citation autocomplete",
      "Live citation status tracking",
    ],
    reversed: false,
  },
];

const moduleStyles = {
  bibliography: {
    badge: "bg-[var(--manu-tint)] text-[var(--manu-text)]",
    bullet: "bg-[var(--manu)] text-white",
    border: "hover:border-[var(--manu-border)]",
  },
  manuscripts: {
    badge: "bg-[var(--biblio-tint)] text-[var(--biblio-text)]",
    bullet: "bg-[var(--biblio)] text-white",
    border: "hover:border-[var(--biblio-border)]",
  },
  discover: {
    badge: "bg-[var(--discover-tint)] text-[var(--discover-text)]",
    bullet: "bg-[var(--discover)] text-white",
    border: "hover:border-[var(--discover-border)]",
  },
};

function FeatureSection({ feature, index }: { feature: FeatureSection; index: number }) {
  const styles = moduleStyles[feature.module];
  const { ref, isInView } = useInView(0.3);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center py-16 lg:py-0">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div
          className={cn(
            "grid lg:grid-cols-[0.72fr_1.28fr] gap-10 lg:gap-16 items-center",
            feature.reversed && "lg:grid-cols-[1.28fr_0.72fr]"
          )}
        >
          {/* Text Content */}
          <BlurFade
            delay={0.1}
            inView
            className={cn(feature.reversed && "lg:order-2")}
          >
            <div className="flex flex-col gap-5 max-w-lg">
              {/* Badge */}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
                  styles.badge
                )}
              >
                <feature.Icon className="size-3" />
                {feature.badge}
              </span>

              {/* Title */}
              <h3 className="font-serif text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight leading-tight">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                {feature.description}
              </p>

              {/* Bullet Points */}
              <ul className="flex flex-col gap-3 mt-2">
                {feature.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-center gap-3 text-[var(--text-primary)]">
                    <span
                      className={cn(
                        "flex items-center justify-center size-5 rounded-full shrink-0",
                        styles.bullet
                      )}
                    >
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </BlurFade>

          {/* Mockup - Bibliography uses standalone component, others use Safari */}
          <BlurFade
            delay={0.2}
            inView
            className={cn(feature.reversed && "lg:order-1")}
          >
            <div
              className={cn(
                "transition-all duration-300",
                "hover:shadow-2xl hover:scale-[1.01]"
              )}
            >
              {feature.module === "bibliography" ? (
                <div className="aspect-[16/10]">
                  <BiblioMockup isInView={isInView} />
                </div>
              ) : feature.module === "manuscripts" ? (
                <div className="aspect-[16/10]">
                  <ManuMockup isInView={isInView} />
                </div>
              ) : (
                <div className="aspect-[16/10]">
                  <IntegrationMockup isInView={isInView} />
                </div>
              )}
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}

export function AlternatingFeatures() {
  return (
    <div className="relative">
      {/* Gradient handled by parent LandingPage - no local gradient */}

      {features.map((feature, index) => (
        <FeatureSection key={feature.module} feature={feature} index={index} />
      ))}
    </div>
  );
}
