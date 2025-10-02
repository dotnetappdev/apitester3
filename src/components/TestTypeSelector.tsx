import React from 'react';

interface TestTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'request' | 'ui' | 'unit') => void;
}

export const TestTypeSelector: React.FC<TestTypeSelectorProps> = ({
  isOpen,
  onClose,
  onSelectType
}) => {
  if (!isOpen) return null;

  const handleSelect = (type: 'request' | 'ui' | 'unit') => {
    onSelectType(type);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="test-type-selector-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Select Test Type</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="test-type-content">
          <p className="test-type-description">
            Choose the type of test you want to create:
          </p>

          <div className="test-type-cards">
            {/* Request Test Card */}
            <div 
              className="test-type-card request-test-card"
              onClick={() => handleSelect('request')}
            >
              <div className="test-type-icon">🌐</div>
              <div className="test-type-info">
                <h3>Request Tests</h3>
                <p className="test-type-subtitle">API Endpoint Testing</p>
                <p className="test-type-details">
                  Test API requests and validate responses. Perfect for testing REST APIs, 
                  checking status codes, headers, and response data.
                </p>
                <ul className="test-type-features">
                  <li>✓ Validate HTTP responses</li>
                  <li>✓ Check JSON data</li>
                  <li>✓ Test authentication</li>
                  <li>✓ Measure response time</li>
                </ul>
              </div>
            </div>

            {/* UI Test Card */}
            <div 
              className="test-type-card ui-test-card"
              onClick={() => handleSelect('ui')}
            >
              <div className="test-type-icon">🖥️</div>
              <div className="test-type-info">
                <h3>UI Tests</h3>
                <p className="test-type-subtitle">Browser Automation</p>
                <p className="test-type-details">
                  Automate browser interactions and test web applications end-to-end. 
                  Powered by Playwright for reliable UI testing.
                </p>
                <ul className="test-type-features">
                  <li>✓ Browser automation</li>
                  <li>✓ Element interactions</li>
                  <li>✓ Form testing</li>
                  <li>✓ Visual validation</li>
                </ul>
              </div>
            </div>

            {/* Unit Test Card */}
            <div 
              className="test-type-card unit-test-card"
              onClick={() => handleSelect('unit')}
            >
              <div className="test-type-icon">🧪</div>
              <div className="test-type-info">
                <h3>Unit Tests</h3>
                <p className="test-type-subtitle">Standalone Testing</p>
                <p className="test-type-details">
                  Create independent test suites for testing functions, utilities, 
                  and business logic without dependencies.
                </p>
                <ul className="test-type-features">
                  <li>✓ Independent tests</li>
                  <li>✓ Reusable suites</li>
                  <li>✓ Utility testing</li>
                  <li>✓ Logic validation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .test-type-selector-dialog {
            background: var(--bg-secondary);
            border-radius: 8px;
            width: 90%;
            max-width: 900px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
          }

          .test-type-content {
            padding: 24px;
          }

          .test-type-description {
            text-align: center;
            color: var(--text-secondary);
            font-size: 14px;
            margin-bottom: 24px;
          }

          .test-type-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 20px;
          }

          .test-type-card {
            background: var(--bg-tertiary);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            padding: 24px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .test-type-card:hover {
            border-color: var(--accent-color);
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0, 122, 204, 0.2);
          }

          .request-test-card:hover {
            border-color: #4fc3f7;
            box-shadow: 0 8px 16px rgba(79, 195, 247, 0.2);
          }

          .ui-test-card:hover {
            border-color: #9c27b0;
            box-shadow: 0 8px 16px rgba(156, 39, 176, 0.2);
          }

          .unit-test-card:hover {
            border-color: #4caf50;
            box-shadow: 0 8px 16px rgba(76, 175, 80, 0.2);
          }

          .test-type-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }

          .test-type-info {
            width: 100%;
          }

          .test-type-info h3 {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 4px;
          }

          .test-type-subtitle {
            font-size: 12px;
            color: var(--accent-color);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
          }

          .request-test-card .test-type-subtitle {
            color: #4fc3f7;
          }

          .ui-test-card .test-type-subtitle {
            color: #9c27b0;
          }

          .unit-test-card .test-type-subtitle {
            color: #4caf50;
          }

          .test-type-details {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.5;
            margin-bottom: 16px;
          }

          .test-type-features {
            list-style: none;
            padding: 0;
            margin: 0;
            text-align: left;
          }

          .test-type-features li {
            font-size: 12px;
            color: var(--text-secondary);
            padding: 4px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .test-type-features li::before {
            content: '';
            width: 4px;
            height: 4px;
            background: var(--accent-color);
            border-radius: 50%;
          }

          @media (max-width: 768px) {
            .test-type-cards {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default TestTypeSelector;
