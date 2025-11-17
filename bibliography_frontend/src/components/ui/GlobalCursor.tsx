import React from 'react';

export const GlobalCursor: React.FC = () => {
  const cursorElementRef = React.useRef<HTMLDivElement | null>(null);
  const lastPointerPosRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafIdRef = React.useRef<number | null>(null);
  const [visible, setVisible] = React.useState(true);
  const [isWritingSurface, setIsWritingSurface] = React.useState(false);

  React.useEffect(() => {
    const updatePosition = () => {
      if (!cursorElementRef.current) return;
      const { x, y } = lastPointerPosRef.current;
      cursorElementRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      rafIdRef.current = null;
    };

    const scheduleUpdate = () => {
      if (rafIdRef.current == null) {
        rafIdRef.current = window.requestAnimationFrame(updatePosition);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
      scheduleUpdate();
    };
    const handleEnter = () => {
      setVisible(true);
    };
    const handleLeave = () => {
      setVisible(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mouseenter', handleEnter, { passive: true });
    window.addEventListener('mouseleave', handleLeave, { passive: true });

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check for writing surface (text editing areas)
      setIsWritingSurface(target.closest('.writing-surface') !== null);
    };
    window.addEventListener('mouseover', handleOver, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mouseenter', handleEnter);
      window.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('mouseover', handleOver);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Bibliography accent color: #04E39E
  const accentColor = '#04E39E';
  const accentGlow = 'rgba(4, 227, 158, 0.35)';

  return (
    <div
      ref={cursorElementRef}
      aria-hidden
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        transform: 'translate3d(0, 0, 0)',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        willChange: 'transform',
      }}
    >
      {isWritingSurface ? (
        // Writing Cursor - Neon green vertical line
        <div
          className="animate-pulse"
          style={{
            width: 2,
            height: 16,
            transform: 'translate(-1px, -8px)',
            background: accentColor,
            borderRadius: '1px',
            boxShadow: `0 0 8px ${accentColor}, 0 0 4px ${accentColor}`,
          }}
        />
      ) : (
        // Neon green rounded triangular cursor
        <svg
          aria-hidden
          height={22}
          viewBox="0 0 22 22"
          width={22}
          style={{
            transform: 'translate(-9px, -9px)', // keep pointer tip under the mouse
            display: 'block',
          }}
        >
          {/* Outer stroke (glow) */}
          <path
            d="M5 5 L17 9 L10 17 Z"
            fill="none"
            stroke={accentGlow}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={4}
          />
          {/* Core stroke */}
          <path
            d="M5 5 L17 9 L10 17 Z"
            fill="none"
            stroke={accentColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      )}
    </div>
  );
};

export default GlobalCursor;
