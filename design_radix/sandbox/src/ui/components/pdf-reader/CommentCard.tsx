import { useState } from "react"
import { Pencil, Trash2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

export type HighlightColor =
  | "yellow"
  | "orange"
  | "green"
  | "blue"
  | "purple"
  | "pink"

export interface Highlight {
  id: string
  highlightedText: string
  noteText: string
  color: HighlightColor
  timestamp: string
  pageNumber: number
}

interface CommentCardProps {
  highlight: Highlight
  onUpdate?: (id: string, noteText: string) => void
  onDelete?: (id: string) => void
  onClick?: () => void
}

const colorBorderClasses: Record<HighlightColor, string> = {
  yellow: "border-l-[var(--amber-9)]",
  orange: "border-l-[var(--orange-9)]",
  green: "border-l-[var(--green-9)]",
  blue: "border-l-[var(--blue-9)]",
  purple: "border-l-[var(--purple-9)]",
  pink: "border-l-[var(--pink-9)]",
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function CommentCard({
  highlight,
  onUpdate,
  onDelete,
  onClick,
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(highlight.noteText)
  const [isHovered, setIsHovered] = useState(false)

  const handleSave = () => {
    onUpdate?.(highlight.id, editText)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditText(highlight.noteText)
    setIsEditing(false)
  }

  const handleDelete = () => {
    onDelete?.(highlight.id)
  }

  return (
    <div
      className={cn(
        "group relative rounded-md border border-l-[3px] bg-card p-3 transition-colors",
        colorBorderClasses[highlight.color],
        "hover:bg-[color:var(--bg-hover)]",
        onClick && "cursor-pointer"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !isEditing && onClick?.()}
    >
      {/* Highlighted text preview */}
      <p className="line-clamp-2 text-sm italic text-muted-foreground">
        "{highlight.highlightedText}"
      </p>

      {/* Note content or edit mode */}
      {isEditing ? (
        <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Add a note..."
            className="min-h-[60px] text-sm"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              size="xs"
              variant="ghost"
              onClick={handleCancel}
            >
              <X className="size-3" />
              Cancel
            </Button>
            <Button
              size="xs"
              onClick={handleSave}
            >
              <Check className="size-3" />
              Save
            </Button>
          </div>
        </div>
      ) : (
        highlight.noteText && (
          <p className="mt-2 text-sm text-foreground">{highlight.noteText}</p>
        )
      )}

      {/* Footer with timestamp and page */}
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Page {highlight.pageNumber}</span>
        <span>{formatRelativeTime(highlight.timestamp)}</span>
      </div>

      {/* Action buttons - appear on hover */}
      {!isEditing && (isHovered || false) && (
        <div
          className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => {
              setEditText(highlight.noteText)
              setIsEditing(true)
            }}
          >
            <Pencil className="size-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon-xs" variant="ghost">
                <Trash2 className="size-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete highlight?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this highlight and any associated
                  notes. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  )
}
