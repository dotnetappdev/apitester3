import React, { useState, useEffect } from 'react';
import { DynamicVariableManager, DynamicVariable } from '../utils/dynamicVariables';

interface DynamicVariablesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertVariable?: (variableName: string) => void;
}

export const DynamicVariablesDialog: React.FC<DynamicVariablesDialogProps> = ({
  isOpen,
  onClose,
  onInsertVariable
}) => {
  const [variables, setVariables] = useState<Array<{ variable: DynamicVariable; value: string }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Refresh preview values
  const refreshValues = () => {
    setVariables(DynamicVariableManager.previewAllVariables());
  };

  useEffect(() => {
    if (isOpen) {
      refreshValues();
    }
  }, [isOpen]);

  // Auto-refresh values every 3 seconds when dialog is open
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isOpen && autoRefresh) {
      interval = setInterval(refreshValues, 3000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isOpen, autoRefresh]);

  const filteredVariables = variables.filter(({ variable }) =>
    variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variable.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInsertVariable = (variableName: string) => {
    if (onInsertVariable) {
      onInsertVariable(`{{${variableName}}}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Optional: Show toast notification
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ width: '800px', maxWidth: '90vw' }}>
        <div className="modal-header">
          <h2>🎲 Dynamic Variables</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="dynamic-variables-content">
            <div className="variables-header">
              <p className="variables-description">
                Dynamic variables generate values automatically when your request is sent. 
                Use them to create realistic test data without manual setup.
              </p>
              
              <div className="variables-controls">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search variables..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div className="control-buttons">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                    />
                    Auto-refresh preview
                  </label>
                  
                  <button
                    className="btn btn-secondary"
                    onClick={refreshValues}
                    title="Refresh preview values"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="variables-list">
              <div className="variables-table">
                <div className="table-header">
                  <div className="col-variable">Variable</div>
                  <div className="col-description">Description</div>
                  <div className="col-preview">Preview</div>
                  <div className="col-actions">Actions</div>
                </div>

                {filteredVariables.map(({ variable, value }) => (
                  <div key={variable.name} className="table-row">
                    <div className="col-variable">
                      <code className="variable-name">
                        {`{{${variable.name}}}`}
                      </code>
                    </div>
                    
                    <div className="col-description">
                      <span className="variable-description">{variable.description}</span>
                    </div>
                    
                    <div className="col-preview">
                      <code className="preview-value" title={value}>
                        {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                      </code>
                    </div>
                    
                    <div className="col-actions">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleInsertVariable(variable.name)}
                        title="Insert into current field"
                        disabled={!onInsertVariable}
                      >
                        Insert
                      </button>
                      
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => copyToClipboard(`{{${variable.name}}}`)}
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredVariables.length === 0 && (
                <div className="no-results">
                  <p>No variables found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-info">
            <small>
              💡 Tip: Dynamic variables are generated fresh each time your request is sent
            </small>
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        .dynamic-variables-content {
          max-height: 60vh;
          display: flex;
          flex-direction: column;
        }

        .variables-header {
          margin-bottom: 20px;
        }

        .variables-description {
          margin-bottom: 15px;
          color: #888;
          font-size: 14px;
          line-height: 1.4;
        }

        .variables-controls {
          display: flex;
          gap: 15px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 200px;
        }

        .control-buttons {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;
          cursor: pointer;
        }

        .variables-list {
          flex: 1;
          overflow: auto;
        }

        .variables-table {
          display: table;
          width: 100%;
          border-spacing: 0;
        }

        .table-header {
          display: table-row;
          background: #2a2a2a;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-header > div {
          display: table-cell;
          padding: 12px 8px;
          border-bottom: 2px solid #404040;
        }

        .table-row {
          display: table-row;
        }

        .table-row:hover {
          background: #252525;
        }

        .table-row > div {
          display: table-cell;
          padding: 12px 8px;
          border-bottom: 1px solid #333;
          vertical-align: middle;
        }

        .col-variable {
          width: 25%;
        }

        .col-description {
          width: 40%;
        }

        .col-preview {
          width: 25%;
        }

        .col-actions {
          width: 10%;
          text-align: right;
        }

        .variable-name {
          background: #1e1e1e;
          color: #569cd6;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
        }

        .variable-description {
          color: #ccc;
          font-size: 14px;
          line-height: 1.3;
        }

        .preview-value {
          background: #2a2a2a;
          color: #dcdcaa;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 12px;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: inline-block;
        }

        .col-actions {
          display: flex;
          gap: 5px;
          justify-content: flex-end;
        }

        .btn-sm {
          padding: 4px 8px;
          font-size: 12px;
          min-width: auto;
        }

        .no-results {
          text-align: center;
          padding: 40px 20px;
          color: #888;
        }

        .footer-info {
          flex: 1;
          text-align: left;
        }

        .footer-info small {
          color: #888;
        }
      `}</style>
    </div>
  );
};