import React, { useState, useEffect } from 'react';
import { MonacoEditor } from './MonacoEditor';
import { CodeGenerator, CodeGenerationOptions, GeneratedFile } from '../utils/codeGeneration';

interface CodeGenerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeGenerationDialog: React.FC<CodeGenerationDialogProps> = ({
  isOpen,
  onClose
}) => {
  const [options, setOptions] = useState<CodeGenerationOptions>({
    language: 'csharp',
    swaggerJson: '',
    authentication: 'none',
    httpClient: 'axios',
    namespace: 'ApiClient'
  });

  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'configure' | 'preview'>('configure');

  const [codeGenerator] = useState(() => new CodeGenerator());

  useEffect(() => {
    if (!isOpen) {
      // Reset state when dialog closes
      setStep('configure');
      setGeneratedFiles([]);
      setActiveFileIndex(0);
      setError(null);
      setIsGenerating(false);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!options.swaggerJson.trim()) {
      setError('Please provide a Swagger JSON content');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const files = await codeGenerator.generateCode(options);
      setGeneratedFiles(files);
      setActiveFileIndex(0);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadZip = async () => {
    if (generatedFiles.length === 0) return;

    try {
      // Use the electron API to create and download zip
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        await (window as any).electronAPI.downloadGeneratedCode({
          files: generatedFiles,
          language: options.language
        });
      }
    } catch (err) {
      setError('Failed to download files');
    }
  };

  const handleSaveToDirectory = async () => {
    if (generatedFiles.length === 0) return;

    try {
      // Use the electron API to save to directory
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        const result = await (window as any).electronAPI.saveGeneratedCodeToDirectory({
          files: generatedFiles,
          language: options.language
        });
        
        if (result.success) {
          alert(`Files saved successfully to: ${result.path}`);
        }
      }
    } catch (err) {
      setError('Failed to save files to directory');
    }
  };

  const handleBack = () => {
    setStep('configure');
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-overlay" onClick={handleOverlayClick}>
      <div className="dialog code-generation-dialog">
        <div className="dialog-header">
          <h2>
            <span className="icon">⚡</span>
            Code Generation
          </h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <div className="dialog-content">
          {step === 'configure' && (
            <div className="configure-step">
              <div className="form-section">
                <label className="form-label">Language</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="language"
                      value="csharp"
                      checked={options.language === 'csharp'}
                      onChange={(e) => setOptions(prev => ({ ...prev, language: e.target.value as 'csharp' }))}
                    />
                    <span>C#</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="language"
                      value="typescript"
                      checked={options.language === 'typescript'}
                      onChange={(e) => setOptions(prev => ({ ...prev, language: e.target.value as 'typescript' }))}
                    />
                    <span>TypeScript</span>
                  </label>
                </div>
              </div>

              <div className="form-section">
                <label className="form-label">Swagger JSON Content</label>
                <textarea
                  className="form-textarea"
                  rows={8}
                  placeholder={`Paste your swagger.json content here, for example:
{
  "openapi": "3.0.0",
  "info": {
    "title": "Your API",
    "version": "1.0.0"
  },
  "paths": {
    ...
  }
}

Or enter "test" for a demo example.`}
                  value={options.swaggerJson}
                  onChange={(e) => setOptions(prev => ({ ...prev, swaggerJson: e.target.value }))}
                />
                <div className="form-hint">
                  Paste the content of your swagger.json file or enter "test" for a demo
                </div>
              </div>

              <div className="form-section">
                <label className="form-label">Authentication</label>
                <select
                  className="form-select"
                  value={options.authentication}
                  onChange={(e) => setOptions(prev => ({ ...prev, authentication: e.target.value as 'none' | 'jwt' }))}
                >
                  <option value="none">None</option>
                  <option value="jwt">JWT Bearer</option>
                </select>
              </div>

              {options.language === 'csharp' && (
                <div className="form-section">
                  <label className="form-label">Namespace</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ApiClient"
                    value={options.namespace}
                    onChange={(e) => setOptions(prev => ({ ...prev, namespace: e.target.value }))}
                  />
                </div>
              )}

              {options.language === 'typescript' && (
                <div className="form-section">
                  <label className="form-label">HTTP Client</label>
                  <div className="checkbox-group">
                    <label className="checkbox-option">
                      <input
                        type="radio"
                        name="httpClient"
                        value="axios"
                        checked={options.httpClient === 'axios'}
                        onChange={(e) => setOptions(prev => ({ ...prev, httpClient: e.target.value as 'axios' }))}
                      />
                      <span>Axios</span>
                    </label>
                    <label className="checkbox-option">
                      <input
                        type="radio"
                        name="httpClient"
                        value="fetch"
                        checked={options.httpClient === 'fetch'}
                        onChange={(e) => setOptions(prev => ({ ...prev, httpClient: e.target.value as 'fetch' }))}
                      />
                      <span>Fetch</span>
                    </label>
                  </div>
                </div>
              )}

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 'preview' && generatedFiles.length > 0 && (
            <div className="preview-step">
              <div className="file-tabs">
                {generatedFiles.map((file, index) => (
                  <button
                    key={index}
                    className={`file-tab ${index === activeFileIndex ? 'active' : ''}`}
                    onClick={() => setActiveFileIndex(index)}
                  >
                    {file.name}
                  </button>
                ))}
              </div>

              <div className="editor-container">
                <MonacoEditor
                  value={generatedFiles[activeFileIndex]?.content || ''}
                  language={generatedFiles[activeFileIndex]?.language === 'csharp' ? 'csharp' : 'typescript'}
                  readOnly={true}
                  height="400px"
                  theme="vs-dark"
                />
              </div>
            </div>
          )}
        </div>

        <div className="dialog-footer">
          {step === 'configure' && (
            <div className="button-group">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleGenerate}
                disabled={isGenerating || !options.swaggerJson.trim()}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner small"></span>
                    Generating...
                  </>
                ) : (
                  'Generate Code'
                )}
              </button>
            </div>
          )}

          {step === 'preview' && (
            <div className="button-group">
              <button className="btn btn-secondary" onClick={handleBack}>
                Back
              </button>
              <button className="btn btn-outline" onClick={handleSaveToDirectory}>
                Save to Directory
              </button>
              <button className="btn btn-primary" onClick={handleDownloadZip}>
                Download ZIP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};