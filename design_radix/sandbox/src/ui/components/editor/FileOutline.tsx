import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface OutlineItem {
  id: string
  label: string
  line: number
}

interface FileOutlineProps {
  items: OutlineItem[]
  onItemClick?: (item: OutlineItem) => void
}

export function FileOutline({ items, onItemClick }: FileOutlineProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center gap-2 px-2 py-2 text-sm font-semibold text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">
          <ChevronRight
            className={cn(
              "size-4 shrink-0 transition-transform",
              isOpen && "rotate-90"
            )}
          />
          <span>File Outline</span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-0.5 pl-4">
          {items.map((item) => (
            <button
              key={item.id}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-secondary)]"
              onClick={() => onItemClick?.(item)}
            >
              <span className="text-xs text-muted-foreground">§</span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
