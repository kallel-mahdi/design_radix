/**
 * MockSidebar - Reusable sidebar for landing page mockups
 *
 * Tree-structured collection list matching the real app.
 */

import type { ReactNode } from "react";
import { ChevronRight, BookOpen, FolderOpen, Plus } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  count?: number;
}

interface MockSidebarProps {
  title?: string;
  collections: Collection[];
  activeId?: string;
  accentVar?: string;
  tintVar?: string;
  children?: ReactNode;
}

export function MockSidebar({
  title = "Library",
  collections,
  activeId,
  accentVar = "--biblio",
  tintVar = "--biblio-tint",
}: MockSidebarProps) {
  return (
    <div
      className="w-44 shrink-0 flex flex-col"
      style={{
        background: "var(--bg-primary)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {/* Header */}
      <div
        className="h-11 flex items-center justify-between px-2.5"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          {title}
        </span>
        <Plus className="size-3.5" style={{ color: "var(--text-muted)" }} />
      </div>

      {/* Tree */}
      <div className="flex-1 py-1.5 px-1.5 overflow-hidden">
        {/* Root item */}
        <button
          className="flex items-center gap-1.5 px-2 py-1.5 w-full text-xs font-medium rounded"
          style={{
            color: `var(${accentVar})`,
            background: `var(${tintVar})`,
          }}
        >
          <ChevronRight className="size-3 rotate-90" />
          <BookOpen className="size-3.5" />
          <span className="truncate">My Library</span>
        </button>

        {/* Nested items */}
        <div
          className="ml-3 mt-1 space-y-0.5 border-l pl-2"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {collections.map((col) => (
            <div
              key={col.id}
              className="flex items-center gap-1.5 px-2 py-1 text-[11px] rounded"
              style={{
                color:
                  activeId === col.id
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                background:
                  activeId === col.id ? "var(--bg-hover)" : "transparent",
              }}
            >
              <FolderOpen className="size-3 shrink-0" />
              <span className="flex-1 truncate">{col.name}</span>
              {col.count !== undefined && (
                <span
                  className="text-[9px] tabular-nums"
                  style={{ color: "var(--text-muted)" }}
                >
                  {col.count}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
