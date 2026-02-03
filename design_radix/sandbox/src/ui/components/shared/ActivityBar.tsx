import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Box, Settings, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Types
export interface NavigationItem {
  id: string
  icon: LucideIcon
  label: string
  selected?: boolean
  onClick?: () => void
}

// Legacy type alias for backwards compatibility
export type ActivityItem = NavigationItem

export interface AppSwitcherConfig {
  items: NavigationItem[]
  activeId: string
  onSelect?: (id: string) => void
}

// New interface with per-item callbacks and logo click
export interface ActivityBarProps {
  items: NavigationItem[]
  onLogoClick?: () => void
  appSwitcher?: AppSwitcherConfig
  // Legacy props for backwards compatibility
  activeId?: string
  onSelect?: (id: string) => void
}

export function ActivityBar({
  items,
  onLogoClick,
  appSwitcher,
  // Legacy props
  activeId,
  onSelect,
}: ActivityBarProps) {
  const [logoExpanded, setLogoExpanded] = useState(false)

  // Determine if an item is selected (supports both old and new patterns)
  const isItemSelected = (item: NavigationItem) => {
    if (item.selected !== undefined) return item.selected
    if (activeId !== undefined) return item.id === activeId
    return false
  }

  // Handle item click (supports both old and new patterns)
  const handleItemClick = (item: NavigationItem) => {
    if (item.onClick) {
      item.onClick()
    } else if (onSelect) {
      onSelect(item.id)
    }
  }

  return (
    <TooltipProvider>
      <aside className="flex w-14 shrink-0 flex-col items-center border-r bg-muted/30">
        {/* Logo Section */}
        {appSwitcher ? (
          // Expandable app switcher (Editor mode)
          <Collapsible open={logoExpanded} onOpenChange={setLogoExpanded}>
            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  "flex h-11 w-full items-center justify-center border-b transition-colors",
                  logoExpanded
                    ? "bg-[color:var(--selection)]"
                    : "hover:bg-[color:var(--bg-hover)]"
                )}
              >
                <div className="flex size-11 items-center justify-center rounded-lg text-[color:var(--accent)]">
                  <Box className="size-[22px]" />
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="w-full overflow-hidden border-b border-[color:var(--border-subtle)] bg-[color:var(--bg-secondary)]">
              <div className="flex flex-col items-center gap-1 py-2">
                {appSwitcher.items.map((app) => (
                  <Tooltip key={app.id}>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          "flex size-11 items-center justify-center rounded-lg transition-colors",
                          app.id === appSwitcher.activeId
                            ? "bg-[color:var(--selection)] text-[color:var(--accent)]"
                            : "text-muted-foreground hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-secondary)]"
                        )}
                        onClick={() => appSwitcher.onSelect?.(app.id)}
                      >
                        <app.icon className="size-7" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{app.label}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          // Simple logo (Bibliography mode) - clickable to navigate home
          <div className="flex h-11 w-full items-center justify-center border-b">
            <button
              className="flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-secondary)]"
              onClick={onLogoClick}
            >
              <Box className="size-[22px]" />
            </button>
          </div>
        )}

        {/* Activity Icons */}
        <nav className="flex flex-1 flex-col items-center gap-1 py-3">
          {items.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "flex size-11 items-center justify-center rounded-lg transition-colors",
                    isItemSelected(item)
                      ? "bg-[color:var(--selection)] text-[color:var(--accent)]"
                      : "text-muted-foreground hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-secondary)]"
                  )}
                >
                  <item.icon className="size-7" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>

        {/* Settings at bottom */}
        <div className="pb-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-secondary)]"
              >
                <Settings className="size-7" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}
