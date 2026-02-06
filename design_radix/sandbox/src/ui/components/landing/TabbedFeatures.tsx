import { BookOpen, FileEdit, Search, Check } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Safari } from "@/components/ui/safari";
import { cn } from "@/lib/utils";
import { BiblioMockup } from "./mockups/BiblioMockup";
import { ManuMockup } from "./mockups/ManuMockup";

interface TabFeature {
  id: string;
  module: "bibliography" | "manuscripts" | "discover";
  label: string;
  Icon: React.ElementType;
  title: string;
  description: string;
  bullets: string[];
  mockupUrl: string;
}

// Placeholder gradient images for each module
const mockupPlaceholders = {
  bibliography: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f0f4f8'/%3E%3Cstop offset='100%25' style='stop-color:%23e1e8f0'/%3E%3C/linearGradient%3E%3ClinearGradient id='accent' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234b7bb5'/%3E%3Cstop offset='100%25' style='stop-color:%235d8ac7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23bg)' width='1200' height='700'/%3E%3Crect x='20' y='20' width='240' height='660' rx='8' fill='%23fff' opacity='0.9'/%3E%3Crect x='40' y='60' width='200' height='12' rx='2' fill='url(%23accent)' opacity='0.3'/%3E%3Crect x='40' y='90' width='160' height='8' rx='2' fill='%23ccd6e0'/%3E%3Crect x='40' y='120' width='200' height='40' rx='4' fill='%23fff' stroke='%23e1e8f0'/%3E%3Crect x='40' y='180' width='200' height='40' rx='4' fill='url(%23accent)' opacity='0.1'/%3E%3Crect x='40' y='240' width='200' height='40' rx='4' fill='%23fff' stroke='%23e1e8f0'/%3E%3Crect x='280' y='20' width='900' height='660' rx='8' fill='%23fff' opacity='0.95'/%3E%3Crect x='300' y='60' width='600' height='24' rx='4' fill='%23e1e8f0'/%3E%3Crect x='300' y='100' width='400' height='16' rx='2' fill='%23f0f4f8'/%3E%3Crect x='300' y='140' width='860' height='520' rx='4' fill='%23fafbfc' stroke='%23e1e8f0'/%3E%3Ctext x='600' y='400' font-family='system-ui' font-size='18' fill='%23a0aec0' text-anchor='middle'%3EBibliography Interface%3C/text%3E%3C/svg%3E",
  manuscripts: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f0f7f4'/%3E%3Cstop offset='100%25' style='stop-color:%23e1f0ea'/%3E%3C/linearGradient%3E%3ClinearGradient id='accent' x1='0%25' y1='0%25' x2='0%25' y2'100%25'%3E%3Cstop offset='0%25' style='stop-color:%2329a383'/%3E%3Cstop offset='100%25' style='stop-color:%2338b595'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23bg)' width='1200' height='700'/%3E%3Crect x='20' y='20' width='580' height='660' rx='8' fill='%231e1e1e'/%3E%3Crect x='40' y='60' width='540' height='20' rx='2' fill='%232d2d2d'/%3E%3Ctext x='60' y='120' font-family='monospace' font-size='14' fill='%23608b4e'%3E%5Cdocumentclass%7Barticle%7D%3C/text%3E%3Ctext x='60' y='145' font-family='monospace' font-size='14' fill='%23dcdcaa'%3E%5Cusepackage%7Bamsmath%7D%3C/text%3E%3Ctext x='60' y='170' font-family='monospace' font-size='14' fill='%23569cd6'%3E%5Cbegin%7Bdocument%7D%3C/text%3E%3Ctext x='60' y='220' font-family='monospace' font-size='14' fill='%23ce9178'%3E%5Ctitle%7BResearch Paper%7D%3C/text%3E%3Crect x='620' y='20' width='560' height='660' rx='8' fill='%23fff' opacity='0.98'/%3E%3Crect x='640' y='60' width='520' height='600' rx='4' fill='%23fafbfc'/%3E%3Ctext x='900' y='350' font-family='Georgia,serif' font-size='24' fill='%23333' text-anchor='middle'%3ELive Preview%3C/text%3E%3Ctext x='900' y='380' font-family='Georgia,serif' font-size='14' fill='%2366758a' text-anchor='middle'%3EYour document renders here%3C/text%3E%3C/svg%3E",
  discover: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f4f0f8'/%3E%3Cstop offset='100%25' style='stop-color:%23ebe1f0'/%3E%3C/linearGradient%3E%3ClinearGradient id='accent' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%238b5fb5'/%3E%3Cstop offset='100%25' style='stop-color:%239b6fc7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23bg)' width='1200' height='700'/%3E%3Ccircle cx='600' cy='350' r='120' fill='url(%23accent)' opacity='0.15'/%3E%3Ccircle cx='600' cy='350' r='80' fill='url(%23accent)' opacity='0.25'/%3E%3Ccircle cx='600' cy='350' r='40' fill='url(%23accent)' opacity='0.9'/%3E%3Ccircle cx='380' cy='280' r='30' fill='%23fff' stroke='url(%23accent)' stroke-width='2'/%3E%3Cline x1='410' y1='300' x2='560' y2='340' stroke='url(%23accent)' stroke-width='2' opacity='0.4'/%3E%3Ccircle cx='820' cy='280' r='30' fill='%23fff' stroke='url(%23accent)' stroke-width='2'/%3E%3Cline x1='790' y1='300' x2='640' y2='340' stroke='url(%23accent)' stroke-width='2' opacity='0.4'/%3E%3Ccircle cx='450' cy='480' r='25' fill='%23fff' stroke='url(%23accent)' stroke-width='2'/%3E%3Cline x1='470' y1='460' x2='570' y2='390' stroke='url(%23accent)' stroke-width='2' opacity='0.4'/%3E%3Ccircle cx='750' cy='480' r='25' fill='%23fff' stroke='url(%23accent)' stroke-width='2'/%3E%3Cline x1='730' y1='460' x2='630' y2='390' stroke='url(%23accent)' stroke-width='2' opacity='0.4'/%3E%3Ctext x='600' y='355' font-family='system-ui' font-size='14' fill='%23fff' text-anchor='middle'%3EYour Paper%3C/text%3E%3Ctext x='600' y='550' font-family='system-ui' font-size='16' fill='%236b5b7a' text-anchor='middle'%3ECitation Graph%3C/text%3E%3C/svg%3E",
};

