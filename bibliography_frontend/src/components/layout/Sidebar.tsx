import { useState, useRef, useEffect } from 'react';
import { cn } from '../../common/utils';

interface SidebarProps {
  width: number;
  onWidthChange: (width: number) => void;
  className?: string;
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  width,
  onWidthChange,
  children,
  className,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      // 64 = ActivityBar width
      const newWidth = Math.max(200, Math.min(500, e.clientX - 64));
      onWidthChange(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, onWidthChange]);

  return (
    <aside
      ref={sidebarRef}
      className={cn('bg-bg-surface border-r border-border relative flex flex-col', className)}
      style={{ width: `${width}px` }}
      aria-label="Sidebar"
    >
      {children}
      {/* Resize handle */}
      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 w-1 hover:w-2 hover:bg-accent cursor-col-resize transition-all',
          isResizing && 'w-2 bg-accent'
        )}
        onMouseDown={handleMouseDown}
        aria-label="Resize sidebar"
      />
    </aside>
  );
};
