import React, { useState, useEffect, useCallback } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import { LayoutManager, LayoutConfig } from '../utils/layoutManager';
import { EnhancedSidebar } from './EnhancedSidebar';
import { TestExplorer } from './TestExplorer';
import { EnhancedRequestPanel } from './EnhancedRequestPanel';
import { ResponsePanel } from './ResponsePanel';
import { Collection, Request, TestResult, User } from '../database/DatabaseManager';
import { TestSuite, TestExecutionResult } from '../testing/TestRunner';
import { UITestSuite, UITestExecutionResult } from '../testing/UITestRunner';
import { ApiResponse } from '../types';

interface DockableLayoutProps {
  user: User;
  collections: Collection[];
  activeRequest: Request | null;
  response: ApiResponse | null;
  isLoading: boolean;
  testResults: Map<number, TestResult[]>;
  testSuites: TestSuite[];
  testExecutionResults: Map<number, TestExecutionResult[]>;
  uiTestSuites: Map<string, UITestSuite>;
  uiTestExecutionResults: Map<string, UITestExecutionResult[]>;
  theme: 'dark' | 'light';
  enableSyntaxHighlighting: boolean;
  onRequestSelect: (request: Request) => void;
  onRequestChange: (request: Request) => void;
  onSendRequest: () => void;
  onNewRequest: () => void;
  onNewCollection: () => void;
  onEditRequest: (request: Request) => void;
  onDeleteRequest: (request: Request) => void;
  onNewTestSuite: (requestId: number) => void;
  onEditTestSuite: (testSuite: TestSuite) => void;
  onDeleteTestSuite: (testSuite: TestSuite) => void;
  onNewUITestSuite: () => void;
  onEditUITestSuite: (testSuite: UITestSuite) => void;
  onDeleteUITestSuite: (testSuite: UITestSuite) => void;
  onDeleteCollection: (collection: Collection) => void;
  onRunTest: (requestId: number) => Promise<TestResult>;
  onRunAllTests: () => Promise<TestResult[]>;
  onRunTestSuite: (requestId: number, testSuite: TestSuite, response: ApiResponse, request: any) => Promise<TestExecutionResult[]>;
  onRunUITestSuite: (testSuite: UITestSuite) => Promise<UITestExecutionResult[]>;
  onRunAllUITests: () => Promise<UITestExecutionResult[]>;
  onUserProfile: () => void;
  onSettings: () => void;
}

