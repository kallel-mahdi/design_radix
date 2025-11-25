import { useState } from 'react';
import { Menu } from '@headlessui/react';
import { CogIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/common/utils';
import { SettingsModal } from './SettingsModal';

type SettingsTab = 'general' | 'project-defaults' | 'shortcuts' | 'storage';

export const SettingsMenu = () => {
  const [selectedTab, setSelectedTab] = useState<SettingsTab | null>(null);

  const menuItems: Array<{ id: SettingsTab; label: string }> = [
    { id: 'general', label: 'General' },
    { id: 'project-defaults', label: 'Project Defaults' },
    { id: 'shortcuts', label: 'Shortcuts' },
    { id: 'storage', label: 'Storage/Sync' },
  ];

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button
          className={cn(
            'inline-flex items-center gap-2 px-3 py-2',
            'rounded-md bg-app-surface hover:bg-app-surface-hover',
            'border border-app-border transition-colors',
            'text-app-text-secondary hover:text-app-text',
            'font-medium text-sm'
          )}
          aria-label="Settings"
        >
          <CogIcon className="w-4 h-4" />
          <span>Settings</span>
          <ChevronDownIcon className="w-4 h-4 opacity-70" />
        </Menu.Button>

        <Menu.Items
          className={cn(
            'absolute right-0 mt-2 w-48 rounded-md shadow-lg',
            'bg-app-surface border border-app-border',
            'ring-1 ring-black ring-opacity-5',
            'z-50 focus:outline-none'
          )}
        >
          <div className="py-1">
            {menuItems.map((item) => (
              <Menu.Item key={item.id}>
                {({ active }) => (
                  <button
                    onClick={() => setSelectedTab(item.id)}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm transition-colors',
                      active ? 'bg-app-accent/20 text-app-accent' : 'text-app-text hover:bg-app-surface-hover'
                    )}
                  >
                    {item.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Menu>

      {selectedTab && (
        <SettingsModal tab={selectedTab} onClose={() => setSelectedTab(null)} />
      )}
    </>
  );
};
