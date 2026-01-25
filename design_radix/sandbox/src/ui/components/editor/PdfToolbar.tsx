import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  PlayCircle,
  ChevronDown,
  Minus,
  Plus,
  CheckCircle2,
  AlertCircle,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PdfToolbarProps {
  errorCount?: number
}

export function PdfToolbar({ errorCount = 0 }: PdfToolbarProps) {
  const [zoom, setZoom] = useState(100)
  const hasErrors = errorCount > 0

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 200))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50))

  return (
    <TooltipProvider>
      <div className="flex h-11 shrink-0 items-center justify-between px-4">
        {/* Left: Recompile button with dropdown */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              >
                <PlayCircle className="size-4 text-[color:var(--success)]" />
                <span>Recompile</span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Recompile</DropdownMenuItem>
              <DropdownMenuItem>Recompile from scratch</DropdownMenuItem>
              <DropdownMenuItem>Stop compilation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Zoom controls, log indicator, download */}
        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={handleZoomOut}>
                  <Minus className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>
            <span className="min-w-10 text-center text-xs font-medium text-[color:var(--text-secondary)]">
              {zoom}%
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={handleZoomIn}>
                  <Plus className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </div>

          {/* Log indicator */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 text-xs",
                  hasErrors
                    ? "text-[color:var(--error)]"
                    : "text-muted-foreground"
                )}
              >
                {hasErrors ? (
                  <AlertCircle className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                <span className="font-semibold">{errorCount}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>View Logs</TooltipContent>
          </Tooltip>

          {/* Download */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Download className="size-[18px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download PDF</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
