import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Plus, FolderPlus, Upload } from "lucide-react"
import { FileTree, type FileNode } from "./FileTree"
import { FileOutline, type OutlineItem } from "./FileOutline"

// Mock file tree data
const mockFiles: FileNode[] = [
  { id: "main", name: "Main.tex", type: "file" },
  { id: "chapter1", name: "chapter1.tex", type: "file" },
  { id: "refs", name: "references.bib", type: "file" },
  {
    id: "figures",
    name: "figures",
    type: "folder",
    children: [{ id: "fig1", name: "fig1.png", type: "file" }],
  },
]

// Mock outline items
const mockOutline: OutlineItem[] = [
  { id: "intro", label: "Introduction", line: 15 },
  { id: "related", label: "Related Work", line: 45 },
  { id: "methods", label: "Methods", line: 78 },
  { id: "results", label: "Results", line: 120 },
  { id: "discussion", label: "Discussion", line: 180 },
  { id: "conclusion", label: "Conclusion", line: 220 },
]

interface FileSidebarProps {
  selectedFileId: string | null
  onSelectFile: (id: string) => void
}

export function FileSidebar({ selectedFileId, onSelectFile }: FileSidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-[color:var(--bg-secondary)]">
      {/* Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b px-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          File Browser
        </span>
        <div className="flex gap-0.5">
          <Button variant="ghost" size="icon-xs" title="New File">
            <Plus className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-xs" title="New Folder">
            <FolderPlus className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-xs" title="Upload">
            <Upload className="size-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-3 pt-4">
          {/* File tree */}
          <FileTree
            files={mockFiles}
            selectedId={selectedFileId}
            onSelect={onSelectFile}
          />

          {/* Outline section */}
          <Separator className="my-4" />
          <FileOutline items={mockOutline} />
        </div>
      </ScrollArea>
    </aside>
  )
}