const tabFeatures: TabFeature[] = [
  {
    id: "bibliography",
    module: "bibliography",
    label: "Bibliography",
    Icon: BookOpen,
    title: "Smart library that organizes itself",
    description:
      "Import papers from anywhere. AI handles the tagging, sorting, and organizing while you focus on reading and understanding.",
    bullets: [
      "AI-powered auto-tagging",
      "Smart collections",
      "One-click import",
    ],
    mockupUrl: "citable.app/bibliography",
  },
  {
    id: "manuscripts",
    module: "manuscripts",
    label: "Manuscripts",
    Icon: FileEdit,
    title: "LaTeX editor built for researchers",
    description:
      "A powerful editor with live preview, real-time collaboration, and seamless citation insertion as you write.",
    bullets: [
      "Side-by-side live preview",
      "Rich formatting toolbar",
      "Auto-save & version history",
    ],
    mockupUrl: "citable.app/editor",
  },
  {
    id: "discover",
    module: "discover",
    label: "Discover",
    Icon: Search,
    title: "Find hidden connections",
    description:
      "Explore citation networks, find related papers, and let AI surface the research you need to strengthen your work.",
    bullets: [
      "Visual citation graphs",
      "AI-powered recommendations",
      "Track citation trends",
    ],
    mockupUrl: "citable.app/discover",
  },
];

const moduleStyles = {
  bibliography: {
    trigger: "data-[state=active]:bg-[var(--manu-tint)] data-[state=active]:text-[var(--manu-text)]",
    bullet: "bg-[var(--manu)] text-white",
  },
  manuscripts: {
    trigger: "data-[state=active]:bg-[var(--biblio-tint)] data-[state=active]:text-[var(--biblio-text)]",
    bullet: "bg-[var(--biblio)] text-white",
  },
  discover: {
    trigger: "data-[state=active]:bg-[var(--discover-tint)] data-[state=active]:text-[var(--discover-text)]",
    bullet: "bg-[var(--discover)] text-white",
  },
};

function TabPanel({ feature }: { feature: TabFeature }) {
  const styles = moduleStyles[feature.module];

  return (
    <div className="grid md:grid-cols-[1fr_1.5fr] gap-8 lg:gap-14 items-center bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-subtle)] p-8 lg:p-12 shadow-lg">
      {/* Text Content */}
      <div className="flex flex-col gap-4">
        <h3 className="text-2xl lg:text-3xl font-semibold tracking-tight">
          {feature.title}
        </h3>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          {feature.description}
        </p>
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

      {/* Safari Mockup */}
      <Safari
        url={feature.mockupUrl}
        imageSrc={feature.module === "discover" ? mockupPlaceholders[feature.module] : undefined}
        className="rounded-lg shadow-md"
      >
        {feature.module === "bibliography" && <BiblioMockup />}
        {feature.module === "manuscripts" && <ManuMockup />}
      </Safari>
    </div>
  );
}

export function TabbedFeatures() {
  return (
    <section className="py-20 bg-[var(--bg-secondary)]">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <BlurFade inView>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              One platform.
              <br />
              Three superpowers.
            </h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
              Everything you need to go from reading to publishing.
            </p>
          </div>
        </BlurFade>

        {/* Tabs */}
        <BlurFade delay={0.2} inView>
          <Tabs defaultValue="bibliography" className="w-full">
            {/* Tab Triggers */}
            <TabsList className="mx-auto mb-8 p-1 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl">
              {tabFeatures.map((feature) => {
                const styles = moduleStyles[feature.module];
                return (
                  <TabsTrigger
                    key={feature.id}
                    value={feature.id}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all",
                      styles.trigger
                    )}
                  >
                    <feature.Icon className="size-4" />
                    {feature.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tab Content */}
            {tabFeatures.map((feature) => (
              <TabsContent
                key={feature.id}
                value={feature.id}
                className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
              >
                <TabPanel feature={feature} />
              </TabsContent>
            ))}
          </Tabs>
        </BlurFade>
      </div>
    </section>
  );
}
