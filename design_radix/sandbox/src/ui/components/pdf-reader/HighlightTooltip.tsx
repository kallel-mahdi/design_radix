import { useState } from "react"
import { Highlighter, Underline } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import type { HighlightColor } from "./CommentCard"

interface HighlightTooltipProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedText: string
  position: { x: number; y: number }
  onCreateHighlight: (data: {
    text: string
    color: HighlightColor
    type: "highlight" | "underline"
    note: string
  }) => void
}

const HIGHLIGHT_COLORS: { color: HighlightColor; className: string }[] = [
  { color: "yellow", className: "bg-[var(--amber-9)]" },
  { color: "orange", className: "bg-[var(--orange-9)]" },
  { color: "green", className: "bg-[var(--green-9)]" },
  { color: "blue", className: "bg-[var(--blue-9)]" },
  { color: "purple", className: "bg-[var(--purple-9)]" },
  { color: "pink", className: "bg-[var(--pink-9)]" },
]

export function HighlightTooltip({
  open,
  onOpenChange,
  selectedText,
  position,
  onCreateHighlight,
}: HighlightTooltipProps) {
  const [activeColor, setActiveColor] = useState<HighlightColor>("yellow")
  const [annotationType, setAnnotationType] = useState<"highlight" | "underline">("highlight")
  const [note, setNote] = useState("")

  const handleCreate = () => {
    onCreateHighlight({
      text: selectedText,
      color: activeColor,
      type: annotationType,
      note,
    })
    setNote("")
    onOpenChange(false)
  }

  const handleCancel = () => {
    setNote("")
    onOpenChange(false)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          width: 0,
          height: 0,
        }}
      />
      <PopoverContent
        className="w-64 p-3"
        side="top"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-3">
          {/* Color swatches */}
          <div className="flex justify-center gap-2">
            {HIGHLIGHT_COLORS.map(({ color, className }) => (
              <button
                key={color}
                className={cn(
                  "size-6 rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  className,
                  activeColor === color && "ring-2 ring-foreground ring-offset-1"
                )}
                onClick={() => setActiveColor(color)}
                aria-label={`Select ${color} color`}
              />
            ))}
          </div>

          {/* Highlight/Underline toggle */}
          <ToggleGroup
            type="single"
            value={annotationType}
            onValueChange={(value) => {
              if (value) setAnnotationType(value as "highlight" | "underline")
            }}
            className="justify-center"
          >
            <ToggleGroupItem value="highlight" size="sm" aria-label="Highlight">
              <Highlighter className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" size="sm" aria-label="Underline">
              <Underline className="size-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Optional note */}
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)..."
            className="min-h-[60px] text-sm"
          />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate}>
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
