import { MessageSquare } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { CommentCard, type Highlight } from "./CommentCard"

interface CommentsPanelProps {
  highlights: Highlight[]
  onUpdate?: (id: string, noteText: string) => void
  onDelete?: (id: string) => void
  onHighlightClick?: (id: string) => void
}

export function CommentsPanel({
  highlights,
  onUpdate,
  onDelete,
  onHighlightClick,
}: CommentsPanelProps) {
  return (
    <div className="flex h-full w-[280px] shrink-0 flex-col border-l bg-background">
      {/* Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b px-4">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Comments
        </span>
        {highlights.length > 0 && (
          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
            {highlights.length}
          </Badge>
        )}
      </div>

      {/* Content */}
      {highlights.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">No highlights yet</p>
            <p className="text-xs text-muted-foreground">
              Select text in the PDF to create highlights and add notes
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2 p-3">
            {highlights.map((highlight) => (
              <CommentCard
                key={highlight.id}
                highlight={highlight}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onClick={() => onHighlightClick?.(highlight.id)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
