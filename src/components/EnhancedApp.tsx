import React, { useState, useEffect } from 'react';
import { DatabaseManager, User, Collection, Request, TestResult } from '../database/DatabaseManager';
import { AuthManager } from '../auth/AuthManager';
import { SettingsManager } from '../settings/SettingsManager';
import { LoginDialog } from './LoginDialog';
import { EnhancedSidebar } from './EnhancedSidebar';
import { EnhancedRequestPanel } from './EnhancedRequestPanel';
import { ResponsePanel } from './ResponsePanel';
import { SettingsDialog } from './SettingsDialog';
import { DocumentationDialog } from './DocumentationDialog';
import { Splitter } from './Splitter';
import { ApiClient } from '../utils/api';
import { ApiResponse } from '../types';

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
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [documentationType, setDocumentationType] = useState<'overview' | 'unit-testing' | null>(null);
  const [splitterPosition, setSplitterPosition] = useState(50);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [enableSyntaxHighlighting, setEnableSyntaxHighlighting] = useState(true);
  const [enableTestExplorer, setEnableTestExplorer] = useState(true);
  
  // Test results
  const [testResults, setTestResults] = useState<Map<number, TestResult[]>>(new Map());
  
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

  // Listen for menu events from Electron
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      // Handle documentation menu events
      window.electronAPI.onMenuShowOverview(() => {
        setDocumentationType('overview');
        setShowDocumentation(true);
      });

      window.electronAPI.onMenuShowUnitTesting(() => {
        setDocumentationType('unit-testing');
        setShowDocumentation(true);
      });

      // Cleanup listeners on unmount
      return () => {
        if (window.electronAPI) {
          window.electronAPI.removeAllListeners('menu-show-overview');
          window.electronAPI.removeAllListeners('menu-show-unit-testing');
        }
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

      {showDocumentation && (
        <DocumentationDialog
          isOpen={showDocumentation}
          onClose={() => {
            setShowDocumentation(false);
            setDocumentationType(null);
          }}
          documentType={documentationType}
        />
      )}
    </div>
  );
};