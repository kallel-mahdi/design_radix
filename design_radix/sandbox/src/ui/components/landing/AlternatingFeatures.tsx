import {
  BookOpen,
  FileEdit,
  Search,
  Check,
} from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Safari } from "@/components/ui/safari";
import { cn } from "@/lib/utils";
import { BiblioMockup } from "./mockups/BiblioMockup";
import { ManuMockup } from "./mockups/ManuMockup";

interface FeatureSection {
  module: "bibliography" | "manuscripts" | "discover";
  badge: string;
  Icon: React.ElementType;
  title: string;
  description: string;
  bullets: string[];
  reversed?: boolean;
  mockupUrl: string;
}

// Placeholder gradient images for each module
const mockupPlaceholders = {
  bibliography: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f0f4f8'/%3E%3Cstop offset='100%25' style='stop-color:%23e1e8f0'/%3E%3C/linearGradient%3E%3ClinearGradient id='accent' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234b7bb5'/%3E%3Cstop offset='100%25' style='stop-color:%235d8ac7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23bg)' width='1200' height='700'/%3E%3Crect x='20' y='20' width='240' height='660' rx='8' fill='%23fff' opacity='0.9'/%3E%3Crect x='40' y='60' width='200' height='12' rx='2' fill='url(%23accent)' opacity='0.3'/%3E%3Crect x='40' y='90' width='160' height='8' rx='2' fill='%23ccd6e0'/%3E%3Crect x='40' y='120' width='200' height='40' rx='4' fill='%23fff' stroke='%23e1e8f0'/%3E%3Crect x='40' y='180' width='200' height='40' rx='4' fill='url(%23accent)' opacity='0.1'/%3E%3Crect x='40' y='240' width='200' height='40' rx='4' fill='%23fff' stroke='%23e1e8f0'/%3E%3Crect x='280' y='20' width='900' height='660' rx='8' fill='%23fff' opacity='0.95'/%3E%3Crect x='300' y='60' width='600' height='24' rx='4' fill='%23e1e8f0'/%3E%3Crect x='300' y='100' width='400' height='16' rx='2' fill='%23f0f4f8'/%3E%3Crect x='300' y='140' width='860' height='520' rx='4' fill='%23fafbfc' stroke='%23e1e8f0'/%3E%3Ctext x='600' y='400' font-family='system-ui' font-size='18' fill='%23a0aec0' text-anchor='middle'%3EBibliography Interface%3C/text%3E%3C/svg%3E",
  manuscripts: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f0f7f4'/%3E%3Cstop offset='100%25' style='stop-color:%23e1f0ea'/%3E%3C/linearGradient%3E%3ClinearGradient id='accent' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2329a383'/%3E%3Cstop offset='100%25' style='stop-color:%2338b595'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23bg)' width='1200' height='700'/%3E%3Crect x='20' y='20' width='580' height='660' rx='8' fill='%231e1e1e'/%3E%3Crect x='40' y='60' width='540' height='20' rx='2' fill='%232d2d2d'/%3E%3Ctext x='60' y='120' font-family='monospace' font-size='14' fill='%23608b4e'%3E%5Cdocumentclass%7Barticle%7D%3C/text%3E%3Ctext x='60' y='145' font-family='monospace' font-size='14' fill='%23dcdcaa'%3E%5Cusepackage%7Bamsmath%7D%3C/text%3E%3Ctext x='60' y='170' font-family='monospace' font-size='14' fill='%23569cd6'%3E%5Cbegin%7Bdocument%7D%3C/text%3E%3Ctext x='60' y='220' font-family='monospace' font-size='14' fill='%23ce9178'%3E%5Ctitle%7BResearch Paper%7D%3C/text%3E%3Crect x='620' y='20' width='560' height='660' rx='8' fill='%23fff' opacity='0.98'/%3E%3Crect x='640' y='60' width='520' height='600' rx='4' fill='%23fafbfc'/%3E%3Ctext x='900' y='350' font-family='Georgia,serif' font-size='24' fill='%23333' text-anchor='middle'%3ELive Preview%3C/text%3E%3Ctext x='900' y='380' font-family='Georgia,serif' font-size='14' fill='%2366758a' text-anchor='middle'%3EYour document renders here%3C/text%3E%3C/svg%3E",
  discover: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f4f0f8'/%3E%3Cstop offset='100%25' style='stop-color:%23ebe1f0'/%3E%3C/linearGradient%3E%3ClinearGradient id='accent' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%238b5fb5'/%3E%3Cstop offset='100%25' style='stop-color:%239b6fc7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23bg)' width='1200' height='700'/%3E%3Ccircle cx='600' cy='350' r='120' fill='url(%23accent)' opacity='0.15'/%3E%3Ccircle cx='600' cy='350' r='80' fill='url(%23accent)' opacity='0.25'/%3E%3Ccircle cx='600' cy='350' r='40' fill='url(%23accent)' opacity='0.9'/%3E%3Ccircle cx='380' cy='280' r='30' fill='%23fff' stroke='url(%23accent)' stroke-width='2'/%3E%3Cline x1='410' y1='300' x2='560' y2='340' stroke='url(%23accent)' stroke-width='2' opacity='0.4'/%3E%3Ccircle cx='820' cy='280' r='30' fill='%23fff' stroke='url(%23accent)' stroke-width='2'/%3E%3Cline x1='790' y1='300' x2='640' y2='340' stroke='url(%23accent)' stroke-width='2' opacity='0.4'/%3E%3Ccircle cx='450' cy='480' r='25' fill='%23fff' stroke='url(%23accent)' stroke-width='2'/%3E%3Cline x1='470' y1='460' x2='570' y2='390' stroke='url(%23accent)' stroke-width='2' opacity='0.4'/%3E%3Ccircle cx='750' cy='480' r='25' fill='%23fff' stroke='url(%23accent)' stroke-width='2'/%3E%3Cline x1='730' y1='460' x2='630' y2='390' stroke='url(%23accent)' stroke-width='2' opacity='0.4'/%3E%3Ctext x='600' y='355' font-family='system-ui' font-size='14' fill='%23fff' text-anchor='middle'%3EYour Paper%3C/text%3E%3Ctext x='600' y='550' font-family='system-ui' font-size='16' fill='%236b5b7a' text-anchor='middle'%3ECitation Graph%3C/text%3E%3C/svg%3E",
};

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
    mockupUrl: "citable.app/bibliography",
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
    mockupUrl: "citable.app/editor",
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
    mockupUrl: "citable.app/discover",
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
        "min-h-screen flex items-center py-16 lg:py-0",
        isOdd ? "bg-[var(--bg-primary)]" : "bg-[var(--bg-secondary)]"
      )}
    >
      <div className="container mx-auto px-6 lg:px-12">
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
                  <BiblioMockup />
                </div>
              ) : feature.module === "manuscripts" ? (
                <div className="aspect-[16/10]">
                  <ManuMockup />
                </div>
              ) : (
                <Safari
                  url={feature.mockupUrl}
                  imageSrc={mockupPlaceholders[feature.module]}
                  className="rounded-xl shadow-2xl"
                />
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
    <div>
      {features.map((feature, index) => (
        <FeatureSection key={feature.module} feature={feature} index={index} />
      ))}
    </div>
  );
}
