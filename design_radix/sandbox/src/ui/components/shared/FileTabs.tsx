import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, FileText, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Types
export interface FileTab {
  id: string
  name: string
  icon?: LucideIcon
  isDirty?: boolean
}

export interface FileTabsProps {
  tabs: FileTab[]
  activeId: string
  onSelect: (id: string) => void
  onClose?: (id: string) => void
  className?: string
}

export function FileTabs({
  tabs,
  activeId,
  onSelect,
  onClose,
  className,
}: FileTabsProps) {
  return (
    <div
      className={cn(
        "flex h-11 shrink-0 items-stretch border-b bg-[color:var(--bg-tertiary)] px-4",
        className
      )}
    >
      <Tabs value={activeId} onValueChange={onSelect} className="h-full">
        <TabsList variant="line" className="h-full gap-6 bg-transparent p-0">
          {tabs.map((tab) => {
            const Icon = tab.icon || FileText
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="group h-full gap-2 px-3 text-sm data-[state=active]:text-[color:var(--accent)] data-[state=active]:after:bg-[color:var(--accent)]"
              >
                <Icon className="size-4" />
                <span>
                  {tab.name}
                  {tab.isDirty && <span className="ml-0.5">•</span>}
                </span>
                {onClose && (
                  <span
                    role="button"
                    tabIndex={0}
                    className="ml-1 flex size-5 items-center justify-center rounded-sm opacity-0 hover:bg-[color:var(--bg-hover)] group-hover:opacity-100 group-data-[state=active]:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      onClose(tab.id)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        e.stopPropagation()
                        onClose(tab.id)
                      }
                    }}
                  >
                    <X className="size-3" />
                  </span>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>
    </div>
  )
}
