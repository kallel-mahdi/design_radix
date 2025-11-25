import React, { useEffect, useRef } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { cn } from '@/common/utils';

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

export interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  items: ContextMenuItem[];
}

/**
 * Reusable context menu component for right-click actions.
 * Positions itself near the click location and closes on outside click or Escape.
 */
export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  onClose,
  items,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Small delay to prevent immediate closing from the right-click event
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Calculate position to keep menu in viewport
  const getAdjustedPosition = () => {
    const menuWidth = 192; // w-48 = 12rem = 192px
    const menuHeight = items.length * 36 + 8; // Approximate height per item + padding
    const padding = 8;

    let x = position.x;
    let y = position.y;

    // Keep within horizontal bounds
    if (x + menuWidth > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth - padding;
    }

    // Keep within vertical bounds
    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }

    return { x: Math.max(padding, x), y: Math.max(padding, y) };
  };

  if (!isOpen) return null;

  const adjustedPosition = getAdjustedPosition();

  return (
    <div
      ref={menuRef}
      className="fixed z-50"
      style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
    >
      <Menu as="div" className="relative">
        <Transition
          show={isOpen}
          as={React.Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            static
            className="w-48 origin-top-left rounded-md border border-app-border bg-app-surface shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <div className="py-1">
              {items.map((item, index) => (
                <Menu.Item key={index} disabled={item.disabled}>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        item.onClick();
                        onClose();
                      }}
                      disabled={item.disabled}
                      className={cn(
                        'flex w-full items-center gap-2 px-4 py-2 text-sm',
                        active && 'bg-app-surface-hover',
                        item.variant === 'danger'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-app-text-primary',
                        item.disabled && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                      {item.label}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};
