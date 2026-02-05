/**
 * IntegrationMockup - Bibliography + Editor integration showcase for landing page
 *
 * Steps:
 * 1. editor (2s) - No sidebar, typing "The transformer architecture \cite{"
 * 2. sidebarOpen (1.5s) - Icon pulses → sidebar slides in → folder pops in with 🔗
 * 3. typingKey (2s) - Continue typing "vas" inside \cite{}
 * 4. autocomplete (2s) - Single-item dropdown: "vaswani2017attention"
 * 5. selection (1.5s) - Item selected → dropdown closes → full citation inserted
 * 6. compile (2s) - Spinner → PDF shows "[1]" → first dot turns green
 *
 * Total loop: 11 seconds
 */

import { useEffect, useState, useRef } from "react";
import { BookOpen, FileCode, FileText, FolderOpen, FolderClosed, Link2 } from "lucide-react";

type IntegrationStep =
  | "editor"
  | "sidebarOpen"
  | "typingKey"
  | "autocomplete"
  | "selection"
  | "compile";

const stepOrder: IntegrationStep[] = [
  "editor",
  "sidebarOpen",
  "typingKey",
  "autocomplete",
  "selection",
  "compile",
];

const stepTimings: Record<IntegrationStep, number> = {
  editor: 1500,      // typing \cite{
  sidebarOpen: 1500, // sidebar + folder + papers
  typingKey: 1200,   // typing "vas"
  autocomplete: 1200,// dropdown visible
  selection: 400,    // instant selection
  compile: 2000,     // compile animation
};

// Text sequences
const proseText = "The transformer architecture has revolutionized NLP"; // static
const citeText = "\\cite{"; // typed in step 1
const keyText = "vas"; // typed in step 3
const fullCitationKey = "vaswani2017attention";

// Papers for the sidebar
const sidebarPapers = [
  { id: "p1", title: "Attention Is All You Need", key: "vaswani2017attention" },
  { id: "p2", title: "BERT: Pre-training...", key: "devlin2019bert" },
  { id: "p3", title: "Language Models are...", key: "brown2020gpt3" },
];

