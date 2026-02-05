/**
 * MockPdfViewer - PDF paper display for landing page mockups
 *
 * Shows a simplified academic paper with:
 * - Title and authors
 * - Abstract section
 * - Highlight animation support
 * - Inline comment input
 */

import { type ReactNode } from "react";

interface MockPdfViewerProps {
  title: string;
  authors: string;
  venue?: string;
  abstractText: string;
  /** Which line to highlight (0-indexed into abstract lines) */
  highlightLine?: number;
  /** Animation phase: 0=none, 1=sweeping, 2=complete */
  highlightPhase?: number;
  /** Show inline comment input below highlight */
  showCommentInput?: boolean;
  /** Text being typed in comment input */
  commentText?: string;
  /** Show cursor blinking in comment input */
  showTypingCursor?: boolean;
  children?: ReactNode;
}

export function MockPdfViewer({
  title,
  authors,
  venue,
  abstractText,
  highlightLine,
  highlightPhase = 0,
  showCommentInput = false,
  commentText = "",
  showTypingCursor = false,
}: MockPdfViewerProps) {
  const abstractLines = abstractText.split("\n").filter(Boolean);

  return (
    <div
      className="flex-1 flex items-center justify-center p-4"
      style={{ background: "var(--bg-tertiary)" }}
    >
      <div
        className="w-full max-w-[400px] h-full rounded shadow-md overflow-hidden flex flex-col"
        style={{ background: "var(--bg-secondary)" }}
      >
        {/* Paper header */}
        <div
          className="p-3 text-center"
          style={{ borderBottom: "1px solid var(--border-default)" }}
        >
          <h1
            className="text-[11px] font-bold leading-tight uppercase tracking-wide"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h1>
          <p className="text-[9px] mt-1" style={{ color: "var(--text-muted)" }}>
            {authors}{venue ? `, ${venue}` : ""}
          </p>
        </div>

        {/* Paper body */}
        <div className="flex-1 p-3 overflow-hidden">
          <p
            className="font-semibold text-[10px] mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Abstract
          </p>
          <div className="text-[9px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {abstractLines.map((line, idx) => {
              const isHighlightTarget = highlightLine === idx;
              const showHighlight = isHighlightTarget && highlightPhase > 0;

              return (
                <p key={idx} className="mb-1.5">
                  {isHighlightTarget ? (
                    <span
                      className={showHighlight ? "animate-text-highlight-yellow" : ""}
                      style={{
                        borderRadius: "2px",
                        padding: "1px 2px",
                        margin: "-1px -2px",
                        background: highlightPhase >= 2 ? "var(--amber-4)" : undefined,
                      }}
                    >
                      {line}
                    </span>
                  ) : (
                    line
                  )}
                </p>
              );
            })}
          </div>

          {/* Inline comment input */}
          {showCommentInput && (
            <div
              className="mt-2 p-2 rounded-md animate-popup-in"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border-default)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              <div className="flex items-start gap-2">
                <div
                  className="size-4 rounded-full shrink-0 mt-0.5"
                  style={{ background: "var(--amber-9)" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px]" style={{ color: "var(--text-primary)" }}>
                    {commentText}
                    {showTypingCursor && (
                      <span
                        className="inline-block w-px h-2.5 ml-0.5 animate-cursor-blink"
                        style={{ background: "var(--manu)" }}
                      />
                    )}
                  </p>
                </div>
                <button
                  className="size-5 rounded flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--manu)",
                    color: "var(--text-on-accent)",
                  }}
                >
                  <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
