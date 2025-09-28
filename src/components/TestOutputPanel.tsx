import React from 'react';
import { TestResult } from '../database/DatabaseManager';

interface TestOutputPanelProps {
  results?: TestResult[];
}

export const TestOutputPanel: React.FC<TestOutputPanelProps> = ({ results = [] }) => {
  return (
    <div className="test-output-panel">
      <div className="test-output-header">Test Output</div>
      <div className="test-output-body">
        {results.length === 0 ? (
          <div className="text-muted">No test results yet</div>
        ) : (
          <table className="test-output-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Status</th>
                <th>Code</th>
                <th>Time (ms)</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className={r.status === 'pass' ? 'pass' : 'fail'}>
                  <td>{`#${r.requestId}`}</td>
                  <td>{r.status}</td>
                  <td>{r.statusCode}</td>
                  <td>{r.responseTime}</td>
                  <td>{r.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TestOutputPanel;
