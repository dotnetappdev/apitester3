import React, { useRef, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';

interface MonacoEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: 'json' | 'xml' | 'text' | 'javascript';
  readOnly?: boolean;
  height?: string | number;
  theme?: 'vs-dark' | 'light';
  enableSuggestions?: boolean;
  placeholder?: string;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  onChange,
  language = 'json',
  readOnly = false,
  height = '200px',
  theme = 'vs-dark',
  enableSuggestions = true,
  placeholder
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    
    // Configure editor
    editor.updateOptions({
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 13,
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      lineNumbers: 'on',
      glyphMargin: false,
      folding: true,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 3,
      renderLineHighlight: 'line',
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        verticalScrollbarSize: 12,
        horizontalScrollbarSize: 12
      }
    });

    // Add custom themes
    monaco.editor.defineTheme('api-tester-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'string.key.json', foreground: '4fc1ff' },
        { token: 'string.value.json', foreground: 'ce9178' },
        { token: 'number.json', foreground: 'b5cea8' },
        { token: 'keyword.json', foreground: '569cd6' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#cccccc',
        'editor.lineHighlightBackground': '#2d2d30',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
        'editorCursor.foreground': '#aeafad',
        'editorWhitespace.foreground': '#404040',
      }
    });

    monaco.editor.defineTheme('api-tester-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'string.key.json', foreground: '0451a5' },
        { token: 'string.value.json', foreground: 'a31515' },
        { token: 'number.json', foreground: '098658' },
        { token: 'keyword.json', foreground: '0000ff' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#000000',
        'editor.lineHighlightBackground': '#f5f5f5',
        'editor.selectionBackground': '#add6ff',
        'editor.inactiveSelectionBackground': '#e5ebf1',
      }
    });

    // Set the custom theme
    monaco.editor.setTheme(theme === 'vs-dark' ? 'api-tester-dark' : 'api-tester-light');

    // Auto-format JSON
    if (language === 'json' && value) {
      try {
        const formatted = JSON.stringify(JSON.parse(value), null, 2);
        if (formatted !== value && onChange) {
          onChange(formatted);
        }
      } catch {
        // Invalid JSON, don't format
      }
    }
  };

  const handleChange = (newValue: string | undefined) => {
    if (onChange && newValue !== undefined) {
      onChange(newValue);
    }
  };

  const formatDocument = () => {
    if (editorRef.current && language === 'json') {
      try {
        const currentValue = editorRef.current.getValue();
        const parsed = JSON.parse(currentValue);
        const formatted = JSON.stringify(parsed, null, 2);
        editorRef.current.setValue(formatted);
        if (onChange) {
          onChange(formatted);
        }
      } catch (error) {
        console.warn('Cannot format invalid JSON');
      }
    }
  };

  const minifyDocument = () => {
    if (editorRef.current && language === 'json') {
      try {
        const currentValue = editorRef.current.getValue();
        const parsed = JSON.parse(currentValue);
        const minified = JSON.stringify(parsed);
        editorRef.current.setValue(minified);
        if (onChange) {
          onChange(minified);
        }
      } catch (error) {
        console.warn('Cannot minify invalid JSON');
      }
    }
  };

  // Auto-detect language based on content
  const detectLanguage = (content: string): string => {
    if (!content.trim()) return 'text';
    
    const trimmed = content.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(content);
        return 'json';
      } catch {
        return 'text';
      }
    }
    
    if (trimmed.startsWith('<') && trimmed.includes('>')) {
      return 'xml';
    }
    
    return 'text';
  };

  const detectedLanguage = language === 'json' ? detectLanguage(value) : language;

  return (
    <div className="monaco-editor-container">
      <div className="editor-toolbar">
        <div className="editor-info">
          <span className="language-indicator">{detectedLanguage.toUpperCase()}</span>
          {value && (
            <span className="character-count">{value.length} chars</span>
          )}
        </div>
        
        {!readOnly && language === 'json' && (
          <div className="editor-actions">
            <button
              className="editor-action-button"
              onClick={formatDocument}
              title="Format JSON (Ctrl+Shift+F)"
            >
              Format
            </button>
            <button
              className="editor-action-button"
              onClick={minifyDocument}
              title="Minify JSON"
            >
              Minify
            </button>
          </div>
        )}
      </div>

      <div className="editor-wrapper" style={{ height }}>
        <Editor
          height="100%"
          defaultLanguage={detectedLanguage}
          language={detectedLanguage}
          value={value}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            automaticLayout: true,
            suggestOnTriggerCharacters: enableSuggestions,
            quickSuggestions: enableSuggestions,
            wordBasedSuggestions: enableSuggestions ? 'allDocuments' : 'off',
            parameterHints: { enabled: enableSuggestions },
            showUnused: false,
            acceptSuggestionOnCommitCharacter: false,
            acceptSuggestionOnEnter: 'off',
            accessibilitySupport: 'off',
            formatOnPaste: true,
            formatOnType: true,
          }}
          loading={
            <div className="editor-loading">
              <div className="spinner"></div>
              <span>Loading editor...</span>
            </div>
          }
        />
      </div>
    </div>
  );
};