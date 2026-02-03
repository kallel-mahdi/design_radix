/**
 * MockFileTabs - Reusable file tabs for landing page mockups
 *
 * Lightweight tabs without Radix dependencies for animation mockups.
 * Supports animated tab entry for "new tab" effects.
 */

import { FileText, type LucideIcon } from "lucide-react";

export interface MockTab {
  id: string;
  name: string;
  icon?: LucideIcon;
  isNew?: boolean; // Triggers slide-in animation
}

interface MockFileTabsProps {
  tabs: MockTab[];
  activeId: string;
  accentVar?: string;
}

export function MockFileTabs({
  tabs,
  activeId,
  accentVar = "--biblio",
}: MockFileTabsProps) {
  return (
    <div
      className="h-11 flex items-stretch px-3 gap-4"
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon || FileText;
        const isActive = tab.id === activeId;

        return (
          <div
            key={tab.id}
            className={`flex items-center gap-1.5 px-2 text-[11px] font-medium ${
              tab.isNew ? "animate-tab-slide-in" : ""
            }`}
            style={{
              color: isActive ? `var(${accentVar})` : "var(--text-muted)",
              borderBottom: isActive ? `2px solid var(${accentVar})` : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            <Icon className="size-3.5" />
            <span className="truncate max-w-[180px]">{tab.name}</span>
          </div>
        );
      })}
    </div>
  );
}
