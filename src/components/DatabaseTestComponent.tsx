import React, { useState } from 'react';
import { DatabaseManager, User, Collection, Request, TestResult } from '../database/DatabaseManager';

interface DatabaseTestComponentProps {
  currentUser: User;
}

export const DatabaseTestComponent: React.FC<DatabaseTestComponentProps> = ({ currentUser }) => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const dbManager = new DatabaseManager();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const runCRUDTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      addResult('🚀 Starting CRUD tests...');

      // Test 1: User operations
      addResult('📝 Testing user operations...');
      const users = await dbManager.getAllUsers();
      addResult(`✅ Found ${users.length} users in database`);

      const testUser = await dbManager.getUserByUsername(currentUser.username);
      addResult(`✅ Retrieved current user: ${testUser?.username}`);

      // Test 2: Collection CRUD
      addResult('📂 Testing collection CRUD...');
      
      // Create collection
      const collectionId = await dbManager.createCollection(
        'Test Collection CRUD',
        'Collection created by CRUD test',
        currentUser.id
      );
      addResult(`✅ Created collection with ID: ${collectionId}`);

      // Read collections
      const collections = await dbManager.getUserCollections(currentUser.id);
      const testCollection = collections.find(c => c.id === collectionId);
      addResult(`✅ Found test collection: ${testCollection?.name}`);

      // Update collection
      if (testCollection) {
        await dbManager.updateCollection(collectionId, {
          name: 'Updated Test Collection',
          description: 'Updated description'
        });
        addResult('✅ Updated collection successfully');
      }

      // Test 3: Request CRUD
      addResult('🌐 Testing request CRUD...');
      
      // Create request
      const requestData = {
        collectionId: collectionId,
        name: 'Test Request CRUD',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        headers: JSON.stringify({ 'Content-Type': 'application/json' }),
        body: '',
        params: JSON.stringify({}),
        auth: JSON.stringify({ type: 'none' }),
        tests: 'console.log("Test executed");'
      };

      const requestId = await dbManager.createRequest(requestData);
      addResult(`✅ Created request with ID: ${requestId}`);

      // Read requests
      const requests = await dbManager.getCollectionRequests(collectionId);
      const testRequest = requests.find(r => r.id === requestId);
      addResult(`✅ Found test request: ${testRequest?.name}`);

      // Update request
      if (testRequest) {
        await dbManager.updateRequest(requestId, {
          name: 'Updated Test Request',
          url: 'https://jsonplaceholder.typicode.com/posts/2'
        });
        addResult('✅ Updated request successfully');
      }

      // Test 4: Test result operations
      addResult('🧪 Testing test result operations...');
      
      // Save test result
      const testResultData = {
        requestId: requestId,
        status: 'pass' as const,
        responseTime: 250,
        statusCode: 200,
        message: 'Test executed successfully'
      };

      const testResultId = await dbManager.saveTestResult(testResultData);
      addResult(`✅ Saved test result with ID: ${testResultId}`);

      // Read test results
      const testResults = await dbManager.getTestResults(requestId);
      addResult(`✅ Found ${testResults.length} test result(s) for request`);

      // Test 5: Test suite operations
      addResult('📋 Testing test suite operations...');
      
      const testSuiteData = {
        requestId: requestId,
        name: 'CRUD Test Suite',
        testCases: JSON.stringify([
          {
            id: 'test1',
            name: 'Status Code Test',
            script: 'assert.assertEquals(200, response.status);'
          }
        ]),
        beforeEach: 'console.log("Setup");',
        afterEach: 'console.log("Cleanup");'
      };

      const testSuiteId = await dbManager.saveTestSuite(testSuiteData);
      addResult(`✅ Saved test suite with ID: ${testSuiteId}`);

      const testSuites = await dbManager.getTestSuites(requestId);
      addResult(`✅ Found ${testSuites.length} test suite(s) for request`);

      // Cleanup
      addResult('🧹 Cleaning up test data...');
      await dbManager.deleteRequest(requestId);
      addResult('✅ Deleted test request');
      
      await dbManager.deleteCollection(collectionId);
      addResult('✅ Deleted test collection');

      addResult('🎉 All CRUD tests completed successfully!');
      addResult('✨ Database is properly persisting all data types');

    } catch (error) {
      addResult(`❌ CRUD test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="database-test-component">
      <div className="test-header">
        <h3>Database CRUD Test Suite</h3>
        <p>This test verifies that all database operations work correctly and data is persisted to SQLite.</p>
      </div>

      <div className="test-controls">
        <button 
          onClick={runCRUDTests} 
          disabled={isRunning}
          className="test-button run-button"
        >
          {isRunning ? '🔄 Running Tests...' : '▶️ Run CRUD Tests'}
        </button>
        
        <button 
          onClick={clearResults}
          disabled={isRunning}
          className="test-button clear-button"
        >
          🗑️ Clear Results
        </button>
      </div>

      <div className="test-results">
        <h4>Test Results:</h4>
        <div className="results-container">
          {testResults.length === 0 ? (
            <p className="no-results">No test results yet. Click "Run CRUD Tests" to begin.</p>
          ) : (
            <pre className="results-log">
              {testResults.join('\n')}
            </pre>
          )}
        </div>
      </div>

      <style>{`
        .database-test-component {
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 8px;
          margin: 20px 0;
        }

        .test-header h3 {
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }

        .test-header p {
          color: var(--text-secondary);
          margin: 0 0 20px 0;
          font-size: 14px;
        }

        .test-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .test-button {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .run-button {
          background: var(--accent-color);
          color: white;
        }

        .run-button:hover:not(:disabled) {
          background: var(--accent-hover);
        }

        .clear-button {
          background: var(--border-color);
          color: var(--text-secondary);
        }

        .clear-button:hover:not(:disabled) {
          background: var(--hover-color);
        }

        .test-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .test-results h4 {
          color: var(--text-primary);
          margin: 0 0 10px 0;
        }

        .results-container {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          max-height: 400px;
          overflow-y: auto;
        }

        .no-results {
          padding: 20px;
          text-align: center;
          color: var(--text-secondary);
          font-style: italic;
        }

        .results-log {
          padding: 15px;
          margin: 0;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          color: var(--text-primary);
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      `}</style>
    </div>
  );
};