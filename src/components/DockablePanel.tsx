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
  onStackOrderChange
}) => {
  const [mode, setMode] = useState<'bottom' | 'right' | 'left' | 'top' | 'floating'>(floating ? 'floating' : defaultDock);
  const [pos, setPos] = useState({ x: 120, y: 120 });
  const [size, setSize] = useState({ width: 400, height: 300 });
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

  const floatingStyle = mode === 'floating' ? {
    left: `${pos.x}px`,
    top: `${pos.y}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    zIndex
  } : {};

  return (
    <div
      ref={rootRef}
      className={`dock-panel ${mode === 'floating' ? 'floating' : 'docked-' + mode} ${stackable ? 'stackable' : ''}`}
      style={floatingStyle}
      onMouseDown={bringToFront}
      id={id}
      data-stack-index={stackIndex}
    >
      <div className="dock-panel-header" onMouseDown={handleMouseDown} role="toolbar" aria-label={title || 'Panel'}>
        <div className="dock-panel-title">{title}</div>
        <div className="dock-panel-actions">
          <button className="dock-btn" onClick={() => handleDock('floating')} title="Float Panel">⤢</button>
          <button className="dock-btn" onClick={() => handleDock('top')} title="Dock Top">▀</button>
          <button className="dock-btn" onClick={() => handleDock('left')} title="Dock Left">▌</button>
          <button className="dock-btn" onClick={() => handleDock('bottom')} title="Dock Bottom">▄</button>
          <button className="dock-btn" onClick={() => handleDock('right')} title="Dock Right">▐</button>
          {onClose && <button className="dock-btn" onClick={onClose} title="Close">✕</button>}
        </div>
      </div>
      <div className="dock-panel-body">
        {children}
      </div>
      
      <style>{`
        .dock-panel {
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          overflow: hidden;
        }

        .dock-panel.floating {
          position: fixed;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          resize: both;
          overflow: auto;
          min-width: 300px;
          min-height: 200px;
        }

        .dock-panel.docked-top,
        .dock-panel.docked-bottom {
          width: 100%;
        }

        .dock-panel.docked-left,
        .dock-panel.docked-right {
          height: 100%;
        }

        .dock-panel.stackable {
          transition: transform 0.2s ease;
        }

        .dock-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-color);
          cursor: move;
          user-select: none;
        }

        .dock-panel.floating .dock-panel-header {
          cursor: move;
        }

        .dock-panel:not(.floating) .dock-panel-header {
          cursor: default;
        }

        .dock-panel-title {
          font-weight: 600;
          font-size: 13px;
          color: var(--text-primary);
        }

        .dock-panel-actions {
          display: flex;
          gap: 4px;
        }

        .dock-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 3px;
          font-size: 12px;
          transition: all 0.15s ease;
        }

        .dock-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .dock-panel-body {
          flex: 1;
          overflow: auto;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default DockablePanel;
