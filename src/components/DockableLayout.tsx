import React, { useState, useEffect } from 'react';
import { EnhancedSidebar } from './EnhancedSidebar';
import { ModernButton, CollectionIcon, TestIcon } from './ModernButton';
import { EnhancedRequestPanel } from './EnhancedRequestPanel';
import { ResponsePanel } from './ResponsePanel';
import { MonitoringPanel } from './MonitoringPanel';
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
  onTeamManager?: () => void;
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
    onTeamManager,
    onShowAbout,
    onReportProblem,
  } = props;

  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [collectionsVisible, setCollectionsVisible] = useState(true);
  const [testsVisible, setTestsVisible] = useState(true);
  const [runGroupOpen, setRunGroupOpen] = useState(false);
  const [showMonitoring, setShowMonitoring] = useState(false);

  useEffect(() => {
    const onDocClick = () => {
      setShowHelpMenu(false);
      setShowProfileDropdown(false);
      setRunGroupOpen(false);
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
        <div className="toolbar-left">
          <ModernButton className={`toolbar-button ${collectionsVisible ? 'active' : ''}`} variant="secondary" size="small" onClick={() => setCollectionsVisible(v => !v)} title="Toggle Collections" icon={<CollectionIcon />} />

          <ModernButton className={`toolbar-button ${testsVisible ? 'active' : ''}`} variant="secondary" size="small" onClick={() => setTestsVisible(v => !v)} title="Toggle Test Explorer" icon={<TestIcon />} />
          
          <ModernButton 
            className={`toolbar-button ${showMonitoring ? 'active' : ''}`} 
            variant={showMonitoring ? 'primary' : 'secondary'} 
            size="small" 
            onClick={() => setShowMonitoring(v => !v)} 
            title="HTTP Monitor" 
            icon={<span>📡</span>}
          >
            {showMonitoring ? 'Exit Monitor' : 'Monitor'}
          </ModernButton>

          <div className="toolbar-sep" />

          <div className="toolbar-group" onClick={e => e.stopPropagation()}>
            <ModernButton variant="primary" size="small" onClick={() => onRunAllTests?.()} title="Run" icon={<span>▶️</span>}>Run</ModernButton>
            <ModernButton variant="secondary" size="small" onClick={() => debugSelected()} title="Debug" icon={<span>🐞</span>}>Debug</ModernButton>
            <ModernButton variant="secondary" size="small" className="toolbar-button small" title="Run options" onClick={() => setRunGroupOpen(o => !o)}>▾</ModernButton>
            {runGroupOpen && (
              <div className="run-dropdown" onClick={e => e.stopPropagation()}>
                <button className="run-item" onClick={() => { setRunGroupOpen(false); onRunAllTests?.(); }}>Run All Tests</button>
                <button className="run-item" onClick={() => { setRunGroupOpen(false); runSelected(); }}>Run Selected</button>
                <button className="run-item" onClick={() => { setRunGroupOpen(false); if (activeRequest) {
                    const suite = testSuitesMap.get(activeRequest.id);
                    if (suite && response) {
                      onRunTestSuite?.(activeRequest.id, suite, response, activeRequest).catch(err => console.error('Run test suite failed', err));
                    }
                  } }}>Run Test Suite</button>
              </div>
            )}
          </div>
        </div>

        <div className="toolbar-right">
          <div className="help-container">
            <ModernButton className={`toolbar-button ${showHelpMenu ? 'active' : ''}`} variant="secondary" size="small" onClick={(e?: React.MouseEvent) => { e?.stopPropagation(); setShowHelpMenu(s => !s); }} title="Help" icon={<span>❓</span>} />
            {showHelpMenu && (
              <div className="help-dropdown">
                <button onClick={() => { setShowHelpMenu(false); onShowAbout?.(); }}>About</button>
                <button onClick={() => { setShowHelpMenu(false); onReportProblem?.(); }}>Report Problem</button>
                <button onClick={() => { setShowHelpMenu(false); window.open('https://github.com/dotnetappdev/apitester3', '_blank'); }}>GitHub</button>
              </div>
            )}
          </div>

          <ModernButton className="toolbar-button" variant="secondary" size="small" title="Reset Layout" onClick={() => { /* placeholder */ }} icon={<span>🔄</span>} />

          <div className={`toolbar-avatar-container ${showProfileDropdown ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
            <button className={`toolbar-avatar ${user?.profilePicture ? 'has-image' : ''}`} onClick={() => setShowProfileDropdown(s => !s)} title={user?.username || 'Profile'}>
              {user?.profilePicture ? <img src={user.profilePicture} alt={user.username} /> : <span className="avatar-initial">{user?.username?.charAt(0).toUpperCase() || '?'}</span>}
            </button>
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <button className="profile-dropdown-item" onClick={() => { setShowProfileDropdown(false); onUserProfile?.(); }}>Profile</button>
                <button className="profile-dropdown-item" onClick={() => { setShowProfileDropdown(false); onTeamManager?.(); }}>Teams</button>
                <button className="profile-dropdown-item" onClick={() => { setShowProfileDropdown(false); onSettings?.(); }}>Settings</button>
                <div className="profile-dropdown-sep" />
                <button className="profile-dropdown-item" onClick={() => { setShowProfileDropdown(false); onShowAbout?.(); }}>About</button>
              </div>
            )}
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

      <style>{`
        /* Windows 11 - inspired toolbar visuals */
        .layout-toolbar { height:48px; display:flex; align-items:center; justify-content:space-between; padding:0 12px; background:var(--bg-primary); border-bottom:1px solid rgba(0,0,0,0.06); }
        .toolbar-left { display:flex; align-items:center; gap:8px; }
        .toolbar-right { display:flex; align-items:center; gap:8px; }
        .toolbar-button { display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:4px; background:transparent; border:1px solid transparent; color:var(--text-primary); cursor:pointer; font-size:13px; transition:box-shadow 0.18s ease, transform 0.12s ease; }
        .toolbar-button .icon { font-size:14px; }
        .toolbar-button .label { display:inline-block; }
        .toolbar-button:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.08); transform: translateY(-2px); background: rgba(255,255,255,0.02); }
        .toolbar-button.primary { background: linear-gradient(180deg, rgba(0,120,215,0.14), rgba(0,120,215,0.08)); color: #fff; }
        .toolbar-group { position:relative; display:inline-flex; align-items:center; gap:6px; }
        .toolbar-button.small { padding:6px 8px; min-width:36px; border-radius:4px; }
        .run-dropdown { position:absolute; top:100%; left:0; margin-top:8px; background:var(--bg-secondary); border:1px solid rgba(0,0,0,0.06); border-radius:4px; box-shadow:0 12px 30px rgba(0,0,0,0.12); z-index:1200; }
        .run-item { display:block; padding:10px 14px; background:transparent; border:none; width:240px; text-align:left; cursor:pointer; font-size:13px; }
        .run-item:hover { background:rgba(255,255,255,0.02); }
        .toolbar-avatar { width:36px; height:36px; border-radius:50%; overflow:hidden; display:inline-flex; align-items:center; justify-content:center; border:1px solid rgba(0,0,0,0.06); background:var(--bg-secondary); cursor:pointer; }
        .toolbar-avatar.has-image img { width:100%; height:100%; object-fit:cover; }
        .profile-dropdown { position:absolute; right:12px; margin-top:8px; background:var(--bg-secondary); border:1px solid rgba(0,0,0,0.06); padding:6px 0; border-radius:4px; box-shadow:0 12px 28px rgba(0,0,0,0.15); z-index:1200; }
        .profile-dropdown-item { display:block; padding:10px 16px; background:transparent; border:none; width:220px; text-align:left; cursor:pointer; font-size:13px; }
        .profile-dropdown-item:hover { background:rgba(255,255,255,0.02); }
        .profile-dropdown-sep { height:1px; background:rgba(0,0,0,0.06); margin:6px 0; }
        .main-area { display:flex; flex:1; min-height:0; }
        .sidebar-column { width:320px; border-right:1px solid rgba(0,0,0,0.06); overflow:auto; }
        .sidebar-column.hidden { display:none; }
        .content-column { flex:1; display:flex; overflow:auto; }
        .content-area { display:flex; flex-direction:column; width:100%; }
        .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; }
        .toolbar-sep { width:1px; height:28px; background:rgba(0,0,0,0.06); margin:0 8px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default DockableLayout;