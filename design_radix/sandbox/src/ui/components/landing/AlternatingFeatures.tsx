import {
  BookOpen,
  FileEdit,
  Search,
  Check,
} from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";

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
    badge: "Discover",
    Icon: Search,
    title: "Find hidden connections",
    description:
      "Explore citation networks, find related papers, and let AI surface the research you need to strengthen your work. Never miss a seminal paper again.",
    bullets: [
      "Visual citation graphs",
      "AI-powered recommendations",
      "Track emerging research",
    ],
    reversed: false,
  },
];

const moduleStyles = {
  bibliography: {
    badge: "bg-[var(--biblio-tint)] text-[var(--biblio-text)]",
    bullet: "bg-[var(--biblio)] text-white",
    border: "hover:border-[var(--biblio-border)]",
  },
  manuscripts: {
    badge: "bg-[var(--manu-tint)] text-[var(--manu-text)]",
    bullet: "bg-[var(--manu)] text-white",
    border: "hover:border-[var(--manu-border)]",
  },
  discover: {
    badge: "bg-[var(--discover-tint)] text-[var(--discover-text)]",
    bullet: "bg-[var(--discover)] text-white",
    border: "hover:border-[var(--discover-border)]",
  },
};

function FeatureSection({ feature, index }: { feature: FeatureSection; index: number }) {
  const styles = moduleStyles[feature.module];
  const isOdd = index % 2 === 1;

  return (
    <section
      className={cn(
        "py-20",
        isOdd ? "bg-[var(--bg-primary)]" : "bg-[var(--bg-secondary)]"
      )}
    >
      <div className="container mx-auto px-6">
        <div
          className={cn(
            "grid md:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center",
            feature.reversed && "md:grid-cols-[1.2fr_1fr]"
          )}
        >
          {/* Text Content */}
          <BlurFade
            delay={0.1}
            inView
            className={cn(feature.reversed && "md:order-2")}
          >
            <div className="flex flex-col gap-5">
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
              <h3 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight leading-tight">
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

          {/* Preview Placeholder */}
          <BlurFade
            delay={0.2}
            inView
            className={cn(feature.reversed && "md:order-1")}
          >
            <div
              className={cn(
                "aspect-[4/3] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]",
                "flex items-center justify-center text-[var(--text-muted)] text-sm",
                "shadow-xl transition-all duration-300",
                "hover:shadow-2xl hover:scale-[1.02] hover:-rotate-[0.5deg]",
                styles.border
              )}
            >
              [{feature.badge} Screenshot]
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}

export function AlternatingFeatures() {
  return (
    <div>
      {features.map((feature, index) => (
        <FeatureSection key={feature.module} feature={feature} index={index} />
      ))}
    </div>
  );
}
