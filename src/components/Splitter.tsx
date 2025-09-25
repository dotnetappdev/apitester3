import React, { useState, useCallback, useRef, useEffect } from 'react';

interface SplitterProps {
  split: 'vertical' | 'horizontal';
  primary?: 'first' | 'second';
  defaultSize?: number | string;
  minSize?: number;
  maxSize?: number;
  children: [React.ReactNode, React.ReactNode];
  onSizeChange?: (size: number) => void;
  disabled?: boolean;
}

export const Splitter: React.FC<SplitterProps> = ({
  split,
  primary = 'first',
  defaultSize = '50%',
  minSize = 50,
  maxSize,
  children,
  onSizeChange,
  disabled = false
}) => {
  const [size, setSize] = useState<number>(
    typeof defaultSize === 'string' && defaultSize.endsWith('%')
      ? parseFloat(defaultSize)
      : typeof defaultSize === 'number'
      ? defaultSize
      : 50
  );
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitterRef = useRef<HTMLDivElement>(null);

  const getContainerSize = useCallback(() => {
    if (!containerRef.current) return 0;
    return split === 'vertical' 
      ? containerRef.current.clientHeight
      : containerRef.current.clientWidth;
  }, [split]);

  const getSizeInPixels = useCallback((percentage: number) => {
    return (getContainerSize() * percentage) / 100;
  }, [getContainerSize]);

  const getSizeInPercentage = useCallback((pixels: number) => {
    const containerSize = getContainerSize();
    return containerSize > 0 ? (pixels / containerSize) * 100 : 50;
  }, [getContainerSize]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    setIsDragging(true);
    
    const startPosition = split === 'vertical' ? event.clientY : event.clientX;
    const startSize = getSizeInPixels(size);
    
    const handleMouseMove = (e: MouseEvent) => {
      const currentPosition = split === 'vertical' ? e.clientY : e.clientX;
      const delta = currentPosition - startPosition;
      
      let newSize = primary === 'first' ? startSize + delta : startSize - delta;
      
      // Apply constraints
      if (newSize < minSize) newSize = minSize;
      if (maxSize && newSize > maxSize) newSize = maxSize;
      
      const newPercentage = getSizeInPercentage(newSize);
      if (newPercentage >= 5 && newPercentage <= 95) {
        setSize(newPercentage);
        onSizeChange?.(newPercentage);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [disabled, split, size, minSize, maxSize, primary, getSizeInPixels, getSizeInPercentage, onSizeChange]);

  useEffect(() => {
    if (typeof defaultSize === 'number') {
      const percentage = getSizeInPercentage(defaultSize);
      setSize(percentage);
    }
  }, [defaultSize, getSizeInPercentage]);

  const firstPaneStyle: React.CSSProperties = {
    [split === 'vertical' ? 'height' : 'width']: `${primary === 'first' ? size : 100 - size}%`,
    overflow: 'hidden'
  };

  const secondPaneStyle: React.CSSProperties = {
    [split === 'vertical' ? 'height' : 'width']: `${primary === 'first' ? 100 - size : size}%`,
    overflow: 'hidden'
  };

  return (
    <div
      ref={containerRef}
      className={`splitter-layout ${split}`}
      style={{ width: '100%', height: '100%' }}
    >
      <div style={firstPaneStyle}>
        {children[0]}
      </div>
      
      <div
        ref={splitterRef}
        className={`layout-splitter ${split} ${disabled ? 'disabled' : ''} ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        style={{
          cursor: disabled ? 'not-allowed' : split === 'vertical' ? 'row-resize' : 'col-resize'
        }}
      />
      
      <div style={secondPaneStyle}>
        {children[1]}
      </div>
    </div>
  );
};