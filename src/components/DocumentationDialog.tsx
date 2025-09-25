import React from 'react';

interface DocumentationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'overview' | 'unit-testing' | null;
}

export const DocumentationDialog: React.FC<DocumentationDialogProps> = ({
  isOpen,
  onClose,
  documentType
}) => {
  if (!isOpen || !documentType) return null;

  const getDocumentPath = (type: string) => {
    // Serve HTML files from the public docs directory
    return `/docs/${type}.html`;
  };

  const getDocumentTitle = (type: string) => {
    switch (type) {
      case 'overview':
        return 'Application Overview';
      case 'unit-testing':
        return 'Unit Testing Documentation';
      default:
        return 'Documentation';
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Style definitions
  const dialogOverlayStyle: React.CSSProperties = {
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
    width: '90vw',
    height: '90vh',
    maxWidth: '1400px',
    maxHeight: '1000px',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #404040',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #404040',
    backgroundColor: '#2d2d30',
    borderRadius: '8px 8px 0 0'
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    color: '#4fc3f7',
    fontSize: '1.2em',
    fontWeight: 600
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#d4d4d4',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: 0,
    overflow: 'hidden'
  };

  const iframeStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: 'none',
    backgroundColor: '#1e1e1e'
  };

  const footerStyle: React.CSSProperties = {
    padding: '16px 20px',
    borderTop: '1px solid #404040',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: '#2d2d30',
    borderRadius: '0 0 8px 8px'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    backgroundColor: '#404040',
    color: '#d4d4d4'
  };

  return (
    <div style={dialogOverlayStyle} onClick={handleOverlayClick}>
      <div style={dialogStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>{getDocumentTitle(documentType)}</h2>
          <button 
            style={closeButtonStyle}
            onClick={onClose}
            aria-label="Close documentation"
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#404040';
              (e.target as HTMLElement).style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'transparent';
              (e.target as HTMLElement).style.color = '#d4d4d4';
            }}
          >
            ×
          </button>
        </div>
        <div style={contentStyle}>
          <iframe
            src={getDocumentPath(documentType)}
            title={getDocumentTitle(documentType)}
            style={iframeStyle}
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
        <div style={footerStyle}>
          <button 
            style={buttonStyle} 
            onClick={onClose}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#505050';
              (e.target as HTMLElement).style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#404040';
              (e.target as HTMLElement).style.color = '#d4d4d4';
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};