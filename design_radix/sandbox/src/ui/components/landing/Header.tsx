import { Button } from "@/components/ui/button";

interface HeaderProps {
  onSignIn?: () => void;
  onStartFree?: () => void;
}

export function Header({ onSignIn, onStartFree }: HeaderProps) {
  const navLinks = ["Features", "Pricing", "Docs", "Blog"];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[var(--bg-primary)]/85 border-b border-[var(--border-subtle)]">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-md relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, var(--biblio), var(--manu))",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
                }}
              />
            </div>
            <span className="font-serif font-semibold text-xl tracking-tight text-[var(--text-primary)]">
              Citable
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors relative group"
              >
                {link}
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--biblio)] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onSignIn}>
              Sign in
            </Button>
            <Button
              onClick={onStartFree}
              className="bg-[var(--biblio)] hover:bg-[var(--biblio-hover)]"
            >
              Start free
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
