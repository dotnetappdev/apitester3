import React from 'react';
import { join } from 'path';

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

  return (
    <div className="dialog-overlay" onClick={handleOverlayClick}>
      <div className="documentation-dialog">
        <div className="dialog-header">
          <h2>{getDocumentTitle(documentType)}</h2>
          <button 
            className="dialog-close-btn"
            onClick={onClose}
            aria-label="Close documentation"
          >
            ×
          </button>
        </div>
        <div className="dialog-content">
          <iframe
            src={getDocumentPath(documentType)}
            title={getDocumentTitle(documentType)}
            className="documentation-iframe"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(3px);
        }
        
        .documentation-dialog {
          background-color: #252526;
          border-radius: 8px;
          width: 90vw;
          height: 90vh;
          max-width: 1400px;
          max-height: 1000px;
          display: flex;
          flex-direction: column;
          border: 1px solid #404040;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        
        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #404040;
          background-color: #2d2d30;
          border-radius: 8px 8px 0 0;
        }
        
        .dialog-header h2 {
          margin: 0;
          color: #4fc3f7;
          font-size: 1.2em;
          font-weight: 600;
        }
        
        .dialog-close-btn {
          background: none;
          border: none;
          color: #d4d4d4;
          font-size: 24px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .dialog-close-btn:hover {
          background-color: #404040;
          color: #ffffff;
        }
        
        .dialog-content {
          flex: 1;
          padding: 0;
          overflow: hidden;
        }
        
        .documentation-iframe {
          width: 100%;
          height: 100%;
          border: none;
          background-color: #1e1e1e;
        }
        
        .dialog-footer {
          padding: 16px 20px;
          border-top: 1px solid #404040;
          display: flex;
          justify-content: flex-end;
          background-color: #2d2d30;
          border-radius: 0 0 8px 8px;
        }
        
        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .btn-secondary {
          background-color: #404040;
          color: #d4d4d4;
        }
        
        .btn-secondary:hover {
          background-color: #505050;
          color: #ffffff;
        }
        
        @media (max-width: 768px) {
          .documentation-dialog {
            width: 95vw;
            height: 95vh;
          }
          
          .dialog-header {
            padding: 12px 16px;
          }
          
          .dialog-header h2 {
            font-size: 1.1em;
          }
          
          .dialog-footer {
            padding: 12px 16px;
          }
        }
      `}</style>
    </div>
  );
};