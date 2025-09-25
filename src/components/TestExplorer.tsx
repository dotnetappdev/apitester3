import React, { useState, useEffect } from 'react';
import { Request, TestResult } from '../database/DatabaseManager';

interface TestExplorerProps {
  requests: Request[];
  onRunTest: (requestId: number) => Promise<TestResult>;
  onRunAllTests: () => Promise<TestResult[]>;
  testResults: Map<number, TestResult[]>;
}

export const TestExplorer: React.FC<TestExplorerProps> = ({
  requests,
  onRunTest,
  onRunAllTests,
  testResults
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);

  const getTestStatus = (requestId: number): 'pass' | 'fail' | 'none' => {
    const results = testResults.get(requestId);
    if (!results || results.length === 0) return 'none';
    return results[0].status; // Latest result
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

  const handleRunSingleTest = async (requestId: number) => {
    setIsRunning(true);
    try {
      await onRunTest(requestId);
    } finally {
      setIsRunning(false);
    }
  };

  const getTestSummary = () => {
    let passed = 0;
    let failed = 0;
    let total = 0;

    requests.forEach(request => {
      const results = testResults.get(request.id);
      if (results && results.length > 0) {
        total++;
        if (results[0].status === 'pass') passed++;
        else failed++;
      }
    });

    return { passed, failed, total: requests.length, tested: total };
  };

  const summary = getTestSummary();

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
                <span style={{ color: 'var(--success-color)' }}>✓ {summary.passed}</span>
              </span>
              <span className="stat-item">
                <span style={{ color: 'var(--error-color)' }}>✗ {summary.failed}</span>
              </span>
              <span className="stat-item">
                <span style={{ color: 'var(--text-muted)' }}>○ {summary.total - summary.tested}</span>
              </span>
              <span className="stat-total">
                {summary.tested}/{summary.total}
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
                const status = getTestStatus(request.id);
                const results = testResults.get(request.id);
                const latestResult = results?.[0];

                return (
                  <div
                    key={request.id}
                    className={`test-item ${selectedTest === request.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTest(selectedTest === request.id ? null : request.id)}
                  >
                    <div className="test-item-header">
                      <span 
                        className="test-status-icon"
                        style={{ color: getTestIconColor(status) }}
                      >
                        {getTestIcon(status)}
                      </span>
                      <span className="test-name">{request.name}</span>
                      <span className="test-method">{request.method}</span>
                      <button
                        className="run-single-test"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRunSingleTest(request.id);
                        }}
                        disabled={isRunning}
                        title="Run Test"
                      >
                        ▶
                      </button>
                    </div>

                    {selectedTest === request.id && latestResult && (
                      <div className="test-details">
                        <div className="test-result-info">
                          <div className="result-row">
                            <span className="result-label">Status:</span>
                            <span className={`result-value ${latestResult.status}`}>
                              {latestResult.statusCode} ({latestResult.status.toUpperCase()})
                            </span>
                          </div>
                          <div className="result-row">
                            <span className="result-label">Response Time:</span>
                            <span className="result-value">{latestResult.responseTime}ms</span>
                          </div>
                          <div className="result-row">
                            <span className="result-label">Run At:</span>
                            <span className="result-value">
                              {new Date(latestResult.runAt).toLocaleString()}
                            </span>
                          </div>
                          {latestResult.message && (
                            <div className="result-row">
                              <span className="result-label">Message:</span>
                              <span className="result-value">{latestResult.message}</span>
                            </div>
                          )}
                        </div>

                        {results && results.length > 1 && (
                          <div className="test-history">
                            <div className="history-header">Recent Results</div>
                            <div className="history-list">
                              {results.slice(1, 6).map((result, index) => (
                                <div key={index} className="history-item">
                                  <span 
                                    className="history-status"
                                    style={{ color: getTestIconColor(result.status) }}
                                  >
                                    {getTestIcon(result.status)}
                                  </span>
                                  <span className="history-time">
                                    {new Date(result.runAt).toLocaleTimeString()}
                                  </span>
                                  <span className="history-response-time">
                                    {result.responseTime}ms
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};