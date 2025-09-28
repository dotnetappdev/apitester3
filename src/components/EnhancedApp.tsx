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
import { DocumentationDialog } from './DocumentationDialog';
import { InputDialog } from './InputDialog';
import { CodeGenerationDialog } from './CodeGenerationDialog';
import { RequestDialog } from './RequestDialog';
import { TestSuiteDialog } from './TestSuiteDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { CollectionIcon } from './ModernButton';
import { Splitter } from './Splitter';
import { DockableLayout } from './DockableLayout';
import { ApiClient } from '../utils/api';
import { ApiResponse } from '../types';
import { TestSuite, TestExecutionResult } from '../testing/TestRunner';
import { UITestSuite, UITestExecutionResult, UITestRunner } from '../testing/UITestRunner';
import { useRealTimeData } from '../hooks/useRealTimeData';

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
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false);
  const [showCodeGeneration, setShowCodeGeneration] = useState(false);
  const [documentationType, setDocumentationType] = useState<'overview' | 'unit-testing' | null>(null);
  
  // Request and Test CRUD dialogs
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showTestSuiteDialog, setShowTestSuiteDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [editingTestSuite, setEditingTestSuite] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'request' | 'testSuite' | 'collection', id: number, name: string} | null>(null);
  const [splitterPosition, setSplitterPosition] = useState(50);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [enableSyntaxHighlighting, setEnableSyntaxHighlighting] = useState(true);
  const [enableTestExplorer, setEnableTestExplorer] = useState(true);
  
  // Test results and test suites
  const [testResults, setTestResults] = useState<Map<number, TestResult[]>>(new Map());
  const [testSuites] = useState<TestSuite[]>([]);
  const [testExecutionResults, setTestExecutionResults] = useState<Map<number, TestExecutionResult[]>>(new Map());
  
  // UI Test suites and results
  const [uiTestSuites, setUITestSuites] = useState<Map<string, UITestSuite>>(new Map());
  const [uiTestExecutionResults, setUITestExecutionResults] = useState<Map<string, UITestExecutionResult[]>>(new Map());
  
  // Managers
  const [dbManager] = useState(() => new DatabaseManager());
  const [authManager] = useState(() => AuthManager.getInstance(dbManager));
  const [settingsManager] = useState(() => SettingsManager.getInstance());
  const { subscribeToUpdates, broadcastUpdate, updateDataCache } = useRealTimeData();

  // Computed values for test explorer
  const testSuitesMap = new Map<number, TestSuite>(
    testSuites.map(suite => [suite.requestId, suite])
  );

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
        
        // Initialize with sample UI test suite for demonstration
        const sampleUITestSuite: UITestSuite = {
          id: 'sample_ui_test_' + Date.now(),
          name: 'Sample UI Tests',
          testCases: [
            {
              id: 'test_homepage_' + Date.now(),
              name: 'Homepage Loads Correctly',
              description: 'Verify that the homepage loads and displays correctly',
              enabled: true,
              script: `// Sample UI Test - Homepage
await page.goto('https://example.com');
await page.waitForLoadState('networkidle');

// Check page title
assert.assertPageTitle('Example Domain', 'Page should have correct title');

// Check main heading
assert.assertElementExists('h1', 'Page should have a main heading');
assert.assertElementText('h1', 'Example Domain', 'Heading should display correct text');

// Check if the page is visible
assert.assertElementVisible('h1', 'Heading should be visible to users');

console.log('Homepage test completed successfully');`,
              timeout: 30000,
              browser: 'chromium',
              headless: true,
              viewport: { width: 1280, height: 720 },
              tags: ['smoke', 'homepage']
            }
          ]
        };
        
        const initialUITestSuites = new Map<string, UITestSuite>();
        initialUITestSuites.set(sampleUITestSuite.id, sampleUITestSuite);
        setUITestSuites(initialUITestSuites);
      } else {
        setCollections([]);
        setActiveRequest(null);
        setResponse(null);
        setUITestSuites(new Map());
        setUITestExecutionResults(new Map());
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
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      // Menu event handlers for import/export
      const handleMenuImportCollection = () => setShowImportExport('import');
      const handleMenuExportCollection = () => setShowImportExport('export');
      const handleMenuNewCollection = () => handleNewCollection();

      // Handle documentation menu events
      const handleMenuShowOverview = () => {
        setDocumentationType('overview');
        setShowDocumentation(true);
      };

      const handleMenuShowUnitTesting = () => {
        setDocumentationType('unit-testing');
        setShowDocumentation(true);
      };

      const handleMenuCodeGeneration = () => {
        setShowCodeGeneration(true);
      };

      // Set up listeners
      (window as any).electronAPI.onMenuImportCollection?.(handleMenuImportCollection);
      (window as any).electronAPI.onMenuExportCollection?.(handleMenuExportCollection);
      (window as any).electronAPI.onMenuNewCollection?.(handleMenuNewCollection);
      (window as any).electronAPI.onMenuShowOverview?.(handleMenuShowOverview);
      (window as any).electronAPI.onMenuShowUnitTesting?.(handleMenuShowUnitTesting);
      (window as any).electronAPI.onMenuCodeGeneration?.(handleMenuCodeGeneration);

      // Cleanup
      return () => {
        (window as any).electronAPI.removeAllListeners?.('menu-import-collection');
        (window as any).electronAPI.removeAllListeners?.('menu-export-collection');
        (window as any).electronAPI.removeAllListeners?.('menu-new-collection');
        (window as any).electronAPI.removeAllListeners?.('menu-show-overview');
        (window as any).electronAPI.removeAllListeners?.('menu-show-unit-testing');
        (window as any).electronAPI.removeAllListeners?.('menu-code-generation');
      };
    }
  }, []);

  // Subscribe to real-time data updates
  useEffect(() => {
    const unsubscribe = subscribeToUpdates((event) => {
      console.log('Real-time update received:', event);
      
      switch (event.type) {
        case 'collection_updated':
          const updatedCollection = event.data as Collection;
          setCollections(prev => prev.map(c => 
            c.id === updatedCollection.id ? updatedCollection : c
          ));
          break;
          
        case 'request_updated':
          const updatedRequest = event.data as Request;
          setCollections(prev => prev.map(collection => ({
            ...collection,
            requests: collection.requests?.map(req => 
              req.id === updatedRequest.id ? updatedRequest : req
            ) || []
          })));
          
          // Update active request if it's the one being updated
          if (activeRequest?.id === updatedRequest.id) {
            setActiveRequest(updatedRequest);
          }
          break;
          
        case 'test_result_updated':
          const { requestId, results } = event.data as { requestId: number; results: TestResult[] };
          setTestResults(prev => new Map(prev).set(requestId, results));
          break;
          
        case 'collection_deleted':
          const deletedCollectionId = event.data as number;
          setCollections(prev => prev.filter(c => c.id !== deletedCollectionId));
          break;
          
        case 'request_deleted':
          const deletedRequestId = event.data as number;
          setCollections(prev => prev.map(collection => ({
            ...collection,
            requests: collection.requests?.filter(r => r.id !== deletedRequestId) || []
          })));
          
          if (activeRequest?.id === deletedRequestId) {
            setActiveRequest(null);
            setResponse(null);
          }
          
          setTestResults(prev => {
            const updated = new Map(prev);
            updated.delete(deletedRequestId);
            return updated;
          });
          
          setTestExecutionResults(prev => {
            const updated = new Map(prev);
            updated.delete(deletedRequestId);
            return updated;
          });
          break;
      }
    });

    return unsubscribe;
  }, [subscribeToUpdates, activeRequest]);

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
      
      // Update real-time data cache
      updateDataCache(collectionsWithRequests, testResults, testExecutionResults);
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
      const updatedCollections = collections.map(collection => ({
        ...collection,
        requests: collection.requests?.map(req => 
          req.id === updatedRequest.id ? updatedRequest : req
        ) || []
      }));
      
      setCollections(updatedCollections);
      
      // Broadcast real-time update
      broadcastUpdate({
        type: 'request_updated',
        data: updatedRequest
      });
      
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
    
    setEditingRequest(null); // Clear any existing request being edited
    setShowRequestDialog(true);
  };

  const handleNewCollection = async () => {
    if (!currentUser) return;
    setShowNewCollectionDialog(true);
  };

  const handleNewCollectionConfirm = async (name: string) => {
    if (!currentUser) return;

    try {
      const collectionId = await dbManager.createCollection(name, '', currentUser.id);
      await loadUserCollections(currentUser.id);
      setShowNewCollectionDialog(false);
      
      // Find the newly created collection and broadcast update
      const updatedCollections = await dbManager.getUserCollections(currentUser.id);
      const newCollection = updatedCollections.find(c => c.id === collectionId);
      if (newCollection) {
        broadcastUpdate({
          type: 'collection_updated',
          data: newCollection
        });
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const handleNewCollectionCancel = () => {
    setShowNewCollectionDialog(false);
  };

  // Request CRUD handlers
  const handleEditRequest = (request: Request) => {
    setEditingRequest(request);
    setShowRequestDialog(true);
  };

  const handleSaveRequest = async (requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) return;

    try {
      const requestId = await dbManager.createRequest(requestData);
      const createdRequest = { 
        ...requestData, 
        id: requestId, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      };
      
      setActiveRequest(createdRequest);
      await loadUserCollections(currentUser.id);
      setShowRequestDialog(false);
      
      // Broadcast real-time update
      broadcastUpdate({
        type: 'request_updated',
        data: createdRequest
      });
    } catch (error) {
      console.error('Failed to create request:', error);
    }
  };

  const handleUpdateRequest = async (id: number, requestData: Partial<Request>) => {
    if (!currentUser) return;

    try {
      await dbManager.updateRequest(id, requestData);
      await loadUserCollections(currentUser.id);
      setShowRequestDialog(false);
      
      // Update active request if it's the one being edited
      if (activeRequest && activeRequest.id === id) {
        const updatedRequest = { ...activeRequest, ...requestData, updatedAt: new Date().toISOString() };
        setActiveRequest(updatedRequest);
      }
      
      // Broadcast real-time update
      broadcastUpdate({
        type: 'request_updated',
        data: { id, ...requestData }
      });
    } catch (error) {
      console.error('Failed to update request:', error);
    }
  };

  const handleDeleteRequest = (request: Request) => {
    setDeleteTarget({ type: 'request', id: request.id, name: request.name });
    setShowDeleteConfirm(true);
  };

  // Test Suite CRUD handlers
  const handleNewTestSuite = (requestId: number) => {
    setEditingTestSuite(null);
    setShowTestSuiteDialog(true);
  };

  const handleEditTestSuite = (testSuite: any) => {
    setEditingTestSuite(testSuite);
    setShowTestSuiteDialog(true);
  };

  const handleSaveTestSuite = async (testSuiteData: any) => {
    if (!currentUser) return;

    try {
      const testSuiteId = await dbManager.saveTestSuite(testSuiteData);
      await loadUserCollections(currentUser.id);
      setShowTestSuiteDialog(false);
      
      // Broadcast real-time update
      broadcastUpdate({
        type: 'test_suite_updated',
        data: { ...testSuiteData, id: testSuiteId }
      });
    } catch (error) {
      console.error('Failed to create test suite:', error);
    }
  };

  const handleUpdateTestSuite = async (id: number, testSuiteData: any) => {
    if (!currentUser) return;

    try {
      await dbManager.updateTestSuite(id, testSuiteData);
      await loadUserCollections(currentUser.id);
      setShowTestSuiteDialog(false);
      
      // Broadcast real-time update
      broadcastUpdate({
        type: 'test_suite_updated',
        data: { id, ...testSuiteData }
      });
    } catch (error) {
      console.error('Failed to update test suite:', error);
    }
  };

  const handleDeleteTestSuite = (testSuite: any) => {
    setDeleteTarget({ type: 'testSuite', id: testSuite.id, name: testSuite.name });
    setShowDeleteConfirm(true);
  };

  // Collection delete handler
  const handleDeleteCollection = (collection: Collection) => {
    setDeleteTarget({ type: 'collection', id: collection.id, name: collection.name });
    setShowDeleteConfirm(true);
  };

  // Generic delete confirmation handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget || !currentUser) return;

    try {
      switch (deleteTarget.type) {
        case 'request':
          await dbManager.deleteRequest(deleteTarget.id);
          // Clear active request if it's the one being deleted
          if (activeRequest && activeRequest.id === deleteTarget.id) {
            setActiveRequest(null);
            setResponse(null);
          }
          break;
        case 'testSuite':
          await dbManager.deleteTestSuite(deleteTarget.id);
          break;
        case 'collection':
          await dbManager.deleteCollection(deleteTarget.id);
          break;
      }
      
      await loadUserCollections(currentUser.id);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      
      // Broadcast real-time update
      broadcastUpdate({
        type: `${deleteTarget.type}_deleted`,
        data: { id: deleteTarget.id }
      });
    } catch (error) {
      console.error(`Failed to delete ${deleteTarget.type}:`, error);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const loadTestResults = async (requestId: number) => {
    try {
      const results = await dbManager.getTestResults(requestId);
      setTestResults(prev => new Map(prev).set(requestId, results));
      
      // Broadcast real-time update
      broadcastUpdate({
        type: 'test_result_updated',
        data: { requestId, results }
      });
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

  const handleRunTestSuite = async (requestId: number, testSuite: TestSuite, response: ApiResponse, request: any): Promise<TestExecutionResult[]> => {
    // This would run a test suite against a response and return detailed execution results
    // For now, return empty array as placeholder
    // TODO: Implement proper test suite execution
    console.log('Running test suite:', testSuite.name, 'for request:', requestId);
    return [];
  };

  // UI Test Suite handlers
  const handleNewUITestSuite = (testSuite?: UITestSuite) => {
    if (testSuite) {
      // Save the new test suite
      handleSaveUITestSuite(testSuite);
    } else {
      // This will trigger the UI test dialog in EnhancedTestExplorer
      console.log('Creating new UI test suite');
    }
  };

  const handleEditUITestSuite = (testSuite: UITestSuite) => {
    console.log('Editing UI test suite:', testSuite.name);
  };

  const handleDeleteUITestSuite = (testSuite: UITestSuite) => {
    const updatedSuites = new Map(uiTestSuites);
    updatedSuites.delete(testSuite.id);
    setUITestSuites(updatedSuites);
    
    // Also remove execution results
    const updatedResults = new Map(uiTestExecutionResults);
    updatedResults.delete(testSuite.id);
    setUITestExecutionResults(updatedResults);
  };

  const handleRunUITestSuite = async (testSuite: UITestSuite): Promise<UITestExecutionResult[]> => {
    try {
      const results = await UITestRunner.getInstance().executeUITestSuite(testSuite);
      
      // Store results
      const updatedResults = new Map(uiTestExecutionResults);
      updatedResults.set(testSuite.id, results);
      setUITestExecutionResults(updatedResults);
      
      return results;
    } catch (error) {
      console.error('Failed to run UI test suite:', error);
      return [];
    }
  };

  const handleRunAllUITests = async (): Promise<UITestExecutionResult[]> => {
    const allResults: UITestExecutionResult[] = [];
    
    for (const testSuite of uiTestSuites.values()) {
      const results = await handleRunUITestSuite(testSuite);
      allResults.push(...results);
    }
    
    return allResults;
  };

  const handleSaveUITestSuite = (testSuite: UITestSuite) => {
    const updatedSuites = new Map(uiTestSuites);
    updatedSuites.set(testSuite.id, testSuite);
    setUITestSuites(updatedSuites);
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
      <DockableLayout
        user={currentUser}
        collections={collections}
        activeRequest={activeRequest}
        response={response}
        isLoading={isLoading}
        testResults={testResults}
        testSuites={testSuites}
        testExecutionResults={testExecutionResults}
        uiTestSuites={uiTestSuites}
        uiTestExecutionResults={uiTestExecutionResults}
        theme={theme}
        enableSyntaxHighlighting={enableSyntaxHighlighting}
        onRequestSelect={handleRequestSelect}
        onRequestChange={handleRequestChange}
        onSendRequest={handleSendRequest}
        onNewRequest={handleNewRequest}
        onNewCollection={handleNewCollection}
        onEditRequest={handleEditRequest}
        onDeleteRequest={handleDeleteRequest}
        onNewTestSuite={handleNewTestSuite}
        onEditTestSuite={handleEditTestSuite}
        onDeleteTestSuite={handleDeleteTestSuite}
        onNewUITestSuite={handleNewUITestSuite}
        onEditUITestSuite={handleEditUITestSuite}
        onDeleteUITestSuite={handleDeleteUITestSuite}
        onDeleteCollection={handleDeleteCollection}
        onRunTest={handleRunTest}
        onRunAllTests={handleRunAllTests}
        onRunTestSuite={handleRunTestSuite}
        onRunUITestSuite={handleRunUITestSuite}
        onRunAllUITests={handleRunAllUITests}
        onUserProfile={() => {/* TODO: Profile dialog */}}
        onSettings={() => setShowSettings(true)}
      />

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

      {showDocumentation && (
        <DocumentationDialog
          isOpen={showDocumentation}
          onClose={() => setShowDocumentation(false)}
          documentType={documentationType}
        />
      )}

      {showCodeGeneration && (
        <CodeGenerationDialog
          isOpen={showCodeGeneration}
          onClose={() => setShowCodeGeneration(false)}
        />
      )}

      <InputDialog
        isOpen={showNewCollectionDialog}
        title="Create New Collection"
        message="Enter a name for your new collection:"
        placeholder="Collection name..."
        onConfirm={handleNewCollectionConfirm}
        onCancel={handleNewCollectionCancel}
        icon={<CollectionIcon />}
        validation={(value) => {
          if (value.length < 2) return 'Collection name must be at least 2 characters';
          if (value.length > 50) return 'Collection name must be less than 50 characters';
          return null;
        }}
      />

      <RequestDialog
        isOpen={showRequestDialog}
        title={
          editingRequest && editingRequest.id === -1 
            ? 'Duplicate Request' 
            : editingRequest 
              ? 'Edit Request' 
              : 'Create New Request'
        }
        request={editingRequest}
        collections={collections}
        onSave={handleSaveRequest}
        onUpdate={handleUpdateRequest}
        onCancel={() => setShowRequestDialog(false)}
      />

      <TestSuiteDialog
        isOpen={showTestSuiteDialog}
        title={editingTestSuite ? 'Edit Test Suite' : 'Create New Test Suite'}
        testSuite={editingTestSuite}
        requestId={activeRequest?.id || 0}
        onSave={handleSaveTestSuite}
        onUpdate={handleUpdateTestSuite}
        onCancel={() => setShowTestSuiteDialog(false)}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={`Delete ${deleteTarget?.type || 'Item'}`}
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};