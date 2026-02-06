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
import { Safari } from "@/components/ui/safari";
import { BiblioMockup } from "./mockups/BiblioMockup";
import { ManuMockup } from "./mockups/ManuMockup";

// Placeholder gradient images for each module
const mockupPlaceholders = {
  bibliography: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f0f4f8'/%3E%3Cstop offset='100%25' style='stop-color:%23e1e8f0'/%3E%3C/linearGradient%3E%3ClinearGradient id='accent' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234b7bb5'/%3E%3Cstop offset='100%25' style='stop-color:%235d8ac7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23bg)' width='1200' height='700'/%3E%3Crect x='20' y='20' width='240' height='660' rx='8' fill='%23fff' opacity='0.9'/%3E%3Crect x='40' y='60' width='200' height='12' rx='2' fill='url(%23accent)' opacity='0.3'/%3E%3Crect x='40' y='90' width='160' height='8' rx='2' fill='%23ccd6e0'/%3E%3Crect x='40' y='120' width='200' height='40' rx='4' fill='%23fff' stroke='%23e1e8f0'/%3E%3Crect x='40' y='180' width='200' height='40' rx='4' fill='url(%23accent)' opacity='0.1'/%3E%3Crect x='40' y='240' width='200' height='40' rx='4' fill='%23fff' stroke='%23e1e8f0'/%3E%3Crect x='280' y='20' width='900' height='660' rx='8' fill='%23fff' opacity='0.95'/%3E%3Crect x='300' y='60' width='600' height='24' rx='4' fill='%23e1e8f0'/%3E%3Crect x='300' y='100' width='400' height='16' rx='2' fill='%23f0f4f8'/%3E%3Crect x='300' y='140' width='860' height='520' rx='4' fill='%23fafbfc' stroke='%23e1e8f0'/%3E%3Ctext x='600' y='400' font-family='system-ui' font-size='18' fill='%23a0aec0' text-anchor='middle'%3EBibliography Interface%3C/text%3E%3C/svg%3E",
  manuscripts: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f0f7f4'/%3E%3Cstop offset='100%25' style='stop-color:%23e1f0ea'/%3E%3C/linearGradient%3E%3ClinearGradient id='accent' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2329a383'/%3E%3Cstop offset='100%25' style='stop-color:%2338b595'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23bg)' width='1200' height='700'/%3E%3Crect x='20' y='20' width='580' height='660' rx='8' fill='%231e1e1e'/%3E%3Crect x='40' y='60' width='540' height='20' rx='2' fill='%232d2d2d'/%3E%3Ctext x='60' y='120' font-family='monospace' font-size='14' fill='%23608b4e'%3E%5Cdocumentclass%7Barticle%7D%3C/text%3E%3Ctext x='60' y='145' font-family='monospace' font-size='14' fill='%23dcdcaa'%3E%5Cusepackage%7Bamsmath%7D%3C/text%3E%3Ctext x='60' y='170' font-family='monospace' font-size='14' fill='%23569cd6'%3E%5Cbegin%7Bdocument%7D%3C/text%3E%3Ctext x='60' y='220' font-family='monospace' font-size='14' fill='%23ce9178'%3E%5Ctitle%7BResearch Paper%7D%3C/text%3E%3Crect x='620' y='20' width='560' height='660' rx='8' fill='%23fff' opacity='0.98'/%3E%3Crect x='640' y='60' width='520' height='600' rx='4' fill='%23fafbfc'/%3E%3Ctext x='900' y='350' font-family='Georgia,serif' font-size='24' fill='%23333' text-anchor='middle'%3ELive Preview%3C/text%3E%3Ctext x='900' y='380' font-family='Georgia,serif' font-size='14' fill='%2366758a' text-anchor='middle'%3EYour document renders here%3C/text%3E%3C/svg%3E",
  discover: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f4f0f8'/%3E%3Cstop offset='100%25' style='stop-color:%23ebe1f0'/%3E%3C/linearGradient%3E%3ClinearGradient id='accent' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%238b5fb5'/%3E%3Cstop offset='100%25' style='stop-color:%239b6fc7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23bg)' width='1200' height='700'/%3E%3Ccircle cx='600' cy='350' r='120' fill='url(%23accent)' opacity='0.15'/%3E%3Ccircle cx='600' cy='350' r='80' fill='url(%23accent)' opacity='0.25'/%3E%3Ccircle cx='600' cy='350' r='40' fill='url(%23accent)' opacity='0.9'/%3E%3Ccircle cx='380' cy='280' r='30' fill='%23fff' stroke='url(%23accent)' stroke-width='2'/%3E%3Cline x1='410' y1='300' x2='560' y2='340' stroke='url(%23accent)' stroke-width='2' opacity='0.4'/%3E%3Ccircle cx='820' cy='280' r='30' fill='%23fff' stroke='url(%23accent)' stroke-width='2'/%3E%3Cline x1='790' y1='300' x2='640' y2='340' stroke='url(%23accent)' stroke-width='2' opacity='0.4'/%3E%3Ccircle cx='450' cy='480' r='25' fill='%23fff' stroke='url(%23accent)' stroke-width='2'/%3E%3Cline x1='470' y1='460' x2='570' y2='390' stroke='url(%23accent)' stroke-width='2' opacity='0.4'/%3E%3Ccircle cx='750' cy='480' r='25' fill='%23fff' stroke='url(%23accent)' stroke-width='2'/%3E%3Cline x1='730' y1='460' x2='630' y2='390' stroke='url(%23accent)' stroke-width='2' opacity='0.4'/%3E%3Ctext x='600' y='355' font-family='system-ui' font-size='14' fill='%23fff' text-anchor='middle'%3EYour Paper%3C/text%3E%3Ctext x='600' y='550' font-family='system-ui' font-size='16' fill='%236b5b7a' text-anchor='middle'%3ECitation Graph%3C/text%3E%3C/svg%3E",
};

