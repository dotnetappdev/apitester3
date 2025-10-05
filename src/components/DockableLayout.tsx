import React, { useState, useEffect } from 'react';
import { EnhancedSidebar } from './EnhancedSidebar';
import { ModernButton, CollectionIcon, TestIcon } from './ModernButton';
import { EnhancedRequestPanel } from './EnhancedRequestPanel';
import { ResponsePanel } from './ResponsePanel';
import { MonitoringPanel } from './MonitoringPanel';
import { TestScriptEditor } from './TestScriptEditor';
import { UITestDialog } from './UITestDialog';
// Note: TestScriptEditor and TestExplorer removed from this simplified layout
import { Collection, Request, TestResult, User } from '../database/DatabaseManager';
import { TestSuite, TestExecutionResult } from '../testing/TestRunner';
import { UITestSuite, UITestExecutionResult } from '../testing/UITestRunner';
import { ApiResponse } from '../types';

interface DockableLayoutProps {
  user: User | null;
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
  onDeleteCollection: (collection: Collection) => void;
  onRunTest: (requestId: number) => Promise<TestResult>;
  onRunAllTests: () => Promise<TestResult[]>;
  onRunTestSuite: (requestId: number, testSuite: TestSuite, response: ApiResponse, request: any) => Promise<TestExecutionResult[]>;
  onRunUITestSuite: (testSuite: UITestSuite) => Promise<UITestExecutionResult[]>;
  onRunAllUITests: () => Promise<UITestExecutionResult[]>;
  onNewTestSuite: (requestId: number) => void;
  onEditTestSuite: (suite: TestSuite) => void;
  onDeleteTestSuite: (testSuite: TestSuite) => void;
  onNewUITestSuite: () => void;
  onEditUITestSuite: (suite: UITestSuite) => void;
  onDeleteUITestSuite: (testSuite: UITestSuite) => void;
  onUserProfile?: () => void;
  onSettings?: () => void;
  onShowAbout?: () => void;
  onReportProblem?: () => void;
}

