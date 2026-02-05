/**
 * MockReferenceTable - Reference table for landing page mockups
 *
 * Shows a bibliography table with:
 * - Checkbox, Title, Authors, Year, Tags columns
 * - Cascading tag appearance animation
 * - Row selection highlight
 */

import { MoreHorizontal } from "lucide-react";

export interface MockPaper {
  id: string;
  title: string;
  authors: string;
  year: string;
  tag?: string;
  tagTone?: "cyan" | "violet" | "emerald" | "amber";
}

interface MockReferenceTableProps {
  papers: MockPaper[];
  /** How many tags to show (for cascading animation) */
  visibleTagCount: number;
  /** Which row is selected (0-indexed) */
  selectedRow?: number;
}

const tagVars: Record<string, { bg: string; text: string }> = {
  cyan: { bg: "var(--tag-cyan-bg)", text: "var(--tag-cyan-text)" },
  violet: { bg: "var(--tag-violet-bg)", text: "var(--tag-violet-text)" },
  emerald: { bg: "var(--tag-emerald-bg)", text: "var(--tag-emerald-text)" },
  amber: { bg: "var(--tag-amber-bg)", text: "var(--tag-amber-text)" },
};

export function MockReferenceTable({
  papers,
  visibleTagCount,
  selectedRow,
}: MockReferenceTableProps) {
  return (
    <div
      className="flex-1 overflow-hidden rounded-md flex flex-col"
      style={{
        background: "var(--bg-secondary)",
        boxShadow: "var(--shadow-soft)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-[11px]">
          <thead
            className="sticky top-0 z-10"
            style={{ background: "var(--bg-hover)" }}
          >
            <tr
              className="h-8 text-left uppercase tracking-wider"
              style={{
                fontSize: "9px",
                color: "var(--text-muted)",
                borderBottom: "1px solid var(--border-default)",
              }}
            >
              <th className="w-7 px-2"></th>
              <th className="px-2 font-medium">Title</th>
              <th className="px-2 font-medium w-[22%]">Authors</th>
              <th className="px-2 font-medium w-[10%]">Year</th>
              <th className="px-2 font-medium w-[16%]">Tags</th>
              <th className="w-7 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {papers.map((paper, i) => {
              const isSelected = selectedRow === i;
              const showTag = visibleTagCount > i && paper.tag;
              const vars = paper.tagTone ? tagVars[paper.tagTone] : tagVars.cyan;

              return (
                <tr
                  key={paper.id}
                  className="h-8 animate-fade-in-row"
                  style={{
                    borderBottom: "1px solid var(--border-default)",
                    animationDelay: `${i * 0.08}s`,
                    background: isSelected ? "var(--selection)" : "transparent",
                  }}
                >
                  <td className="px-2">
                    <div
                      className="size-3.5 rounded-sm flex items-center justify-center"
                      style={{
                        border: isSelected
                          ? "1px solid var(--manu)"
                          : "1px solid var(--border-default)",
                        background: isSelected ? "var(--manu)" : "transparent",
                      }}
                    >
                      {isSelected && (
                        <svg
                          className="size-2.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--text-on-accent)"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="px-2">
                    <span
                      className="font-medium line-clamp-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {paper.title}
                    </span>
                  </td>
                  <td
                    className="px-2 line-clamp-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {paper.authors}
                  </td>
                  <td
                    className="px-2 tabular-nums"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {paper.year}
                  </td>
                  <td className="px-2">
                    {showTag ? (
                      <span
                        className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded animate-tag-appear"
                        style={{
                          background: vars.bg,
                          color: vars.text,
                          animationDelay: "0.12s",
                        }}
                      >
                        {paper.tag}
                      </span>
                    ) : paper.tag ? (
                      <span
                        className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded"
                        style={{
                          background: "var(--bg-tertiary)",
                          border: "1px dashed var(--border-default)",
                          color: "var(--text-muted)",
                        }}
                      >
                        Adding...
                      </span>
                    ) : null}
                  </td>
                  <td className="px-2">
                    <MoreHorizontal
                      className="size-3.5"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom status bar */}
      <div
        className="h-7 px-3 flex items-center justify-between shrink-0"
        style={{
          borderTop: "1px solid var(--border-default)",
          background: "var(--bg-secondary)",
        }}
      >
        <span
          className="text-[10px] font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          {papers.length} items
        </span>
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          Tags: {Math.min(visibleTagCount, papers.filter(p => p.tag).length)}/{papers.filter(p => p.tag).length}
        </span>
      </div>
    </div>
  );
}
