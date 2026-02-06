/**
 * ManuMockup - Overleaf-style editor split view for landing page
 *
 * Story loop (9s total):
 * 1) typing (2s) - User typing LaTeX prose with blinking cursor
 * 2) collab (3s) - Sarah joins and types in Methods section
 * 3) comment (2s) - Sarah leaves an inline comment
 * 4) compile (2s) - PDF compiles with rotation animation
 *
 * Static initial state: "typing" with full text visible (rich content).
 * Animation begins only when `isInView` is true.
 * Respects prefers-reduced-motion (shows static state only).
 */

import { useEffect, useState, useRef } from "react";
import { FileText, FileCode, Check } from "lucide-react";
import { MockAppShell } from "./MockAppShell";

type EditorStep = "typing" | "collab" | "comment" | "compile";

const stepOrder: EditorStep[] = ["typing", "collab", "comment", "compile"];

const stepTimings: Record<EditorStep, number> = {
  typing: 2000,
  collab: 3000,
  comment: 2000,
  compile: 2000,
};

type Collaborator = {
  name: string;
  initial: string;
  colorVar: string;
};

const collaborators = {
  you: { name: "You", initial: "Y", colorVar: "--biblio" },
  sarah: { name: "Sarah", initial: "S", colorVar: "--discover" },
};

const baseLatex = [
  "\\documentclass{article}",
  "\\begin{document}",
  "",
  "\\section{Introduction}",
];

const typingText = "The transformer architecture has revolutionized";
const sarahTypingText = "\\section{Methods}";

interface ManuMockupProps {
  isInView?: boolean;
}

