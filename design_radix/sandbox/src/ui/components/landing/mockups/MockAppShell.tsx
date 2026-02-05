/**
 * MockAppShell - Reusable app layout shell for landing page mockups
 *
 * Matches the real app's AppLayout structure:
 * - Activity Bar (narrow icon bar)
 * - Optional Sidebar
 * - Main content area
 *
 * Used by BiblioMockup, ManuMockup, DiscoverMockup
 */

import type { ReactNode } from "react";
import { BookOpen, FileEdit, Search, Compass } from "lucide-react";

type Module = "bibliography" | "manuscripts" | "discover";

interface MockAppShellProps {
  module: Module;
  sidebar?: ReactNode;
  children: ReactNode;
}

const moduleConfig = {
  bibliography: {
    icon: BookOpen,
    accentVar: "--manu",
    tintVar: "--manu-tint",
  },
  manuscripts: {
    icon: FileEdit,
    accentVar: "--biblio",
    tintVar: "--biblio-tint",
  },
  discover: {
    icon: Compass,
    accentVar: "--discover",
    tintVar: "--discover-tint",
  },
};

export function MockAppShell({ module, sidebar, children }: MockAppShellProps) {
  const config = moduleConfig[module];

  return (
    <div
      className="w-full h-full flex overflow-hidden rounded-lg border"
      style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border-default)",
        boxShadow: "var(--shadow-medium)",
      }}
    >
      {/* Activity Bar */}
      <MockActivityBar module={module} config={config} />

      {/* Sidebar */}
      {sidebar}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function MockActivityBar({
  module,
  config,
}: {
  module: Module;
  config: (typeof moduleConfig)[Module];
}) {
  const Icon = config.icon;

  return (
    <div
      className="w-14 shrink-0 flex flex-col"
      style={{
        background: "var(--bg-tertiary)",
        borderRight: "1px solid var(--border-default)",
      }}
    >
      {/* Logo */}
      <div
        className="h-11 flex items-center justify-center"
        style={{ borderBottom: "1px solid var(--border-default)" }}
      >
        <div
          className="size-6 rounded flex items-center justify-center text-[11px] font-bold"
          style={{ background: `var(${config.accentVar})`, color: "white" }}
        >
          C
        </div>
      </div>

      {/* Nav icons */}
      <div className="flex-1 flex flex-col items-center gap-0.5 py-2">
        {/* Active module */}
        <div
          className="size-8 rounded flex items-center justify-center"
          style={{
            background: `var(${config.tintVar})`,
            color: `var(${config.accentVar})`,
          }}
        >
          <Icon className="size-4" />
        </div>

        {/* Other modules (muted) */}
        {Object.entries(moduleConfig)
          .filter(([key]) => key !== module)
          .slice(0, 1)
          .map(([key, cfg]) => (
            <div
              key={key}
              className="size-8 rounded flex items-center justify-center"
              style={{ color: "var(--text-muted)" }}
            >
              <cfg.icon className="size-4" />
            </div>
          ))}

        <div
          className="size-8 rounded flex items-center justify-center"
          style={{ color: "var(--text-muted)" }}
        >
          <Search className="size-4" />
        </div>
      </div>
    </div>
  );
}
