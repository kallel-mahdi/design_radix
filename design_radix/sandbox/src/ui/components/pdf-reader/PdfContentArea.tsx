import { useRef, useState, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { HighlightTooltip } from "./HighlightTooltip"
import type { HighlightColor, Highlight } from "./CommentCard"

interface PdfContentAreaProps {
  zoom: number
  highlights: Highlight[]
  onCreateHighlight: (data: {
    text: string
    color: HighlightColor
    type: "highlight" | "underline"
    note: string
  }) => void
}

const highlightTintClasses: Record<HighlightColor, string> = {
  yellow: "bg-[var(--amber-4)]",
  orange: "bg-[var(--orange-4)]",
  green: "bg-[var(--green-4)]",
  blue: "bg-[var(--blue-4)]",
  purple: "bg-[var(--purple-4)]",
  pink: "bg-[var(--pink-4)]",
}

// Mock PDF content with selectable text
const MOCK_CONTENT = `
Abstract

This paper presents a comprehensive analysis of machine learning approaches for natural language processing tasks. We demonstrate significant improvements over baseline methods across multiple benchmark datasets, achieving state-of-the-art results on text classification and sentiment analysis tasks.

1. Introduction

Recent advances in deep learning have revolutionized the field of natural language processing. Transformer-based models have shown remarkable performance on a wide range of tasks, from machine translation to question answering.

The key contributions of this paper are:
• A novel attention mechanism that improves context understanding
• An efficient training procedure that reduces computational requirements
• Extensive experiments demonstrating the effectiveness of our approach

Previous studies have shown that pre-training on large corpora leads to better generalization. However, the computational cost of training such models remains a significant barrier for many researchers and practitioners.

2. Related Work

The landscape of natural language processing has evolved significantly over the past decade. Early approaches relied heavily on hand-crafted features and rule-based systems.

Word embeddings marked a significant shift towards data-driven methods. Word2Vec and GloVe demonstrated that distributed representations could capture semantic relationships between words.

The introduction of attention mechanisms further improved model performance. Self-attention, in particular, has become a fundamental building block in modern architectures.

3. Methodology

Our approach builds upon the transformer architecture with several key modifications. We introduce a sparse attention pattern that reduces memory requirements while maintaining model quality.

The training objective combines masked language modeling with a contrastive learning component. This encourages the model to learn more discriminative representations.

4. Experiments

We evaluate our method on several benchmark datasets:
• GLUE benchmark for natural language understanding
• SQuAD for question answering
• WMT for machine translation

Results show consistent improvements across all tasks, with particularly strong performance on low-resource settings.

5. Conclusion

This work demonstrates the effectiveness of our proposed approach for natural language processing. Future work will explore applications to multilingual and multimodal settings.
`

export function PdfContentArea({
  zoom,
  highlights,
  onCreateHighlight,
}: PdfContentAreaProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()

    if (text && text.length > 0 && contentRef.current) {
      const range = selection?.getRangeAt(0)
      const rect = range?.getBoundingClientRect()
      const containerRect = contentRef.current.getBoundingClientRect()

      if (rect) {
        setSelectedText(text)
        setTooltipPosition({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top,
        })
        setTooltipOpen(true)
      }
    }
  }, [])

  // Render content with highlights applied
  const renderContent = () => {
    let content = MOCK_CONTENT

    // Sort highlights by position (longest first to avoid nested replacements)
    const sortedHighlights = [...highlights].sort(
      (a, b) => b.highlightedText.length - a.highlightedText.length
    )

    // Apply highlights as styled spans (simplified - in production would use proper text ranges)
    const parts: { text: string; highlight?: Highlight }[] = []
    let remainingContent = content

    for (const highlight of sortedHighlights) {
      const idx = remainingContent.indexOf(highlight.highlightedText)
      if (idx !== -1) {
        if (idx > 0) {
          parts.push({ text: remainingContent.slice(0, idx) })
        }
        parts.push({ text: highlight.highlightedText, highlight })
        remainingContent = remainingContent.slice(idx + highlight.highlightedText.length)
      }
    }

    if (remainingContent) {
      parts.push({ text: remainingContent })
    }

    // If no highlights matched, just return the raw content
    if (parts.length === 0) {
      return content.split("\n").map((line, i) => (
        <p key={i} className={cn(line.trim() === "" ? "h-4" : "mb-4")}>
          {line}
        </p>
      ))
    }

    return parts.map((part, i) => {
      if (part.highlight) {
        return (
          <span
            key={i}
            className={cn(
              "cursor-pointer rounded px-0.5",
              highlightTintClasses[part.highlight.color]
            )}
            title={part.highlight.noteText || "Click to view"}
          >
            {part.text}
          </span>
        )
      }
      return part.text.split("\n").map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ))
    })
  }

  return (
    <ScrollArea className="min-w-0 flex-1 bg-[color:var(--bg-tertiary)]">
      <div className="flex justify-center p-8">
        {/* Paper container */}
        <div
          ref={contentRef}
          className="relative w-full max-w-[800px] rounded-sm bg-white p-12 shadow-lg dark:bg-[color:var(--sand-2)]"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
          onMouseUp={handleMouseUp}
        >
          {/* Mock PDF content */}
          <div className="prose prose-sm max-w-none select-text text-[color:var(--mauve-12)] dark:prose-invert">
            {renderContent()}
          </div>

          {/* Highlight tooltip */}
          <HighlightTooltip
            open={tooltipOpen}
            onOpenChange={setTooltipOpen}
            selectedText={selectedText}
            position={tooltipPosition}
            onCreateHighlight={onCreateHighlight}
          />
        </div>
      </div>
    </ScrollArea>
  )
}
