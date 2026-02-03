import {
  BookOpen,
  FileEdit,
  Search,
  Download,
  Users,
  Sparkles,
  Tag,
} from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";

// Background components for each card
function BiblioBackground() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[var(--biblio-tint)] to-transparent opacity-50" />
  );
}

function ManuBackground() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[var(--manu-tint)] to-transparent opacity-50" />
  );
}

function DiscoverBackground() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[var(--discover-tint)] to-transparent opacity-50" />
  );
}

const features = [
  // Row 1: Bibliography (2 cols) + Manuscripts (1 col)
  {
    Icon: BookOpen,
    name: "Smart library that organizes itself",
    description:
      "Import papers from anywhere — Zotero, Mendeley, DOI, arXiv, or any URL. AI handles tagging, sorting, and organizing.",
    href: "#",
    cta: "Explore Bibliography",
    background: <BiblioBackground />,
    className:
      "md:col-span-2 [&_svg]:text-[var(--biblio-text)] [&_h3]:text-[var(--text-primary)] [&_p]:text-[var(--text-secondary)]",
  },
  {
    Icon: FileEdit,
    name: "LaTeX editor built for you",
    description:
      "Live preview, real-time collaboration, seamless citation insertion.",
    href: "#",
    cta: "Try Editor",
    background: <ManuBackground />,
    className:
      "md:col-span-1 [&_svg]:text-[var(--manu-text)] [&_h3]:text-[var(--text-primary)] [&_p]:text-[var(--text-secondary)]",
  },
  // Row 2: Import (1 col) + Discover (2 cols)
  {
    Icon: Download,
    name: "One-click import",
    description: "Drag and drop PDFs or paste any URL. We handle the rest.",
    href: "#",
    cta: "Learn more",
    background: <BiblioBackground />,
    className:
      "md:col-span-1 [&_svg]:text-[var(--biblio-text)] [&_h3]:text-[var(--text-primary)] [&_p]:text-[var(--text-secondary)]",
  },
  {
    Icon: Search,
    name: "Find hidden connections",
    description:
      "Visual citation graphs reveal how papers connect. AI-powered recommendations surface research you'd miss.",
    href: "#",
    cta: "Discover papers",
    background: <DiscoverBackground />,
    className:
      "md:col-span-2 [&_svg]:text-[var(--discover-text)] [&_h3]:text-[var(--text-primary)] [&_p]:text-[var(--text-secondary)]",
  },
  // Row 3: Three equal cards
  {
    Icon: Users,
    name: "Real-time collaboration",
    description: "Work with your team, see changes as they happen.",
    href: "#",
    cta: "Learn more",
    background: <ManuBackground />,
    className:
      "md:col-span-1 [&_svg]:text-[var(--manu-text)] [&_h3]:text-[var(--text-primary)] [&_p]:text-[var(--text-secondary)]",
  },
  {
    Icon: Sparkles,
    name: "AI recommendations",
    description: "Surface relevant papers you might have missed.",
    href: "#",
    cta: "Learn more",
    background: <DiscoverBackground />,
    className:
      "md:col-span-1 [&_svg]:text-[var(--discover-text)] [&_h3]:text-[var(--text-primary)] [&_p]:text-[var(--text-secondary)]",
  },
  {
    Icon: Tag,
    name: "Smart tagging",
    description: "AI automatically categorizes and tags your papers.",
    href: "#",
    cta: "Learn more",
    background: <BiblioBackground />,
    className:
      "md:col-span-1 [&_svg]:text-[var(--biblio-text)] [&_h3]:text-[var(--text-primary)] [&_p]:text-[var(--text-secondary)]",
  },
];

export function BentoFeatures() {
  return (
    <section className="py-20 bg-[var(--bg-secondary)]">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <BlurFade inView>
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Everything you need.
              <br />
              Nothing you don't.
            </h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
              Three modules, one seamless experience. Built for researchers who
              spend their days reading, writing, and discovering.
            </p>
          </div>
        </BlurFade>

        {/* Magic UI Bento Grid */}
        <BlurFade delay={0.2} inView>
          <BentoGrid className="auto-rows-[16rem] md:grid-cols-3">
            {features.map((feature, idx) => (
              <BentoCard key={idx} {...feature} />
            ))}
          </BentoGrid>
        </BlurFade>
      </div>
    </section>
  );
}
