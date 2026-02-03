import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface OutlineItem {
  id: string
  title: string
  pageNumber: number
  children: OutlineItem[]
}

interface PdfOutlinePanelProps {
  outline: OutlineItem[]
  onNavigate?: (pageNumber: number) => void
}

interface OutlineNodeProps {
  item: OutlineItem
  depth: number
  onNavigate?: (pageNumber: number) => void
}

function OutlineNode({ item, depth, onNavigate }: OutlineNodeProps) {
  const [isOpen, setIsOpen] = useState(true)
  const hasChildren = item.children.length > 0
  const paddingLeft = `${depth * 1}rem`

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
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
            <span className="flex-1 truncate text-left">{item.title}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {item.pageNumber}
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {item.children.map((child) => (
            <OutlineNode
              key={child.id}
              item={child}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        "text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-primary)]"
      )}
      style={{ paddingLeft: `calc(${paddingLeft} + 1.5rem)` }}
      onClick={() => onNavigate?.(item.pageNumber)}
    >
      <span className="flex-1 truncate text-left">{item.title}</span>
      <span className="shrink-0 text-xs text-muted-foreground">
        {item.pageNumber}
      </span>
    </button>
  )
}

export function PdfOutlinePanel({ outline, onNavigate }: PdfOutlinePanelProps) {
  return (
    <div className="flex h-full w-[240px] shrink-0 flex-col border-r bg-background">
      {/* Header */}
      <div className="flex h-11 shrink-0 items-center border-b px-4">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Outline
        </span>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {outline.map((item) => (
            <OutlineNode
              key={item.id}
              item={item}
              depth={0}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
