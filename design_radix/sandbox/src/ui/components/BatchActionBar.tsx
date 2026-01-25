import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckSquare,
  Tag,
  FolderInput,
  Trash2,
  X,
  ChevronDown,
} from "lucide-react";

interface BatchActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onAddTag?: (tag: string) => void;
  onMoveTo?: (collection: string) => void;
  onDelete?: () => void;
}

const mockTags = [
  { id: "1", label: "Important", color: "red" },
  { id: "2", label: "To Read", color: "blue" },
  { id: "3", label: "Reviewed", color: "green" },
  { id: "4", label: "Needs Revision", color: "amber" },
];

const mockCollections = [
  { id: "1", name: "Offline RL" },
  { id: "2", name: "Exploration" },
  { id: "3", name: "To Read" },
  { id: "4", name: "Archive" },
];

export function BatchActionBar({
  selectedCount,
  onClearSelection,
  onAddTag,
  onMoveTo,
  onDelete,
}: BatchActionBarProps) {
  if (selectedCount < 2) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg shadow-lg">
        {/* Selection Count */}
        <div className="flex items-center gap-2 pr-3 border-r border-border">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {selectedCount} selected
          </span>
        </div>

        {/* Add Tag Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Tag className="h-4 w-4" />
              Add Tag
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {mockTags.map((tag) => (
              <DropdownMenuItem
                key={tag.id}
                onClick={() => onAddTag?.(tag.label)}
              >
                <div
                  className="h-2 w-2 rounded-full mr-2"
                  style={{
                    backgroundColor:
                      tag.color === "red"
                        ? "var(--red-9)"
                        : tag.color === "blue"
                        ? "var(--blue-9)"
                        : tag.color === "green"
                        ? "var(--green-9)"
                        : "var(--amber-9)",
                  }}
                />
                {tag.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Tag className="h-4 w-4 mr-2 opacity-50" />
              Create new tag...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Move To Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <FolderInput className="h-4 w-4" />
              Move to
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {mockCollections.map((collection) => (
              <DropdownMenuItem
                key={collection.id}
                onClick={() => onMoveTo?.(collection.name)}
              >
                <FolderInput className="h-4 w-4 mr-2 opacity-50" />
                {collection.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Clear Selection */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
