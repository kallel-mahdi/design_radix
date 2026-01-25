import { FileText } from "lucide-react"
import { EditorToolbar } from "./EditorToolbar"
import { CodePlaceholder } from "./CodePlaceholder"
import { FileTabs, type FileTab } from "../shared/FileTabs"

export interface EditorTab {
  id: string
  name: string
  fileId: string
  isDirty: boolean
}

interface EditorPaneProps {
  tabs: EditorTab[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  onTabClose?: (tabId: string) => void
}

export function EditorPane({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
}: EditorPaneProps) {
  // Convert EditorTab to FileTab for the shared component
  const fileTabs: FileTab[] = tabs.map((tab) => ({
    id: tab.id,
    name: tab.name,
    icon: FileText,
    isDirty: tab.isDirty,
  }))

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar (shared component) */}
      <FileTabs
        tabs={fileTabs}
        activeId={activeTabId}
        onSelect={onTabChange}
        onClose={onTabClose}
      />

      {/* Toolbar */}
      <EditorToolbar />

      {/* Code content */}
      <div className="flex-1 overflow-hidden bg-[color:var(--bg-primary)]">
        <CodePlaceholder />
      </div>
    </div>
  )
}
