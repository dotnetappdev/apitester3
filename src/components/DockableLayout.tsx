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
  theme: 'dark' | 'light';
  enableSyntaxHighlighting: boolean;
  onRequestSelect: (request: Request) => void;
  onRequestChange: (request: Request) => void;
  onSendRequest: () => void;
  onNewRequest: () => void;
  onNewCollection: () => void;
  onRunTest: (requestId: number) => Promise<TestResult>;
  onRunAllTests: () => Promise<TestResult[]>;
  onRunTestSuite: (requestId: number, testSuite: TestSuite, response: ApiResponse, request: any) => Promise<TestExecutionResult[]>;
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
  theme,
  enableSyntaxHighlighting,
  onRequestSelect,
  onRequestChange,
  onSendRequest,
  onNewRequest,
  onNewCollection,
  onRunTest,
  onRunAllTests,
  onRunTestSuite,
  onUserProfile,
  onSettings
}) => {
  const [layoutManager] = useState(() => LayoutManager.getInstance());
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(() => layoutManager.loadLayout());
  const [isResponsive, setIsResponsive] = useState(() => layoutManager.getResponsiveConfig());

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      const newResponsive = layoutManager.getResponsiveConfig();
      setIsResponsive(newResponsive);
      
      // Update layout config if responsive state changed
      if (newResponsive.mobile !== isResponsive.mobile || 
          newResponsive.tablet !== isResponsive.tablet || 
          newResponsive.desktop !== isResponsive.desktop) {
        const updatedConfig = layoutManager.updateResponsiveState();
        setLayoutConfig(updatedConfig);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // Mobile layout - stack vertically
  if (isResponsive.mobile) {
    return (
      <div className="dockable-layout mobile">
        <div className="mobile-header">
          <button className="panel-toggle" onClick={() => togglePanel('sidebar')}>
            Collections {layoutConfig.panels.sidebar.visible ? '▼' : '▶'}
          </button>
          <button className="panel-toggle" onClick={() => togglePanel('testRunner')}>
            Tests {layoutConfig.panels.testRunner.visible ? '▼' : '▶'}
          </button>
        </div>
        
        {layoutConfig.panels.sidebar.visible && (
          <div className="mobile-panel">
            <EnhancedSidebar
              user={user}
              collections={collections}
              onRequestSelect={onRequestSelect}
              onNewRequest={onNewRequest}
              onNewCollection={onNewCollection}
              activeRequest={activeRequest}
              testResults={testResults}
              onRunTest={onRunTest}
              onRunAllTests={onRunAllTests}
              onUserProfile={onUserProfile}
              onSettings={onSettings}
              enableTestExplorer={false} // Separate panel on mobile
            />
          </div>
        )}

        {layoutConfig.panels.testRunner.visible && (
          <div className="mobile-panel">
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
        )}

        {activeRequest && (
          <div className="mobile-content">
            <Allotment vertical>
              <Allotment.Pane minSize={200}>
                <EnhancedRequestPanel
                  request={activeRequest}
                  onRequestChange={onRequestChange}
                  onSendRequest={onSendRequest}
                  isLoading={isLoading}
                  enableSyntaxHighlighting={enableSyntaxHighlighting}
                  theme={theme}
                />
              </Allotment.Pane>
              <Allotment.Pane minSize={200}>
                <ResponsePanel
                  response={response}
                  isLoading={isLoading}
                />
              </Allotment.Pane>
            </Allotment>
          </div>
        )}
      </div>
    );
  }

  // Desktop/Tablet layout with dockable panels
  return (
    <div className="dockable-layout desktop">
      <div className="layout-toolbar">
        <div className="panel-controls">
          <button 
            className={`panel-toggle ${layoutConfig.panels.sidebar.visible ? 'active' : ''}`}
            onClick={() => togglePanel('sidebar')}
            title="Toggle Collections"
          >
            📁
          </button>
          <button 
            className={`panel-toggle ${layoutConfig.panels.testRunner.visible ? 'active' : ''}`}
            onClick={() => togglePanel('testRunner')}
            title="Toggle Test Explorer"
          >
            🧪
          </button>
          <button 
            className="reset-layout"
            onClick={resetLayout}
            title="Reset Layout"
          >
            🔄
          </button>
        </div>
      </div>

      <Allotment
        defaultSizes={[layoutConfig.splitterSizes.main, 1000 - layoutConfig.splitterSizes.main]}
        onChange={(sizes) => handleSplitterChange(sizes, 'main')}
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
                      activeRequest={activeRequest}
                      testResults={testResults}
                      onRunTest={onRunTest}
                      onRunAllTests={onRunAllTests}
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
        <Allotment.Pane minSize={400}>
          {activeRequest ? (
            <Allotment 
              vertical={isResponsive.tablet}
              defaultSizes={[layoutConfig.splitterSizes.content, 100 - layoutConfig.splitterSizes.content]}
              onChange={(sizes) => handleSplitterChange(sizes, 'content')}
            >
              <Allotment.Pane minSize={300}>
                <div className="panel-container request-panel">
                  <div className="panel-header">
                    <span className="panel-title">Request</span>
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
              
              <Allotment.Pane minSize={300}>
                <div className="panel-container response-panel">
                  <div className="panel-header">
                    <span className="panel-title">Response</span>
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
          overflow-y: auto;
        }

        .mobile-header {
          height: 40px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          flex-shrink: 0;
        }

        .mobile-panel {
          max-height: 300px;
          overflow-y: auto;
          border-bottom: 1px solid var(--border-color);
        }

        .mobile-content {
          flex: 1;
          min-height: 400px;
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