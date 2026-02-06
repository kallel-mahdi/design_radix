import { useEffect, useRef, useState } from "react";
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

function useScrollAssist(threshold = 0.4) {
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
          // Smooth-scroll the section to center viewport
          el.scrollIntoView({ behavior: "smooth", block: "center" });
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

  bullets: string[];
  reversed?: boolean;
}

const features: FeatureSection[] = [
  {
    module: "bibliography",
    badge: "Bibliography",
    Icon: BookOpen,
    title: "Build your library",
    bullets: [
      "Import PDFs with auto-extracted metadata",
      "Organize into nested collections and tags",
      "Read and annotate PDFs inline",
    ],
    reversed: false,
  },
  {
    module: "manuscripts",
    badge: "Manuscripts",
    Icon: FileEdit,
    title: "Create with ease",
    bullets: [
      "LaTeX editor with live compilation",
      "Version history with side-by-side diffs",
      "Real-time collaborative editing",
    ],
    reversed: true,
  },
  {
    module: "discover",
    badge: "Integration",
    Icon: Link2,
    title: "Connect every source",
    bullets: [
      "Cite papers directly from your bibliography",
      "Track which papers are cited in your manuscript",
      "Open referenced PDFs without leaving the editor",
    ],
    reversed: false,
  },
];

// Mockup glow: blurred circle behind each mockup
const GLOW = { opacity: 0.25, size: 85, blur: 110 };

const moduleColors = {
  bibliography: "--jade-9",
  manuscripts: "--blue-9",
  discover: "--iris-9",
};

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

function FeatureSection({ feature }: { feature: FeatureSection }) {
  const styles = moduleStyles[feature.module];
  const color = moduleColors[feature.module];
  const { ref, isInView } = useScrollAssist(0.6);

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
              <h3 className="text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight leading-tight">
                {feature.title}
              </h3>

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

          {/* Mockup with per-module glow */}
          <BlurFade
            delay={0.2}
            inView
            className={cn(feature.reversed && "lg:order-1")}
          >
            <div className="relative">
              {/* Blurred circle glow behind mockup */}
              <div
                className="absolute pointer-events-none rounded-full"
                style={{
                  width: `${GLOW.size}%`,
                  aspectRatio: "1",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: `var(${color})`,
                  filter: `blur(${GLOW.blur}px)`,
                  opacity: GLOW.opacity,
                }}
              />
              <div
                className={cn(
                  "relative transition-all duration-300",
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
      {features.map((feature) => (
        <FeatureSection key={feature.module} feature={feature} />
      ))}
    </div>
  );
}
