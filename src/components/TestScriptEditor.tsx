import React, { useState, useEffect } from 'react';
import { MonacoEditor } from './MonacoEditor';
import { TestCase, TestSuite, TestExecutionResult, TestRunner } from '../testing/TestRunner';
import { ApiResponse } from '../types';

interface TestScriptEditorProps {
  requestId: number;
  requestName: string;
  onTestSuiteChange: (testSuite: TestSuite) => void;
  onRunTests: (testSuite: TestSuite, response: ApiResponse, request: any) => Promise<TestExecutionResult[]>;
  testResults?: TestExecutionResult[];
}

export const TestScriptEditor: React.FC<TestScriptEditorProps> = ({
  requestId,
  requestName,
  onTestSuiteChange,
  onRunTests,
  testResults = []
}) => {
  const [testSuite, setTestSuite] = useState<TestSuite>({
    id: `suite_${requestId}`,
    name: `${requestName} Tests`,
    requestId,
    testCases: []
  });

  const [selectedTestIndex, setSelectedTestIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentResults, setCurrentResults] = useState<TestExecutionResult[]>(testResults);

  // Initialize with a default test case if none exist
  useEffect(() => {
    if (testSuite.testCases.length === 0) {
      const defaultTest = TestRunner.getInstance().createDefaultTestCase(requestId, requestName);
      const updatedSuite = {
        ...testSuite,
        testCases: [defaultTest]
      };
      setTestSuite(updatedSuite);
      onTestSuiteChange(updatedSuite);
    }
  }, [requestId, requestName]);

  const addNewTestCase = () => {
    const newTest = TestRunner.getInstance().createDefaultTestCase(requestId, `${requestName} Test ${testSuite.testCases.length + 1}`);
    const updatedSuite = {
      ...testSuite,
      testCases: [...testSuite.testCases, newTest]
    };
    setTestSuite(updatedSuite);
    onTestSuiteChange(updatedSuite);
    setSelectedTestIndex(updatedSuite.testCases.length - 1);
  };

  const removeTestCase = (index: number) => {
    if (testSuite.testCases.length <= 1) return; // Keep at least one test
    
    const updatedSuite = {
      ...testSuite,
      testCases: testSuite.testCases.filter((_, i) => i !== index)
    };
    setTestSuite(updatedSuite);
    onTestSuiteChange(updatedSuite);
    
    if (selectedTestIndex >= updatedSuite.testCases.length) {
      setSelectedTestIndex(Math.max(0, updatedSuite.testCases.length - 1));
    }
  };

  const updateTestCase = (index: number, updates: Partial<TestCase>) => {
    const updatedSuite = {
      ...testSuite,
      testCases: testSuite.testCases.map((test, i) => 
        i === index ? { ...test, ...updates } : test
      )
    };
    setTestSuite(updatedSuite);
    onTestSuiteChange(updatedSuite);
  };

  const toggleTestEnabled = (index: number) => {
    updateTestCase(index, { enabled: !testSuite.testCases[index].enabled });
  };

  const getTestStatus = (testId: string): 'pass' | 'fail' | 'error' | 'none' => {
    const result = currentResults.find(r => r.testCaseId === testId);
    return result ? result.status === 'error' ? 'error' : result.status : 'none';
  };

  const getTestIcon = (status: 'pass' | 'fail' | 'error' | 'none') => {
    switch (status) {
      case 'pass': return '✓';
      case 'fail': return '✗';
      case 'error': return '⚠';
      default: return '○';
    }
  };

  const getTestIconColor = (status: 'pass' | 'fail' | 'error' | 'none') => {
    switch (status) {
      case 'pass': return 'var(--success-color)';
      case 'fail': return 'var(--error-color)';
      case 'error': return 'var(--warning-color)';
      default: return 'var(--text-muted)';
    }
  };

  const selectedTest = testSuite.testCases[selectedTestIndex];
  const selectedTestResult = selectedTest ? currentResults.find(r => r.testCaseId === selectedTest.id) : null;

  return (
    <div className="test-script-editor">
      <div className="test-editor-header">
        <h3>Test Scripts for {requestName}</h3>
        <div className="test-controls">
          <button onClick={addNewTestCase} className="btn btn-small">
            ➕ Add Test
          </button>
        </div>
      </div>

      <div className="test-editor-content">
        {/* Test Cases List */}
        <div className="test-cases-sidebar">
          <div className="test-cases-header">
            <h4>Test Cases ({testSuite.testCases.length})</h4>
          </div>
          <div className="test-cases-list">
            {testSuite.testCases.map((testCase, index) => (
              <div 
                key={testCase.id}
                className={`test-case-item ${selectedTestIndex === index ? 'selected' : ''}`}
                onClick={() => setSelectedTestIndex(index)}
              >
                <div className="test-case-status">
                  <span 
                    className="test-status-icon"
                    style={{ color: getTestIconColor(getTestStatus(testCase.id)) }}
                  >
                    {getTestIcon(getTestStatus(testCase.id))}
                  </span>
                  <input
                    type="checkbox"
                    checked={testCase.enabled}
                    onChange={() => toggleTestEnabled(index)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="test-case-info">
                  <div className="test-case-name">{testCase.name}</div>
                  <div className="test-case-description">{testCase.description}</div>
                </div>
                {testSuite.testCases.length > 1 && (
                  <button
                    className="test-case-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTestCase(index);
                    }}
                  >
                    ✗
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Test Script Editor */}
        <div className="test-script-content">
          {selectedTest && (
            <>
              <div className="test-details">
                <div className="test-detail-row">
                  <label>Test Name:</label>
                  <input
                    type="text"
                    value={selectedTest.name}
                    onChange={(e) => updateTestCase(selectedTestIndex, { name: e.target.value })}
                    className="test-name-input"
                  />
                </div>
                <div className="test-detail-row">
                  <label>Description:</label>
                  <input
                    type="text"
                    value={selectedTest.description || ''}
                    onChange={(e) => updateTestCase(selectedTestIndex, { description: e.target.value })}
                    className="test-description-input"
                    placeholder="Optional test description..."
                  />
                </div>
                <div className="test-detail-row">
                  <label>Timeout (ms):</label>
                  <input
                    type="number"
                    value={selectedTest.timeout}
                    onChange={(e) => updateTestCase(selectedTestIndex, { timeout: parseInt(e.target.value) || 5000 })}
                    className="test-timeout-input"
                    min="100"
                    max="30000"
                  />
                </div>
              </div>

              <div className="test-script-editor-container">
                <div className="test-script-header">
                  <h4>Test Script</h4>
                  <div className="test-script-help">
                    Available: <code>response</code>, <code>request</code>, <code>assert</code>, <code>console</code>
                  </div>
                </div>
                <MonacoEditor
                  value={selectedTest.script}
                  onChange={(value) => updateTestCase(selectedTestIndex, { script: value })}
                  language="javascript"
                  height="300px"
                  options={{
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    folding: false,
                    scrollBeyondLastLine: false,
                    wordWrap: 'on'
                  }}
                />
              </div>

              {/* Test Results */}
              {selectedTestResult && (
                <div className="test-results">
                  <div className="test-results-header">
                    <h4>Test Results</h4>
                    <span className={`test-result-status ${selectedTestResult.status}`}>
                      {getTestIcon(selectedTestResult.status)} {selectedTestResult.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="test-result-summary">
                    <div>Execution Time: {selectedTestResult.executionTime}ms</div>
                    <div>Run At: {new Date(selectedTestResult.runAt).toLocaleString()}</div>
                    {selectedTestResult.errorMessage && (
                      <div className="test-error-message">
                        <strong>Error:</strong> {selectedTestResult.errorMessage}
                      </div>
                    )}
                  </div>

                  {selectedTestResult.assertions.length > 0 && (
                    <div className="test-assertions">
                      <h5>Assertions ({selectedTestResult.assertions.length})</h5>
                      <div className="assertions-list">
                        {selectedTestResult.assertions.map((assertion, i) => (
                          <div key={i} className={`assertion-item ${assertion.passed ? 'passed' : 'failed'}`}>
                            <span className="assertion-icon">
                              {assertion.passed ? '✓' : '✗'}
                            </span>
                            <div className="assertion-details">
                              <div className="assertion-type">{assertion.type}</div>
                              <div className="assertion-message">{assertion.message}</div>
                              {assertion.path && (
                                <div className="assertion-path">Path: {assertion.path}</div>
                              )}
                              <div className="assertion-values">
                                <span>Expected: {JSON.stringify(assertion.expected)}</span>
                                {assertion.actual !== undefined && (
                                  <span>Actual: {JSON.stringify(assertion.actual)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .test-script-editor {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }

        .test-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .test-editor-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .test-controls {
          display: flex;
          gap: 8px;
        }

        .test-editor-content {
          flex: 1;
          display: flex;
          min-height: 0;
        }

        .test-cases-sidebar {
          width: 300px;
          border-right: 1px solid var(--border-color);
          background: var(--bg-secondary);
          display: flex;
          flex-direction: column;
        }

        .test-cases-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .test-cases-header h4 {
          margin: 0;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .test-cases-list {
          flex: 1;
          overflow-y: auto;
        }

        .test-case-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid var(--border-subtle);
          transition: background-color 0.1s;
        }

        .test-case-item:hover {
          background: var(--bg-hover);
        }

        .test-case-item.selected {
          background: var(--bg-selected);
          border-left: 3px solid var(--accent-color);
        }

        .test-case-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-right: 12px;
        }

        .test-status-icon {
          font-size: 14px;
          width: 16px;
          text-align: center;
        }

        .test-case-info {
          flex: 1;
          min-width: 0;
        }

        .test-case-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .test-case-description {
          font-size: 11px;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .test-case-remove {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          font-size: 12px;
          opacity: 0;
          transition: opacity 0.1s;
        }

        .test-case-item:hover .test-case-remove {
          opacity: 1;
        }

        .test-case-remove:hover {
          color: var(--error-color);
        }

        .test-script-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .test-details {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .test-detail-row {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }

        .test-detail-row:last-child {
          margin-bottom: 0;
        }

        .test-detail-row label {
          width: 120px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .test-name-input,
        .test-description-input,
        .test-timeout-input {
          flex: 1;
          padding: 6px 8px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 12px;
        }

        .test-timeout-input {
          width: 100px;
          flex: none;
        }

        .test-script-editor-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .test-script-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .test-script-header h4 {
          margin: 0;
          font-size: 12px;
          font-weight: 600;
        }

        .test-script-help {
          font-size: 11px;
          color: var(--text-muted);
        }

        .test-script-help code {
          background: var(--bg-code);
          padding: 2px 4px;
          border-radius: 2px;
          font-family: 'Courier New', monospace;
        }

        .test-results {
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .test-results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .test-results-header h4 {
          margin: 0;
          font-size: 12px;
          font-weight: 600;
        }

        .test-result-status {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .test-result-status.pass {
          background: var(--success-bg);
          color: var(--success-color);
        }

        .test-result-status.fail {
          background: var(--error-bg);
          color: var(--error-color);
        }

        .test-result-status.error {
          background: var(--warning-bg);
          color: var(--warning-color);
        }

        .test-result-summary {
          padding: 12px 16px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .test-result-summary > div {
          margin-bottom: 4px;
        }

        .test-error-message {
          color: var(--error-color);
          font-family: 'Courier New', monospace;
          background: var(--error-bg);
          padding: 8px;
          border-radius: 4px;
          margin-top: 8px;
        }

        .test-assertions {
          padding: 12px 16px;
        }

        .test-assertions h5 {
          margin: 0 0 12px 0;
          font-size: 12px;
          font-weight: 600;
        }

        .assertions-list {
          max-height: 200px;
          overflow-y: auto;
        }

        .assertion-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 8px;
          font-size: 11px;
        }

        .assertion-item.passed {
          background: var(--success-bg);
        }

        .assertion-item.failed {
          background: var(--error-bg);
        }

        .assertion-icon {
          font-size: 12px;
          width: 16px;
          text-align: center;
          margin-top: 1px;
        }

        .assertion-item.passed .assertion-icon {
          color: var(--success-color);
        }

        .assertion-item.failed .assertion-icon {
          color: var(--error-color);
        }

        .assertion-details {
          flex: 1;
        }

        .assertion-type {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .assertion-message {
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .assertion-path {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .assertion-values {
          display: grid;
          gap: 2px;
          font-family: 'Courier New', monospace;
          font-size: 10px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default TestScriptEditor;