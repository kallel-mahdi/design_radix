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
import { ActivityBar, type ActivityItem } from "../components/shared/ActivityBar"
import { FileSidebar } from "../components/editor/FileSidebar"
import { EditorPane, type EditorTab } from "../components/editor/EditorPane"
import { PdfPane } from "../components/editor/PdfPane"

// Activity bar items for Editor/Manuscripts module
const editorActivityItems: ActivityItem[] = [
  { id: "files", icon: Folder, label: "Files" },
  { id: "search", icon: Search, label: "Search" },
  { id: "references", icon: BookOpen, label: "References" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "collaborators", icon: Users, label: "Collaborators" },
  { id: "history", icon: Clock, label: "History" },
]

// App switcher options
const appSwitcherItems: ActivityItem[] = [
  { id: "editor", icon: Code, label: "Editor" },
  { id: "library", icon: BookOpen, label: "Library" },
]

// Mock editor tabs
const initialTabs: EditorTab[] = [
  { id: "tab-main", name: "Main.tex", fileId: "main", isDirty: false },
  { id: "tab-chapter1", name: "chapter1.tex", fileId: "chapter1", isDirty: false },
]

export function EditorPage() {
  const [activeActivity, setActiveActivity] = useState("files")
  const [selectedFileId, setSelectedFileId] = useState<string | null>("main")
  const [tabs, setTabs] = useState<EditorTab[]>(initialTabs)
  const [activeTabId, setActiveTabId] = useState("tab-main")

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
    <div className="flex min-h-0 flex-1" data-module="manuscripts">
      {/* Activity Bar - 56px (shared component with app switcher) */}
      <ActivityBar
        items={editorActivityItems}
        activeId={activeActivity}
        onSelect={setActiveActivity}
        appSwitcher={{
          items: appSwitcherItems,
          activeId: "editor",
        }}
      />

      {/* File Sidebar - 256px */}
      <FileSidebar
        selectedFileId={selectedFileId}
        onSelectFile={handleFileSelect}
      />

      {/* Main Content Area with Resizable Panes */}
      <main className="flex flex-1 flex-col overflow-hidden">
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
      </main>
    </div>
  )
}
