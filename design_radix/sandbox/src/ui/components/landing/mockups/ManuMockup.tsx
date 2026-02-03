/**
 * ManuMockup - Overleaf-style editor split view for landing page
 *
 * Story loop:
 * 1) typing (3s) - Single author writing LaTeX
 * 2) collab (3s) - Collaborator joins + remote cursor appears
 * 3) compile (2.5s) - Compile overlay, then PDF updates
 * 4) comment (3.5s) - Comment bubble anchored to a code line
 *
 * Renders inside a 16:10 frame (see landing layouts).
 */

import { useEffect, useMemo, useState } from "react";
import { FileText, PlayCircle, MessageSquare } from "lucide-react";
import { MockAppShell } from "./MockAppShell";

type EditorStep = "typing" | "collab" | "compile" | "comment";

const stepOrder: EditorStep[] = ["typing", "collab", "compile", "comment"];

const stepTimings: Record<EditorStep, number> = {
  typing: 3000,
  collab: 3000,
  compile: 2500,
  comment: 3500,
};

type Collaborator = {
  name: string;
  initial: string;
  colorVar: string;
};

const collaborators: { you: Collaborator; alex: Collaborator } = {
  you: { name: "Sarah Chen", initial: "S", colorVar: "--manu" },
  alex: { name: "Alex Rodriguez", initial: "A", colorVar: "--discover" },
};

type Line = { num: number; text: string };

const baseLines: Line[] = [
  { num: 1, text: "\\documentclass{article}" },
  { num: 2, text: "\\usepackage{amsmath}" },
  { num: 3, text: "\\usepackage{biblatex}" },
  { num: 4, text: "\\addbibresource{references.bib}" },
  { num: 5, text: "" },
  { num: 6, text: "\\title{Machine Learning for Climate Prediction}" },
  { num: 7, text: "\\author{Chen et al.}" },
  { num: 8, text: "" },
  { num: 9, text: "\\begin{document}" },
  { num: 10, text: "\\maketitle" },
  { num: 11, text: "" },
  { num: 12, text: "\\section{Introduction}" },
  { num: 13, text: "Climate prediction remains one of the most challenging" },
  { num: 14, text: "problems in environmental science \\cite{ipcc2023}." },
  { num: 15, text: "" },
  { num: 16, text: "\\end{document}" },
];

export function ManuMockup() {
  const [step, setStep] = useState<EditorStep>("typing");
  const [compilePhase, setCompilePhase] = useState<0 | 1>(0);
  const [commentPhase, setCommentPhase] = useState<0 | 1>(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextIndex = (stepOrder.indexOf(step) + 1) % stepOrder.length;
      const next = stepOrder[nextIndex];
      setStep(next);
      if (next === "compile") setCompilePhase(0);
      if (next === "comment") setCommentPhase(0);
    }, stepTimings[step]);
    return () => clearTimeout(timeout);
  }, [step]);

  useEffect(() => {
    if (step !== "compile") return;
    const t1 = setTimeout(() => setCompilePhase(1), 1200);
    return () => clearTimeout(t1);
  }, [step]);

  useEffect(() => {
    if (step !== "comment") return;
    const t1 = setTimeout(() => setCommentPhase(1), 700);
    return () => clearTimeout(t1);
  }, [step]);

  const visibleLines = useMemo(() => {
    if (step === "typing") return baseLines.slice(0, 14);
    if (step === "collab") return baseLines.slice(6, 16);
    if (step === "compile") return baseLines.slice(8, 16);
    return baseLines.slice(10, 16);
  }, [step]);

  return (
    <MockAppShell module="manuscripts">
      <TopBar
        step={step}
        compilePhase={compilePhase}
      />
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <EditorPane step={step} commentPhase={commentPhase} lines={visibleLines} />
        <SplitHandle />
        <PdfPane step={step} compilePhase={compilePhase} />
      </div>
    </MockAppShell>
  );
}

