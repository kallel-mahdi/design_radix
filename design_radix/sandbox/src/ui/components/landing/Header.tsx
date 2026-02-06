import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import logoWithText from "@/assets/logo-with-text.png";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onSignIn?: () => void;
}

export function Header({ onSignIn }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/70 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.08)]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-[1280px] mx-auto h-16 px-[var(--spacing-page-x)] flex items-center justify-between">
        <img src={logoWithText} alt="Citable" className="w-[10rem] h-[2.75rem]" />

        <Button
          onClick={onSignIn}
          className="bg-[var(--sand-12)] hover:bg-[var(--sand-11)] text-[var(--sand-1)]"
        >
          Sign in
        </Button>
      </div>
    </nav>
  );
}
