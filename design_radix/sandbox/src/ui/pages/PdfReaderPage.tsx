import { useState, useCallback } from "react"
import { FileText, List, MessageSquare } from "lucide-react"
import { AppLayout, type NavigationItem } from "@/ui/components/shared/AppLayout"
import { FileTabs, type FileTab } from "@/ui/components/shared/FileTabs"
import { PdfReaderToolbar } from "@/ui/components/pdf-reader/PdfReaderToolbar"
import { PdfOutlinePanel, type OutlineItem } from "@/ui/components/pdf-reader/PdfOutlinePanel"
import { CommentsPanel } from "@/ui/components/pdf-reader/CommentsPanel"
import { PdfContentArea } from "@/ui/components/pdf-reader/PdfContentArea"
import type { Highlight, HighlightColor } from "@/ui/components/pdf-reader/CommentCard"

// Mock data
const mockOutline: OutlineItem[] = [
  { id: "1", title: "Abstract", pageNumber: 1, children: [] },
  {
    id: "2",
    title: "Introduction",
    pageNumber: 2,
    children: [
      { id: "2.1", title: "Background", pageNumber: 2, children: [] },
      { id: "2.2", title: "Related Work", pageNumber: 4, children: [] },
    ],
  },
  { id: "3", title: "Methodology", pageNumber: 6, children: [] },
  { id: "4", title: "Experiments", pageNumber: 10, children: [] },
  { id: "5", title: "Conclusion", pageNumber: 15, children: [] },
]

const initialHighlights: Highlight[] = [
  {
    id: "1",
    highlightedText: "significant improvements over baseline methods",
    noteText: "Key finding - cite this in discussion",
    color: "yellow",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    pageNumber: 1,
  },
  {
    id: "2",
    highlightedText: "Transformer-based models have shown remarkable performance",
    noteText: "",
    color: "blue",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    pageNumber: 2,
  },
]

const mockTabs: FileTab[] = [
  { id: "paper1", name: "ml_analysis.pdf", icon: FileText },
  { id: "paper2", name: "references.pdf", icon: FileText },
]

interface PdfReaderPageProps {
  onNavigateHome?: () => void
}

export function PdfReaderPage({ onNavigateHome }: PdfReaderPageProps) {
  // Panel visibility state
  const [outlinePanelOpen, setOutlinePanelOpen] = useState(true)
  const [commentsPanelOpen, setCommentsPanelOpen] = useState(true)
  const [activeActivityId, setActiveActivityId] = useState("outline")

  // Tab state
  const [activeTabId, setActiveTabId] = useState("paper1")
  const [tabs, setTabs] = useState(mockTabs)

  // Toolbar state
  const [zoom, setZoom] = useState(100)
  const [annotationMode, setAnnotationMode] = useState<"highlight" | "underline" | null>(null)
  const [activeColor, setActiveColor] = useState<HighlightColor>("yellow")

  // Highlights state
  const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights)

  // Handle activity bar toggle (both can be open)
  const handleActivitySelect = (id: string) => {
    if (id === "outline") {
      setOutlinePanelOpen(!outlinePanelOpen)
    } else if (id === "comments") {
      setCommentsPanelOpen(!commentsPanelOpen)
    }
    setActiveActivityId(id)
  }

  // Build navigation items with per-item callbacks
  const navItems: NavigationItem[] = [
    {
      id: "outline",
      icon: List,
      label: "Outline",
      selected: activeActivityId === "outline",
      onClick: () => handleActivitySelect("outline"),
    },
    {
      id: "comments",
      icon: MessageSquare,
      label: "Comments",
      selected: activeActivityId === "comments",
      onClick: () => handleActivitySelect("comments"),
    },
  ]

  // Handle tab close
  const handleTabClose = (id: string) => {
    setTabs((prev) => prev.filter((tab) => tab.id !== id))
    if (activeTabId === id && tabs.length > 1) {
      const remaining = tabs.filter((tab) => tab.id !== id)
      setActiveTabId(remaining[0]?.id || "")
    }
  }

  // Handle outline navigation
  const handleOutlineNavigate = (pageNumber: number) => {
    console.log(`Navigate to page ${pageNumber}`)
  }

  // Handle highlight creation
  const handleCreateHighlight = useCallback(
    (data: {
      text: string
      color: HighlightColor
      type: "highlight" | "underline"
      note: string
    }) => {
      const newHighlight: Highlight = {
        id: `highlight-${Date.now()}`,
        highlightedText: data.text,
        noteText: data.note,
        color: data.color,
        timestamp: new Date().toISOString(),
        pageNumber: 1,
      }
      setHighlights((prev) => [newHighlight, ...prev])
    },
    []
  )

  // Handle highlight update
  const handleHighlightUpdate = useCallback((id: string, noteText: string) => {
    setHighlights((prev) =>
      prev.map((h) => (h.id === id ? { ...h, noteText } : h))
    )
  }, [])

  // Handle highlight delete
  const handleHighlightDelete = useCallback((id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id))
  }, [])

  // Handle highlight click from comments panel
  const handleHighlightClick = useCallback((id: string) => {
    console.log(`Scroll to highlight ${id}`)
  }, [])

  return (
    <AppLayout
      activityBarItems={navItems}
      onLogoClick={onNavigateHome ?? (() => {})}
      sidebar={outlinePanelOpen ? {
        content: (
          <PdfOutlinePanel
            outline={mockOutline}
            onNavigate={handleOutlineNavigate}
          />
        ),
        visible: true,
      } : undefined}
      dataModule="bibliography"
    >
      {/* Main content + Comments area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* File tabs row - h-11 */}
        <FileTabs
          tabs={tabs}
          activeId={activeTabId}
          onSelect={setActiveTabId}
          onClose={handleTabClose}
        />

        {/* Below FileTabs: Toolbar + PDF + Comments sidebar */}
        <div className="flex min-h-0 flex-1">
          {/* Center: Toolbar + PDF content */}
          <main className="flex min-w-0 flex-1 flex-col">
            <PdfReaderToolbar
              zoom={zoom}
              onZoomChange={setZoom}
              annotationMode={annotationMode}
              onAnnotationModeChange={setAnnotationMode}
              activeColor={activeColor}
              onColorChange={setActiveColor}
            />
            <PdfContentArea
              zoom={zoom}
              highlights={highlights}
              onCreateHighlight={handleCreateHighlight}
            />
          </main>

          {/* Comments Sidebar (right) - 280px, header at Toolbar level */}
          {commentsPanelOpen && (
            <CommentsPanel
              highlights={highlights}
              onUpdate={handleHighlightUpdate}
              onDelete={handleHighlightDelete}
              onHighlightClick={handleHighlightClick}
            />
          )}
        </div>
      </div>
    </AppLayout>
  )
}