function TopBar({ step, compilePhase }: { step: EditorStep; compilePhase: 0 | 1 }) {
  const showAlex = step === "collab" || step === "compile" || step === "comment";
  const status =
    step === "compile" && compilePhase === 0
      ? { label: "Compiling…", Icon: PlayCircle, tone: "warning" as const }
      : { label: "Saved", Icon: PlayCircle, tone: "success" as const };

  return (
    <div
      className="h-11 flex items-center justify-between px-3"
      style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-default)" }}
    >
      {/* Active tab */}
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded-md min-w-0"
          style={{
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)",
          }}
        >
          <FileText className="size-3.5 shrink-0" />
          <span className="truncate">Main.tex</span>
        </div>
      </div>

      {/* Right-side controls */}
      <div className="flex items-center gap-2">
        {/* Collaborators */}
        <div className="flex items-center gap-1">
          <AvatarChip collaborator={collaborators.you} />
          {showAlex && (
            <div className="animate-popup-in">
              <AvatarChip collaborator={collaborators.alex} />
            </div>
          )}
        </div>

        {/* Status */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold"
          style={{
            background: status.tone === "warning" ? "var(--warning-tint)" : "var(--success-tint)",
            color: status.tone === "warning" ? "var(--warning-text)" : "var(--success-text)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <status.Icon className="size-3" />
          <span>{status.label}</span>
        </div>
      </div>
    </div>
  );
}

function AvatarChip({ collaborator }: { collaborator: Collaborator }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="size-4 rounded-full flex items-center justify-center text-[9px] font-bold"
        style={{
          background: `var(${collaborator.colorVar})`,
          color: "var(--text-on-accent)",
        }}
        aria-label={collaborator.name}
        title={collaborator.name}
      >
        {collaborator.initial}
      </div>
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

function EditorPane({
  step,
  commentPhase,
  lines,
}: {
  step: EditorStep;
  commentPhase: 0 | 1;
  lines: Line[];
}) {
  const showRemoteCursor = step === "collab" || step === "compile" || step === "comment";
  const showComment = step === "comment" && commentPhase === 1;

  const lineHeightPx = 16;
  const topPaddingPx = 12;
  const targetLineIndex = Math.min(5, Math.max(0, lines.length - 3));

  return (
    <div className="flex-[1.1] min-w-0 flex flex-col overflow-hidden">
      <div
        className="h-9 flex items-center justify-between px-3"
        style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-default)" }}
      >
        <div className="flex items-center gap-1.5">
          <button
            className="h-7 px-2.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5"
            style={{
              background: "var(--manu)",
              color: "var(--text-on-accent)",
            }}
          >
            <PlayCircle className="size-4" />
            Compile
          </button>
          <button
            className="h-7 px-2.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <MessageSquare className="size-4" />
            Comments
          </button>
        </div>
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          Auto-save
        </span>
      </div>

      <div
        className="flex-1 relative overflow-hidden"
        style={{ background: "var(--bg-primary)" }}
      >
        {/* Code */}
        <div
          className="h-full overflow-hidden px-3 py-3 font-mono"
          style={{ fontSize: "11px", lineHeight: `${lineHeightPx}px` }}
        >
          {lines.map((line, idx) => {
            const isCommentAnchor = showComment && idx === targetLineIndex;
            return (
              <div key={`${line.num}-${idx}`} className="flex">
                <span
                  className="w-7 pr-2 text-right select-none shrink-0 tabular-nums"
                  style={{ color: "var(--text-muted)" }}
                >
                  {line.num}
                </span>
                <span
                  className="min-w-0"
                  style={{
                    color: "var(--text-primary)",
                    background: isCommentAnchor ? "var(--manu-tint)" : undefined,
                    borderRadius: isCommentAnchor ? "4px" : undefined,
                    padding: isCommentAnchor ? "0 2px" : undefined,
                  }}
                >
                  {formatLatex(line.text)}
                  {step === "typing" && idx === lines.length - 1 && (
                    <span
                      className="inline-block w-0.5 h-3 ml-0.5 align-middle animate-cursor-blink"
                      style={{ background: "var(--manu)" }}
                    />
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Remote cursor */}
        {showRemoteCursor && (
          <div
            className="absolute animate-popup-in"
            style={{
              left: "160px",
              top: `${topPaddingPx + targetLineIndex * lineHeightPx}px`,
            }}
          >
            <div className="relative">
              <div
                className="w-0.5 h-4"
                style={{ background: `var(${collaborators.alex.colorVar})` }}
              />
              <div
                className="absolute -top-5 left-0 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap"
                style={{
                  background: `var(${collaborators.alex.colorVar})`,
                  color: "var(--text-on-accent)",
                }}
              >
                Alex
              </div>
            </div>
          </div>
        )}

        {/* Comment bubble anchored to a line */}
        {showComment && (
          <div
            className="absolute animate-popup-in"
            style={{
              left: "54px",
              top: `${topPaddingPx + targetLineIndex * lineHeightPx - 4}px`,
            }}
          >
            <div
              className="relative max-w-[210px] rounded-md px-2.5 py-2"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              <div
                className="absolute -left-1.5 top-3 size-3 rotate-45"
                style={{
                  background: "var(--bg-secondary)",
                  borderLeft: "1px solid var(--border-default)",
                  borderBottom: "1px solid var(--border-default)",
                }}
              />
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="size-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{
                    background: `var(${collaborators.alex.colorVar})`,
                    color: "var(--text-on-accent)",
                  }}
                >
                  {collaborators.alex.initial}
                </div>
                <span className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  Alex
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  on line {lines[targetLineIndex]?.num ?? 0}
                </span>
              </div>
              <p className="text-[11px] leading-snug" style={{ color: "var(--text-secondary)" }}>
                Could we cite the latest IPCC report here?
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PdfPane({ step, compilePhase }: { step: EditorStep; compilePhase: 0 | 1 }) {
  const showOverlay = step === "compile" && compilePhase === 0;
  const isCompiled = (step === "compile" && compilePhase === 1) || step === "comment";
  const showAuthors = step === "collab" || step === "compile" || step === "comment";

  return (
    <div className="flex-[0.9] min-w-0 flex flex-col overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
      <div
        className="h-9 flex items-center justify-between px-3"
        style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-default)" }}
      >
        <span className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>
          output.pdf
        </span>
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          {isCompiled ? "Last compiled just now" : "Not compiled yet"}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center p-3 relative overflow-hidden">
        <div
          className="w-full h-full rounded-md overflow-hidden"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <div
            className="px-3 py-2 text-center"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div className="text-[12px] font-bold" style={{ color: "var(--text-primary)" }}>
              Machine Learning for Climate Prediction
            </div>
            <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {showAuthors ? "Chen • Rodriguez" : "Chen"}
            </div>
          </div>
          <div className="p-3">
            <div
              className="h-1 w-10 rounded-full mb-2"
              style={{ background: "var(--border-default)" }}
            />
            <div className="text-[11px] font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              1. Introduction
            </div>
            <div className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Climate prediction remains one of the most challenging problems in environmental science…
            </div>
            {!isCompiled && (
              <div className="mt-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
                Compile to render PDF preview
              </div>
            )}
          </div>
        </div>

        {showOverlay && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "var(--overlay)" }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-md"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                boxShadow: "var(--shadow-medium)",
              }}
            >
              <div
                className="size-4 rounded-full border-2 animate-spin"
                style={{
                  borderColor: "var(--border-default)",
                  borderTopColor: "var(--manu)",
                }}
              />
              <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>
                Compiling…
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
    if (part.startsWith("\\")) return <span key={idx} style={{ color: "var(--manu-text)" }}>{part}</span>;
    if (part === "{" || part === "}") return <span key={idx} style={{ color: "var(--text-muted)" }}>{part}</span>;
    return <span key={idx}>{part}</span>;
  });
}
