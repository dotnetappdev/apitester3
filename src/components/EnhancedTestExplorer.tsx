import React, { useState } from 'react';
import { Request, TestResult } from '../database/DatabaseManager';
import { TestSuite, TestExecutionResult } from '../testing/TestRunner';
import { UITestSuite, UITestExecutionResult } from '../testing/UITestRunner';
import { ApiResponse } from '../types';
import UITestDialog from './UITestDialog';

interface EnhancedTestExplorerProps {
  requests: Request[];
  testSuites: Map<number, TestSuite>;
  uiTestSuites: Map<string, UITestSuite>;
  onRunTest: (requestId: number) => Promise<TestResult>;
  onRunAllTests: () => Promise<TestResult[]>;
  onRunTestSuite: (requestId: number, testSuite: TestSuite, response: ApiResponse, request: any) => Promise<TestExecutionResult[]>;
  onRunUITestSuite: (testSuite: UITestSuite) => Promise<UITestExecutionResult[]>;
  onRunAllUITests: () => Promise<UITestExecutionResult[]>;
  onNewTestSuite?: (requestId: number) => void;
  onEditTestSuite?: (testSuite: TestSuite) => void;
  onDeleteTestSuite?: (testSuite: TestSuite) => void;
  onNewUITestSuite?: () => void;
  onEditUITestSuite?: (testSuite: UITestSuite) => void;
  onDeleteUITestSuite?: (testSuite: UITestSuite) => void;
  testResults: Map<number, TestResult[]>;
  testExecutionResults: Map<number, TestExecutionResult[]>;
  uiTestExecutionResults: Map<string, UITestExecutionResult[]>;
}

