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
export interface ActivityItem {
  id: string
  icon: LucideIcon
  label: string
}

export interface AppSwitcherConfig {
  items: ActivityItem[]
  activeId: string
  onSelect?: (id: string) => void
}

export interface ActivityBarProps {
  items: ActivityItem[]
  activeId: string
  onSelect: (id: string) => void
  appSwitcher?: AppSwitcherConfig
}

export function ActivityBar({
  items,
  activeId,
  onSelect,
  appSwitcher,
}: ActivityBarProps) {
  const [logoExpanded, setLogoExpanded] = useState(false)

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
          // Simple logo (Bibliography mode)
          <div className="flex h-11 w-full items-center justify-center border-b">
            <button className="flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-secondary)]">
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
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    "flex size-11 items-center justify-center rounded-lg transition-colors",
                    activeId === item.id
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
