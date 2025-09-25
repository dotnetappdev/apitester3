import React, { useState, useEffect } from 'react';
import { Collection, User } from '../database/DatabaseManager';
import { TestSuite } from '../testing/TestRunner';

interface ImportExportDialogProps {
  isOpen: boolean;
  mode: 'import' | 'export' | null;
  currentUser: User;
  collections: Collection[];
  testSuites: TestSuite[];
  onClose: () => void;
  onImport: (data: any, options: any) => Promise<void>;
  onExport: (collections: Collection[], testSuites: TestSuite[]) => Promise<void>;
}

interface ImportPreview {
  metadata: any;
  collections: any[];
  filePath: string;
}

export const ImportExportDialog: React.FC<ImportExportDialogProps> = ({
  isOpen,
  mode,
  currentUser,
  collections,
  testSuites,
  onClose,
  onImport,
  onExport
}) => {
  const [selectedCollections, setSelectedCollections] = useState<number[]>([]);
  const [importOptions, setImportOptions] = useState({
    targetUserId: currentUser.id,
    importForAllUsers: false,
    remapToCurrentUser: true
  });
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && mode === 'export') {
      // Select all collections by default
      setSelectedCollections(collections.map(c => c.id));
    }
  }, [isOpen, mode, collections]);

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const selectedCollectionData = collections.filter(c => selectedCollections.includes(c.id));
      const relatedTestSuites = testSuites.filter(ts => 
        selectedCollectionData.some(col => 
          col.requests?.some(req => req.id === ts.requestId)
        )
      );
      
      await onExport(selectedCollectionData, relatedTestSuites);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportPreview = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await (window as any).electronAPI.previewImport();
      if (result.success) {
        setImportPreview(result);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importPreview) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const options = {
        targetUserId: importOptions.remapToCurrentUser ? currentUser.id : undefined,
        importForAllUsers: importOptions.importForAllUsers
      };
      
      const result = await (window as any).electronAPI.importCollection(options);
      if (result.success) {
        await onImport(result.data, options);
        onClose();
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !mode) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog import-export-dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>{mode === 'export' ? 'Export Collections' : 'Import Collections'}</h2>
          <button className="dialog-close" onClick={onClose}>&times;</button>
        </div>

        <div className="dialog-content">
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {mode === 'export' && (
            <div className="export-content">
              <div className="section">
                <h3>Select Collections to Export</h3>
                <div className="collection-list">
                  {collections.map(collection => (
                    <label key={collection.id} className="collection-item">
                      <input
                        type="checkbox"
                        checked={selectedCollections.includes(collection.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCollections([...selectedCollections, collection.id]);
                          } else {
                            setSelectedCollections(selectedCollections.filter(id => id !== collection.id));
                          }
                        }}
                      />
                      <div className="collection-info">
                        <strong>{collection.name}</strong>
                        <span className="collection-meta">
                          {collection.requests?.length || 0} requests
                          {collection.description && ` • ${collection.description}`}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="export-summary">
                <h4>Export Summary</h4>
                <ul>
                  <li>{selectedCollections.length} collections selected</li>
                  <li>{collections.filter(c => selectedCollections.includes(c.id)).reduce((sum, c) => sum + (c.requests?.length || 0), 0)} requests</li>
                  <li>{testSuites.filter(ts => 
                    collections.filter(c => selectedCollections.includes(c.id)).some(col => 
                      col.requests?.some(req => req.id === ts.requestId)
                    )
                  ).length} test suites</li>
                </ul>
              </div>
            </div>
          )}

          {mode === 'import' && !importPreview && (
            <div className="import-content">
              <div className="section">
                <h3>Select Collection File</h3>
                <p>Choose an API Tester collection file (.apit) to import.</p>
                <button 
                  className="button primary" 
                  onClick={handleImportPreview}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Browse Collection File'}
                </button>
              </div>
            </div>
          )}

          {mode === 'import' && importPreview && (
            <div className="import-content">
              <div className="section">
                <h3>Import Preview</h3>
                <div className="preview-info">
                  <div className="preview-metadata">
                    <h4>File Information</h4>
                    <ul>
                      <li><strong>Exported by:</strong> {importPreview.metadata.exportedBy}</li>
                      <li><strong>Export date:</strong> {new Date(importPreview.metadata.exportedAt || '').toLocaleDateString()}</li>
                      <li><strong>Collections:</strong> {importPreview.metadata.totalCollections}</li>
                      <li><strong>Requests:</strong> {importPreview.metadata.totalRequests}</li>
                      <li><strong>Test suites:</strong> {importPreview.metadata.totalTestSuites}</li>
                    </ul>
                  </div>

                  <div className="preview-collections">
                    <h4>Collections to Import</h4>
                    <div className="collection-list preview">
                      {importPreview.collections.map(collection => (
                        <div key={collection.id} className="collection-item preview">
                          <strong>{collection.name}</strong>
                          <span className="collection-meta">
                            {collection.requestCount} requests
                            {collection.description && ` • ${collection.description}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="section">
                <h3>Import Options</h3>
                <div className="import-options">
                  <label className="option-item">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importOptions.remapToCurrentUser}
                      onChange={() => setImportOptions({
                        ...importOptions,
                        remapToCurrentUser: true,
                        importForAllUsers: false
                      })}
                    />
                    <div className="option-info">
                      <strong>Import as my collections</strong>
                      <span>All imported collections will be owned by you ({currentUser.username})</span>
                    </div>
                  </label>

                  <label className="option-item">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importOptions.importForAllUsers}
                      onChange={() => setImportOptions({
                        ...importOptions,
                        remapToCurrentUser: false,
                        importForAllUsers: true
                      })}
                    />
                    <div className="option-info">
                      <strong>Preserve original ownership</strong>
                      <span>Maintain original user assignments (requires matching user IDs)</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="section">
                <button 
                  className="button secondary" 
                  onClick={() => setImportPreview(null)}
                >
                  Choose Different File
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <button className="button secondary" onClick={onClose}>
            Cancel
          </button>
          
          {mode === 'export' && (
            <button 
              className="button primary" 
              onClick={handleExport}
              disabled={isLoading || selectedCollections.length === 0}
            >
              {isLoading ? 'Exporting...' : 'Export Collections'}
            </button>
          )}
          
          {mode === 'import' && importPreview && (
            <button 
              className="button primary" 
              onClick={handleImport}
              disabled={isLoading}
            >
              {isLoading ? 'Importing...' : 'Import Collections'}
            </button>
          )}
        </div>

        <style>{`
          .import-export-dialog {
            width: 700px;
            max-height: 80vh;
            overflow-y: auto;
          }

          .section {
            margin-bottom: 24px;
          }

          .section h3 {
            margin: 0 0 12px 0;
            color: var(--text-primary);
            font-size: 16px;
          }

          .section h4 {
            margin: 0 0 8px 0;
            color: var(--text-primary);
            font-size: 14px;
          }

          .collection-list {
            border: 1px solid var(--border-color);
            border-radius: 6px;
            max-height: 200px;
            overflow-y: auto;
          }

          .collection-item {
            display: flex;
            align-items: center;
            padding: 12px;
            border-bottom: 1px solid var(--border-color);
            cursor: pointer;
            transition: background-color 0.2s;
          }

          .collection-item:last-child {
            border-bottom: none;
          }

          .collection-item:hover {
            background-color: var(--bg-hover);
          }

          .collection-item.preview {
            cursor: default;
            padding: 8px 12px;
          }

          .collection-item input[type="checkbox"] {
            margin-right: 12px;
          }

          .collection-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .collection-meta {
            font-size: 12px;
            color: var(--text-secondary);
          }

          .export-summary {
            background-color: var(--bg-secondary);
            padding: 16px;
            border-radius: 6px;
            border: 1px solid var(--border-color);
          }

          .export-summary h4 {
            margin: 0 0 8px 0;
            color: var(--text-primary);
          }

          .export-summary ul {
            margin: 0;
            padding-left: 20px;
            color: var(--text-secondary);
          }

          .import-options {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .option-item {
            display: flex;
            align-items: flex-start;
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .option-item:hover {
            background-color: var(--bg-hover);
            border-color: var(--accent-color);
          }

          .option-item input[type="radio"] {
            margin-right: 12px;
            margin-top: 2px;
          }

          .option-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .option-info strong {
            color: var(--text-primary);
            font-size: 14px;
          }

          .option-info span {
            font-size: 12px;
            color: var(--text-secondary);
          }

          .preview-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }

          .preview-metadata ul {
            margin: 8px 0 0 0;
            padding-left: 20px;
            color: var(--text-secondary);
          }

          .preview-metadata ul li {
            margin-bottom: 4px;
          }

          .error-message {
            background-color: var(--error-bg, #fee);
            border: 1px solid var(--error-border, #fcc);
            color: var(--error-text, #c33);
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 16px;
          }

          @media (max-width: 768px) {
            .import-export-dialog {
              width: 90vw;
              max-width: none;
            }

            .preview-info {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </div>
  );
};