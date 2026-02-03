import type { ReactNode } from "react"
import { ActivityBar, type NavigationItem, type AppSwitcherConfig } from "./ActivityBar"

interface SidebarConfig {
  content: ReactNode
  visible: boolean
}

interface AppLayoutProps {
  activityBarItems: NavigationItem[]
  onLogoClick: () => void
  sidebar?: SidebarConfig
  children: ReactNode
  dataModule?: "bibliography" | "manuscripts" | "discover"
  appSwitcher?: AppSwitcherConfig
}

export function AppLayout({
  activityBarItems,
  onLogoClick,
  sidebar,
  children,
  dataModule,
  appSwitcher,
}: AppLayoutProps) {
  return (
    <div className="platform-wrapper" data-module={dataModule}>
      <ActivityBar
        items={activityBarItems}
        onLogoClick={onLogoClick}
        appSwitcher={appSwitcher}
      />

      {sidebar?.visible && sidebar.content}

      <div className="platform-content">
        {children}
      </div>
    </div>
  )
}

export type { NavigationItem, SidebarConfig, AppLayoutProps }
