import React, { useState, useEffect } from 'react';
import { Request, TestResult } from '../database/DatabaseManager';
import { TestSuite, TestExecutionResult, TestRunner } from '../testing/TestRunner';
import { ApiResponse } from '../types';

interface TestExplorerProps {
  requests: Request[];
  testSuites: Map<number, TestSuite>;
  onRunTest: (requestId: number) => Promise<TestResult>;
  onRunAllTests: () => Promise<TestResult[]>;
  onRunTestSuite: (requestId: number, testSuite: TestSuite, response: ApiResponse, request: any) => Promise<TestExecutionResult[]>;
  testResults: Map<number, TestResult[]>;
  testExecutionResults: Map<number, TestExecutionResult[]>;
}

export const TestExplorer: React.FC<TestExplorerProps> = ({
  requests,
  testSuites,
  onRunTest,
  onRunAllTests,
  onRunTestSuite,
  testResults,
  testExecutionResults
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [expandedRequests, setExpandedRequests] = useState<Set<number>>(new Set());

  // Get combined test status (both simple and execution tests)
  const getTestStatus = (requestId: number): 'pass' | 'fail' | 'none' => {
    // Check execution results first (more detailed)
    const executionResults = testExecutionResults.get(requestId);
    if (executionResults && executionResults.length > 0) {
      const hasFailures = executionResults.some(r => r.status === 'fail' || r.status === 'error');
      return hasFailures ? 'fail' : 'pass';
    }
    
    // Fall back to simple test results
    const results = testResults.get(requestId);
    if (!results || results.length === 0) return 'none';
    return results[0].status; // Latest result
  };

  const getTestCounts = () => {
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    requests.forEach(request => {
      const testSuite = testSuites.get(request.id);
      if (testSuite && testSuite.testCases.length > 0) {
        const executionResults = testExecutionResults.get(request.id);
        if (executionResults && executionResults.length > 0) {
          totalTests += executionResults.length;
          passedTests += executionResults.filter(r => r.status === 'pass').length;
          failedTests += executionResults.filter(r => r.status === 'fail' || r.status === 'error').length;
        } else {
          totalTests += testSuite.testCases.filter(tc => tc.enabled).length;
        }
      }
    });
    
    return { totalTests, passedTests, failedTests };
  };

  const toggleRequestExpanded = (requestId: number) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const runIndividualTest = async (requestId: number) => {
    const testSuite = testSuites.get(requestId);
    if (!testSuite) {
      // Fall back to simple test
      await onRunTest(requestId);
      return;
    }

    setIsRunning(true);
    try {
      // This would need to be implemented in the parent component
      // For now, we'll call the simple test runner
      await onRunTest(requestId);
    } finally {
      setIsRunning(false);
    }
  };

  const getTestIcon = (status: 'pass' | 'fail' | 'none') => {
    switch (status) {
      case 'pass': return '✓';
      case 'fail': return '✗';
      default: return '○';
    }
  };

  const getTestIconColor = (status: 'pass' | 'fail' | 'none') => {
    switch (status) {
      case 'pass': return 'var(--success-color)';
      case 'fail': return 'var(--error-color)';
      default: return 'var(--text-muted)';
    }
  };

  const handleRunAllTests = async () => {
    setIsRunning(true);
    try {
      await onRunAllTests();
    } finally {
      setIsRunning(false);
    }
  };

  const { totalTests, passedTests, failedTests } = getTestCounts();

  // Remove redundant methods - use the enhanced versions above
  return (
    <div className="test-explorer">
      <div className="test-explorer-header">
        <div 
          className="test-explorer-title"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span 
            className="expand-icon"
            style={{
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease'
            }}
          >
            ▶
          </span>
          <span>Test Explorer</span>
        </div>
        
        <div className="test-actions">
          <button
            className="test-action-button"
            onClick={handleRunAllTests}
            disabled={isRunning || requests.length === 0}
            title="Run All Tests"
          >
            ⚡
          </button>
          <button
            className="test-action-button"
            onClick={() => {/* TODO: Refresh tests */}}
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="test-explorer-content">
          <div className="test-summary">
            <div className="summary-stats">
              <span className="stat-item">
                <span style={{ color: 'var(--success-color)' }}>✓ {passedTests}</span>
              </span>
              <span className="stat-item">
                <span style={{ color: 'var(--error-color)' }}>✗ {failedTests}</span>
              </span>
              <span className="stat-item">
                <span style={{ color: 'var(--text-muted)' }}>○ {totalTests - passedTests - failedTests}</span>
              </span>
              <span className="stat-total">
                {passedTests + failedTests}/{totalTests}
              </span>
            </div>
            {isRunning && (
              <div className="test-running">
                <div className="spinner small"></div>
                <span>Running tests...</span>
              </div>
            )}
          </div>

          <div className="test-list">
            {requests.length === 0 ? (
              <div className="no-tests">
                <p>No tests available</p>
                <p className="text-small text-muted">Create requests with test scripts to see them here</p>
              </div>
            ) : (
              requests.map(request => {
                const testSuite = testSuites.get(request.id);
                const hasTests = testSuite && testSuite.testCases.length > 0;
                const isExpanded = expandedRequests.has(request.id);
                const status = getTestStatus(request.id);
                const executionResults = testExecutionResults.get(request.id) || [];

                return (
                  <div key={request.id} className="test-request-item">
                    <div 
                      className="test-request-header"
                      onClick={() => hasTests && toggleRequestExpanded(request.id)}
                      style={{ cursor: hasTests ? 'pointer' : 'default' }}
                    >
                      {hasTests && (
                        <span className="expand-icon">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      )}
                      <span 
                        className="test-status-icon"
                        style={{ color: getTestIconColor(status) }}
                      >
                        {getTestIcon(status)}
                      </span>
                      <div className="test-request-info">
                        <div className="test-request-name">{request.name}</div>
                        <div className="test-request-details">
                          {hasTests ? `${testSuite.testCases.length} test(s)` : 'No tests'}
                        </div>
                      </div>
                      <button
                        className="run-test-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          runIndividualTest(request.id);
                        }}
                        disabled={isRunning}
                      >
                        ▶
                      </button>
                    </div>

                    {hasTests && isExpanded && (
                      <div className="test-cases-list">
                        {testSuite.testCases.map((testCase, index) => {
                          const testResult = executionResults.find(r => r.testCaseId === testCase.id);
                          const testStatus = testResult ? 
                            (testResult.status === 'error' ? 'fail' : testResult.status) : 'none';

                          return (
                            <div key={testCase.id} className="test-case-item">
                              <span 
                                className="test-case-icon"
                                style={{ color: getTestIconColor(testStatus) }}
                              >
                                {getTestIcon(testStatus)}
                              </span>
                              <div className="test-case-info">
                                <div className="test-case-name">
                                  {testCase.name}
                                  {!testCase.enabled && <span className="disabled-indicator"> (disabled)</span>}
                                </div>
                                {testResult && (
                                  <div className="test-case-result">
                                    {testResult.executionTime}ms
                                    {testResult.errorMessage && (
                                      <span className="error-preview">
                                        - {testResult.errorMessage.substring(0, 50)}...
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .test-explorer {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
        }

        .test-explorer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .test-explorer-title {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .expand-icon {
          color: var(--text-muted);
          font-size: 10px;
          transition: transform 0.15s ease;
        }

        .test-actions {
          display: flex;
          gap: 4px;
        }

        .test-action-button {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 3px;
          font-size: 12px;
          transition: all 0.1s;
        }

        .test-action-button:hover:not(:disabled) {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .test-action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .test-explorer-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .test-summary {
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-primary);
        }

        .summary-stats {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .stat-total {
          color: var(--text-muted);
          margin-left: auto;
        }

        .test-running {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          font-size: 10px;
          color: var(--text-muted);
        }

        .test-list {
          flex: 1;
          overflow-y: auto;
          padding: 4px;
        }

        .no-tests {
          padding: 20px;
          text-align: center;
          color: var(--text-muted);
        }

        .no-tests p {
          margin: 4px 0;
          font-size: 12px;
        }

        .test-request-item {
          margin-bottom: 4px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--bg-primary);
          overflow: hidden;
        }

        .test-request-header {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          gap: 8px;
          transition: background-color 0.1s;
        }

        .test-request-header:hover {
          background: var(--bg-hover);
        }

        .test-request-info {
          flex: 1;
          min-width: 0;
        }

        .test-request-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .test-request-details {
          font-size: 10px;
          color: var(--text-muted);
        }

        .run-test-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 3px;
          font-size: 10px;
          transition: all 0.1s;
        }

        .run-test-btn:hover:not(:disabled) {
          background: var(--accent-color);
          color: white;
        }

        .run-test-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .test-cases-list {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          padding: 4px 0;
        }

        .test-case-item {
          display: flex;
          align-items: center;
          padding: 6px 12px 6px 28px;
          gap: 8px;
          transition: background-color 0.1s;
        }

        .test-case-item:hover {
          background: var(--bg-hover);
        }

        .test-case-icon {
          font-size: 11px;
          width: 12px;
          text-align: center;
        }

        .test-case-info {
          flex: 1;
          min-width: 0;
        }

        .test-case-name {
          font-size: 11px;
          color: var(--text-primary);
          margin-bottom: 1px;
        }

        .disabled-indicator {
          color: var(--text-muted);
          font-style: italic;
        }

        .test-case-result {
          font-size: 10px;
          color: var(--text-muted);
        }

        .error-preview {
          color: var(--error-color);
        }

        .spinner {
          width: 12px;
          height: 12px;
          border: 2px solid var(--border-color);
          border-top: 2px solid var(--accent-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};