// Background components with live mockups for hero cards
function BiblioMockupBackground() {
  return (
    <div className="absolute inset-0 flex items-start justify-center pt-4 px-4 overflow-hidden">
      <div className="w-full max-w-[90%] aspect-[16/10] opacity-90 transition-transform duration-500 group-hover:scale-105">
        <BiblioMockup />
      </div>
    </div>
  );
}

function ManuMockupBackground() {
  return (
    <div className="absolute inset-0 flex items-start justify-center pt-4 px-4 overflow-hidden">
      <div className="w-full max-w-[90%] aspect-[16/10] opacity-90 transition-transform duration-500 group-hover:scale-105">
        <ManuMockup />
      </div>
    </div>
  );
}

function DiscoverMockupBackground() {
  return (
    <div className="absolute inset-0 flex items-start justify-center pt-4 px-4 overflow-hidden">
      <Safari
        url="citable.app/discover"
        imageSrc={mockupPlaceholders.discover}
        mode="simple"
        className="w-full max-w-[90%] opacity-90 transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  );
}

// Simple gradient backgrounds for supporting cards
function BiblioBackground() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[var(--manu-tint)] to-transparent opacity-50" />
  );
}

function ManuBackground() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[var(--biblio-tint)] to-transparent opacity-50" />
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
    background: <BiblioMockupBackground />,
    className:
      "md:col-span-2 md:row-span-2 [&_svg]:text-[var(--manu-text)] [&_h3]:text-[var(--text-primary)] [&_p]:text-[var(--text-secondary)]",
  },
  {
    Icon: FileEdit,
    name: "LaTeX editor built for you",
    description:
      "Live preview, real-time collaboration, seamless citation insertion.",
    href: "#",
    cta: "Try Editor",
    background: <ManuMockupBackground />,
    className:
      "md:col-span-1 md:row-span-2 [&_svg]:text-[var(--biblio-text)] [&_h3]:text-[var(--text-primary)] [&_p]:text-[var(--text-secondary)]",
  },
  // Row 3: Three supporting cards
  {
    Icon: Download,
    name: "One-click import",
    description: "Drag and drop PDFs or paste any URL. We handle the rest.",
    href: "#",
    cta: "Learn more",
    background: <BiblioBackground />,
    className:
      "md:col-span-1 [&_svg]:text-[var(--manu-text)] [&_h3]:text-[var(--text-primary)] [&_p]:text-[var(--text-secondary)]",
  },
  {
    Icon: Search,
    name: "Find hidden connections",
    description:
      "Visual citation graphs reveal how papers connect. AI surfaces research you'd miss.",
    href: "#",
    cta: "Discover papers",
    background: <DiscoverMockupBackground />,
    className:
      "md:col-span-2 md:row-span-2 [&_svg]:text-[var(--discover-text)] [&_h3]:text-[var(--text-primary)] [&_p]:text-[var(--text-secondary)]",
  },
  {
    Icon: Users,
    name: "Real-time collaboration",
    description: "Work with your team, see changes as they happen.",
    href: "#",
    cta: "Learn more",
    background: <ManuBackground />,
    className:
      "md:col-span-1 [&_svg]:text-[var(--biblio-text)] [&_h3]:text-[var(--text-primary)] [&_p]:text-[var(--text-secondary)]",
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
      "md:col-span-1 [&_svg]:text-[var(--manu-text)] [&_h3]:text-[var(--text-primary)] [&_p]:text-[var(--text-secondary)]",
  },
];

export function BentoFeatures() {
  return (
    <section className="py-20 bg-[var(--bg-secondary)]">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <BlurFade inView>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
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
          <BentoGrid className="auto-rows-[18rem] md:grid-cols-3">
            {features.map((feature, idx) => (
              <BentoCard key={idx} {...feature} />
            ))}
          </BentoGrid>
        </BlurFade>
      </div>
    </section>
  );
}
