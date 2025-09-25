import React, { useState, useEffect, useRef } from 'react';

interface InputDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  icon?: React.ReactNode;
  validation?: (value: string) => string | null;
}

export const InputDialog: React.FC<InputDialogProps> = ({
  isOpen,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  confirmText = 'Create',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  icon,
  validation
}) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError(null);
      // Focus input after animation
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 200);
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = () => {
    if (validation) {
      const validationError = validation(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (error) {
      setError(null);
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
    width: '450px',
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

  const messageStyle: React.CSSProperties = {
    marginBottom: '16px',
    lineHeight: '1.5',
    color: '#cccccc'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: error ? '1px solid #f44747' : '1px solid #6c6c6c',
    borderRadius: '4px',
    backgroundColor: '#3c3c3c',
    color: '#cccccc',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease'
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
    backgroundColor: value.trim() ? '#007acc' : '#4a4a4a',
    color: value.trim() ? '#ffffff' : '#969696',
    cursor: value.trim() ? 'pointer' : 'not-allowed'
  };

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          {icon && <div style={{ color: '#4fc3f7', fontSize: '20px' }}>{icon}</div>}
          <h3 style={titleStyle}>{title}</h3>
        </div>
        <div style={contentStyle}>
          {message && <div style={messageStyle}>{message}</div>}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={inputStyle}
            onFocus={e => {
              (e.target as HTMLElement).style.borderColor = '#007acc';
            }}
            onBlur={e => {
              (e.target as HTMLElement).style.borderColor = error ? '#f44747' : '#6c6c6c';
            }}
          />
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
            {cancelText}
          </button>
          <button
            style={confirmButtonStyle}
            onClick={handleSubmit}
            disabled={!value.trim()}
            onMouseEnter={e => {
              if (value.trim()) {
                (e.target as HTMLElement).style.backgroundColor = '#106ebe';
              }
            }}
            onMouseLeave={e => {
              if (value.trim()) {
                (e.target as HTMLElement).style.backgroundColor = '#007acc';
              }
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};