export const DockableLayout: React.FC<DockableLayoutProps> = ({
  user,
  collections,
  activeRequest,
  response,
  isLoading,
  testResults,
  testSuites,
  testExecutionResults,
  uiTestSuites,
  uiTestExecutionResults,
  theme,
  enableSyntaxHighlighting,
  onRequestSelect,
  onRequestChange,
  onSendRequest,
  onNewRequest,
  onNewCollection,
  onEditRequest,
  onDeleteRequest,
  onNewTestSuite,
  onEditTestSuite,
  onDeleteTestSuite,
  onNewUITestSuite,
  onEditUITestSuite,
  onDeleteUITestSuite,
  onDeleteCollection,
  onRunTest,
  onRunAllTests,
  onRunTestSuite,
  onRunUITestSuite,
  onRunAllUITests,
  onUserProfile,
  onSettings
}) => {
  const [layoutManager] = useState(() => LayoutManager.getInstance());
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(() => layoutManager.loadLayout());
  const [isResponsive, setIsResponsive] = useState(() => layoutManager.getResponsiveConfig());

  // Handle window resize for responsive design with debouncing
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newResponsive = layoutManager.getResponsiveConfig();
        setIsResponsive(newResponsive);
        
        // Update layout config if responsive state changed
        if (newResponsive.mobile !== isResponsive.mobile || 
            newResponsive.tablet !== isResponsive.tablet || 
            newResponsive.desktop !== isResponsive.desktop) {
          const updatedConfig = layoutManager.updateResponsiveState();
          setLayoutConfig(updatedConfig);
        }
      }, 150); // Debounce resize events
    };

    window.addEventListener('resize', handleResize);
    
    // Handle orientation change on mobile devices
    const handleOrientationChange = () => {
      setTimeout(() => {
        handleResize();
      }, 100); // Small delay to ensure dimensions are updated
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      clearTimeout(resizeTimer);
    };
  }, [layoutManager, isResponsive]);

  const handleSplitterChange = useCallback((sizes: number[], splitterKey: keyof LayoutConfig['splitterSizes']) => {
    const size = sizes[0];
    const updatedConfig = layoutManager.updateSplitterSize(splitterKey, size);
    setLayoutConfig(updatedConfig);
  }, [layoutManager]);

  const togglePanel = useCallback((panelId: string) => {
    const panel = layoutConfig.panels[panelId as keyof typeof layoutConfig.panels];
    const updatedConfig = layoutManager.updatePanelVisibility(panelId, !panel.visible);
    setLayoutConfig(updatedConfig);
  }, [layoutConfig, layoutManager]);

  const resetLayout = useCallback(() => {
    const defaultConfig = layoutManager.resetLayout();
    setLayoutConfig(defaultConfig);
  }, [layoutManager]);

  // Get all requests for test explorer
  const allRequests = collections.flatMap(c => c.requests || []);

  // Convert testSuites array to Map for TestExplorer
  const testSuitesMap = new Map<number, TestSuite>();
  testSuites.forEach(suite => {
    if (suite.requestId) {
      testSuitesMap.set(suite.requestId, suite);
    }
  });

  // Mobile layout - optimized for touch and different orientations
  if (isResponsive.mobile) {
    const isTouchDevice = 'ontouchstart' in window;
    const isPortrait = window.innerHeight > window.innerWidth;
    
    return (
      <div className={`dockable-layout mobile ${isPortrait ? 'portrait' : 'landscape'} ${isTouchDevice ? 'touch' : ''}`}>
        <div className="mobile-header">
          <div className="mobile-nav-buttons">
            <button 
              className={`panel-toggle ${layoutConfig.panels.sidebar.visible ? 'active' : ''}`}
              onClick={() => togglePanel('sidebar')}
              aria-label="Toggle Collections Panel"
            >
              📁 Collections {layoutConfig.panels.sidebar.visible ? '▼' : '▶'}
            </button>
            <button 
              className={`panel-toggle ${layoutConfig.panels.testRunner.visible ? 'active' : ''}`}
              onClick={() => togglePanel('testRunner')}
              aria-label="Toggle Test Explorer Panel"
            >
              🧪 Tests {layoutConfig.panels.testRunner.visible ? '▼' : '▶'}
            </button>
          </div>
          <button className="layout-options" onClick={resetLayout} aria-label="Reset Layout">
            🔄
          </button>
        </div>
        
        <div className="mobile-panels">
          {layoutConfig.panels.sidebar.visible && (
            <div className="mobile-panel collections-panel">
              <div className="panel-header">
                <span className="panel-title">📁 Collections</span>
                <button 
                  className="panel-close"
                  onClick={() => togglePanel('sidebar')}
                  aria-label="Close Collections Panel"
                >
                  ✕
                </button>
              </div>
              <div className="panel-content">
                <EnhancedSidebar
                  user={user}
                  collections={collections}
                  onRequestSelect={onRequestSelect}
                  onNewRequest={onNewRequest}
                  onNewCollection={onNewCollection}
                  onEditRequest={onEditRequest}
                  onDeleteRequest={onDeleteRequest}
                  onDeleteCollection={onDeleteCollection}
                  activeRequest={activeRequest}
                  testResults={testResults}
                  testSuites={testSuitesMap}
                  uiTestSuites={uiTestSuites}
                  testExecutionResults={testExecutionResults}
                  uiTestExecutionResults={uiTestExecutionResults}
                  onRunTest={onRunTest}
                  onRunAllTests={onRunAllTests}
                  onRunTestSuite={onRunTestSuite}
                  onRunUITestSuite={onRunUITestSuite}
                  onRunAllUITests={onRunAllUITests}
                  onNewTestSuite={onNewTestSuite}
                  onEditTestSuite={onEditTestSuite}
                  onDeleteTestSuite={onDeleteTestSuite}
                  onNewUITestSuite={onNewUITestSuite}
                  onEditUITestSuite={onEditUITestSuite}
                  onDeleteUITestSuite={onDeleteUITestSuite}
                  onUserProfile={onUserProfile}
                  onSettings={onSettings}
                  enableTestExplorer={false} // Separate panel on mobile
                />
              </div>
            </div>
          )}

          {layoutConfig.panels.testRunner.visible && (
            <div className="mobile-panel test-panel">
              <div className="panel-header">
                <span className="panel-title">🧪 Test Explorer</span>
                <button 
                  className="panel-close"
                  onClick={() => togglePanel('testRunner')}
                  aria-label="Close Test Explorer Panel"
                >
                  ✕
                </button>
              </div>
              <div className="panel-content">
                <TestExplorer
                  requests={allRequests}
                  testSuites={testSuitesMap}
                  onRunTest={onRunTest}
                  onRunAllTests={onRunAllTests}
                  onRunTestSuite={onRunTestSuite}
                  testResults={testResults}
                  testExecutionResults={testExecutionResults}
                />
              </div>
            </div>
          )}
        </div>

        {activeRequest && (
          <div className="mobile-content">
            <Allotment 
              vertical={isPortrait}
              snap={true} // Enable snap points
              resizerStyle={{ 
                backgroundColor: 'var(--accent-color)',
                width: isPortrait ? '100%' : '6px',
                height: isPortrait ? '6px' : '100%'
              }}
            >
              <Allotment.Pane 
                minSize={isPortrait ? 200 : 300}
                preferredSize={isPortrait ? "50%" : "60%"}
                snap
              >
                <div className="mobile-panel-wrapper">
                  <div className="panel-header">
                    <span className="panel-title">📝 Request</span>
                  </div>
                  <EnhancedRequestPanel
                    request={activeRequest}
                    onRequestChange={onRequestChange}
                    onSendRequest={onSendRequest}
                    isLoading={isLoading}
                    enableSyntaxHighlighting={enableSyntaxHighlighting}
                    theme={theme}
                  />
                </div>
              </Allotment.Pane>
              <Allotment.Pane 
                minSize={isPortrait ? 150 : 250}
                snap
              >
                <div className="mobile-panel-wrapper">
                  <div className="panel-header">
                    <span className="panel-title">📄 Response</span>
                  </div>
                  <ResponsePanel
                    response={response}
                    isLoading={isLoading}
                  />
                </div>
              </Allotment.Pane>
            </Allotment>
          </div>
        )}
        
        {!activeRequest && (
          <div className="mobile-welcome">
            <div className="welcome-content">
              <h2>API Tester 3</h2>
              <p>Professional API testing on mobile</p>
              <div className="welcome-actions">
                <button className="btn btn-primary" onClick={onNewRequest}>
                  ➕ New Request
                </button>
                <button className="btn btn-secondary" onClick={onNewCollection}>
                  📁 New Collection
                </button>
              </div>
              <div className="mobile-tips">
                <p>💡 Tap headers to show/hide panels</p>
                <p>📱 Rotate device for different layouts</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop/Tablet layout with dockable panels
  const isTablet = isResponsive.tablet;
  const isPortraitTablet = isTablet && window.innerHeight > window.innerWidth;
  
  return (
    <div className={`dockable-layout ${isTablet ? 'tablet' : 'desktop'} ${isPortraitTablet ? 'portrait' : 'landscape'}`}>
      <div className="layout-toolbar">
        <div className="panel-controls">
          <button 
            className={`panel-toggle ${layoutConfig.panels.sidebar.visible ? 'active' : ''}`}
            onClick={() => togglePanel('sidebar')}
            title="Toggle Collections Panel"
            aria-label="Toggle Collections Panel"
          >
            📁 {!isTablet && 'Collections'}
          </button>
          <button 
            className={`panel-toggle ${layoutConfig.panels.testRunner.visible ? 'active' : ''}`}
            onClick={() => togglePanel('testRunner')}
            title="Toggle Test Explorer Panel"
            aria-label="Toggle Test Explorer Panel"
          >
            🧪 {!isTablet && 'Tests'}
          </button>
          <div className="toolbar-spacer"></div>
          <button 
            className="reset-layout"
            onClick={resetLayout}
            title="Reset Layout to Default"
            aria-label="Reset Layout"
          >
            🔄 {!isTablet && 'Reset'}
          </button>
        </div>
        {isTablet && (
          <div className="tablet-orientation-indicator">
            {isPortraitTablet ? '📱' : '💻'} {window.innerWidth}×{window.innerHeight}
          </div>
        )}
      </div>

      <Allotment
        snap={true}
        defaultSizes={[layoutConfig.splitterSizes.main, 1000 - layoutConfig.splitterSizes.main]}
        onChange={(sizes) => handleSplitterChange(sizes, 'main')}
        resizerStyle={{
          backgroundColor: 'var(--border-color)',
          width: '4px',
          transition: 'background-color 0.2s ease'
        }}
      >
        {/* Left Panel - Sidebar + Test Runner */}
        <Allotment.Pane 
          minSize={layoutConfig.panels.sidebar.minSize}
          maxSize={layoutConfig.panels.sidebar.maxSize}
          visible={layoutConfig.panels.sidebar.visible || layoutConfig.panels.testRunner.visible}
        >
          <Allotment vertical>
            {layoutConfig.panels.sidebar.visible && (
              <Allotment.Pane 
                minSize={200}
                maxSize={600}
              >
                <div className="panel-container sidebar-panel">
                  <div className="panel-header">
                    <span className="panel-title">Collections</span>
                    <button 
                      className="panel-close"
                      onClick={() => togglePanel('sidebar')}
                      title="Close Panel"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="panel-content">
                    <EnhancedSidebar
                      user={user}
                      collections={collections}
                      onRequestSelect={onRequestSelect}
                      onNewRequest={onNewRequest}
                      onNewCollection={onNewCollection}
                      onEditRequest={onEditRequest}
                      onDeleteRequest={onDeleteRequest}
                      onDeleteCollection={onDeleteCollection}
                      activeRequest={activeRequest}
                      testResults={testResults}
                      testSuites={testSuitesMap}
                      uiTestSuites={uiTestSuites}
                      testExecutionResults={testExecutionResults}
                      uiTestExecutionResults={uiTestExecutionResults}
                      onRunTest={onRunTest}
                      onRunAllTests={onRunAllTests}
                      onRunTestSuite={onRunTestSuite}
                      onRunUITestSuite={onRunUITestSuite}
                      onRunAllUITests={onRunAllUITests}
                      onNewTestSuite={onNewTestSuite}
                      onEditTestSuite={onEditTestSuite}
                      onDeleteTestSuite={onDeleteTestSuite}
                      onNewUITestSuite={onNewUITestSuite}
                      onEditUITestSuite={onEditUITestSuite}
                      onDeleteUITestSuite={onDeleteUITestSuite}
                      onUserProfile={onUserProfile}
                      onSettings={onSettings}
                      enableTestExplorer={false} // Now separate
                    />
                  </div>
                </div>
              </Allotment.Pane>
            )}

            {layoutConfig.panels.testRunner.visible && (
              <Allotment.Pane 
                minSize={layoutConfig.panels.testRunner.minSize}
                maxSize={layoutConfig.panels.testRunner.maxSize}
              >
                <div className="panel-container test-runner-panel">
                  <div className="panel-header">
                    <span className="panel-title">Test Explorer</span>
                    <button 
                      className="panel-close"
                      onClick={() => togglePanel('testRunner')}
                      title="Close Panel"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="panel-content">
                    <TestExplorer
                      requests={allRequests}
                      testSuites={testSuitesMap}
                      onRunTest={onRunTest}
                      onRunAllTests={onRunAllTests}
                      onRunTestSuite={onRunTestSuite}
                      onNewTestSuite={onNewTestSuite}
                      onEditTestSuite={onEditTestSuite}
                      onDeleteTestSuite={onDeleteTestSuite}
                      testResults={testResults}
                      testExecutionResults={testExecutionResults}
                    />
                  </div>
                </div>
              </Allotment.Pane>
            )}
          </Allotment>
        </Allotment.Pane>

        {/* Main Content Area */}
        <Allotment.Pane minSize={isTablet ? 350 : 400} snap>
          {activeRequest ? (
            <Allotment 
              vertical={isPortraitTablet}
              snap={true}
              defaultSizes={[layoutConfig.splitterSizes.content, 100 - layoutConfig.splitterSizes.content]}
              onChange={(sizes) => handleSplitterChange(sizes, 'content')}
              resizerStyle={{
                backgroundColor: 'var(--border-color)',
                ...(isPortraitTablet ? {
                  height: '4px',
                  width: '100%'
                } : {
                  width: '4px',
                  height: '100%'
                })
              }}
            >
              <Allotment.Pane 
                minSize={isTablet ? 250 : 300}
                preferredSize="50%"
                snap
              >
                <div className="panel-container request-panel">
                  <div className="panel-header">
                    <span className="panel-title">📝 Request</span>
                    {isLoading && <span className="loading-indicator">⏳</span>}
                  </div>
                  <div className="panel-content">
                    <EnhancedRequestPanel
                      request={activeRequest}
                      onRequestChange={onRequestChange}
                      onSendRequest={onSendRequest}
                      isLoading={isLoading}
                      enableSyntaxHighlighting={enableSyntaxHighlighting}
                      theme={theme}
                    />
                  </div>
                </div>
              </Allotment.Pane>
              
              <Allotment.Pane 
                minSize={isTablet ? 200 : 300}
                snap
              >
                <div className="panel-container response-panel">
                  <div className="panel-header">
                    <span className="panel-title">📄 Response</span>
                    {response && (
                      <span className="response-status">
                        {response.status} • {response.responseTime}ms
                      </span>
                    )}
                  </div>
                  <div className="panel-content">
                    <ResponsePanel
                      response={response}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              </Allotment.Pane>
            </Allotment>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <h1>Welcome to API Tester 3</h1>
                <p>Professional API testing tool with Visual Studio-style dockable layout</p>
                <div className="welcome-actions">
                  <button className="btn btn-primary" onClick={onNewRequest}>
                    Create New Request
                  </button>
                  <button className="btn btn-secondary" onClick={onNewCollection}>
                    Create Collection
                  </button>
                </div>
                <div className="layout-info">
                  <p>💡 Drag panel borders to resize • Toggle panels with toolbar buttons • Right-click for more options</p>
                </div>
              </div>
            </div>
          )}
        </Allotment.Pane>
      </Allotment>

      <style>{`
        .dockable-layout {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }

        .layout-toolbar {
          height: 32px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          padding: 0 8px;
          flex-shrink: 0;
        }

        .panel-controls {
          display: flex;
          gap: 4px;
        }

        .panel-toggle {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-primary);
          padding: 4px 8px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .panel-toggle:hover {
          background: var(--bg-hover);
          border-color: var(--border-color);
        }

        .panel-toggle.active {
          background: var(--accent-color);
          color: white;
        }

        .reset-layout {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-muted);
          padding: 4px 8px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
          margin-left: auto;
          transition: all 0.2s ease;
        }

        .reset-layout:hover {
          background: var(--bg-hover);
          border-color: var(--border-color);
          color: var(--text-primary);
        }

        .panel-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
        }

        .panel-header {
          height: 28px;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px;
          flex-shrink: 0;
        }

        .panel-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .panel-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 2px;
          font-size: 10px;
          line-height: 1;
          transition: all 0.2s ease;
        }

        .panel-close:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .panel-content {
          flex: 1;
          overflow: hidden;
        }

        /* Mobile layout styles */
        .dockable-layout.mobile {
          height: 100vh;
          overflow: hidden;
          position: relative;
        }

        .dockable-layout.mobile.touch {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        .mobile-header {
          height: 48px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .mobile-nav-buttons {
          display: flex;
          gap: 8px;
        }

        .mobile-header .panel-toggle {
          padding: 8px 12px;
          font-size: 14px;
          border-radius: 6px;
          min-height: 44px; /* Touch-friendly */
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .layout-options {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 8px;
          border-radius: 6px;
          font-size: 16px;
          min-height: 44px;
          min-width: 44px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-panels {
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          max-height: 40vh;
        }

        .mobile-panel {
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .mobile-panel .panel-header {
          height: 40px;
          padding: 0 16px;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-color);
        }

        .mobile-panel .panel-title {
          font-size: 14px;
          font-weight: 600;
        }

        .mobile-panel .panel-content {
          max-height: 300px;
          overflow-y: auto;
        }

        .mobile-content {
          flex: 1;
          min-height: 400px;
          display: flex;
          flex-direction: column;
        }

        .mobile-panel-wrapper {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
        }

        .mobile-welcome {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
        }

        .mobile-welcome .welcome-content h2 {
          font-size: 24px;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .mobile-welcome .welcome-content p {
          font-size: 16px;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        .mobile-welcome .welcome-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .mobile-welcome .btn {
          padding: 12px 20px;
          font-size: 16px;
          border-radius: 8px;
          min-height: 48px;
        }

        .mobile-tips {
          padding: 16px;
          background: var(--bg-tertiary);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .mobile-tips p {
          font-size: 12px;
          color: var(--text-muted);
          margin: 4px 0;
        }

        /* Tablet layout styles */
        .dockable-layout.tablet {
          height: 100vh;
        }

        .dockable-layout.tablet .layout-toolbar {
          height: 40px;
          padding: 0 12px;
        }

        .dockable-layout.tablet .panel-toggle {
          padding: 6px 12px;
          font-size: 13px;
          min-height: 36px;
        }

        .tablet-orientation-indicator {
          font-size: 12px;
          color: var(--text-muted);
          padding: 4px 8px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        .toolbar-spacer {
          flex: 1;
        }

        /* Enhanced panel headers with status indicators */
        .panel-header .loading-indicator {
          font-size: 12px;
          animation: pulse 1s infinite;
        }

        .panel-header .response-status {
          font-size: 10px;
          color: var(--text-muted);
          font-family: 'Consolas', Monaco, monospace;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Touch-friendly improvements */
        @media (pointer: coarse) {
          .panel-toggle,
          .panel-close,
          .reset-layout {
            min-height: 44px;
            min-width: 44px;
            padding: 8px;
          }
          
          .panel-header {
            height: 44px;
          }
          
          .mobile-header {
            height: 56px;
          }
        }

        /* Responsive breakpoints */
        @media (max-width: 479px) {
          .dockable-layout.mobile .mobile-header .panel-toggle {
            font-size: 12px;
            padding: 6px 8px;
          }
          
          .mobile-welcome .welcome-content h2 {
            font-size: 20px;
          }
        }

        @media (min-width: 480px) and (max-width: 767px) {
          .mobile-panels {
            max-height: 50vh;
          }
          
          .dockable-layout.mobile.landscape .mobile-panels {
            max-height: 35vh;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .dockable-layout.tablet.portrait .layout-toolbar {
            height: 48px;
          }
          
          .dockable-layout.tablet.portrait .panel-toggle {
            padding: 8px 16px;
            font-size: 14px;
          }
        }

        /* Welcome screen enhancements */
        .welcome-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 20px;
        }

        .welcome-content {
          text-align: center;
          max-width: 500px;
        }

        .welcome-content h1 {
          font-size: 32px;
          margin-bottom: 12px;
          color: var(--text-primary);
        }

        .welcome-content p {
          font-size: 16px;
          color: var(--text-muted);
          margin-bottom: 24px;
        }

        .welcome-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 24px;
        }

        .layout-info {
          padding: 16px;
          background: var(--bg-tertiary);
          border-radius: 6px;
          border: 1px solid var(--border-color);
        }

        .layout-info p {
          font-size: 12px;
          color: var(--text-muted);
          margin: 0;
        }

        /* Responsive breakpoints */
        @media (max-width: 767px) {
          .panel-toggle {
            padding: 6px 12px;
            font-size: 14px;
          }
          
          .mobile-header {
            height: 48px;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .layout-toolbar {
            height: 36px;
          }
          
          .panel-toggle {
            padding: 6px 10px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};