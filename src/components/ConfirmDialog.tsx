import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default'
}) => {
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
    width: '400px',
    maxWidth: '90vw',
    border: '1px solid #404040',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    animation: 'fadeIn 0.2s ease-out'
  };

  const headerStyle: React.CSSProperties = {
    padding: '16px 20px',
    borderBottom: '1px solid #404040',
    backgroundColor: '#2d2d30',
    borderRadius: '8px 8px 0 0'
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    color: '#4fc3f7',
    fontSize: '1.1em',
    fontWeight: 600
  };

  const contentStyle: React.CSSProperties = {
    padding: '20px',
    color: '#cccccc',
    lineHeight: '1.5'
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
    backgroundColor: variant === 'danger' ? '#f44747' : '#007acc',
    color: '#ffffff'
  };

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>{title}</h3>
        </div>
        <div style={contentStyle}>
          {message}
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
            onClick={onConfirm}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.backgroundColor = variant === 'danger' ? '#d73a49' : '#106ebe';
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.backgroundColor = variant === 'danger' ? '#f44747' : '#007acc';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};