export const EnhancedTestExplorer: React.FC<EnhancedTestExplorerProps> = ({
  requests,
  testSuites,
  uiTestSuites,
  onRunTest,
  onRunAllTests,
  onRunTestSuite: _onRunTestSuite,
  onRunUITestSuite,
  onRunAllUITests,
  onNewTestSuite,
  onEditTestSuite,
  onDeleteTestSuite,
  onNewUITestSuite,
  onEditUITestSuite,
  onDeleteUITestSuite,
  testResults,
  testExecutionResults,
  uiTestExecutionResults
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isUITestsExpanded, setIsUITestsExpanded] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState<Set<number>>(new Set());
  const [expandedUITestSuites, setExpandedUITestSuites] = useState<Set<string>>(new Set());
  const [showUITestDialog, setShowUITestDialog] = useState(false);
  const [editingUITestSuite, setEditingUITestSuite] = useState<UITestSuite | undefined>();
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredTests, setDiscoveredTests] = useState<Map<string, 'discovered' | 'not-discovered'>>(new Map());
  const [showTestTypeSelector, setShowTestTypeSelector] = useState(false);

  // Keyboard shortcuts for test runner
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5' && !isRunning) {
        e.preventDefault();
        if (requests.length > 0 || uiTestSuites.size > 0) {
          handleRunAllTests();
        }
      } else if (e.key === 'F6' && !isRunning) {
        e.preventDefault();
        // TODO: Implement debug mode
        console.log('Debug tests (F6) - not yet implemented');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, requests.length, uiTestSuites.size]);

  // Get combined test status (both simple and execution tests)
  const getTestStatus = (requestId: number): 'pass' | 'fail' | 'none' => {
    const executionResults = testExecutionResults.get(requestId);
    if (executionResults && executionResults.length > 0) {
      const hasFailures = executionResults.some(r => r.status === 'fail' || r.status === 'error');
      return hasFailures ? 'fail' : 'pass';
    }
    
    const results = testResults.get(requestId);
    if (!results || results.length === 0) return 'none';
    return results[0].status;
  };

  const getUITestStatus = (testSuiteId: string): 'pass' | 'fail' | 'none' => {
    const results = uiTestExecutionResults.get(testSuiteId);
    if (!results || results.length === 0) return 'none';
    const hasFailures = results.some(r => r.status === 'fail' || r.status === 'error');
    return hasFailures ? 'fail' : 'pass';
  };

  const getTestIcon = (status: 'pass' | 'fail' | 'none' | 'skip', testId?: string) => {
    // Check discovery status first
    if (testId && discoveredTests.get(testId) === 'not-discovered') {
      return '🔍';
    }
    if (testId && discoveredTests.get(testId) === 'discovered' && status === 'none') {
      return '✅';
    }
    
    switch (status) {
      case 'pass': return '✔️';
      case 'fail': return '❌';
      case 'skip': return '⚠️';
      case 'none': 
      default: return '○';
    }
  };

  const getTestIconColor = (status: 'pass' | 'fail' | 'none' | 'skip', testId?: string) => {
    // Check discovery status first
    if (testId && discoveredTests.get(testId) === 'not-discovered') {
      return 'var(--text-muted)';
    }
    if (testId && discoveredTests.get(testId) === 'discovered' && status === 'none') {
      return 'var(--success-color)';
    }
    
    switch (status) {
      case 'pass': return 'var(--success-color)';
      case 'fail': return 'var(--error-color)';
      case 'skip': return 'var(--warning-color)';
      case 'none':
      default: return 'var(--text-muted)';
    }
  };

  // Discover all tests
  const handleDiscoverTests = async () => {
    setIsDiscovering(true);
    const newDiscoveredTests = new Map<string, 'discovered' | 'not-discovered'>();

    try {
      // Discover API Request Tests
      requests.forEach(request => {
        const testSuite = testSuites.get(request.id);
        if (testSuite) {
          testSuite.testCases.forEach(testCase => {
            const testId = `request-${request.id}-${testCase.id}`;
            newDiscoveredTests.set(testId, 'discovered');
          });
        }
      });

      // Discover UI Tests
      Array.from(uiTestSuites.values()).forEach(uiTestSuite => {
        uiTestSuite.testCases.forEach(testCase => {
          const testId = `ui-${uiTestSuite.id}-${testCase.id}`;
          newDiscoveredTests.set(testId, 'discovered');
        });
      });

      setDiscoveredTests(newDiscoveredTests);
      
      // Simulate discovery time
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Test discovery failed:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const getTestCounts = () => {
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    // Count API tests
    requests.forEach(request => {
      const testSuite = testSuites.get(request.id);
      if (testSuite) {
        const executionResults = testExecutionResults.get(request.id);
        if (executionResults) {
          totalTests += executionResults.length;
          passedTests += executionResults.filter(r => r.status === 'pass').length;
          failedTests += executionResults.filter(r => r.status === 'fail' || r.status === 'error').length;
        } else {
          totalTests += testSuite.testCases.filter(tc => tc.enabled).length;
        }
      }
    });

    // Count UI tests
    Array.from(uiTestSuites.values()).forEach(uiTestSuite => {
      const executionResults = uiTestExecutionResults.get(uiTestSuite.id);
      if (executionResults) {
        totalTests += executionResults.length;
        passedTests += executionResults.filter(r => r.status === 'pass').length;
        failedTests += executionResults.filter(r => r.status === 'fail' || r.status === 'error').length;
      } else {
        totalTests += uiTestSuite.testCases.filter(tc => tc.enabled).length;
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

  const toggleUITestSuiteExpanded = (testSuiteId: string) => {
    const newExpanded = new Set(expandedUITestSuites);
    if (newExpanded.has(testSuiteId)) {
      newExpanded.delete(testSuiteId);
    } else {
      newExpanded.add(testSuiteId);
    }
    setExpandedUITestSuites(newExpanded);
  };

  const runIndividualTest = async (requestId: number) => {
    const testSuite = testSuites.get(requestId);
    if (!testSuite) {
      await onRunTest(requestId);
      return;
    }

    setIsRunning(true);
    try {
      await onRunTest(requestId);
    } finally {
      setIsRunning(false);
    }
  };

  const runUITestSuite = async (testSuite: UITestSuite) => {
    setIsRunning(true);
    try {
      await onRunUITestSuite(testSuite);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunAllTests = async () => {
    setIsRunning(true);
    try {
      await onRunAllTests();
      await onRunAllUITests();
    } finally {
      setIsRunning(false);
    }
  };

  const handleCreateUITestSuite = () => {
    setEditingUITestSuite(undefined);
    setShowUITestDialog(true);
  };

  const handleEditUITestSuite = (testSuite: UITestSuite) => {
    setEditingUITestSuite(testSuite);
    setShowUITestDialog(true);
  };

  const handleSaveUITestSuite = (updatedTestSuite: UITestSuite) => {
    if (editingUITestSuite) {
      onEditUITestSuite?.(updatedTestSuite);
    } else {
      // For new test suites, we need a way to save them
      if (onNewUITestSuite) {
        // Pass the test suite data to the parent handler
        (onNewUITestSuite as any)(updatedTestSuite);
      }
    }
    setShowUITestDialog(false);
    setEditingUITestSuite(undefined);
  };

  const { totalTests, passedTests, failedTests } = getTestCounts();

  return (
    <div className="enhanced-test-explorer">
      <div className="test-explorer-header">
        <div 
          className="test-explorer-title"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▶</span>
          Test Explorer
        </div>
        <div className="test-actions">
          <button
            className="test-action-button discover"
            onClick={handleDiscoverTests}
            disabled={isRunning || isDiscovering}
            title="Discover All Tests"
          >
            {isDiscovering ? '🔄' : '🔍'}
          </button>
          {isRunning ? (
            <button
              className="test-action-button stop"
              onClick={() => setIsRunning(false)}
              title="Stop Tests"
            >
              ⏹️
            </button>
          ) : (
            <button
              className="test-action-button play"
              onClick={handleRunAllTests}
              disabled={requests.length === 0 && uiTestSuites.size === 0}
              title="Run All Tests (F5)"
            >
              ▶️
            </button>
          )}
          <button
            className="test-action-button debug"
            disabled={isRunning || (requests.length === 0 && uiTestSuites.size === 0)}
            title="Debug Tests (F6)"
          >
            🐛
          </button>
          <button
            className="test-action-button"
            onClick={() => {/* TODO: Refresh tests */}}
            title="Refresh Tests"
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
                <span style={{ color: 'var(--info-color)' }}>🔍 {discoveredTests.size}</span>
              </span>
              <span className="stat-item">
                <span style={{ color: 'var(--success-color)' }}>✔️ {passedTests}</span>
              </span>
              <span className="stat-item">
                <span style={{ color: 'var(--error-color)' }}>❌ {failedTests}</span>
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

          <div className="test-sections">
            {/* API Tests Section */}
            <div className="test-section">
              <div className="test-section-header">
                <span className="section-title">API Tests</span>
                <span className="test-count">({requests.length})</span>
              </div>
              <div className="test-list">
                {requests.length === 0 ? (
                  <div className="no-tests">
                    <p>No API tests available</p>
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
                            style={{ color: getTestIconColor(status, `request-${request.id}`) }}
                          >
                            {getTestIcon(status, `request-${request.id}`)}
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
                            {testSuite.testCases.map((testCase, _index) => {
                              const testResult = executionResults.find(r => r.testCaseId === testCase.id);
                              const testStatus = testResult ? 
                                (testResult.status === 'error' ? 'fail' : testResult.status) : 'none';
                              const testId = `request-${request.id}-${testCase.id}`;

                              return (
                                <div key={testCase.id} className="test-case-item">
                                  <span 
                                    className="test-case-icon"
                                    style={{ color: getTestIconColor(testStatus, testId) }}
                                  >
                                    {getTestIcon(testStatus, testId)}
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

            {/* UI Tests Section */}
            <div className="test-section">
              <div className="test-section-header">
                <div 
                  className="section-title-container"
                  onClick={() => setIsUITestsExpanded(!isUITestsExpanded)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className={`expand-icon ${isUITestsExpanded ? 'expanded' : ''}`}>▶</span>
                  <span className="section-title">UI Tests</span>
                  <span className="test-count">({uiTestSuites.size})</span>
                </div>
                <button
                  className="create-test-btn"
                  onClick={handleCreateUITestSuite}
                  title="Create new UI test suite"
                >
                  +
                </button>
              </div>
              
              {isUITestsExpanded && (
                <div className="test-list">
                  {uiTestSuites.size === 0 ? (
                    <div className="no-tests">
                      <p>No UI tests available</p>
                      <p className="text-small text-muted">Create UI test suites to test your application's interface</p>
                      <button className="create-first-test-btn" onClick={handleCreateUITestSuite}>
                        Create First UI Test
                      </button>
                    </div>
                  ) : (
                    Array.from(uiTestSuites.values()).map(uiTestSuite => {
                      const isExpanded = expandedUITestSuites.has(uiTestSuite.id);
                      const status = getUITestStatus(uiTestSuite.id);
                      const executionResults = uiTestExecutionResults.get(uiTestSuite.id) || [];

                      return (
                        <div key={uiTestSuite.id} className="test-request-item ui-test-item">
                          <div 
                            className="test-request-header"
                            onClick={() => toggleUITestSuiteExpanded(uiTestSuite.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <span className="expand-icon">
                              {isExpanded ? '▼' : '▶'}
                            </span>
                            <span 
                              className="test-status-icon"
                              style={{ color: getTestIconColor(status, `ui-${uiTestSuite.id}`) }}
                            >
                              {getTestIcon(status, `ui-${uiTestSuite.id}`)}
                            </span>
                            <div className="test-request-info">
                              <div className="test-request-name">
                                🌐 {uiTestSuite.name}
                              </div>
                              <div className="test-request-details">
                                {uiTestSuite.testCases.length} UI test(s)
                              </div>
                            </div>
                            <div className="ui-test-actions">
                              <button
                                className="edit-test-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditUITestSuite(uiTestSuite);
                                }}
                                disabled={isRunning}
                                title="Edit test suite"
                              >
                                ✏️
                              </button>
                              <button
                                className="run-test-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  runUITestSuite(uiTestSuite);
                                }}
                                disabled={isRunning}
                              >
                                ▶
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="test-cases-list">
                              {uiTestSuite.testCases.map((testCase, _index) => {
                                const testResult = executionResults.find(r => r.testCaseId === testCase.id);
                                const testStatus = testResult ? 
                                  (testResult.status === 'error' ? 'fail' : testResult.status) : 'none';
                                const testId = `ui-${uiTestSuite.id}-${testCase.id}`;

                                return (
                                  <div key={testCase.id} className="test-case-item ui-test-case">
                                    <span 
                                      className="test-case-icon"
                                      style={{ color: getTestIconColor(testStatus, testId) }}
                                    >
                                      {getTestIcon(testStatus, testId)}
                                    </span>
                                    <div className="test-case-info">
                                      <div className="test-case-name">
                                        {testCase.name}
                                        {!testCase.enabled && <span className="disabled-indicator"> (disabled)</span>}
                                        <span className="browser-indicator">({testCase.browser})</span>
                                        {!testCase.headless && <span className="headed-indicator">👁️</span>}
                                      </div>
                                      {testResult && (
                                        <div className="test-case-result">
                                          {testResult.executionTime}ms
                                          {testResult.errorMessage && (
                                            <span className="error-preview">
                                              - {testResult.errorMessage.substring(0, 50)}...
                                            </span>
                                          )}
                                          {testResult.screenshot && (
                                            <span className="screenshot-indicator">📸</span>
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
              )}
            </div>
          </div>
        </div>
      )}

      {showUITestDialog && (
        <UITestDialog
          isOpen={showUITestDialog}
          onClose={() => {
            setShowUITestDialog(false);
            setEditingUITestSuite(undefined);
          }}
          onSave={handleSaveUITestSuite}
          existingTestSuite={editingUITestSuite}
          title={editingUITestSuite ? 'Edit UI Test Suite' : 'Create UI Test Suite'}
        />
      )}

      <style>{`
        .enhanced-test-explorer {
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

        .expand-icon.expanded {
          transform: rotate(90deg);
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

        .test-action-button.play {
          color: var(--success-color);
        }

        .test-action-button.play:hover:not(:disabled) {
          background: rgba(76, 175, 80, 0.1);
          color: var(--success-color);
        }

        .test-action-button.stop {
          color: var(--error-color);
        }

        .test-action-button.stop:hover {
          background: rgba(244, 71, 71, 0.1);
          color: var(--error-color);
        }

        .test-action-button.debug {
          color: var(--warning-color);
        }

        .test-action-button.debug:hover:not(:disabled) {
          background: rgba(255, 193, 7, 0.1);
          color: var(--warning-color);
        }

        .test-action-button.discover {
          color: var(--info-color);
        }

        .test-action-button.discover:hover:not(:disabled) {
          background: rgba(33, 150, 243, 0.1);
          color: var(--info-color);
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

        .test-sections {
          flex: 1;
          overflow-y: auto;
          padding: 4px;
        }

        .test-section {
          margin-bottom: 12px;
        }

        .test-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          margin-bottom: 4px;
        }

        .section-title-container {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
        }

        .section-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .test-count {
          font-size: 10px;
          color: var(--text-muted);
        }

        .create-test-btn {
          background: var(--accent-color);
          border: none;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.1s;
        }

        .create-test-btn:hover {
          background: var(--accent-hover);
          transform: scale(1.1);
        }

        .test-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
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

        .create-first-test-btn {
          margin-top: 8px;
          padding: 6px 12px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          transition: all 0.1s;
        }

        .create-first-test-btn:hover {
          background: var(--accent-hover);
        }

        .test-request-item {
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--bg-primary);
          overflow: hidden;
        }

        .ui-test-item {
          border-left: 3px solid var(--accent-color);
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

        .ui-test-actions {
          display: flex;
          gap: 4px;
        }

        .run-test-btn,
        .edit-test-btn {
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

        .edit-test-btn:hover:not(:disabled) {
          background: var(--warning-color);
          color: white;
        }

        .run-test-btn:disabled,
        .edit-test-btn:disabled {
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

        .ui-test-case {
          border-left: 2px solid var(--accent-color);
          margin-left: 8px;
          padding-left: 20px;
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
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .disabled-indicator {
          color: var(--text-muted);
          font-style: italic;
        }

        .browser-indicator {
          color: var(--text-muted);
          font-size: 9px;
        }

        .headed-indicator {
          font-size: 10px;
          title: "Running with browser UI visible";
        }

        .test-case-result {
          font-size: 10px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .error-preview {
          color: var(--error-color);
        }

        .screenshot-indicator {
          font-size: 10px;
          cursor: pointer;
          title: "Screenshot available";
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

export default EnhancedTestExplorer;