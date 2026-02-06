import { useState } from "react";
import {
  Header,
  HeroSection,
  AlternatingFeatures,
  CTASection,
  Footer,
} from "../components/landing";
import { cn } from "@/lib/utils";
import type { BlobTransition } from "../components/landing/HeroSection";

const BLOB_OPTIONS: { key: BlobTransition; label: string }[] = [
  { key: "mask-fade", label: "Mask Fade" },
  { key: "blob-overflow", label: "Blob Overflow" },
];

interface LandingPageProps {
  onNavigate?: (screen: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [blobTransition, setBlobTransition] =
    useState<BlobTransition>("mask-fade");

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header />

      <main>
        <div
          className={cn(
            "relative bg-white",
            blobTransition === "blob-overflow"
              ? "overflow-x-hidden"
              : "overflow-hidden"
          )}
        >
          <HeroSection blobTransition={blobTransition} />

          <AlternatingFeatures />

          <CTASection />
        </div>
      </main>

      <Footer />

      {/* Blob Transition Toggle */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 p-4 bg-white/80 backdrop-blur-md rounded-xl border border-gray-200 shadow-xl max-w-[280px]">
        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
          Blob transition
        </span>
        <div className="flex flex-wrap gap-1.5">
          {BLOB_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setBlobTransition(key)}
              className={cn(
                "px-2.5 py-1.5 text-xs rounded-md transition-all font-medium border",
                blobTransition === key
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
