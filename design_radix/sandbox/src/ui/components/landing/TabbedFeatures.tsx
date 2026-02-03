import { BookOpen, FileEdit, Search, Check } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface TabFeature {
  id: string;
  module: "bibliography" | "manuscripts" | "discover";
  label: string;
  Icon: React.ElementType;
  title: string;
  description: string;
  bullets: string[];
}

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
  },
];

const moduleStyles = {
  bibliography: {
    trigger: "data-[state=active]:bg-[var(--biblio-tint)] data-[state=active]:text-[var(--biblio-text)]",
    bullet: "bg-[var(--biblio)] text-white",
  },
  manuscripts: {
    trigger: "data-[state=active]:bg-[var(--manu-tint)] data-[state=active]:text-[var(--manu-text)]",
    bullet: "bg-[var(--manu)] text-white",
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
        <h3 className="font-serif text-2xl lg:text-3xl font-semibold tracking-tight">
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

      {/* Preview Placeholder */}
      <div className="aspect-[16/10] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] text-sm">
        [{feature.label} Interface]
      </div>
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
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
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