export const DockableLayout: React.FC<DockableLayoutProps> = (props) => {
  const {
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
    onDeleteCollection,
    onRunTest,
    onRunAllTests,
    onRunTestSuite,
    onRunUITestSuite,
    onRunAllUITests,
    onNewTestSuite,
    onEditTestSuite,
    onDeleteTestSuite,
    onNewUITestSuite,
    onEditUITestSuite,
    onDeleteUITestSuite,
    onUserProfile,
    onSettings,
    onShowAbout,
    onReportProblem,
  } = props;

  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [collectionsVisible, setCollectionsVisible] = useState(true);
  const [ribbonTab, setRibbonTab] = useState<'home' | 'features'>('home');
  // testsVisible removed - ribbon replaces test visibility toggle
  const [runGroupOpen, setRunGroupOpen] = useState(false);
  const [showMonitoring, setShowMonitoring] = useState(false);
  const [sidebarView, setSidebarView] = useState<'collections' | 'environments' | 'history' | 'monitoring' | 'ui-tests' | 'tests'>('collections');
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showDebugMenu, setShowDebugMenu] = useState(false);
  const [showUnitTestEditor, setShowUnitTestEditor] = useState(false);
  const [showUITestEditor, setShowUITestEditor] = useState(false);

  useEffect(() => {
    const onDocClick = () => {
      setShowHelpMenu(false);
      setShowProfileDropdown(false);
      setRunGroupOpen(false);
      setShowViewMenu(false);
      setShowDebugMenu(false);
    };
    window.addEventListener('click', onDocClick);
    return () => window.removeEventListener('click', onDocClick);
  }, []);

  // flattened requests not needed in this simplified toolbar implementation
  const testSuitesMap = new Map<number, TestSuite>();
  testSuites.forEach(s => { if (s.requestId) testSuitesMap.set(s.requestId, s); });

  const runSelected = () => {
    if (activeRequest) onRunTest?.(activeRequest.id).catch(err => console.error('Run selected failed', err));
  };

  const debugSelected = () => {
    if (activeRequest) onRunTest?.(activeRequest.id).catch(err => console.error('Debug selected failed', err)); // placeholder: same handler
  };

  return (
    <div className={`dockable-layout ${theme === 'light' ? 'light-theme' : ''}`}>
      <div className="layout-toolbar">
        <div className="ribbon">
          {/* Ribbon Tabs */}
          <div className="ribbon-tabs">
            <button className={`ribbon-tab ${ribbonTab === 'home' ? 'active' : ''}`} onClick={() => setRibbonTab('home')}>Home</button>
            <button className={`ribbon-tab ${ribbonTab === 'features' ? 'active' : ''}`} onClick={() => setRibbonTab('features')}>Features</button>
            
            {/* Right-side toolbar controls */}
            <div className="ribbon-tabs-right">
              <div className="help-container" onClick={e => e.stopPropagation()}>
                <button className={`ribbon-icon-button ${showHelpMenu ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setShowHelpMenu(s => !s); }} title="Help">
                  <span>❓</span>
                </button>
                {showHelpMenu && (
                  <div className="help-dropdown">
                    <button onClick={() => { setShowHelpMenu(false); onShowAbout?.(); }}>About</button>
                    <button onClick={() => { setShowHelpMenu(false); onReportProblem?.(); }}>Report Problem</button>
                    <button onClick={() => { setShowHelpMenu(false); window.open('https://github.com/dotnetappdev/apitester3', '_blank'); }}>GitHub</button>
                  </div>
                )}
              </div>

              <div className={`toolbar-avatar-container ${showProfileDropdown ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
                <button className={`toolbar-avatar ${user?.profilePicture ? 'has-image' : ''}`} onClick={() => setShowProfileDropdown(s => !s)} title={user?.username || 'Profile'}>
                  {user?.profilePicture ? <img src={user.profilePicture} alt={user.username} /> : <span className="avatar-initial">{user?.username?.charAt(0).toUpperCase() || '?'}</span>}
                </button>
                {showProfileDropdown && (
                  <div className="profile-dropdown">
                    <button className="profile-dropdown-item" onClick={() => { setShowProfileDropdown(false); onUserProfile?.(); }}>Profile</button>
                    <button className="profile-dropdown-item" onClick={() => { setShowProfileDropdown(false); onSettings?.(); }}>Settings</button>
                    <div className="profile-dropdown-sep" />
                    <button className="profile-dropdown-item" onClick={() => { setShowProfileDropdown(false); onShowAbout?.(); }}>About</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ribbon Content */}
          <div className="ribbon-content">
            {/* Home Tab */}
            <div className={`ribbon-tab-content ${ribbonTab !== 'home' ? 'hidden' : ''}`}>
              {/* Request Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-buttons">
                  <button className="ribbon-button" onClick={() => onNewRequest?.()} title="New Request">
                    <span className="ribbon-button-icon">📄</span>
                    <span className="ribbon-button-label">New<br/>Request</span>
                  </button>
                  <button className="ribbon-button" onClick={() => onNewCollection?.()} title="New Collection">
                    <span className="ribbon-button-icon"><CollectionIcon /></span>
                    <span className="ribbon-button-label">New<br/>Collection</span>
                  </button>
                  <button className="ribbon-button" onClick={() => onSendRequest?.()} title="Send Request" disabled={!activeRequest}>
                    <span className="ribbon-button-icon">🚀</span>
                    <span className="ribbon-button-label">Send</span>
                  </button>
                </div>
                <div className="ribbon-group-label">Request</div>
              </div>

              {/* Test Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-buttons">
                  <button className="ribbon-button ribbon-button-primary" onClick={() => onRunAllTests?.()} title="Run Tests">
                    <span className="ribbon-button-icon">▶️</span>
                    <span className="ribbon-button-label">Run</span>
                  </button>
                  <div className="ribbon-dropdown-wrapper" onClick={e => e.stopPropagation()}>
                    <button className="ribbon-button" onClick={(e) => { e.stopPropagation(); setShowDebugMenu(v => !v); }} title="Debug">
                      <span className="ribbon-button-icon">🐞</span>
                      <span className="ribbon-button-label">Debug</span>
                      <span className="ribbon-button-arrow">▼</span>
                    </button>
                    {showDebugMenu && (
                      <div className="ribbon-dropdown">
                        <button className="ribbon-dropdown-item" onClick={() => { debugSelected(); setShowDebugMenu(false); }}>
                          Debug Selected
                        </button>
                        <button className="ribbon-dropdown-item" onClick={() => { setShowUnitTestEditor(true); setShowDebugMenu(false); }}>
                          Debug Unit Tests
                        </button>
                        <button className="ribbon-dropdown-item" onClick={() => { setShowUITestEditor(true); setShowDebugMenu(false); }}>
                          Debug UI Tests
                        </button>
                      </div>
                    )}
                  </div>
                  <button className="ribbon-button" onClick={() => { window.dispatchEvent(new CustomEvent('toggle-output')); }} title="Output">
                    <span className="ribbon-button-icon">📺</span>
                    <span className="ribbon-button-label">Output</span>
                  </button>
                  <button className="ribbon-button" onClick={() => setShowUnitTestEditor(true)} title="Unit Tests">
                    <span className="ribbon-button-icon">🧪</span>
                    <span className="ribbon-button-label">Unit Tests</span>
                  </button>
                  <button className="ribbon-button" onClick={() => setShowUITestEditor(true)} title="UI Tests">
                    <span className="ribbon-button-icon">🖥️</span>
                    <span className="ribbon-button-label">UI Tests</span>
                  </button>
                </div>
                <div className="ribbon-group-label">Test</div>
              </div>

              {/* View Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-buttons">
                  <button className={`ribbon-button ${collectionsVisible ? 'active' : ''}`} onClick={() => { setCollectionsVisible(v => !v); setSidebarView('collections'); }} title="Collections Panel">
                    <span className="ribbon-button-icon"><CollectionIcon /></span>
                    <span className="ribbon-button-label">Collections</span>
                  </button>
                  <button className="ribbon-button" onClick={() => { setSidebarView('tests'); setCollectionsVisible(true); }} title="Tests">
                    <span className="ribbon-button-icon">🧪</span>
                    <span className="ribbon-button-label">Tests</span>
                  </button>
                  <div className="ribbon-button-with-menu" onClick={e => e.stopPropagation()}>
                    <button className="ribbon-button" onClick={() => setShowViewMenu(v => !v)} title="View Options">
                      <span className="ribbon-button-icon">👁️</span>
                      <span className="ribbon-button-label">View ▾</span>
                    </button>
                    {showViewMenu && (
                      <div className="ribbon-dropdown">
                        <button className="ribbon-dropdown-item" onClick={() => { setCollectionsVisible(true); setSidebarView('collections'); setShowViewMenu(false); }}>
                          <span className="ribbon-dropdown-check">{collectionsVisible && sidebarView === 'collections' ? '✓' : ''}</span>
                          Collections Panel
                        </button>
                        <button className="ribbon-dropdown-item" onClick={() => { setCollectionsVisible(true); setSidebarView('tests'); setShowViewMenu(false); }}>
                          <span className="ribbon-dropdown-check">{sidebarView === 'tests' ? '✓' : ''}</span>
                          Tests Panel
                        </button>
                        <button className="ribbon-dropdown-item" onClick={() => { setCollectionsVisible(true); setSidebarView('ui-tests'); setShowViewMenu(false); }}>
                          <span className="ribbon-dropdown-check">{sidebarView === 'ui-tests' ? '✓' : ''}</span>
                          UI Tests Panel
                        </button>
                        <button className="ribbon-dropdown-item" onClick={() => { setCollectionsVisible(true); setSidebarView('environments'); setShowViewMenu(false); }}>
                          <span className="ribbon-dropdown-check">{sidebarView === 'environments' ? '✓' : ''}</span>
                          Environments Panel
                        </button>
                        <button className="ribbon-dropdown-item" onClick={() => { setCollectionsVisible(true); setSidebarView('history'); setShowViewMenu(false); }}>
                          <span className="ribbon-dropdown-check">{sidebarView === 'history' ? '✓' : ''}</span>
                          History Panel
                        </button>
                        <div className="ribbon-dropdown-sep" />
                        <button className="ribbon-dropdown-item" onClick={() => { setCollectionsVisible(v => !v); setShowViewMenu(false); }}>
                          <span className="ribbon-dropdown-check">{collectionsVisible ? '✓' : ''}</span>
                          Show Sidebar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ribbon-group-label">View</div>
              </div>
            </div>

            {/* Features Tab */}
            <div className={`ribbon-tab-content ${ribbonTab !== 'features' ? 'hidden' : ''}`}>
              {/* Data Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-buttons">
                  <button className="ribbon-button" onClick={() => { setSidebarView('environments'); setCollectionsVisible(true); }} title="Environments">
                    <span className="ribbon-button-icon">🌍</span>
                    <span className="ribbon-button-label">Environments</span>
                  </button>
                  <button className="ribbon-button" onClick={() => { setSidebarView('history'); setCollectionsVisible(true); }} title="History">
                    <span className="ribbon-button-icon">📜</span>
                    <span className="ribbon-button-label">History</span>
                  </button>
                </div>
                <div className="ribbon-group-label">Data</div>
              </div>

              {/* Monitor Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-buttons">
                  <button className="ribbon-button" onClick={() => { setShowMonitoring(v => !v); setSidebarView('monitoring'); }} title="Monitoring">
                    <span className="ribbon-button-icon">📡</span>
                    <span className="ribbon-button-label">Monitoring</span>
                  </button>
                  <button className="ribbon-button" onClick={() => { setSidebarView('ui-tests'); setCollectionsVisible(true); }} title="UI Tests">
                    <span className="ribbon-button-icon">🖥️</span>
                    <span className="ribbon-button-label">UI Tests</span>
                  </button>
                </div>
                <div className="ribbon-group-label">Monitor</div>
              </div>

              {/* Settings Group */}
              <div className="ribbon-group">
                <div className="ribbon-group-buttons">
                  <button className="ribbon-button" onClick={() => onSettings?.()} title="Settings">
                    <span className="ribbon-button-icon">⚙️</span>
                    <span className="ribbon-button-label">Settings</span>
                  </button>
                </div>
                <div className="ribbon-group-label">Options</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-area">
          <div className={`sidebar-column ${collectionsVisible ? 'visible' : 'hidden'}`}>
            <EnhancedSidebar
            user={user!}
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
            onNewTestSuite={() => onNewTestSuite?.(activeRequest ? activeRequest.id : 0)}
            onEditTestSuite={onEditTestSuite}
            onDeleteTestSuite={onDeleteTestSuite}
            onNewUITestSuite={onNewUITestSuite}
            onEditUITestSuite={onEditUITestSuite}
            onDeleteUITestSuite={onDeleteUITestSuite}
            onUserProfile={onUserProfile}
            onSettings={onSettings}
            enableTestExplorer={true}
            forceActiveView={sidebarView}
          />
        </div>

        <div className="content-column">
          {showMonitoring ? (
            <MonitoringPanel theme={theme} />
          ) : activeRequest ? (
            <div className="content-area">
              <EnhancedRequestPanel
                request={activeRequest}
                onRequestChange={onRequestChange}
                onSendRequest={onSendRequest}
                isLoading={isLoading}
                enableSyntaxHighlighting={enableSyntaxHighlighting}
                theme={theme}
              />

              <ResponsePanel response={response} isLoading={isLoading} />
            </div>
          ) : (
            <div className="empty-state">
              <h2>Welcome to VerifyApi</h2>
              <p>Select a request to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Unit Test Editor Dialog */}
      {showUnitTestEditor && activeRequest && (
        <div className="modal-overlay" onClick={() => setShowUnitTestEditor(false)}>
          <div className="modal-dialog modal-dialog-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Unit Test Editor - {activeRequest.name}</h3>
              <button className="modal-close" onClick={() => setShowUnitTestEditor(false)}>✕</button>
            </div>
            <div className="modal-body">
              <TestScriptEditor
                requestId={activeRequest.id}
                requestName={activeRequest.name}
                onTestSuiteChange={onEditTestSuite}
                onRunTests={onRunTestSuite}
                testResults={testExecutionResults.get(activeRequest.id)}
              />
            </div>
          </div>
        </div>
      )}

      {/* UI Test Editor Dialog */}
      {showUITestEditor && (
        <UITestDialog
          isOpen={showUITestEditor}
          onClose={() => setShowUITestEditor(false)}
          onSave={(suite) => {
            onEditUITestSuite(suite);
            setShowUITestEditor(false);
          }}
          title="UI Test Editor"
        />
      )}

      <style>{`
        /* Office 365 Ribbon Bar Styles */
        .layout-toolbar { 
          height: auto; 
          display: flex; 
          flex-direction: column;
          background: #1f1f1f; 
          border-bottom: 1px solid #2d2d2d; 
        }
        
        /* Ribbon Container */
        .ribbon { 
          display: flex; 
          flex-direction: column; 
          width: 100%;
        }
        
        /* Ribbon Tabs Row */
        .ribbon-tabs { 
          display: flex; 
          align-items: center;
          justify-content: space-between;
          background: #2d2d2d; 
          border-bottom: 1px solid #3e3e42;
          padding: 0 8px;
          height: 32px;
        }
        
        .ribbon-tabs-right {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
        }
        
        .ribbon-tab { 
          padding: 6px 20px; 
          background: transparent; 
          border: none; 
          color: #cccccc; 
          cursor: pointer; 
          font-size: 13px; 
          font-weight: 500;
          transition: all 0.15s ease;
          border-bottom: 2px solid transparent;
          height: 100%;
          display: flex;
          align-items: center;
        }
        
        .ribbon-tab:hover { 
          background: rgba(255, 255, 255, 0.05); 
          color: #ffffff;
        }
        
        .ribbon-tab.active { 
          background: #1f1f1f;
          color: #ffffff; 
          border-bottom-color: #0078d4;
        }
        
        /* Ribbon Content Area */
        .ribbon-content { 
          display: flex; 
          background: #1f1f1f;
          padding: 8px 16px;
          min-height: 92px;
        }
        
        .ribbon-tab-content { 
          display: flex; 
          gap: 8px;
          width: 100%;
          align-items: flex-start;
        }
        
        .ribbon-tab-content.hidden { 
          display: none; 
        }
        
        /* Ribbon Groups */
        .ribbon-group { 
          display: flex; 
          flex-direction: column;
          align-items: center;
          padding: 4px 12px;
          border-right: 1px solid #3e3e42;
          min-width: fit-content;
        }
        
        .ribbon-group:last-child {
          border-right: none;
        }
        
        .ribbon-group-buttons { 
          display: flex; 
          gap: 4px;
          margin-bottom: 4px;
        }
        
        .ribbon-group-label { 
          font-size: 11px; 
          color: #999999; 
          text-align: center;
          margin-top: 4px;
          font-weight: 500;
          letter-spacing: 0.3px;
        }
        
        /* Ribbon Buttons - Office 365 Style */
        .ribbon-button { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center;
          padding: 8px 12px;
          min-width: 64px;
          min-height: 64px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 3px;
          color: #cccccc;
          cursor: pointer;
          font-size: 11px;
          transition: all 0.12s ease;
          gap: 4px;
        }
        
        .ribbon-button:hover { 
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }
        
        .ribbon-button:active { 
          background: rgba(255, 255, 255, 0.05);
          transform: scale(0.98);
        }
        
        .ribbon-button.active {
          background: rgba(0, 120, 212, 0.2);
          border-color: #0078d4;
          color: #ffffff;
        }
        
        .ribbon-button.ribbon-button-primary {
          background: rgba(0, 120, 212, 0.15);
          border-color: #0078d4;
        }
        
        .ribbon-button.ribbon-button-primary:hover {
          background: rgba(0, 120, 212, 0.25);
          border-color: #1890ff;
        }
        
        .ribbon-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .ribbon-button:disabled:hover {
          background: transparent;
          border-color: transparent;
        }
        
        .ribbon-button-icon { 
          font-size: 24px;
          width: 32px;
          height: 32px;
          display: flex; 
          align-items: center; 
          justify-content: center;
        }
        
        .ribbon-button-icon svg {
          width: 24px;
          height: 24px;
        }
        
        .ribbon-button-label { 
          font-size: 11px; 
          text-align: center;
          line-height: 1.2;
          font-weight: 500;
          white-space: nowrap;
        }
        
        /* Ribbon Button with Menu */
        .ribbon-button-with-menu {
          position: relative;
          display: inline-block;
        }
        
        .ribbon-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          background: #2d2d2d;
          border: 1px solid #3e3e42;
          border-radius: 4px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
          z-index: 1300;
          min-width: 220px;
          overflow: hidden;
        }
        
        .ribbon-dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-size: 13px;
          color: #cccccc;
          transition: all 0.12s ease;
        }
        
        .ribbon-dropdown-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }
        
        .ribbon-dropdown-check {
          width: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #0078d4;
        }
        
        .ribbon-dropdown-sep {
          height: 1px;
          background: #3e3e42;
          margin: 4px 0;
        }
        
        /* Icon Button (for Help, etc.) */
        .ribbon-icon-button {
          width: 28px;
          height: 28px;
          padding: 4px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 3px;
          color: #cccccc;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.12s ease;
          font-size: 16px;
        }
        
        .ribbon-icon-button:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .ribbon-icon-button.active {
          background: rgba(0, 120, 212, 0.2);
          border-color: #0078d4;
        }
        
        /* Help & Profile Dropdowns */
        .help-container {
          position: relative;
        }
        
        .help-dropdown { 
          position: absolute; 
          top: calc(100% + 4px); 
          right: 0;
          background: #2d2d2d; 
          border: 1px solid #3e3e42; 
          border-radius: 4px; 
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4); 
          z-index: 1200;
          min-width: 180px;
          overflow: hidden;
        }
        
        .help-dropdown button { 
          display: block; 
          padding: 10px 16px; 
          background: transparent; 
          border: none; 
          width: 100%; 
          text-align: left; 
          cursor: pointer; 
          font-size: 13px; 
          color: #cccccc;
          transition: all 0.12s ease;
        }
        
        .help-dropdown button:hover { 
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }
        
        .toolbar-avatar-container {
          position: relative;
        }
        
        .toolbar-avatar { 
          width: 28px; 
          height: 28px; 
          border-radius: 3px; 
          overflow: hidden; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border: 1px solid #3e3e42; 
          background: rgba(255, 255, 255, 0.05); 
          cursor: pointer; 
          transition: all 0.15s ease; 
          font-size: 12px; 
          font-weight: 600; 
          color: #cccccc;
        }
        
        .toolbar-avatar:hover { 
          background: rgba(255, 255, 255, 0.08); 
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .toolbar-avatar.has-image img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover;
        }
        
        .toolbar-avatar .avatar-initial { 
          font-size: 12px;
          font-weight: 600;
        }
        
        .profile-dropdown { 
          position: absolute; 
          top: calc(100% + 4px); 
          right: 0;
          background: #2d2d2d; 
          border: 1px solid #3e3e42; 
          padding: 4px 0; 
          border-radius: 4px; 
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4); 
          z-index: 1200;
          min-width: 200px;
        }
        
        .profile-dropdown-item { 
          display: block; 
          padding: 10px 16px; 
          background: transparent; 
          border: none; 
          width: 100%; 
          text-align: left; 
          cursor: pointer; 
          font-size: 13px; 
          color: #cccccc; 
          transition: all 0.12s ease;
        }
        
        .profile-dropdown-item:hover { 
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }
        
        .profile-dropdown-sep { 
          height: 1px; 
          background: #3e3e42; 
          margin: 4px 0;
        }
        
        /* Main Layout Area */
        .main-area { 
          display: flex; 
          flex: 1; 
          min-height: 0;
        }
        
        .sidebar-column { 
          width: var(--sidebar-width, 420px); 
          min-width: 360px; 
          border-right: 1px solid #2d2d2d; 
          overflow: auto;
          display: flex;
          flex-direction: column;
        }
        
        .sidebar-column.hidden { 
          display: none;
        }
        
        .content-column { 
          flex: 1; 
          display: flex; 
          overflow: auto;
        }
        
        .content-area { 
          display: flex; 
          flex-direction: column; 
          width: 100%;
        }
        
        .empty-state { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          flex: 1;
          color: #999999;
        }
        
        .empty-state h2 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #cccccc;
        }
        
        .empty-state p {
          font-size: 14px;
        }
        
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }

        /* Modal Overlay and Dialog Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .modal-dialog {
          background: #2d2d2d;
          border: 1px solid #3e3e42;
          border-radius: 8px;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }

        .modal-dialog-large {
          width: 1200px;
          height: 800px;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #3e3e42;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
        }

        .modal-close {
          background: transparent;
          border: none;
          color: #cccccc;
          font-size: 20px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.15s;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .modal-body {
          flex: 1;
          overflow: auto;
          padding: 0;
        }

        /* Ribbon Dropdown Wrapper for Debug Button */
        .ribbon-dropdown-wrapper {
          position: relative;
          display: inline-block;
        }

        .ribbon-button-arrow {
          margin-left: 4px;
          font-size: 8px;
        }

        .ribbon-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 4px;
          background: #2d2d2d;
          border: 1px solid #3e3e42;
          border-radius: 4px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
          z-index: 1100;
          min-width: 200px;
          padding: 4px 0;
        }
      `}</style>
    </div>
  );
};

export default DockableLayout;