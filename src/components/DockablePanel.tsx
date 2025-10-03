import React, { useEffect, useRef, useState } from 'react';

interface DockablePanelProps {
  id?: string;
  title?: string;
  defaultDock?: 'bottom' | 'right' | 'left' | 'top' | 'floating';
  floating?: boolean;
  onClose?: () => void;
  onDockChange?: (mode: 'bottom' | 'right' | 'left' | 'top' | 'floating') => void;
  children?: React.ReactNode;
  stackable?: boolean;
  stackIndex?: number;
  onStackOrderChange?: (newIndex: number) => void;
  hideDockingControls?: boolean;
}

export const DockablePanel: React.FC<DockablePanelProps> = ({
  id,
  title,
  defaultDock = 'bottom',
  floating = false,
  onClose,
  onDockChange,
  children,
  stackable = false,
  stackIndex = 0,
  onStackOrderChange,
  hideDockingControls = false
}) => {
  const [mode, setMode] = useState<'bottom' | 'right' | 'left' | 'top' | 'floating'>(floating ? 'floating' : defaultDock);
  const [pos, setPos] = useState({ x: 120, y: 120 });
  const [size] = useState({ width: 400, height: 300 });
  const [zIndex, setZIndex] = useState(100);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, origX: 0, origY: 0 });

  useEffect(() => {
    setMode(floating ? 'floating' : defaultDock);
  }, [floating, defaultDock]);

  const bringToFront = () => setZIndex((z) => z + 1 + Math.floor(Math.random() * 5));

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'floating') return;
    draggingRef.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, origX: pos.x, origY: pos.y };
    bringToFront();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPos({ x: dragStart.current.origX + dx, y: dragStart.current.origY + dy });
  };

  const handleMouseUp = () => {
    draggingRef.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleDock = (newMode: 'bottom' | 'right' | 'left' | 'top' | 'floating') => {
    setMode(newMode);
    onDockChange?.(newMode);
  };

  // Imperatively apply floating position/size/zIndex to the root element to avoid inline JSX styles
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    if (mode === 'floating') {
      el.style.position = 'fixed';
      el.style.left = `${pos.x}px`;
      el.style.top = `${pos.y}px`;
      el.style.width = `${size.width}px`;
      el.style.height = `${size.height}px`;
      el.style.zIndex = String(zIndex);
    } else {
      // Clear floating-specific inline styles when docked
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      el.style.width = '';
      el.style.height = '';
      el.style.zIndex = '';
    }
  }, [mode, pos, size, zIndex]);

  // floatingStyle removed; positioning applied via ref in useEffect

  return (
    <div
      ref={rootRef}
      className={`dock-panel ${mode === 'floating' ? 'floating' : 'docked-' + mode} ${stackable ? 'stackable' : ''}`}
      onMouseDown={bringToFront}
      id={id}
      data-stack-index={stackIndex}
    >
      <div className="dock-panel-header" onMouseDown={handleMouseDown} role="toolbar" aria-label={title || 'Panel'}>
        <div className="dock-panel-title">{title}</div>
        <div className="dock-panel-actions">
          {!hideDockingControls && (
            <>
              <button className="dock-btn" onClick={() => handleDock('floating')} title="Float Panel">⤢</button>
              <button className="dock-btn" onClick={() => handleDock('top')} title="Dock Top">▀</button>
              <button className="dock-btn" onClick={() => handleDock('left')} title="Dock Left">▌</button>
              <button className="dock-btn" onClick={() => handleDock('bottom')} title="Dock Bottom">▄</button>
              <button className="dock-btn" onClick={() => handleDock('right')} title="Dock Right">▐</button>
            </>
          )}
          {onClose && <button className="dock-btn" onClick={onClose} title="Close">✕</button>}
        </div>
      </div>
      <div className="dock-panel-body fill-width">
        {children}
      </div>
      
      {/* styles moved to src/styles/index.css */}
    </div>
  );
};

export default DockablePanel;
