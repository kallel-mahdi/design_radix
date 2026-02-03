import { useState } from "react"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import {
  Folder,
  Search,
  BookOpen,
  Bell,
  Users,
  Clock,
  Code,
} from "lucide-react"
import { AppLayout, type NavigationItem } from "../components/shared/AppLayout"
import { FileSidebar } from "../components/editor/FileSidebar"
import { EditorPane, type EditorTab } from "../components/editor/EditorPane"
import { PdfPane } from "../components/editor/PdfPane"

// Mock editor tabs
const initialTabs: EditorTab[] = [
  { id: "tab-main", name: "Main.tex", fileId: "main", isDirty: false },
  { id: "tab-chapter1", name: "chapter1.tex", fileId: "chapter1", isDirty: false },
]

// App switcher options
const appSwitcherItems: NavigationItem[] = [
  { id: "editor", icon: Code, label: "Editor" },
  { id: "library", icon: BookOpen, label: "Library" },
]

interface EditorPageProps {
  onNavigateHome?: () => void
}

export function EditorPage({ onNavigateHome }: EditorPageProps) {
  const [activeActivity, setActiveActivity] = useState("files")
  const [selectedFileId, setSelectedFileId] = useState<string | null>("main")
  const [tabs, setTabs] = useState<EditorTab[]>(initialTabs)
  const [activeTabId, setActiveTabId] = useState("tab-main")

  // Build navigation items with per-item callbacks
  const navItems: NavigationItem[] = [
    { id: "files", icon: Folder, label: "Files", selected: activeActivity === "files", onClick: () => setActiveActivity("files") },
    { id: "search", icon: Search, label: "Search", selected: activeActivity === "search", onClick: () => setActiveActivity("search") },
    { id: "references", icon: BookOpen, label: "References", selected: activeActivity === "references", onClick: () => setActiveActivity("references") },
    { id: "notifications", icon: Bell, label: "Notifications", selected: activeActivity === "notifications", onClick: () => setActiveActivity("notifications") },
    { id: "collaborators", icon: Users, label: "Collaborators", selected: activeActivity === "collaborators", onClick: () => setActiveActivity("collaborators") },
    { id: "history", icon: Clock, label: "History", selected: activeActivity === "history", onClick: () => setActiveActivity("history") },
  ]

  const handleTabClose = (tabId: string) => {
    setTabs((prev) => prev.filter((t) => t.id !== tabId))
    if (activeTabId === tabId && tabs.length > 1) {
      const remaining = tabs.filter((t) => t.id !== tabId)
      setActiveTabId(remaining[0]?.id || "")
    }
  }

  const handleFileSelect = (fileId: string) => {
    setSelectedFileId(fileId)
    // Check if tab already exists
    const existingTab = tabs.find((t) => t.fileId === fileId)
    if (existingTab) {
      setActiveTabId(existingTab.id)
    }
    // In a real implementation, we would open a new tab here
  }

  return (
    <AppLayout
      activityBarItems={navItems}
      onLogoClick={onNavigateHome ?? (() => {})}
      sidebar={{ content: <FileSidebar selectedFileId={selectedFileId} onSelectFile={handleFileSelect} />, visible: true }}
      dataModule="manuscripts"
      appSwitcher={{
        items: appSwitcherItems,
        activeId: "editor",
      }}
    >
      {/* Main Content Area with Resizable Panes */}
      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        {/* Editor Pane */}
        <ResizablePanel defaultSize={50} minSize={25}>
          <EditorPane
            tabs={tabs}
            activeTabId={activeTabId}
            onTabChange={setActiveTabId}
            onTabClose={handleTabClose}
          />
        </ResizablePanel>

        {/* Resize Handle */}
        <ResizableHandle
          withHandle
          className="bg-[color:var(--bg-tertiary)] transition-colors hover:bg-[color:var(--accent)]"
        />

        {/* PDF Pane */}
        <ResizablePanel defaultSize={50} minSize={25}>
          <PdfPane errorCount={0} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </AppLayout>
  )
}
