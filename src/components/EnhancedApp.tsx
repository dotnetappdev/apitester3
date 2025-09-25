import React, { useState, useEffect } from 'react';
import { DatabaseManager, User, Collection, Request, TestResult } from '../database/DatabaseManager';
import { AuthManager } from '../auth/AuthManager';
import { SettingsManager } from '../settings/SettingsManager';
import { LoginDialog } from './LoginDialog';
import { EnhancedSidebar } from './EnhancedSidebar';
import { EnhancedRequestPanel } from './EnhancedRequestPanel';
import { ResponsePanel } from './ResponsePanel';
import { SettingsDialog } from './SettingsDialog';
import { ImportExportDialog } from './ImportExportDialog';
import { Splitter } from './Splitter';
import { ApiClient } from '../utils/api';
import { ApiResponse } from '../types';
import { TestSuite } from '../testing/TestRunner';

export const EnhancedApp: React.FC = () => {
  // Core state
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeRequest, setActiveRequest] = useState<Request | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showImportExport, setShowImportExport] = useState<'import' | 'export' | null>(null);
  const [splitterPosition, setSplitterPosition] = useState(50);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [enableSyntaxHighlighting, setEnableSyntaxHighlighting] = useState(true);
  const [enableTestExplorer, setEnableTestExplorer] = useState(true);
  
  // Test results and test suites
  const [testResults, setTestResults] = useState<Map<number, TestResult[]>>(new Map());
  const [testSuites] = useState<TestSuite[]>([]);
  
  // Managers
  const [dbManager] = useState(() => new DatabaseManager());
  const [authManager] = useState(() => AuthManager.getInstance(dbManager));
  const [settingsManager] = useState(() => SettingsManager.getInstance());

  // Initialize the application
  useEffect(() => {
    const initialize = async () => {
      try {
        await dbManager.initialize();
        
        // Load settings
        const settings = settingsManager.getSettings();
        setTheme(settings.theme);
        setEnableSyntaxHighlighting(settings.enableSyntaxHighlighting);
        setEnableTestExplorer(settings.enableTestExplorer);
        setSplitterPosition(settings.splitterPosition);
        
        // Apply theme to body
        document.body.className = settings.theme === 'light' ? 'light-theme' : '';
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize application:', error);
      }
    };

    initialize();
  }, [dbManager, settingsManager]);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = authManager.onSessionChange((session) => {
      setCurrentUser(session?.user || null);
      if (session?.user) {
        loadUserCollections(session.user.id);
      } else {
        setCollections([]);
        setActiveRequest(null);
        setResponse(null);
      }
    });

    return unsubscribe;
  }, [authManager]);

  // Listen for settings changes
  useEffect(() => {
    const unsubscribe = settingsManager.onSettingsChange((settings) => {
      setTheme(settings.theme);
      setEnableSyntaxHighlighting(settings.enableSyntaxHighlighting);
      setEnableTestExplorer(settings.enableTestExplorer);
      setSplitterPosition(settings.splitterPosition);
      
      // Apply theme to body
      document.body.className = settings.theme === 'light' ? 'light-theme' : '';
    });

    return unsubscribe;
  }, [settingsManager]);

  // Listen for menu events from electron
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      // Menu event handlers
      const handleMenuImportCollection = () => setShowImportExport('import');
      const handleMenuExportCollection = () => setShowImportExport('export');
      const handleMenuNewCollection = () => handleNewCollection();

      // Set up listeners
      (window as any).electronAPI.onMenuImportCollection(handleMenuImportCollection);
      (window as any).electronAPI.onMenuExportCollection(handleMenuExportCollection);
      (window as any).electronAPI.onMenuNewCollection(handleMenuNewCollection);

      // Cleanup
      return () => {
        (window as any).electronAPI.removeAllListeners('menu-import-collection');
        (window as any).electronAPI.removeAllListeners('menu-export-collection');
        (window as any).electronAPI.removeAllListeners('menu-new-collection');
      };
    }
  }, []);

  const loadUserCollections = async (userId: number) => {
    try {
      const userCollections = await dbManager.getUserCollections(userId);
      
      // Load requests for each collection
      const collectionsWithRequests = await Promise.all(
        userCollections.map(async (collection) => {
          const requests = await dbManager.getCollectionRequests(collection.id);
          return { ...collection, requests };
        })
      );
      
      setCollections(collectionsWithRequests);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleRequestSelect = (request: Request) => {
    setActiveRequest(request);
    setResponse(null);
  };

  const handleRequestChange = async (updatedRequest: Request) => {
    try {
      await dbManager.updateRequest(updatedRequest.id, updatedRequest);
      setActiveRequest(updatedRequest);
      
      // Update in collections
      setCollections(prev => prev.map(collection => ({
        ...collection,
        requests: collection.requests?.map(req => 
          req.id === updatedRequest.id ? updatedRequest : req
        ) || []
      })));
    } catch (error) {
      console.error('Failed to update request:', error);
    }
  };

  const handleSendRequest = async () => {
    if (!activeRequest) return;

    setIsLoading(true);
    setResponse(null);

    try {
      // Convert database format to API format
      const apiRequest = {
        id: activeRequest.id.toString(),
        name: activeRequest.name,
        method: activeRequest.method as any,
        url: activeRequest.url,
        headers: activeRequest.headers ? JSON.parse(activeRequest.headers) : {},
        body: activeRequest.body,
        params: activeRequest.params ? JSON.parse(activeRequest.params) : {},
        auth: activeRequest.auth ? JSON.parse(activeRequest.auth) : { type: 'none' }
      };

      const response = await ApiClient.makeRequest(apiRequest);
      setResponse(response);

      // Save test result
      if (activeRequest.tests) {
        const testResult = {
          requestId: activeRequest.id,
          status: response.status >= 200 && response.status < 300 ? 'pass' as const : 'fail' as const,
          responseTime: response.responseTime,
          statusCode: response.status,
          message: response.status >= 400 ? 'Request failed' : 'Request succeeded'
        };

        await dbManager.saveTestResult(testResult);
        await loadTestResults(activeRequest.id);
      }
    } catch (error) {
      console.error('Request failed:', error);
      
      const errorResponse: ApiResponse = {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        responseTime: 0,
        size: 0
      };
      
      setResponse(errorResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewRequest = async () => {
    if (!currentUser || collections.length === 0) return;

    const newRequest = {
      collectionId: collections[0].id,
      name: 'New Request',
      method: 'GET',
      url: '',
      headers: JSON.stringify({}),
      body: '',
      params: JSON.stringify({}),
      auth: JSON.stringify({ type: 'none' })
    };

    try {
      const requestId = await dbManager.createRequest(newRequest);
      const createdRequest = { ...newRequest, id: requestId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      
      setActiveRequest(createdRequest);
      await loadUserCollections(currentUser.id);
    } catch (error) {
      console.error('Failed to create request:', error);
    }
  };

  const handleNewCollection = async () => {
    if (!currentUser) return;

    const name = prompt('Collection name:');
    if (!name) return;

    try {
      const collectionId = await dbManager.createCollection(name, '', currentUser.id);
      await loadUserCollections(currentUser.id);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const loadTestResults = async (requestId: number) => {
    try {
      const results = await dbManager.getTestResults(requestId);
      setTestResults(prev => new Map(prev).set(requestId, results));
    } catch (error) {
      console.error('Failed to load test results:', error);
    }
  };

  const handleRunTest = async (requestId: number): Promise<TestResult> => {
    const request = collections.flatMap(c => c.requests || []).find(r => r.id === requestId);
    if (!request) throw new Error('Request not found');

    // Temporarily set as active and run
    const originalActive = activeRequest;
    setActiveRequest(request);
    await handleSendRequest();
    setActiveRequest(originalActive);

    // Return latest test result
    const results = await dbManager.getTestResults(requestId, 1);
    return results[0];
  };

  const handleRunAllTests = async (): Promise<TestResult[]> => {
    const allRequests = collections.flatMap(c => c.requests || []);
    const results: TestResult[] = [];

    for (const request of allRequests) {
      if (request.tests) {
        try {
          const result = await handleRunTest(request.id);
          results.push(result);
        } catch (error) {
          console.error(`Failed to run test for ${request.name}:`, error);
        }
      }
    }

    return results;
  };

  const handleExportCollections = async (selectedCollections: Collection[], selectedTestSuites: TestSuite[]) => {
    if (!currentUser) return;

    try {
      const result = await (window as any).electronAPI.exportCollection({
        collections: selectedCollections,
        testSuites: selectedTestSuites,
        exportedBy: currentUser.username
      });

      if (result.success) {
        console.log('Export successful:', result.stats);
        // Could show a success notification here
      } else if (result.error) {
        console.error('Export failed:', result.error);
        // Could show an error notification here
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImportCollections = async (importData: any, _options: any) => {
    if (!currentUser) return;

    try {
      // Create collections in the database
      for (const collection of importData.collections) {
        const collectionId = await dbManager.createCollection(
          collection.name,
          collection.description || '',
          collection.ownerId
        );

        // Create requests for this collection
        if (collection.requests) {
          for (const request of collection.requests) {
            await dbManager.createRequest({
              ...request,
              collectionId: collectionId
            });
          }
        }
      }

      // Reload collections to show imported data
      await loadUserCollections(currentUser.id);
      
      console.log('Import successful');
      // Could show a success notification here
    } catch (error) {
      console.error('Import failed:', error);
      // Could show an error notification here
    }
  };

  if (!isInitialized) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Initializing API Tester 3...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginDialog
        authManager={authManager}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="app-container enhanced">
      <div className="main-layout">
        <EnhancedSidebar
          user={currentUser}
          collections={collections}
          onRequestSelect={handleRequestSelect}
          onNewRequest={handleNewRequest}
          onNewCollection={handleNewCollection}
          activeRequest={activeRequest}
          testResults={testResults}
          onRunTest={handleRunTest}
          onRunAllTests={handleRunAllTests}
          onUserProfile={() => {/* TODO: Profile dialog */}}
          onSettings={() => setShowSettings(true)}
          enableTestExplorer={enableTestExplorer}
        />

        <div className="content-area">
          {activeRequest ? (
            <Splitter
              split="vertical"
              defaultSize={splitterPosition}
              onSizeChange={(size) => {
                setSplitterPosition(size);
                settingsManager.updateSettings({ splitterPosition: size });
              }}
            >
              <EnhancedRequestPanel
                request={activeRequest}
                onRequestChange={handleRequestChange}
                onSendRequest={handleSendRequest}
                isLoading={isLoading}
                enableSyntaxHighlighting={enableSyntaxHighlighting}
                theme={theme}
              />
              <ResponsePanel
                response={response}
                isLoading={isLoading}
              />
            </Splitter>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <h1>Welcome to API Tester 3</h1>
                <p>Professional API testing tool with enterprise features</p>
                <div className="welcome-actions">
                  <button className="btn btn-primary" onClick={handleNewRequest}>
                    Create New Request
                  </button>
                  <button className="btn btn-secondary" onClick={handleNewCollection}>
                    Create Collection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <SettingsDialog
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settingsManager={settingsManager}
        />
      )}

      {showImportExport && currentUser && (
        <ImportExportDialog
          isOpen={true}
          mode={showImportExport}
          currentUser={currentUser}
          collections={collections}
          testSuites={testSuites}
          onClose={() => setShowImportExport(null)}
          onImport={handleImportCollections}
          onExport={handleExportCollections}
        />
      )}
    </div>
  );
};