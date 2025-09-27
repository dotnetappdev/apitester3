import React, { useState, useEffect } from 'react';

interface FileBrowserDialogProps {
  isOpen: boolean;
  title: string;
  currentPath: string;
  onConfirm: (path: string) => void;
  onCancel: () => void;
  mode?: 'file' | 'folder';
  fileExtensions?: string[];
}

export const FileBrowserDialog: React.FC<FileBrowserDialogProps> = ({
  isOpen,
  title,
  currentPath,
  onConfirm,
  onCancel,
  mode = 'file',
  fileExtensions = []
}) => {
  const [path, setPath] = useState(currentPath);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPath(currentPath);
      setError(null);
    }
  }, [isOpen, currentPath]);

  const handleSubmit = () => {
    if (!path.trim()) {
      setError('Please enter a valid path');
      return;
    }

    // Basic validation
    if (mode === 'file' && fileExtensions.length > 0) {
      const hasValidExtension = fileExtensions.some(ext => 
        path.toLowerCase().endsWith(ext.toLowerCase())
      );
      if (!hasValidExtension) {
        setError(`File must have one of these extensions: ${fileExtensions.join(', ')}`);
        return;
      }
    }

    onConfirm(path.trim());
  };

  const handleBrowse = () => {
    // In a real Electron app, this would use the native file dialog
    // For now, we'll show common paths as suggestions
    const commonPaths = [
      './database.db',
      './data/apitester.db',
      './apitester3.db',
      '~/apitester3/database.db', // Cross-platform home directory
      '~/Documents/apitester3/database.db'
    ];
    
    const selectedPath = prompt(`Enter path or select from common locations:\n\n${commonPaths.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nEnter a number (1-${commonPaths.length}) or custom path:`, path);
    
    if (selectedPath !== null) {
      const numSelection = parseInt(selectedPath);
      if (!isNaN(numSelection) && numSelection >= 1 && numSelection <= commonPaths.length) {
        setPath(commonPaths[numSelection - 1]);
      } else if (selectedPath.trim()) {
        setPath(selectedPath.trim());
      }
    }
  };

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(3px)'
  };

  const dialogStyle: React.CSSProperties = {
    backgroundColor: '#252526',
    borderRadius: '8px',
    width: '500px',
    maxWidth: '90vw',
    border: '1px solid #404040',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    animation: 'fadeIn 0.2s ease-out'
  };

  const headerStyle: React.CSSProperties = {
    padding: '16px 20px',
    borderBottom: '1px solid #404040',
    backgroundColor: '#2d2d30',
    borderRadius: '8px 8px 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    color: '#4fc3f7',
    fontSize: '1.1em',
    fontWeight: 600
  };

  const contentStyle: React.CSSProperties = {
    padding: '20px',
    color: '#cccccc'
  };

  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px'
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '10px 12px',
    border: error ? '1px solid #f44747' : '1px solid #6c6c6c',
    borderRadius: '4px',
    backgroundColor: '#3c3c3c',
    color: '#cccccc',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  };

  const browseButtonStyle: React.CSSProperties = {
    padding: '10px 16px',
    border: '1px solid #6c6c6c',
    borderRadius: '4px',
    backgroundColor: '#3c3c3c',
    color: '#cccccc',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const hintStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#969696',
    marginBottom: '8px',
    lineHeight: '1.4'
  };

  const errorStyle: React.CSSProperties = {
    marginTop: '8px',
    color: '#f44747',
    fontSize: '12px'
  };

  const footerStyle: React.CSSProperties = {
    padding: '16px 20px',
    borderTop: '1px solid #404040',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    backgroundColor: '#2d2d30',
    borderRadius: '0 0 8px 8px'
  };

  const buttonBaseStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '80px'
  };

  const cancelButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#3c3c3c',
    color: '#cccccc',
    border: '1px solid #6c6c6c'
  };

  const confirmButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: path.trim() ? '#007acc' : '#4a4a4a',
    color: path.trim() ? '#ffffff' : '#969696',
    cursor: path.trim() ? 'pointer' : 'not-allowed'
  };

  const iconStyle: React.CSSProperties = {
    color: '#4fc3f7',
    fontSize: '20px'
  };

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={iconStyle}>📁</div>
          <h3 style={titleStyle}>{title}</h3>
        </div>
        <div style={contentStyle}>
          <div style={hintStyle}>
            {mode === 'file' 
              ? `Select or enter the path to the ${fileExtensions.length > 0 ? fileExtensions.join('/') + ' ' : ''}file:`
              : 'Select or enter the path to the folder:'
            }
          </div>
          <div style={inputContainerStyle}>
            <input
              type="text"
              value={path}
              onChange={e => {
                setPath(e.target.value);
                if (error) setError(null);
              }}
              placeholder={mode === 'file' ? 'Enter file path...' : 'Enter folder path...'}
              style={inputStyle}
              onFocus={e => {
                (e.target as HTMLElement).style.borderColor = '#007acc';
              }}
              onBlur={e => {
                (e.target as HTMLElement).style.borderColor = error ? '#f44747' : '#6c6c6c';
              }}
            />
            <button
              style={browseButtonStyle}
              onClick={handleBrowse}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.backgroundColor = '#4a4a4a';
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.backgroundColor = '#3c3c3c';
              }}
            >
              Browse
            </button>
          </div>
          {error && <div style={errorStyle}>{error}</div>}
        </div>
        <div style={footerStyle}>
          <button
            style={cancelButtonStyle}
            onClick={onCancel}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.backgroundColor = '#4a4a4a';
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.backgroundColor = '#3c3c3c';
            }}
          >
            Cancel
          </button>
          <button
            style={confirmButtonStyle}
            onClick={handleSubmit}
            disabled={!path.trim()}
            onMouseEnter={e => {
              if (path.trim()) {
                (e.target as HTMLElement).style.backgroundColor = '#106ebe';
              }
            }}
            onMouseLeave={e => {
              if (path.trim()) {
                (e.target as HTMLElement).style.backgroundColor = '#007acc';
              }
            }}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
};