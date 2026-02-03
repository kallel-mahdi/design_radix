import * as ToolbarPrimitive from "@radix-ui/react-toolbar"
import { Minus, Plus, Highlighter, Underline, ChevronDown } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { HighlightColor } from "./CommentCard"

interface PdfReaderToolbarProps {
  zoom: number
  onZoomChange: (zoom: number) => void
  annotationMode: "highlight" | "underline" | null
  onAnnotationModeChange: (mode: "highlight" | "underline" | null) => void
  activeColor: HighlightColor
  onColorChange: (color: HighlightColor) => void
}

const ZOOM_MIN = 50
const ZOOM_MAX = 200
const ZOOM_STEP = 25

const HIGHLIGHT_COLORS: { color: HighlightColor; className: string }[] = [
  { color: "yellow", className: "bg-[var(--amber-9)]" },
  { color: "orange", className: "bg-[var(--orange-9)]" },
  { color: "green", className: "bg-[var(--green-9)]" },
  { color: "blue", className: "bg-[var(--blue-9)]" },
  { color: "purple", className: "bg-[var(--purple-9)]" },
  { color: "pink", className: "bg-[var(--pink-9)]" },
]

const toolbarButtonClasses =
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] h-8 px-3 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"

const toolbarToggleClasses =
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] h-8 px-3 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"

export function PdfReaderToolbar({
  zoom,
  onZoomChange,
  annotationMode,
  onAnnotationModeChange,
  activeColor,
  onColorChange,
}: PdfReaderToolbarProps) {
  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + ZOOM_STEP, ZOOM_MAX))
  }

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - ZOOM_STEP, ZOOM_MIN))
  }

  const handleAnnotationToggle = (value: string) => {
    if (value === annotationMode) {
      onAnnotationModeChange(null)
    } else {
      onAnnotationModeChange(value as "highlight" | "underline")
    }
  }

  const activeColorConfig = HIGHLIGHT_COLORS.find((c) => c.color === activeColor)

  return (
    <ToolbarPrimitive.Root
      className="flex h-11 shrink-0 items-center justify-center gap-1 border-b bg-background px-2"
      aria-label="PDF annotation tools"
    >
      {/* Zoom controls */}
      <ToolbarPrimitive.Button
        className={toolbarButtonClasses}
        onClick={handleZoomOut}
        disabled={zoom <= ZOOM_MIN}
        aria-label="Zoom out"
      >
        <Minus className="size-4" />
      </ToolbarPrimitive.Button>

      <span className="flex h-8 min-w-[4rem] items-center justify-center text-sm text-muted-foreground">
        {zoom}%
      </span>

      <ToolbarPrimitive.Button
        className={toolbarButtonClasses}
        onClick={handleZoomIn}
        disabled={zoom >= ZOOM_MAX}
        aria-label="Zoom in"
      >
        <Plus className="size-4" />
      </ToolbarPrimitive.Button>

      <ToolbarPrimitive.Separator className="mx-2 h-5 w-px bg-border" />

      {/* Annotation mode toggles */}
      <ToolbarPrimitive.ToggleGroup
        type="single"
        value={annotationMode || ""}
        onValueChange={handleAnnotationToggle}
        aria-label="Annotation mode"
      >
        <ToolbarPrimitive.ToggleItem
          value="highlight"
          className={toolbarToggleClasses}
          aria-label="Highlight mode"
        >
          <Highlighter className="size-4" />
        </ToolbarPrimitive.ToggleItem>
        <ToolbarPrimitive.ToggleItem
          value="underline"
          className={toolbarToggleClasses}
          aria-label="Underline mode"
        >
          <Underline className="size-4" />
        </ToolbarPrimitive.ToggleItem>
      </ToolbarPrimitive.ToggleGroup>

      {/* Color picker */}
      <Popover>
        <PopoverTrigger asChild>
          <ToolbarPrimitive.Button
            className={cn(toolbarButtonClasses, "gap-1.5")}
            aria-label="Select highlight color"
          >
            <span
              className={cn(
                "size-4 rounded-full border border-border",
                activeColorConfig?.className
              )}
            />
            <ChevronDown className="size-3" />
          </ToolbarPrimitive.Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1.5">
            {HIGHLIGHT_COLORS.map(({ color, className }) => (
              <button
                key={color}
                className={cn(
                  "size-7 rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  className,
                  activeColor === color && "ring-2 ring-ring ring-offset-2"
                )}
                onClick={() => onColorChange(color)}
                aria-label={`Select ${color} color`}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </ToolbarPrimitive.Root>
  )
}
