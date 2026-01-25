import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Image,
  File,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types
export interface FileNode {
  id: string
  name: string
  type: "file" | "folder"
  children?: FileNode[]
}

interface FileTreeProps {
  files: FileNode[]
  selectedId: string | null
  onSelect: (id: string) => void
}

// File icon logic by extension
function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "tex":
    case "latex":
      return { Icon: FileText, className: "text-sky-500" }
    case "bib":
      return { Icon: BookOpen, className: "text-amber-500" }
    case "pdf":
      return { Icon: FileText, className: "text-red-500" }
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
      return { Icon: Image, className: "text-emerald-500" }
    default:
      return { Icon: File, className: "text-muted-foreground" }
  }
}

// Recursive tree node component
function TreeNode({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: FileNode
  depth: number
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const [isOpen, setIsOpen] = useState(true)
  const isSelected = selectedId === node.id
  const paddingLeft = `${depth * 1}rem`

  if (node.type === "folder") {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  "text-muted-foreground hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-primary)]"
                )}
                style={{ paddingLeft }}
              >
                <ChevronRight
                  className={cn(
                    "size-4 shrink-0 transition-transform",
                    isOpen && "rotate-90"
                  )}
                />
                {isOpen ? (
                  <FolderOpen className="size-4 shrink-0 text-amber-500" />
                ) : (
                  <Folder className="size-4 shrink-0 text-amber-500" />
                )}
                <span className="truncate">{node.name}</span>
              </button>
            </CollapsibleTrigger>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>New File</ContextMenuItem>
            <ContextMenuItem>New Folder</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Rename</ContextMenuItem>
            <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <CollapsibleContent>
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  const { Icon, className: iconClassName } = getFileIcon(node.name)

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
            isSelected
              ? "bg-[color:var(--selection)] text-[color:var(--accent)] font-medium"
              : "text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-primary)]"
          )}
          style={{ paddingLeft: `calc(${paddingLeft} + 1.5rem)` }}
          onClick={() => onSelect(node.id)}
        >
          <Icon className={cn("size-4 shrink-0", iconClassName)} />
          <span className="truncate">{node.name}</span>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Open</ContextMenuItem>
        <ContextMenuItem>Rename</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export function FileTree({ files, selectedId, onSelect }: FileTreeProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {files.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