export function IntegrationMockup() {
  const [step, setStep] = useState<IntegrationStep>("editor");
  const [typedInitialChars, setTypedInitialChars] = useState(0);
  const [typedKeyChars, setTypedKeyChars] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [folderVisible, setFolderVisible] = useState(false);
  const [papersVisible, setPapersVisible] = useState(false);
  const [iconPulsing, setIconPulsing] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [citationInserted, setCitationInserted] = useState(false);
  const [compilePhase, setCompilePhase] = useState<0 | 1 | 2>(0);
  const [citedPaperIndex, setCitedPaperIndex] = useState<number | null>(null);

  const initialTypingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const keyTypingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step progression
  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextIndex = (stepOrder.indexOf(step) + 1) % stepOrder.length;
      const next = stepOrder[nextIndex];
      setStep(next);

      // Reset states on loop restart
      if (next === "editor") {
        setTypedInitialChars(0);
        setTypedKeyChars(0);
        setSidebarVisible(false);
        setFolderVisible(false);
        setPapersVisible(false);
        setIconPulsing(false);
        setShowAutocomplete(false);
        setCitationInserted(false);
        setCompilePhase(0);
        setCitedPaperIndex(null);
      }
    }, stepTimings[step]);
    return () => clearTimeout(timeout);
  }, [step]);

  // Step 1: Editor - typing \cite{ only (prose is static)
  useEffect(() => {
    if (step !== "editor") {
      if (initialTypingRef.current) {
        clearInterval(initialTypingRef.current);
        initialTypingRef.current = null;
      }
      return;
    }

    setTypedInitialChars(0);
    const interval = setInterval(() => {
      setTypedInitialChars((prev) => {
        if (prev >= citeText.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 80);
    initialTypingRef.current = interval;

    return () => {
      clearInterval(interval);
      initialTypingRef.current = null;
    };
  }, [step]);

  // Step 2: sidebarOpen - icon pulse → sidebar slides in → folder pops in → papers appear
  useEffect(() => {
    if (step !== "sidebarOpen") {
      setIconPulsing(false);
      return;
    }

    // Start pulse immediately
    setIconPulsing(true);
    // After pulse, slide in sidebar
    const t1 = setTimeout(() => {
      setIconPulsing(false);
      setSidebarVisible(true);
    }, 400);
    // After sidebar slides in, pop in folder
    const t2 = setTimeout(() => {
      setFolderVisible(true);
    }, 750);
    // After folder pops in, show papers with dots
    const t3 = setTimeout(() => {
      setPapersVisible(true);
    }, 1050);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [step]);

  // Step 3: typingKey - continue typing "vas" inside \cite{}
  useEffect(() => {
    if (step !== "typingKey") {
      if (keyTypingRef.current) {
        clearInterval(keyTypingRef.current);
        keyTypingRef.current = null;
      }
      return;
    }

    setTypedKeyChars(0);
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        setTypedKeyChars((prev) => {
          if (prev >= keyText.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 150);
      keyTypingRef.current = interval;
    }, 400);

    return () => {
      clearTimeout(startDelay);
      if (keyTypingRef.current) {
        clearInterval(keyTypingRef.current);
        keyTypingRef.current = null;
      }
    };
  }, [step]);

  // Step 4: autocomplete - show dropdown
  useEffect(() => {
    if (step !== "autocomplete") return;
    const t = setTimeout(() => setShowAutocomplete(true), 300);
    return () => clearTimeout(t);
  }, [step]);

  // Step 5: selection - insert full citation immediately
  useEffect(() => {
    if (step !== "selection") return;
    setShowAutocomplete(false);
    setCitationInserted(true);
  }, [step]);

  // Step 6: compile - spinner, then PDF updates, dot turns green
  useEffect(() => {
    if (step !== "compile") return;
    setCompilePhase(0);
    const t1 = setTimeout(() => setCompilePhase(1), 800);
    const t2 = setTimeout(() => {
      setCompilePhase(2);
      setCitedPaperIndex(0);
    }, 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [step]);

  // Compute displayed text
  const displayedCiteText =
    step === "editor"
      ? citeText.slice(0, typedInitialChars)
      : citeText;

  const displayedKeyText =
    step === "typingKey"
      ? keyText.slice(0, typedKeyChars)
      : step === "autocomplete"
        ? keyText
        : citationInserted || step === "compile"
          ? fullCitationKey
          : "";

  const showCursor =
    step === "editor" ||
    step === "typingKey" ||
    (step === "sidebarOpen" && !sidebarVisible);

  return (
    <IntegrationAppShell
      sidebarVisible={sidebarVisible}
      folderVisible={folderVisible}
      papersVisible={papersVisible}
      iconPulsing={iconPulsing}
      citedPaperIndex={citedPaperIndex}
    >
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Editor pane */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <EditorTabs />
          <EditorContent
            displayedCiteText={displayedCiteText}
            displayedKeyText={displayedKeyText}
            showCursor={showCursor}
            showAutocomplete={showAutocomplete}
            citationInserted={citationInserted || step === "compile"}
          />
        </div>

        <SplitHandle />

        {/* PDF pane */}
        <PdfPane compilePhase={compilePhase} />
      </div>
    </IntegrationAppShell>
  );
}

// ============================================
// Integration App Shell (with animated sidebar)
// ============================================

interface IntegrationAppShellProps {
  sidebarVisible: boolean;
  folderVisible: boolean;
  papersVisible: boolean;
  iconPulsing: boolean;
  citedPaperIndex: number | null;
  children: React.ReactNode;
}

function IntegrationAppShell({
  sidebarVisible,
  folderVisible,
  papersVisible,
  iconPulsing,
  citedPaperIndex,
  children,
}: IntegrationAppShellProps) {
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
      <IntegrationActivityBar iconPulsing={iconPulsing} sidebarVisible={sidebarVisible} />

      {/* Sidebar (animated) */}
      {sidebarVisible && (
        <MockBiblioSidebar
          folderVisible={folderVisible}
          papersVisible={papersVisible}
          citedPaperIndex={citedPaperIndex}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// ============================================
// Activity Bar with pulse support
// ============================================

function IntegrationActivityBar({
  iconPulsing,
  sidebarVisible,
}: {
  iconPulsing: boolean;
  sidebarVisible: boolean;
}) {
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
          style={{ background: "var(--biblio)", color: "white" }}
        >
          C
        </div>
      </div>

      {/* Nav icons */}
      <div className="flex-1 flex flex-col items-center gap-0.5 py-2">
        {/* File browser icon - active until sidebar opens */}
        <div
          className="size-8 rounded flex items-center justify-center"
          style={{
            background: sidebarVisible ? "transparent" : "var(--selection)",
            color: sidebarVisible ? "var(--text-muted)" : "var(--biblio)",
          }}
        >
          <FolderClosed className="size-4" />
        </div>

        {/* Bibliography icon - pulses then becomes active */}
        <div
          className={`size-8 rounded flex items-center justify-center ${
            iconPulsing ? "animate-icon-pulse" : ""
          }`}
          style={{
            background: sidebarVisible ? "var(--selection)" : "transparent",
            color: sidebarVisible ? "var(--biblio)" : "var(--text-muted)",
          }}
        >
          <BookOpen className="size-4" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Mock Bibliography Sidebar
// ============================================

function MockBiblioSidebar({
  folderVisible,
  papersVisible,
  citedPaperIndex,
}: {
  folderVisible: boolean;
  papersVisible: boolean;
  citedPaperIndex: number | null;
}) {
  return (
    <div
      className="w-44 shrink-0 flex flex-col animate-sidebar-slide-in overflow-hidden"
      style={{
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-default)",
      }}
    >
      {/* Header */}
      <div
        className="h-11 flex items-center gap-2 px-3"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <BookOpen className="size-3.5" style={{ color: "var(--biblio)" }} />
        <span className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>
          References
        </span>
      </div>

      {/* Folder with linked indicator - pops in after sidebar */}
      <div className="p-2">
        {folderVisible && (
          <div
            className="flex items-center gap-2 px-2 py-1.5 rounded animate-folder-pop-in"
            style={{ background: "var(--bg-hover)" }}
          >
            <FolderOpen className="size-3" style={{ color: "var(--biblio)" }} />
            <span
              className="text-[10px] font-medium flex-1 truncate"
              style={{ color: "var(--text-primary)" }}
            >
              Transformers
            </span>
            <Link2 className="size-2.5" style={{ color: "var(--biblio)" }} />
          </div>
        )}
      </div>

      {/* PDF list with citation status dots - appears after folder */}
      <div className="flex-1 flex flex-col gap-0.5 px-2 py-1">
        {papersVisible &&
          sidebarPapers.map((paper, idx) => (
            <div
              key={paper.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded animate-paper-fade-in hover:bg-[var(--bg-hover)] transition-colors"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <FileText className="size-3 shrink-0" style={{ color: "var(--text-muted)" }} />
              <span
                className="text-[10px] flex-1 truncate"
                style={{ color: "var(--text-secondary)" }}
              >
                {paper.title}
              </span>
              {/* Citation status dot */}
              <span
                className={`size-1.5 rounded-full shrink-0 ${
                  citedPaperIndex === idx ? "animate-dot-to-green" : ""
                }`}
                style={{
                  background:
                    citedPaperIndex !== null && citedPaperIndex === idx
                      ? "var(--success)"
                      : "var(--error)",
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
}

// ============================================
// Editor Components
// ============================================

function EditorTabs() {
  return (
    <div
      className="h-11 flex items-center justify-between"
      style={{
        background: "var(--bg-tertiary)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        className="h-full flex items-center gap-2 px-4 relative"
        style={{ background: "var(--bg-primary)" }}
      >
        <FileCode className="size-3.5 shrink-0" style={{ color: "var(--manu)" }} />
        <span className="text-[12px] font-medium" style={{ color: "var(--manu)" }}>
          Main.tex
        </span>
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: "var(--manu)" }}
        />
      </div>

      {/* Collaborator avatar */}
      <div className="flex items-center gap-1.5 px-3">
        <div
          className="size-5 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: "var(--manu)", color: "var(--text-on-accent)" }}
        >
          Y
        </div>
      </div>
    </div>
  );
}

function EditorContent({
  displayedCiteText,
  displayedKeyText,
  showCursor,
  showAutocomplete,
  citationInserted,
}: {
  displayedCiteText: string;
  displayedKeyText: string;
  showCursor: boolean;
  showAutocomplete: boolean;
  citationInserted: boolean;
}) {
  const baseLatex = [
    "\\documentclass{article}",
    "\\begin{document}",
    "",
    "\\section{Introduction}",
  ];

  // Build the cite line content
  const citeLineContent = citationInserted
    ? `${citeText}${displayedKeyText}}`
    : `${displayedCiteText}${displayedKeyText}`;

  const lines = [
    { num: 1, text: baseLatex[0] },
    { num: 2, text: baseLatex[1] },
    { num: 3, text: baseLatex[2] },
    { num: 4, text: baseLatex[3] },
    { num: 5, text: proseText },
    { num: 6, text: citeLineContent, isCiteLine: true },
  ];

  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <div
        className="h-full overflow-hidden px-3 py-3 font-mono"
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
              {formatLatex(line.text)}
              {/* Cursor on cite line (line 6) */}
              {line.isCiteLine && showCursor && (
                <span
                  className="inline-block w-0.5 h-3.5 ml-0.5 align-middle animate-cursor-blink"
                  style={{ background: "var(--manu)" }}
                />
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Autocomplete dropdown - positioned below line 6, left-aligned to code */}
      {showAutocomplete && (
        <div
          className="absolute animate-autocomplete-in"
          style={{
            left: "32px",
            top: "145px",
          }}
        >
          <MockAutocomplete />
        </div>
      )}
    </div>
  );
}

function MockAutocomplete() {
  return (
    <div
      className="py-1 rounded-md min-w-[180px]"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-medium)",
      }}
    >
      <div
        className="px-2 py-1.5 mx-1 rounded flex items-center gap-2"
        style={{ background: "var(--biblio-tint)" }}
      >
        <FileText className="size-3" style={{ color: "var(--biblio)" }} />
        <span className="text-[10px] font-mono" style={{ color: "var(--text-primary)" }}>
          vaswani2017attention
        </span>
      </div>
    </div>
  );
}

function formatLatex(text: string) {
  if (!text) return null;
  const parts = text.split(/(\\[a-zA-Z]+|\{|\})/g);
  return parts.map((part, idx) => {
    if (part.startsWith("\\"))
      return (
        <span key={idx} style={{ color: "var(--manu-text)" }}>
          {part}
        </span>
      );
    if (part === "{" || part === "}")
      return (
        <span key={idx} style={{ color: "var(--text-muted)" }}>
          {part}
        </span>
      );
    return <span key={idx}>{part}</span>;
  });
}

// ============================================
// Split Handle (copied from ManuMockup)
// ============================================

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
          <span
            className="block w-0.5 h-0.5 rounded-full"
            style={{ background: "var(--text-muted)" }}
          />
          <span
            className="block w-0.5 h-0.5 rounded-full"
            style={{ background: "var(--text-muted)" }}
          />
          <span
            className="block w-0.5 h-0.5 rounded-full"
            style={{ background: "var(--text-muted)" }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// PDF Pane
// ============================================

function PdfPane({ compilePhase }: { compilePhase: 0 | 1 | 2 }) {
  const isCompiling = compilePhase === 1;
  const isCompiled = compilePhase === 2;

  return (
    <div
      className="flex-1 min-w-0 flex flex-col overflow-hidden"
      style={{ background: "var(--bg-tertiary)" }}
    >
      {/* PDF tabs */}
      <div
        className="h-11 flex items-center"
        style={{
          background: "var(--bg-tertiary)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div
          className="h-full flex items-center gap-2 px-4 relative"
          style={{ background: "var(--bg-primary)" }}
        >
          <FileText className="size-3.5 shrink-0" style={{ color: "var(--error)" }} />
          <span className="text-[12px] font-medium" style={{ color: "var(--manu)" }}>
            output.pdf
          </span>
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5"
            style={{ background: "var(--manu)" }}
          />
        </div>
      </div>

      {/* PDF preview */}
      <div className="flex-1 flex items-center justify-center p-3 relative overflow-hidden">
        <div
          className={`w-full h-full rounded-md overflow-hidden ${
            isCompiling ? "animate-pdf-compile-rotate" : ""
          }`}
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          {/* Paper title */}
          <div
            className="px-3 py-2 text-center"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div
              className="text-[11px] font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              My Research Paper
            </div>
            <div className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              Author Name
            </div>
          </div>

          {/* Paper content */}
          <div
            className="p-3 text-[10px] leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            <div className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              1. Introduction
            </div>
            <div className="mb-3">
              {isCompiled ? (
                <>
                  <span>The transformer architecture </span>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--biblio)" }}
                  >
                    [1]
                  </span>
                  <span> has revolutionized...</span>
                </>
              ) : (
                <span style={{ color: "var(--text-muted)" }}>...</span>
              )}
            </div>

            {/* References section */}
            {isCompiled && (
              <div className="mt-4 pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <div className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  References
                </div>
                <div className="text-[9px]" style={{ color: "var(--text-secondary)" }}>
                  <span style={{ color: "var(--biblio)" }}>[1]</span> Vaswani et al.
                  "Attention Is All You Need." NeurIPS, 2017.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compile overlay */}
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
                  borderTopColor: "var(--manu)",
                }}
              />
              <span
                className="text-[11px] font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Compiling...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
