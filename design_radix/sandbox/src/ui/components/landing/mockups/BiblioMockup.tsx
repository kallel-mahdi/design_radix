/**
 * BiblioMockup - 6-step animated bibliography showcase for landing page
 *
 * Steps:
 * 1. upload (2s) - PDFs dropping, NO chrome
 * 2. tagging (1.5s) - Table with cascading tags
 * 3. click (0.8s) - Row selection + new tab appearing
 * 4. reader (1s) - Clean PDF view with two tabs
 * 5. highlight (1.3s) - Yellow highlight sweep animation
 * 6. comment (2.8s) - Inline comment input → side panel appears
 *
 * Total loop: 9.4 seconds
 *
 * Static initial state: "tagging" with all tags visible (rich content).
 * Animation begins only when `isInView` is true.
 * Respects prefers-reduced-motion (shows static state only).
 */

import { useState, useEffect, useRef } from "react";
import { FileText, ChevronRight } from "lucide-react";
import { MockAppShell } from "./MockAppShell";
import { MockFileTabs, type MockTab } from "./MockFileTabs";
import { MockReferenceTable, type MockPaper } from "./MockReferenceTable";
import { MockPdfViewer } from "./MockPdfViewer";
import { MockCommentsPanel, type MockComment } from "./MockCommentsPanel";

type BiblioStep = "upload" | "tagging" | "click" | "reader" | "highlight" | "comment";

const stepTimings: Record<BiblioStep, number> = {
  upload: 2000,
  tagging: 1500,
  click: 800,
  reader: 1000,
  highlight: 1300,
  comment: 2800,
};

const stepOrder: BiblioStep[] = ["upload", "tagging", "click", "reader", "highlight", "comment"];

const papers: MockPaper[] = [
  { id: "p1", title: "Attention Is All You Need", authors: "Vaswani et al.", year: "2017", tag: "Transformers", tagTone: "violet" },
  { id: "p2", title: "BERT: Pre-training of Deep...", authors: "Devlin et al.", year: "2019", tag: "NLP", tagTone: "cyan" },
  { id: "p3", title: "Language Models are Few-Shot...", authors: "Brown et al.", year: "2020", tag: "Scaling", tagTone: "emerald" },
  { id: "p4", title: "Deep Residual Learning", authors: "He et al.", year: "2016", tag: "Vision", tagTone: "amber" },
];

const abstractText = `The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder.
We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.
Experiments on two machine translation tasks show these models achieve superior quality while being more parallelizable.`;

interface BiblioMockupProps {
  isInView?: boolean;
}

export function BiblioMockup({ isInView = true }: BiblioMockupProps) {
  const reducedMotion = useRef(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ).current;
  const shouldAnimate = isInView && !reducedMotion;

  // Rich initial state: "tagging" with all tags visible
  const [step, setStep] = useState<BiblioStep>("tagging");
  const [tagCount, setTagCount] = useState(papers.length);
  const [selectedRow, setSelectedRow] = useState<number | undefined>(undefined);
  const [showNewTab, setShowNewTab] = useState(false);
  const [highlightPhase, setHighlightPhase] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);

  const animating = useRef(false);

  // Step progression — paused until shouldAnimate
  useEffect(() => {
    if (!shouldAnimate) return;

    // First activation: skip the static tagging step, advance to click
    if (!animating.current) {
      animating.current = true;
      const t = setTimeout(() => setStep("click"), 600);
      return () => clearTimeout(t);
    }

    const timeout = setTimeout(() => {
      const nextIndex = (stepOrder.indexOf(step) + 1) % stepOrder.length;
      const nextStep = stepOrder[nextIndex];
      setStep(nextStep);

      if (nextStep === "upload") {
        setTagCount(0);
        setSelectedRow(undefined);
        setShowNewTab(false);
        setHighlightPhase(0);
        setCommentText("");
        setShowCommentInput(false);
        setShowCommentsPanel(false);
      }
    }, stepTimings[step]);
    return () => clearTimeout(timeout);
  }, [step, shouldAnimate]);

  // Tagging: cascade tags one by one
  useEffect(() => {
    if (!animating.current || step !== "tagging") return;
    // Skip cascade if all tags already visible (initial static state)
    if (tagCount >= papers.length) return;
    setTagCount(0);
    const timers = papers.map((_, idx) =>
      setTimeout(() => setTagCount(c => Math.max(c, idx + 1)), 200 + idx * 280)
    );
    return () => timers.forEach(t => clearTimeout(t));
  }, [step]);

  // Click: select row, then show new tab
  useEffect(() => {
    if (!animating.current || step !== "click") return;
    setSelectedRow(0);
    const t = setTimeout(() => setShowNewTab(true), 350);
    return () => clearTimeout(t);
  }, [step]);

  // Reader: keep tab visible
  useEffect(() => {
    if (step === "reader") setShowNewTab(true);
  }, [step]);

  // Highlight: sweep animation
  useEffect(() => {
    if (!animating.current || step !== "highlight") return;
    setHighlightPhase(0);
    const t1 = setTimeout(() => setHighlightPhase(1), 150);
    const t2 = setTimeout(() => setHighlightPhase(2), 850);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [step]);

  // Comment: typing animation → panel slide-in
  useEffect(() => {
    if (!animating.current || step !== "comment") return;
    setShowCommentInput(true);
    setCommentText("");
    setShowCommentsPanel(false);

    const fullText = "Key insight - transformers replace RNNs";
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex < fullText.length) {
        setCommentText(fullText.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 30);

    const t1 = setTimeout(() => {
      setShowCommentInput(false);
      setShowCommentsPanel(true);
    }, 1600);

    return () => { clearInterval(typeInterval); clearTimeout(t1); };
  }, [step]);

  // Step 1: Upload - App shell with empty drop zone, PDFs dropping
  if (step === "upload") {
    const uploadTabs: MockTab[] = [{ id: "bib", name: "reference.bib", icon: FileText }];
    return (
      <MockAppShell module="bibliography">
        <MockFileTabs tabs={uploadTabs} activeId="bib" accentVar="--manu" />
        <div className="flex-1 overflow-hidden p-3" style={{ background: "var(--bg-primary)" }}>
          <UploadAnimation />
        </div>
      </MockAppShell>
    );
  }

  // Build tabs based on step
  const tabs: MockTab[] = [
    { id: "bib", name: "reference.bib", icon: FileText },
  ];
  if (showNewTab || step === "reader" || step === "highlight" || step === "comment") {
    tabs.push({
      id: "pdf",
      name: "Attention Is All You Need.pdf",
      icon: FileText,
      isNew: step === "click" && showNewTab,
    });
  }
  const activeTabId = (step === "reader" || step === "highlight" || step === "comment") ? "pdf" : "bib";

  // Steps 2-3: Table view
  if (step === "tagging" || step === "click") {
    return (
      <MockAppShell module="bibliography">
        <MockFileTabs tabs={tabs} activeId={activeTabId} accentVar="--manu" />
        <div className="flex-1 overflow-hidden p-3" style={{ background: "var(--bg-primary)" }}>
          <MockReferenceTable
            papers={papers}
            visibleTagCount={tagCount}
            selectedRow={step === "click" ? selectedRow : undefined}
          />
        </div>
      </MockAppShell>
    );
  }

  // Steps 4-6: PDF view
  const comments: MockComment[] = showCommentsPanel
    ? [{ id: "c1", highlightText: "based solely on attention mechanisms", noteText: "Key insight - transformers replace RNNs", color: "yellow" }]
    : [];

  return (
    <MockAppShell module="bibliography" sidebar={<MockOutlinePanel />}>
      <MockFileTabs tabs={tabs} activeId="pdf" accentVar="--manu" />
      <div className="flex-1 flex overflow-hidden relative">
        <MockPdfViewer
          title="ATTENTION IS ALL YOU NEED"
          authors="Vaswani et al."
          venue="NeurIPS 2017"
          abstractText={abstractText}
          highlightLine={step === "highlight" || step === "comment" ? 1 : undefined}
          highlightPhase={highlightPhase}
          showCommentInput={showCommentInput}
          commentText={commentText}
          showTypingCursor={showCommentInput && commentText.length < 39}
        />
        {showCommentsPanel && <MockCommentsPanel comments={comments} visible={showCommentsPanel} />}
      </div>
    </MockAppShell>
  );
}

