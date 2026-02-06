export function Footer() {
  const links = ["Features", "Pricing", "Docs", "Blog", "Privacy", "Terms"];

  return (
    <footer className="py-10 border-t border-[var(--border-subtle)]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md"
              style={{
                background: "linear-gradient(135deg, var(--biblio), var(--manu))",
              }}
            />
            <span className="font-bold text-[var(--text-primary)]">
              Citable
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {links.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-sm text-[var(--text-muted)]">
            © 2026 Citable. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
