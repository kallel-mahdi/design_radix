import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Undo2,
  Redo2,
  Link,
  Image,
  MessageSquareQuote,
  Table,
  Search,
} from "lucide-react"

export function EditorToolbar() {
  return (
    <TooltipProvider>
      <div className="flex h-11 shrink-0 items-center justify-between px-4">
        <div className="flex items-center gap-1">
          {/* Undo/Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Undo2 className="size-[18px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Redo2 className="size-[18px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-2 h-6" />

          {/* Format toggles */}
          <ToggleGroup type="multiple" variant="outline">
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="bold" size="icon-sm">
                  <span className="text-sm font-bold">B</span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="italic" size="icon-sm">
                  <span className="text-sm italic">I</span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>
          </ToggleGroup>

          <Separator orientation="vertical" className="mx-2 h-6" />

          {/* Insert buttons */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Link className="size-[18px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Link</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Image className="size-[18px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Image</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MessageSquareQuote className="size-[18px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Citation</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Table className="size-[18px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Table</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Search className="size-[18px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Find & Replace</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