const outlineItems = [
  { title: "Abstract", page: 1 },
  { title: "Introduction", page: 1, children: [
    { title: "Background", page: 2 },
    { title: "Related Work", page: 3 },
  ]},
  { title: "Model Architecture", page: 3, children: [
    { title: "Attention", page: 4 },
  ]},
  { title: "Results", page: 6 },
  { title: "Conclusion", page: 8 },
];

function MockOutlinePanel() {
  return (
    <div
      className="w-[140px] shrink-0 flex flex-col overflow-hidden"
      style={{
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-default)",
      }}
    >
      <div
        className="h-11 flex items-center px-3 shrink-0"
        style={{ borderBottom: "1px solid var(--border-default)" }}
      >
        <span
          className="text-[9px] font-medium uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          Outline
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-px p-1.5 overflow-hidden">
        {outlineItems.map((item) => (
          <div key={item.title}>
            <div className="flex items-center gap-1 px-1.5 py-1 rounded">
              {item.children ? (
                <ChevronRight className="size-2.5 shrink-0 rotate-90" style={{ color: "var(--text-muted)" }} />
              ) : (
                <span className="w-2.5 shrink-0" />
              )}
              <span className="text-[9px] flex-1 truncate" style={{ color: "var(--text-secondary)" }}>
                {item.title}
              </span>
              <span className="text-[8px] shrink-0 tabular-nums" style={{ color: "var(--text-muted)" }}>
                {item.page}
              </span>
            </div>
            {item.children?.map((child) => (
              <div key={child.title} className="flex items-center gap-1 px-1.5 py-1 rounded ml-3">
                <span className="text-[9px] flex-1 truncate" style={{ color: "var(--text-muted)" }}>
                  {child.title}
                </span>
                <span className="text-[8px] shrink-0 tabular-nums" style={{ color: "var(--text-muted)" }}>
                  {child.page}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function UploadAnimation() {
  return (
    <div
      className="h-full rounded-md border-2 border-dashed flex items-center justify-center relative"
      style={{
        borderColor: "var(--border-default)",
        background: "var(--bg-secondary)",
      }}
    >
      <span className="text-[11px] absolute bottom-6" style={{ color: "var(--text-muted)" }}>
        Drop PDFs to import
      </span>

      <div className="flex gap-5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="animate-pdf-drop"
            style={{ animationDelay: `${i * 0.25}s` }}
          >
            <div
              className="w-11 h-14 rounded shadow-md flex flex-col items-center justify-center gap-1"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, var(--manu) 85%, var(--bg-primary)), var(--manu))`,
                border: "1px solid var(--manu-border)",
              }}
            >
              <FileText className="size-4" style={{ color: "var(--text-on-accent)" }} />
              <span className="text-[8px] font-bold" style={{ color: "var(--text-on-accent)" }}>
                PDF
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