export function ManuMockup({ isInView = true }: ManuMockupProps) {
  const reducedMotion = useRef(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ).current;
  const shouldAnimate = isInView && !reducedMotion;

  // Rich initial state: "typing" with full text visible
  const [step, setStep] = useState<EditorStep>("typing");
  const [compilePhase, setCompilePhase] = useState<0 | 1>(0);
  const [typedChars, setTypedChars] = useState(typingText.length);
  const [sarahTypedChars, setSarahTypedChars] = useState(0);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sarahTypingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const animating = useRef(false);

  // Step progression — paused until shouldAnimate
  useEffect(() => {
    if (!shouldAnimate) return;

    // First activation: advance from static "typing" to "collab"
    if (!animating.current) {
      animating.current = true;
      const t = setTimeout(() => setStep("collab"), 600);
      return () => clearTimeout(t);
    }

    const timeout = setTimeout(() => {
      const nextIndex = (stepOrder.indexOf(step) + 1) % stepOrder.length;
      const next = stepOrder[nextIndex];
      setStep(next);

      if (next === "typing") {
        setTypedChars(0);
        setSarahTypedChars(0);
      }
      if (next === "compile") setCompilePhase(0);
    }, stepTimings[step]);
    return () => clearTimeout(timeout);
  }, [step, shouldAnimate]);

  // Typing animation for user
  useEffect(() => {
    if (step !== "typing" && step !== "collab") {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      return;
    }

    if (!animating.current) return;

    if (step === "typing") setTypedChars(0);

    const interval = setInterval(() => {
      setTypedChars((prev) => {
        if (prev >= typingText.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 100);
    typingIntervalRef.current = interval;

    return () => {
      clearInterval(interval);
      typingIntervalRef.current = null;
    };
  }, [step]);

  // Sarah typing animation (collab step)
  useEffect(() => {
    if (step !== "collab") {
      if (sarahTypingIntervalRef.current) {
        clearInterval(sarahTypingIntervalRef.current);
        sarahTypingIntervalRef.current = null;
      }
      return;
    }

    if (!animating.current) return;

    setSarahTypedChars(0);
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        setSarahTypedChars((prev) => {
          if (prev >= sarahTypingText.length) {
            if (sarahTypingIntervalRef.current) clearInterval(sarahTypingIntervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 80);
      sarahTypingIntervalRef.current = interval;
    }, 500);

    return () => {
      clearTimeout(startDelay);
      if (sarahTypingIntervalRef.current) {
        clearInterval(sarahTypingIntervalRef.current);
        sarahTypingIntervalRef.current = null;
      }
    };
  }, [step]);

  // Compile phase transition
  useEffect(() => {
    if (!animating.current || step !== "compile") return;
    const t1 = setTimeout(() => setCompilePhase(1), 1000);
    return () => clearTimeout(t1);
  }, [step]);

  const showSarah = step === "collab" || step === "comment" || step === "compile";
  const isUserTyping = animating.current && (step === "typing" || step === "collab");
  const displayedTypingText = isUserTyping
    ? typingText.slice(0, typedChars)
    : typingText;
  const displayedSarahText = step === "collab"
    ? sarahTypingText.slice(0, sarahTypedChars)
    : (step === "comment" || step === "compile" ? sarahTypingText : "");

  return (
    <MockAppShell module="manuscripts">
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Editor pane */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <EditorTabs showSarah={showSarah} />

          <div
            className="flex-1 relative overflow-hidden"
            style={{ background: "var(--bg-primary)" }}
          >
            <EditorContent
              step={step}
              displayedTypingText={displayedTypingText}
              displayedSarahText={displayedSarahText}
              sarahTypedChars={sarahTypedChars}
              isAnimating={animating.current}
            />
          </div>
        </div>

        <SplitHandle />

        {/* PDF pane */}
        <PdfPane step={step} compilePhase={compilePhase} />
      </div>
    </MockAppShell>
  );
}

function EditorTabs({ showSarah }: { showSarah: boolean }) {
  return (
    <div
      className="h-11 flex items-center justify-between"
      style={{ background: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-subtle)" }}
    >
      <div
        className="h-full flex items-center gap-2 px-4 relative"
        style={{ background: "var(--bg-primary)" }}
      >
        <FileCode className="size-3.5 shrink-0" style={{ color: "var(--biblio)" }} />
        <span className="text-[12px] font-medium" style={{ color: "var(--biblio)" }}>
          Main.tex
        </span>
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: "var(--biblio)" }}
        />
      </div>

      <div className="flex items-center gap-1.5 px-3">
        <AvatarChip collaborator={collaborators.you} />
        {showSarah && (
          <div className="animate-popup-in">
            <AvatarChip collaborator={collaborators.sarah} />
          </div>
        )}
      </div>
    </div>
  );
}

function AvatarChip({ collaborator }: { collaborator: Collaborator }) {
  return (
    <div
      className="size-5 rounded-full flex items-center justify-center text-[10px] font-bold"
      style={{
        background: `var(${collaborator.colorVar})`,
        color: "var(--text-on-accent)",
      }}
      aria-label={collaborator.name}
      title={collaborator.name}
    >
      {collaborator.initial}
    </div>
  );
}

function EditorContent({
  step,
  displayedTypingText,
  displayedSarahText,
  sarahTypedChars,
  isAnimating,
}: {
  step: EditorStep;
  displayedTypingText: string;
  displayedSarahText: string;
  sarahTypedChars: number;
  isAnimating: boolean;
}) {
  const showUserCursor = isAnimating && (step === "typing" || step === "collab");
  const showSarahCursor = step === "collab";
  const showComment = step === "comment";
  const showHighlight = step === "comment";

  const lines = [
    { num: 1, text: baseLatex[0] },
    { num: 2, text: baseLatex[1] },
    { num: 3, text: baseLatex[2] },
    { num: 4, text: baseLatex[3] },
    { num: 5, text: displayedTypingText, isTypingLine: true, showHighlight },
    { num: 6, text: "" },
    { num: 7, text: displayedSarahText, isSarahLine: true },
  ];

  return (
    <div
      className="h-full overflow-hidden px-3 py-3 font-mono relative"
      style={{ fontSize: "11px", lineHeight: "18px" }}
    >
      {lines.map((line) => (
        <div key={line.num} className="flex relative">
          <span
            className="w-7 pr-2 text-right select-none shrink-0 tabular-nums"
            style={{ color: "var(--text-muted)" }}
          >
            {line.num}
          </span>

          <span className="min-w-0 relative">
            {line.showHighlight ? (
              <span
                className="px-0.5 rounded"
                style={{ background: "var(--biblio-tint)" }}
              >
                {formatLatex(line.text)}
              </span>
            ) : (
              formatLatex(line.text)
            )}

            {line.isTypingLine && showUserCursor && (
              <span
                className="inline-block w-0.5 h-3.5 ml-0.5 align-middle animate-cursor-blink"
                style={{ background: "var(--biblio)" }}
              />
            )}

            {line.isSarahLine && showSarahCursor && sarahTypedChars > 0 && (
              <span className="relative">
                <span
                  className="inline-block w-0.5 h-3.5 ml-0.5 align-middle"
                  style={{ background: `var(${collaborators.sarah.colorVar})` }}
                />
                <span
                  className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-semibold whitespace-nowrap"
                  style={{
                    background: `var(${collaborators.sarah.colorVar})`,
                    color: "var(--text-on-accent)",
                  }}
                >
                  Sarah
                </span>
              </span>
            )}

            {line.showHighlight && (
              <span className="ml-2 text-[10px]" style={{ color: "var(--biblio)" }}>
                💬
              </span>
            )}
          </span>
        </div>
      ))}

      {showComment && (
        <div
          className="absolute animate-popup-in"
          style={{
            left: "34px",
            top: "102px",
          }}
        >
          <InlineCommentCard />
        </div>
      )}
    </div>
  );
}

function InlineCommentCard() {
  return (
    <div
      className="max-w-[220px] rounded-lg px-3 py-2"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-medium)",
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="size-4 rounded-full flex items-center justify-center text-[8px] font-bold"
          style={{
            background: `var(${collaborators.sarah.colorVar})`,
            color: "var(--text-on-accent)",
          }}
        >
          {collaborators.sarah.initial}
        </div>
        <span className="text-[10px] font-semibold" style={{ color: "var(--text-primary)" }}>
          Sarah
        </span>
      </div>
      <p className="text-[10px] leading-snug mb-2" style={{ color: "var(--text-secondary)" }}>
        Consider rephrasing this for clarity
      </p>
      <button
        className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-medium"
        style={{
          background: "var(--bg-tertiary)",
          color: "var(--text-secondary)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <Check className="size-2.5" />
        Resolve
      </button>
    </div>
  );
}

function SplitHandle() {
  return (
    <div
      className="w-px relative shrink-0"
      style={{ background: "var(--border-default)" }}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-5 rounded-md flex items-center justify-center"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <div className="flex flex-col gap-0.5">
          <span className="block w-0.5 h-0.5 rounded-full" style={{ background: "var(--text-muted)" }} />
          <span className="block w-0.5 h-0.5 rounded-full" style={{ background: "var(--text-muted)" }} />
          <span className="block w-0.5 h-0.5 rounded-full" style={{ background: "var(--text-muted)" }} />
        </div>
      </div>
    </div>
  );
}

function PdfPane({ step, compilePhase }: { step: EditorStep; compilePhase: 0 | 1 }) {
  const isCompiling = step === "compile" && compilePhase === 0;
  const isCompiled = step === "compile" && compilePhase === 1;

  return (
    <div className="flex-1 min-w-0 flex flex-col overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
      <div
        className="h-11 flex items-center"
        style={{ background: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div
          className="h-full flex items-center gap-2 px-4 relative"
          style={{ background: "var(--bg-primary)" }}
        >
          <FileText className="size-3.5 shrink-0" style={{ color: "var(--error)" }} />
          <span className="text-[12px] font-medium" style={{ color: "var(--biblio)" }}>
            output.pdf
          </span>
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5"
            style={{ background: "var(--biblio)" }}
          />
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div
          className={`w-full h-full overflow-hidden ${isCompiling ? "animate-pdf-compile-rotate" : ""}`}
          style={{ background: "var(--bg-secondary)" }}
        >
          <div
            className="px-3 py-2 text-center"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div className="text-[11px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              My Research Paper
            </div>
            <div className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              Author Name
            </div>
          </div>

          <div className="p-3 text-[10px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <div className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              1. Introduction
            </div>
            <div className="mb-3">
              {isCompiled ? (
                <span style={{ background: "var(--biblio-tint)", padding: "0 2px", borderRadius: "2px" }}>
                  The transformer architecture has revolutionized...
                </span>
              ) : (
                <span style={{ color: "var(--text-muted)" }}>...</span>
              )}
            </div>

            {isCompiled && (
              <>
                <div className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  2. Methods
                </div>
                <div style={{ color: "var(--text-muted)" }}>...</div>
              </>
            )}
          </div>
        </div>

        {isCompiling && (
          <div
            className="absolute inset-0 flex items-center justify-center animate-compile-overlay-in"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                boxShadow: "var(--shadow-medium)",
              }}
            >
              <div
                className="size-4 rounded-full border-2 animate-compile-spinner"
                style={{
                  borderColor: "var(--border-default)",
                  borderTopColor: "var(--biblio)",
                }}
              />
              <span className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>
                Compiling...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatLatex(text: string) {
  if (!text) return null;
  const parts = text.split(/(\\[a-zA-Z]+|\{|\})/g);
  return parts.map((part, idx) => {
    if (part.startsWith("\\")) return <span key={idx} style={{ color: "var(--biblio-text)" }}>{part}</span>;
    if (part === "{" || part === "}") return <span key={idx} style={{ color: "var(--text-muted)" }}>{part}</span>;
    return <span key={idx}>{part}</span>;
  });
}
