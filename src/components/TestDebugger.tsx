import React, { useState, useRef, useEffect } from 'react';
import { MonacoEditor } from './MonacoEditor';
import { Request } from '../database/DatabaseManager';
import { TestSuite, TestExecutionResult } from '../testing/TestRunner';
import { UITestSuite, UITestExecutionResult } from '../testing/UITestRunner';

interface TestDebuggerProps {
  isOpen: boolean;
  onClose: () => void;
  testType: 'api' | 'ui';
  testData?: Request | UITestSuite;
  testSuite?: TestSuite;
  onRunDebug?: () => Promise<void>;
}

interface Breakpoint {
  line: number;
  enabled: boolean;
}

interface DebugState {
  isRunning: boolean;
  isPaused: boolean;
  currentLine: number | null;
  exception: string | null;
  variables: Record<string, any>;
}

export const TestDebugger: React.FC<TestDebuggerProps> = ({
  isOpen,
  onClose,
  testType,
  testData,
  testSuite,
  onRunDebug
}) => {
  const [testCode, setTestCode] = useState('');
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [debugState, setDebugState] = useState<DebugState>({
    isRunning: false,
    isPaused: false,
    currentLine: null,
    exception: null,
    variables: {}
  });
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (testType === 'api' && testSuite) {
      // Generate test code from test suite
      const code = generateTestCode(testSuite);
      setTestCode(code);
    } else if (testType === 'ui' && testData) {
      // Generate UI test code
      const uiSuite = testData as UITestSuite;
      const code = generateUITestCode(uiSuite);
      setTestCode(code);
    }
  }, [testType, testData, testSuite]);

  const generateTestCode = (suite: TestSuite): string => {
    let code = `// Test Suite: ${suite.name}\n`;
    code += `// Request ID: ${suite.requestId}\n\n`;
    
    suite.testCases.forEach((testCase, index) => {
      code += `// Test Case ${index + 1}: ${testCase.name}\n`;
      code += `describe('${testCase.name}', () => {\n`;
      code += `  it('${testCase.description || 'should pass'}', async () => {\n`;
      code += `    // Test assertions\n`;
      
      testCase.assertions.forEach((assertion) => {
        code += `    // ${assertion.type}: ${assertion.field}\n`;
        code += `    expect(response.${assertion.field}).${assertion.type}(${JSON.stringify(assertion.expectedValue)});\n`;
      });
      
      code += `  });\n`;
      code += `});\n\n`;
    });
    
    return code;
  };

  const generateUITestCode = (suite: UITestSuite): string => {
    let code = `// UI Test Suite: ${suite.name}\n`;
    code += `// URL: ${suite.url}\n\n`;
    
    suite.testCases.forEach((testCase, index) => {
      code += `// Test Case ${index + 1}: ${testCase.name}\n`;
      code += `test('${testCase.name}', async ({ page }) => {\n`;
      code += `  // Navigate to URL\n`;
      code += `  await page.goto('${suite.url}');\n\n`;
      
      testCase.actions.forEach((action, actionIndex) => {
        code += `  // Action ${actionIndex + 1}: ${action.type}\n`;
        switch (action.type) {
          case 'click':
            code += `  await page.click('${action.selector}');\n`;
            break;
          case 'type':
            code += `  await page.fill('${action.selector}', '${action.value || ''}');\n`;
            break;
          case 'wait':
            code += `  await page.waitForTimeout(${action.timeout || 1000});\n`;
            break;
          case 'assert':
            code += `  await expect(page.locator('${action.selector}')).${action.assertion || 'toBeVisible'}();\n`;
            break;
        }
      });
      
      code += `});\n\n`;
    });
    
    return code;
  };

  const toggleBreakpoint = (line: number) => {
    const existingIndex = breakpoints.findIndex(bp => bp.line === line);
    if (existingIndex >= 0) {
      setBreakpoints(breakpoints.filter(bp => bp.line !== line));
    } else {
      setBreakpoints([...breakpoints, { line, enabled: true }]);
    }
  };

  const handleStartDebug = async () => {
    setDebugState({
      ...debugState,
      isRunning: true,
      isPaused: false,
      currentLine: null,
      exception: null
    });

    try {
      if (onRunDebug) {
        await onRunDebug();
      }
      
      // Simulate debug execution
      // In a real implementation, this would step through the test
      setTimeout(() => {
        setDebugState({
          ...debugState,
          isRunning: false,
          isPaused: false,
          currentLine: null
        });
      }, 2000);
    } catch (error) {
      setDebugState({
        ...debugState,
        isRunning: false,
        isPaused: true,
        exception: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleStepOver = () => {
    // Implement step over logic
    setDebugState({
      ...debugState,
      currentLine: (debugState.currentLine || 0) + 1
    });
  };

  const handleStepInto = () => {
    // Implement step into logic
    setDebugState({
      ...debugState,
      currentLine: (debugState.currentLine || 0) + 1
    });
  };

  const handleContinue = () => {
    setDebugState({
      ...debugState,
      isPaused: false
    });
  };

  const handleStop = () => {
    setDebugState({
      isRunning: false,
      isPaused: false,
      currentLine: null,
      exception: null,
      variables: {}
    });
  };

  if (!isOpen) return null;

  return (
    <div className="test-debugger-overlay">
      <div className="test-debugger-dialog">
        <div className="debugger-header">
          <h3>🐛 Test Debugger - {testType === 'api' ? 'API Test' : 'UI Test'}</h3>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="debugger-toolbar">
          <div className="debug-controls">
            {!debugState.isRunning ? (
              <button 
                className="debug-btn start-debug"
                onClick={handleStartDebug}
                title="Start Debugging (F5)"
              >
                ▶️ Start Debug
              </button>
            ) : (
              <>
                {debugState.isPaused ? (
                  <>
                    <button 
                      className="debug-btn continue"
                      onClick={handleContinue}
                      title="Continue (F5)"
                    >
                      ▶️ Continue
                    </button>
                    <button 
                      className="debug-btn step-over"
                      onClick={handleStepOver}
                      title="Step Over (F10)"
                    >
                      ⤵️ Step Over
                    </button>
                    <button 
                      className="debug-btn step-into"
                      onClick={handleStepInto}
                      title="Step Into (F11)"
                    >
                      ⤷ Step Into
                    </button>
                  </>
                ) : null}
                <button 
                  className="debug-btn stop"
                  onClick={handleStop}
                  title="Stop Debugging"
                >
                  ⏹️ Stop
                </button>
              </>
            )}
          </div>
          
          <div className="debug-status">
            {debugState.isRunning && (
              <span className="status-indicator running">
                {debugState.isPaused ? '⏸️ Paused' : '▶️ Running'}
              </span>
            )}
            {debugState.currentLine !== null && (
              <span className="current-line-indicator">
                Line {debugState.currentLine}
              </span>
            )}
          </div>
        </div>

        <div className="debugger-content">
          <div className="code-editor-panel">
            <div className="breakpoints-gutter">
              {/* Breakpoints will be shown here */}
            </div>
            <div className="editor-container">
              <MonacoEditor
                value={testCode}
                onChange={setTestCode}
                language="javascript"
                readOnly={false}
                height="400px"
                theme="vs-dark"
                enableSuggestions={true}
              />
            </div>
          </div>

          <div className="debug-panels">
            <div className="variables-panel">
              <div className="panel-header">Variables</div>
              <div className="panel-content">
                {Object.keys(debugState.variables).length > 0 ? (
                  <div className="variables-list">
                    {Object.entries(debugState.variables).map(([key, value]) => (
                      <div key={key} className="variable-item">
                        <span className="variable-name">{key}:</span>
                        <span className="variable-value">{JSON.stringify(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">No variables in current scope</div>
                )}
              </div>
            </div>

            <div className="exceptions-panel">
              <div className="panel-header">Exceptions</div>
              <div className="panel-content">
                {debugState.exception ? (
                  <div className="exception-item error">
                    <div className="exception-icon">❌</div>
                    <div className="exception-message">{debugState.exception}</div>
                  </div>
                ) : (
                  <div className="empty-state">No exceptions</div>
                )}
              </div>
            </div>

            <div className="breakpoints-panel">
              <div className="panel-header">Breakpoints</div>
              <div className="panel-content">
                {breakpoints.length > 0 ? (
                  <div className="breakpoints-list">
                    {breakpoints.map((bp, index) => (
                      <div key={index} className="breakpoint-item">
                        <input
                          type="checkbox"
                          checked={bp.enabled}
                          onChange={() => {
                            const updated = [...breakpoints];
                            updated[index].enabled = !updated[index].enabled;
                            setBreakpoints(updated);
                          }}
                        />
                        <span>Line {bp.line}</span>
                        <button 
                          className="remove-breakpoint"
                          onClick={() => toggleBreakpoint(bp.line)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">No breakpoints set</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .test-debugger-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
          }

          .test-debugger-dialog {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            width: 90%;
            max-width: 1200px;
            height: 80vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          }

          .debugger-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-secondary);
          }

          .debugger-header h3 {
            margin: 0;
            font-size: 18px;
            color: var(--text-primary);
          }

          .close-button {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            font-size: 20px;
            padding: 4px 8px;
            border-radius: 4px;
            transition: all 0.2s;
          }

          .close-button:hover {
            background: var(--bg-hover);
            color: var(--text-primary);
          }

          .debugger-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
            background: var(--bg-tertiary);
            border-bottom: 1px solid var(--border-color);
          }

          .debug-controls {
            display: flex;
            gap: 8px;
          }

          .debug-btn {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .debug-btn.start-debug {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            border: 1px solid #45a049;
          }

          .debug-btn.start-debug:hover {
            background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
          }

          .debug-btn.stop {
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
            color: white;
            border: 1px solid #d32f2f;
          }

          .debug-btn.stop:hover {
            background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
          }

          .debug-btn:hover {
            background: var(--bg-hover);
            transform: translateY(-1px);
          }

          .debug-status {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 13px;
          }

          .status-indicator {
            padding: 4px 10px;
            border-radius: 4px;
            font-weight: 500;
          }

          .status-indicator.running {
            background: rgba(76, 175, 80, 0.2);
            color: #4CAF50;
          }

          .current-line-indicator {
            color: var(--text-muted);
          }

          .debugger-content {
            flex: 1;
            display: flex;
            overflow: hidden;
          }

          .code-editor-panel {
            flex: 2;
            display: flex;
            border-right: 1px solid var(--border-color);
          }

          .breakpoints-gutter {
            width: 30px;
            background: var(--bg-tertiary);
            border-right: 1px solid var(--border-color);
          }

          .editor-container {
            flex: 1;
          }

          .debug-panels {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: var(--bg-secondary);
          }

          .variables-panel,
          .exceptions-panel,
          .breakpoints-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            border-bottom: 1px solid var(--border-color);
            overflow: hidden;
          }

          .breakpoints-panel {
            border-bottom: none;
          }

          .panel-header {
            padding: 10px 12px;
            background: var(--bg-tertiary);
            border-bottom: 1px solid var(--border-color);
            font-weight: 600;
            font-size: 13px;
            color: var(--text-primary);
          }

          .panel-content {
            flex: 1;
            overflow: auto;
            padding: 8px;
          }

          .empty-state {
            color: var(--text-muted);
            font-size: 12px;
            text-align: center;
            padding: 20px;
          }

          .variables-list,
          .breakpoints-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .variable-item {
            display: flex;
            gap: 8px;
            padding: 6px 8px;
            background: var(--bg-primary);
            border-radius: 4px;
            font-size: 12px;
            font-family: 'Consolas', 'Monaco', monospace;
          }

          .variable-name {
            color: var(--info-color);
            font-weight: 500;
          }

          .variable-value {
            color: var(--text-secondary);
          }

          .exception-item {
            display: flex;
            gap: 10px;
            padding: 10px;
            background: rgba(244, 67, 54, 0.1);
            border-left: 3px solid var(--error-color);
            border-radius: 4px;
          }

          .exception-icon {
            font-size: 18px;
          }

          .exception-message {
            flex: 1;
            font-size: 13px;
            color: var(--error-color);
            word-break: break-word;
          }

          .breakpoint-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 8px;
            background: var(--bg-primary);
            border-radius: 4px;
            font-size: 12px;
          }

          .breakpoint-item input[type="checkbox"] {
            cursor: pointer;
          }

          .remove-breakpoint {
            margin-left: auto;
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
          }

          .remove-breakpoint:hover {
            background: var(--bg-hover);
            color: var(--error-color);
          }
        `}</style>
      </div>
    </div>
  );
};

export default TestDebugger;
