import { Button } from "@/components/ui/button";
import logoWithText from "@/assets/logo-with-text.png";

interface HeaderProps {
  onSignIn?: () => void;
}

export function Header({ onSignIn }: HeaderProps) {
  return (
    <nav className="sticky top-0 z-50 bg-[var(--bg-secondary)]/80 backdrop-blur-md border-b border-[var(--border-default)]">
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
