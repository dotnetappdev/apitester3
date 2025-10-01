import React from 'react';
import { APP_INFO, GITHUB_INFO, LINKS } from '../constants/appInfo';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleLinkClick = (url: string) => {
    if (typeof window !== 'undefined' && window.electron) {
      window.electron.openExternal(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content about-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>About {APP_INFO.name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="about-logo">
            <div className="app-icon">🚀</div>
            <h3>{APP_INFO.name}</h3>
            <p className="version">Version {APP_INFO.version}</p>
          </div>

          <div className="about-description">
            <p>{APP_INFO.description}</p>
          </div>

          <div className="about-section">
            <h4>📚 Resources</h4>
            <div className="about-links">
              <button 
                className="link-button"
                onClick={() => handleLinkClick(GITHUB_INFO.url)}
              >
                <span>🔗</span> GitHub Repository
              </button>
              <button 
                className="link-button"
                onClick={() => handleLinkClick(LINKS.documentation)}
              >
                <span>📖</span> Documentation
              </button>
              <button 
                className="link-button"
                onClick={() => handleLinkClick(LINKS.releases)}
              >
                <span>📦</span> Releases & Changelog
              </button>
              <button 
                className="link-button"
                onClick={() => handleLinkClick(GITHUB_INFO.discussionsUrl)}
              >
                <span>💬</span> Discussions
              </button>
            </div>
          </div>

          <div className="about-section">
            <h4>ℹ️ Information</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Author:</span>
                <span className="info-value">{APP_INFO.author}</span>
              </div>
              <div className="info-item">
                <span className="info-label">License:</span>
                <span className="info-value">{APP_INFO.license}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Repository:</span>
                <span className="info-value">{GITHUB_INFO.repository}</span>
              </div>
            </div>
          </div>

          <div className="about-footer">
            <p>Built with ❤️ for developers</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <style>{`
        .about-dialog {
          max-width: 500px;
          width: 90%;
        }

        .about-logo {
          text-align: center;
          padding: 20px 0;
        }

        .app-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .about-logo h3 {
          margin: 0;
          font-size: 24px;
          color: var(--text-primary);
        }

        .version {
          margin: 8px 0 0 0;
          color: var(--text-muted);
          font-size: 14px;
        }

        .about-description {
          text-align: center;
          padding: 16px;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        .about-section {
          padding: 20px 0;
          border-bottom: 1px solid var(--border-color);
        }

        .about-section:last-of-type {
          border-bottom: none;
        }

        .about-section h4 {
          margin: 0 0 16px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .about-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .link-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          text-align: left;
        }

        .link-button:hover {
          background: var(--bg-hover);
          border-color: var(--accent-color);
        }

        .link-button span {
          font-size: 16px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border-radius: 4px;
          font-size: 13px;
        }

        .info-label {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .info-value {
          color: var(--text-primary);
        }

        .about-footer {
          text-align: center;
          padding: 16px 0 0 0;
          color: var(--text-muted);
          font-size: 13px;
        }

        @media (max-width: 600px) {
          .about-dialog {
            max-width: 95%;
          }
        }
      `}</style>
    </div>
  );
};
