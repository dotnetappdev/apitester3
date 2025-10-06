import React, { useState } from 'react';
import { Request, TestResult } from '../database/DatabaseManager';
import { TestSuite, TestExecutionResult } from '../testing/TestRunner';
import { UITestSuite, UITestExecutionResult } from '../testing/UITestRunner';
import { ApiResponse } from '../types';
import TestDebugger from './TestDebugger';

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
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredTests, setDiscoveredTests] = useState<Map<string, 'discovered' | 'not-discovered'>>(new Map());
  const [showTestTypeSelector, setShowTestTypeSelector] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);
  const [debugTestType, setDebugTestType] = useState<'api' | 'ui'>('api');
  const [debugTestData, setDebugTestData] = useState<Request | UITestSuite | undefined>();
  const [debugTestSuite, setDebugTestSuite] = useState<TestSuite | undefined>();

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
        handleOpenDebugger();
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
    // Just call the callback to create a new UI test suite
    // The panel will be opened by the parent component
    onNewUITestSuite?.();
  };

  const handleEditUITestSuite = (testSuite: UITestSuite) => {
    // Just call the callback to edit the UI test suite
    // The panel will be opened by the parent component
    onEditUITestSuite?.(testSuite);
  };

  const handleOpenDebugger = () => {
    // Default to API tests if available, otherwise UI tests
    if (requests.length > 0) {
      const firstRequest = requests[0];
      const testSuite = testSuites.get(firstRequest.id);
      setDebugTestType('api');
      setDebugTestData(firstRequest);
      setDebugTestSuite(testSuite);
    } else if (uiTestSuites.size > 0) {
      const firstUITest = Array.from(uiTestSuites.values())[0];
      setDebugTestType('ui');
      setDebugTestData(firstUITest);
      setDebugTestSuite(undefined);
    }
    setShowDebugger(true);
  };

  const handleRunDebug = async () => {
    // Implement debug run logic here
    console.log('Running debug for:', debugTestType, debugTestData);
    // This would integrate with the actual test runner
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
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7 3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM1.5 7a5.5 5.5 0 1 1 9.77 3.44l3.64 3.65a1 1 0 0 1-1.41 1.42l-3.65-3.65A5.5 5.5 0 0 1 1.5 7z"/>
            </svg>
          </button>
          {isRunning ? (
            <>
              <button
                className="test-action-button pause"
                onClick={() => {/* TODO: Implement pause */}}
                title="Pause Tests"
              >
                <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5 3h2v10H5V3zm4 0h2v10H9V3z"/>
                </svg>
              </button>
              <button
                className="test-action-button stop"
                onClick={() => setIsRunning(false)}
                title="Stop Tests"
              >
                <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="3" y="3" width="10" height="10" rx="1"/>
                </svg>
              </button>
            </>
          ) : (
            <button
              className="test-action-button play"
              onClick={handleRunAllTests}
              disabled={requests.length === 0 && uiTestSuites.size === 0}
              title="Run All Tests (F5)"
            >
              <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 2l10 6-10 6V2z"/>
              </svg>
            </button>
          )}
          <button
            className="test-action-button debug"
            onClick={handleOpenDebugger}
            disabled={isRunning || (requests.length === 0 && uiTestSuites.size === 0)}
            title="Debug Tests (F6)"
          >
            <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a3.5 3.5 0 0 1 3.5 3.5v1.088A5.002 5.002 0 0 1 13 10v3H3v-3a5.002 5.002 0 0 1 1.5-4.412V4.5A3.5 3.5 0 0 1 8 1zm0 1a2.5 2.5 0 0 0-2.5 2.5v1.336a1 1 0 0 1-.26.67A4 4 0 0 0 4 10v2h8v-2a4 4 0 0 0-1.24-2.894 1 1 0 0 1-.26-.67V4.5A2.5 2.5 0 0 0 8 2z"/>
            </svg>
          </button>
          <button
            className="test-action-button refresh"
            onClick={() => {/* TODO: Refresh tests */}}
            title="Refresh Tests"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
              <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
            </svg>
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

          {/* Discovery Banner - shown when tests exist but haven't been discovered */}
          {(requests.length > 0 || uiTestSuites.size > 0) && discoveredTests.size === 0 && !isDiscovering && (
            <div className="discovery-banner">
              <div className="discovery-banner-icon">🔍</div>
              <div className="discovery-banner-content">
                <div className="discovery-banner-title">Tests need to be discovered</div>
                <div className="discovery-banner-description">
                  Discover tests to validate and prepare them for execution
                </div>
              </div>
              <button 
                className="discovery-banner-button"
                onClick={handleDiscoverTests}
                disabled={isRunning}
              >
                Discover Now
              </button>
            </div>
          )}

          <div className="test-sections">
            {/* Request Tests Section - Uses Live Data */}
            <div className="test-section request-tests-section">
              <div className="test-section-header">
                <div className="section-title-wrapper">
                  <span className="section-icon">🌐</span>
                  <span className="section-title">Request Tests</span>
                  <span className="test-count">({requests.length})</span>
                  <span className="data-type-badge live-data">Live Data</span>
                </div>
                <div className="section-description">
                  API endpoint tests using live request/response data
                </div>
              </div>
              <div className="test-list">
                {requests.length === 0 ? (
                  <div className="no-tests">
                    <p>No request tests available</p>
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
                          <div className="test-item-actions">
                            <button
                              className="test-item-action-btn run-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                runIndividualTest(request.id);
                              }}
                              disabled={isRunning}
                              title="Run test"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M3 2l10 6-10 6V2z"/>
                              </svg>
                            </button>
                            {hasTests && (
                              <>
                                <button
                                  className="test-item-action-btn edit-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditTestSuite?.(testSuite);
                                  }}
                                  disabled={isRunning}
                                  title="Edit test suite"
                                >
                                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                  </svg>
                                </button>
                                <button
                                  className="test-item-action-btn delete-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Are you sure you want to delete this test suite?')) {
                                      onDeleteTestSuite?.(testSuite);
                                    }
                                  }}
                                  disabled={isRunning}
                                  title="Delete test suite"
                                >
                                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
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

            {/* UI Tests Section - Browser Automation */}
            <div className="test-section ui-tests-section">
              <div className="test-section-header">
                <div className="section-title-wrapper">
                  <div 
                    className="section-title-container"
                    onClick={() => setIsUITestsExpanded(!isUITestsExpanded)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className={`expand-icon ${isUITestsExpanded ? 'expanded' : ''}`}>▶</span>
                    <span className="section-icon">🖥️</span>
                    <span className="section-title">UI Tests</span>
                    <span className="test-count">({uiTestSuites.size})</span>
                    <span className="data-type-badge mock-data">Mock Data</span>
                  </div>
                  <button
                    className="create-test-btn"
                    onClick={handleCreateUITestSuite}
                    title="Create new UI test suite"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/>
                    </svg>
                  </button>
                </div>
                <div className="section-description">
                  Browser automation tests using Playwright with mock data for assertions
                </div>
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
                            <div className="test-item-actions">
                              <button
                                className="test-item-action-btn run-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  runUITestSuite(uiTestSuite);
                                }}
                                disabled={isRunning}
                                title="Run UI test"
                              >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M3 2l10 6-10 6V2z"/>
                                </svg>
                              </button>
                              <button
                                className="test-item-action-btn edit-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditUITestSuite(uiTestSuite);
                                }}
                                disabled={isRunning}
                                title="Edit UI test suite"
                              >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                </svg>
                              </button>
                              <button
                                className="test-item-action-btn delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Are you sure you want to delete this UI test suite?')) {
                                    onDeleteUITestSuite?.(uiTestSuite);
                                  }
                                }}
                                disabled={isRunning}
                                title="Delete UI test suite"
                              >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                </svg>
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

            {/* Unit Tests Section - Standalone Tests with Mock Data */}
            <div className="test-section unit-tests-section">
              <div className="test-section-header">
                <div className="section-title-wrapper">
                  <span className="section-icon">🧪</span>
                  <span className="section-title">Unit Tests</span>
                  <span className="test-count">(0)</span>
                  <span className="data-type-badge mock-data">Mock Data</span>
                </div>
                <div className="section-description">
                  Standalone unit tests for testing logic and utilities with mock data
                </div>
              </div>
              <div className="test-list">
                <div className="no-tests">
                  <p>No unit tests available</p>
                  <p className="text-small text-muted">Unit tests are standalone tests independent of requests</p>
                  <p className="text-small text-muted">Coming soon: Create unit tests for your utilities and business logic</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <TestDebugger
        isOpen={showDebugger}
        onClose={() => setShowDebugger(false)}
        testType={debugTestType}
        testData={debugTestData}
        testSuite={debugTestSuite}
        onRunDebug={handleRunDebug}
      />

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
          gap: 6px;
          align-items: center;
        }

        .test-action-button {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px 14px;
          border-radius: 4px;
          font-size: 16px;
          transition: all 0.2s ease;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 42px;
          min-height: 36px;
        }

        .test-action-button.play {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          border: 1px solid #45a049;
          box-shadow: 0 2px 6px rgba(76, 175, 80, 0.4);
        }

        .test-action-button.play:hover:not(:disabled) {
          background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
          box-shadow: 0 4px 10px rgba(76, 175, 80, 0.5);
          transform: translateY(-2px);
        }

        .test-action-button.stop {
          background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
          color: white;
          border: 1px solid #d32f2f;
          box-shadow: 0 2px 6px rgba(244, 67, 54, 0.4);
        }

        .test-action-button.stop:hover {
          background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
          box-shadow: 0 4px 10px rgba(244, 67, 54, 0.5);
          transform: translateY(-2px);
        }

        .test-action-button.pause {
          background: linear-gradient(135deg, #FFC107 0%, #FFA000 100%);
          color: white;
          border: 1px solid #FFA000;
          box-shadow: 0 2px 6px rgba(255, 193, 7, 0.4);
        }

        .test-action-button.pause:hover {
          background: linear-gradient(135deg, #FFA000 0%, #FF8F00 100%);
          box-shadow: 0 4px 10px rgba(255, 193, 7, 0.5);
          transform: translateY(-2px);
        }

        .test-action-button.debug {
          background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
          color: white;
          border: 1px solid #F57C00;
          box-shadow: 0 2px 6px rgba(255, 152, 0, 0.4);
        }

        .test-action-button.debug:hover:not(:disabled) {
          background: linear-gradient(135deg, #F57C00 0%, #E65100 100%);
          box-shadow: 0 4px 10px rgba(255, 152, 0, 0.5);
          transform: translateY(-2px);
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
          transform: translateY(-1px);
        }

        .test-action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
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

        .discovery-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          margin: 8px 12px;
          background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(79, 195, 247, 0.1) 100%);
          border: 1px solid rgba(33, 150, 243, 0.3);
          border-radius: 6px;
          animation: fadeInSlide 0.3s ease;
        }

        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .discovery-banner-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .discovery-banner-content {
          flex: 1;
        }

        .discovery-banner-title {
          font-weight: 600;
          font-size: 13px;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .discovery-banner-description {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .discovery-banner-button {
          background: var(--info-color);
          color: white;
          border: none;
          padding: 6px 16px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .discovery-banner-button:hover:not(:disabled) {
          background: #1976d2;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
        }

        .discovery-banner-button:active {
          transform: translateY(0);
        }

        .discovery-banner-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
          padding: 8px;
        }

        .test-section {
          margin-bottom: 16px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-secondary);
          overflow: hidden;
        }

        /* Visual distinction for different test types */
        .request-tests-section {
          border-left: 3px solid #4fc3f7;
        }

        .ui-tests-section {
          border-left: 3px solid #9c27b0;
        }

        .unit-tests-section {
          border-left: 3px solid #4caf50;
        }

        .test-section-header {
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-tertiary);
        }

        .section-title-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .section-title-container {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
        }

        .section-icon {
          font-size: 16px;
        }

        .section-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .section-description {
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 4px;
          padding-left: 24px;
        }

        .data-type-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .data-type-badge.live-data {
          background: rgba(79, 195, 247, 0.2);
          color: #4fc3f7;
          border: 1px solid rgba(79, 195, 247, 0.4);
        }

        .data-type-badge.mock-data {
          background: rgba(156, 39, 176, 0.2);
          color: #ce93d8;
          border: 1px solid rgba(156, 39, 176, 0.4);
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