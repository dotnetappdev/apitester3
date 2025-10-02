import React, { useEffect, useRef, useState } from 'react';

interface DockablePanelProps {
  id?: string;
  title?: string;
  defaultDock?: 'bottom' | 'right' | 'left' | 'floating';
  floating?: boolean;
  onClose?: () => void;
  onDockChange?: (mode: 'bottom' | 'right' | 'left' | 'floating') => void;
  children?: React.ReactNode;
}

export const DockablePanel: React.FC<DockablePanelProps> = ({
  id,
  title,
  defaultDock = 'bottom',
  floating = false,
  onClose,
  onDockChange,
  children
}) => {
  const [mode, setMode] = useState<'bottom' | 'right' | 'left' | 'floating'>(floating ? 'floating' : defaultDock);
  const [pos, setPos] = useState({ x: 120, y: 120 });
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

  const handleDock = (newMode: 'bottom' | 'right' | 'left' | 'floating') => {
    setMode(newMode);
    onDockChange?.(newMode);
  };

  return (
    <div
      ref={rootRef}
      className={`dock-panel ${mode === 'floating' ? 'floating' : 'docked-' + mode} ${mode === 'floating' ? 'floating-positioned' : ''}`}
      data-x={pos.x}
      data-y={pos.y}
      data-z={zIndex}
      onMouseDown={bringToFront}
      id={id}
    >
      <div className="dock-panel-header" onMouseDown={handleMouseDown} role="toolbar" aria-label={title || 'Panel'}>
        <div className="dock-panel-title">{title}</div>
        <div className="dock-panel-actions">
          <button className="dock-btn" onClick={() => handleDock('floating')} title="Float">⤢</button>
          <button className="dock-btn" onClick={() => handleDock('bottom')} title="Dock bottom">▦</button>
          <button className="dock-btn" onClick={() => handleDock('right')} title="Dock right">▣</button>
          <button className="dock-btn" onClick={onClose} title="Close">✕</button>
        </div>
      </div>
      <div className="dock-panel-body">
        {children}
      </div>
    </div>
  );
};

export default DockablePanel;
