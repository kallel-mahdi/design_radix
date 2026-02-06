/**
 * MockCommentsPanel - Comments side panel for landing page mockups
 *
 * Slides in from right with comment cards.
 * Used in BiblioMockup step 6.
 */

export interface MockComment {
  id: string;
  highlightText: string;
  noteText: string;
  color?: "yellow" | "blue" | "green";
}

interface MockCommentsPanelProps {
  comments: MockComment[];
  /** Controls slide-in animation */
  visible: boolean;
}

const colorVars: Record<string, string> = {
  yellow: "var(--amber-9)",
  blue: "var(--biblio)",
  green: "var(--manu)",
};

export function MockCommentsPanel({ comments, visible }: MockCommentsPanelProps) {
  return (
    <div
      className="w-[160px] shrink-0 flex flex-col overflow-hidden"
      style={{
        borderLeft: "1px solid var(--border-default)",
        background: "var(--bg-secondary)",
      }}
    >
      {/* Header */}
      <div
        className="h-8 flex items-center justify-between px-3 text-[9px] font-medium uppercase tracking-wide shrink-0"
        style={{
          borderBottom: "1px solid var(--border-default)",
          color: "var(--text-muted)",
        }}
      >
        Comments
        {comments.length > 0 && (
          <span
            className="px-1.5 py-0.5 rounded text-[8px]"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
            }}
          >
            {comments.length}
          </span>
        )}
      </div>

      {/* Comments list */}
      <div className="flex-1 p-2 overflow-hidden">
        {comments.map((comment, idx) => (
          <div
            key={comment.id}
            className="p-2 rounded text-[9px] leading-relaxed mb-2 animate-note-slide-in"
            style={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-default)",
              borderLeft: `3px solid ${colorVars[comment.color || "yellow"]}`,
              animationDelay: `${idx * 0.1}s`,
            }}
          >
            <p
              className="font-medium mb-1 line-clamp-1"
              style={{ color: "var(--text-primary)" }}
            >
              {comment.noteText}
            </p>
            <p
              className="italic line-clamp-2"
              style={{ color: "var(--text-secondary)" }}
            >
              "{comment.highlightText}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
