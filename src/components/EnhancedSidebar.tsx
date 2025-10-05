import React, { useState } from 'react';
import { Collection, Request, TestResult, User } from '../database/DatabaseManager';
import { EnhancedTestExplorer } from './EnhancedTestExplorer';
import { TestSuite, TestExecutionResult } from '../testing/TestRunner';
import { UITestSuite, UITestExecutionResult } from '../testing/UITestRunner';
import { ModernButton, CollectionIcon, TestIcon, AddIcon, SettingsIcon, MonitorIcon, FolderIcon } from './ModernButton';
import { ApiResponse } from '../types';

interface EnhancedSidebarProps {
  user: User;
  collections: Collection[];
  onRequestSelect: (request: Request) => void;
  onNewRequest: () => void;
  onNewCollection: () => void;
  onEditRequest: (request: Request) => void;
  onDeleteRequest: (request: Request) => void;
  onDeleteCollection: (collection: Collection) => void;
  activeRequest: Request | null;
  testResults?: Map<number, TestResult[]>;
  testSuites?: Map<number, TestSuite>;
  uiTestSuites?: Map<string, UITestSuite>;
  testExecutionResults?: Map<number, TestExecutionResult[]>;
  uiTestExecutionResults?: Map<string, UITestExecutionResult[]>;
  onRunTest?: (requestId: number) => Promise<TestResult>;
  onRunAllTests?: () => Promise<TestResult[]>;
  onRunTestSuite?: (requestId: number, testSuite: TestSuite, response: ApiResponse, request: any) => Promise<TestExecutionResult[]>;
  onRunUITestSuite?: (testSuite: UITestSuite) => Promise<UITestExecutionResult[]>;
  onRunAllUITests?: () => Promise<UITestExecutionResult[]>;
  onNewTestSuite?: (requestId: number) => void;
  onEditTestSuite?: (testSuite: TestSuite) => void;
  onDeleteTestSuite?: (testSuite: TestSuite) => void;
  onNewUITestSuite?: () => void;
  onEditUITestSuite?: (testSuite: UITestSuite) => void;
  onDeleteUITestSuite?: (testSuite: UITestSuite) => void;
  onUserProfile?: () => void;
  onSettings?: () => void;
  // onTeamManager removed — team management moved to profile dropdown in the toolbar
  onToggleOutput?: () => void;
  enableTestExplorer?: boolean;
}

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  user,
  collections,
  onRequestSelect,
  onNewRequest,
  onNewCollection,
  onEditRequest,
  onDeleteRequest,
  onDeleteCollection,
  activeRequest,
  testResults,
  testSuites,
  uiTestSuites,
  testExecutionResults,
  uiTestExecutionResults,
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
  onToggleOutput,
  enableTestExplorer
}) => {
  const [expandedCollections, setExpandedCollections] = useState<Set<number>>(new Set());
  const [activeView, setActiveView] = useState<'collections' | 'environments' | 'history' | 'ui-tests' | 'tests'>('collections');
  const [activeTab, setActiveTab] = useState<'collections' | 'tests'>('collections');
  const [contextMenu, setContextMenu] = useState<{type: 'collection' | 'request', id: number, x: number, y: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleCollection = (collectionId: number) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  // Method color mapping moved to CSS classes; helper removed to avoid unused symbol warnings.

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? '👑' : '👤';
  };

  const handleContextMenu = (e: React.MouseEvent, type: 'collection' | 'request', id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      type,
      id,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleContextMenuAction = (action: string, type: 'collection' | 'request', id: number) => {
    setContextMenu(null);
    
    if (type === 'collection') {
      const collection = collections.find(c => c.id === id);
      if (!collection) return;
      
      switch (action) {
        case 'edit':
          // TODO: Add collection edit dialog
          break;
        case 'delete':
          onDeleteCollection(collection);
          break;
      }
    } else if (type === 'request') {
      const request = collections.flatMap(c => c.requests || []).find(r => r.id === id);
      if (!request) return;
      
      switch (action) {
        case 'edit':
          onEditRequest(request);
          break;
        case 'delete':
          onDeleteRequest(request);
          break;
        case 'duplicate':
          // Duplicate request: create a new request object suitable for editing/creation flow
          const duplicateData = {
            ...request,
            name: `Copy of ${request.name}`,
            id: -1, // Use -1 as a flag for duplication/new
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            collectionId: request.collectionId
          } as Request;
          onEditRequest(duplicateData);
          break;
      }
    }
  };

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // Get all requests from all collections for test explorer
  const allRequests = collections.flatMap(collection => 
    collection.requests?.map(req => ({ ...req, collectionId: collection.id })) || []
  );

  // Filter collections and requests based on search query
  const filteredCollections = searchQuery.trim() === '' 
    ? collections 
    : collections.map(collection => {
        const matchesCollection = collection.name.toLowerCase().includes(searchQuery.toLowerCase());
        const filteredRequests = collection.requests?.filter(request => 
          request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.url.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [];
        
        if (matchesCollection || filteredRequests.length > 0) {
          return {
            ...collection,
            requests: filteredRequests
          };
        }
        return null;
      }).filter(c => c !== null) as Collection[];

  // Expand all collections when searching
  React.useEffect(() => {
    if (searchQuery.trim() !== '') {
      setExpandedCollections(new Set(filteredCollections.map(c => c.id)));
    }
  }, [searchQuery, filteredCollections]);

  return (
    <div className="enhanced-sidebar">
      {/* User Profile Header */}
      <div className="sidebar-header">
        <div className="user-profile" onClick={onUserProfile}>
          <div className="user-avatar main-ui">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={user.username} />
            ) : (
              <div className="avatar-placeholder main-ui">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-info">
            <div className="user-name">
              <span>{user.username}</span>
              <span className="role-icon" title={user.role}>
                {getRoleIcon(user.role)}
              </span>
            </div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>
        
        <div className="header-actions">
          <ModernButton className="header-action-icon" title="Settings" onClick={onSettings} variant="secondary" size="small" icon={<SettingsIcon />}>{/* icon-only */}{null}</ModernButton>
          {/* Teams button removed — replaced by profile/avatar in the top toolbar */}
          <ModernButton className="header-action-icon pill" title="New Collection" onClick={onNewCollection} variant="primary" size="small" icon={<FolderIcon />}>{/* icon-only */}{null}</ModernButton>
          <ModernButton onClick={onNewRequest} variant="primary" size="small" icon={<AddIcon />} title="New Request">New</ModernButton>
          <ModernButton className="header-action-icon" title="Toggle Output" onClick={() => onToggleOutput?.()} variant="secondary" size="small" icon={<MonitorIcon />}>{/* icon-only */}{null}</ModernButton>
        </div>
      </div>

      {/* Search Bar - VS Code Style */}
      <div className="sidebar-search">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search collections and requests... (Ctrl+P)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchQuery('');
                e.currentTarget.blur();
              }
            }}
          />
          {searchQuery && (
            <button 
              className="search-clear"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Icon Navigation Menu - Postman Style */}
      <div className="sidebar-icon-nav">
        <button
          className={`icon-nav-button ${activeView === 'collections' ? 'active' : ''}`}
          onClick={() => setActiveView('collections')}
          title="Collections"
        >
          <span className="icon-nav-icon">📁</span>
          <span className="icon-nav-label">Collections</span>
        </button>
        
        <button
          className={`icon-nav-button ${activeView === 'environments' ? 'active' : ''}`}
          onClick={() => setActiveView('environments')}
          title="Environments"
        >
          <span className="icon-nav-icon">🌍</span>
          <span className="icon-nav-label">Environments</span>
        </button>
        
        <button
          className={`icon-nav-button ${activeView === 'history' ? 'active' : ''}`}
          onClick={() => setActiveView('history')}
          title="History"
        >
          <span className="icon-nav-icon">📜</span>
          <span className="icon-nav-label">History</span>
        </button>
        
        {enableTestExplorer && (
          <>
            <button
              className={`icon-nav-button ${activeView === 'ui-tests' ? 'active' : ''}`}
              onClick={() => { setActiveView('ui-tests'); window.dispatchEvent(new CustomEvent('navigate', { detail: 'ui-tests' })); }}
              title="UI Tests"
            >
              <span className="icon-nav-icon">🖥️</span>
              <span className="icon-nav-label">UI Tests</span>
            </button>
            
            <button
              className={`icon-nav-button ${activeView === 'tests' ? 'active' : ''}`}
              onClick={() => { setActiveView('tests'); window.dispatchEvent(new CustomEvent('navigate', { detail: 'tests' })); }}
              title="Tests"
            >
              <span className="icon-nav-icon">🧪</span>
              <span className="icon-nav-label">Tests</span>
            </button>
          </>
        )}
      </div>

      {/* Tab Navigation - Old style, kept for backward compatibility */}
  <div className="sidebar-tabs hidden">
          <button
            className={`sidebar-tab ${activeTab === 'collections' ? 'active' : ''} sidebar-tab-flex`}
            onClick={() => setActiveTab('collections')}
          >
          <CollectionIcon />
          Collections
          <span className="tab-count">{collections.length}</span>
        </button>
        
        {enableTestExplorer && (
          <button
            className={`sidebar-tab ${activeTab === 'tests' ? 'active' : ''} sidebar-tab-flex`}
            onClick={() => setActiveTab('tests')}
          >
            <TestIcon />
            Tests
            <span className="tab-count">{allRequests.length}</span>
          </button>
        )}
      </div>

      {/* View Content */}
      <div className="sidebar-content">
        {activeView === 'collections' && (
          <div className="collections-panel">
            {filteredCollections.length === 0 ? (
              <div className="empty-state">
                {searchQuery ? (
                  <>
                    <div className="empty-icon">🔍</div>
                    <p>No results found</p>
                    <p className="text-small text-muted">
                      Try a different search query
                    </p>
                  </>
                ) : (
                  <>
                    <div className="empty-icon">📁</div>
                    <p>No collections yet</p>
                    <p className="text-small text-muted">
                      Create your first collection to organize your requests
                    </p>
                    <ModernButton
                      onClick={onNewCollection}
                      variant="success"
                      icon={<CollectionIcon />}
                      style={{ marginTop: '12px' }}
                    >
                      Create Collection
                    </ModernButton>
                  </>
                )}
              </div>
            ) : (
              filteredCollections.map(collection => (
                <div key={collection.id} className="collection-item">
                  <div
                    className="collection-header"
                    onContextMenu={(e) => handleContextMenu(e, 'collection', collection.id)}
                  >
                    <span
                      className={`expand-icon ${expandedCollections.has(collection.id) ? 'expanded' : ''}`}
                      onClick={() => toggleCollection(collection.id)}
                    >
                      ▶
                    </span>
                    <div className="collection-info" onClick={() => toggleCollection(collection.id)}>
                      <span className="collection-name">{collection.name}</span>
                      <div className="collection-meta">
                        <span className="request-count">
                          {collection.requests?.length || 0} requests
                        </span>
                        {collection.isShared && (
                          <span className="shared-indicator" title="Shared Collection">
                            🔗
                          </span>
                        )}
                        {collection.ownerId === user.id && (
                          <span className="owner-indicator" title="You own this collection">
                            👑
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="collection-actions">
                      <button
                        className="action-button"
                        onClick={(e) => { e.stopPropagation(); handleContextMenu(e, 'collection', collection.id); }}
                        title="Collection actions"
                      >
                        ⋮
                      </button>
                    </div>
                  </div>

                  {expandedCollections.has(collection.id) && collection.requests && (
                    <div className="collection-requests">
                      {collection.requests.length === 0 ? (
                        <div className="no-requests">
                          <p className="text-muted text-small">No requests in this collection</p>
                        </div>
                      ) : (
                        collection.requests.map(request => (
                          <div
                            key={request.id}
                            className={`request-item ${activeRequest?.id === request.id ? 'active' : ''}`}
                            onContextMenu={(e) => handleContextMenu(e, 'request', request.id)}
                          >
                            <div className="request-method-badge">
                              <span className="method-text method-color">{request.method}</span>
                            </div>
                            <div className="request-info" onClick={() => onRequestSelect(request)}>
                              <div className="request-name">{request.name}</div>
                              <div className="request-url">{request.url}</div>
                            </div>
                            <div className="request-actions">
                              {request.tests && (
                                <span className="test-indicator" title="Has tests">
                                  🧪
                                </span>
                              )}
                              <button className="action-button" onClick={(e) => { e.stopPropagation(); handleContextMenu(e, 'request', request.id); }} title="Request actions">⋮</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeView === 'environments' && (
          <div className="environments-panel">
            <div className="panel-header">
              <h3>Environments</h3>
              <p className="panel-description">Switch between different deployment contexts</p>
            </div>
            <div className="empty-state">
              <div className="empty-icon">🌍</div>
              <p>Environment Management</p>
              <p className="text-small text-muted">
                Create environments for dev, sys, live, and prod with different variable sets
              </p>
              <div className="environment-presets">
                <button className="env-preset-button">🔧 Development</button>
                <button className="env-preset-button">🔬 System Test</button>
                <button className="env-preset-button">📡 Live</button>
                <button className="env-preset-button">🚀 Production</button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'history' && (
          <div className="history-panel">
            <div className="panel-header">
              <h3>History</h3>
              <p className="panel-description">Audit trail of all API requests</p>
            </div>
            <div className="empty-state">
              <div className="empty-icon">📜</div>
              <p>Request History</p>
              <p className="text-small text-muted">
                Track who ran what request, when, with what payload, and what results
              </p>
              <div className="history-info">
                <div className="history-info-item">
                  <span className="history-info-icon">👤</span>
                  <span>User tracking</span>
                </div>
                <div className="history-info-item">
                  <span className="history-info-icon">⏰</span>
                  <span>Timestamp logging</span>
                </div>
                <div className="history-info-item">
                  <span className="history-info-icon">📦</span>
                  <span>Payload storage</span>
                </div>
                <div className="history-info-item">
                  <span className="history-info-icon">✅</span>
                  <span>Result capture</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'ui-tests' && enableTestExplorer && (
          <div className="ui-tests-panel">
            <div className="panel-header">
              <h3>UI Tests</h3>
              <p className="panel-description">Browser automation tests</p>
            </div>
            <EnhancedTestExplorer
              requests={allRequests}
              testSuites={testSuites ?? new Map<number, TestSuite>()}
              uiTestSuites={uiTestSuites ?? new Map<string, UITestSuite>()}
              onRunTest={onRunTest ?? (async () => { throw new Error('Not implemented'); }) as any}
              onRunAllTests={onRunAllTests ?? (async () => [])}
              onRunTestSuite={onRunTestSuite ?? (async () => [])}
              onRunUITestSuite={onRunUITestSuite ?? (async () => [])}
              onRunAllUITests={onRunAllUITests ?? (async () => [])}
              onNewTestSuite={onNewTestSuite}
              onEditTestSuite={onEditTestSuite}
              onDeleteTestSuite={onDeleteTestSuite}
              onNewUITestSuite={onNewUITestSuite}
              onEditUITestSuite={onEditUITestSuite}
              onDeleteUITestSuite={onDeleteUITestSuite}
              testResults={testResults ?? new Map<number, TestResult[]>()}
              testExecutionResults={testExecutionResults ?? new Map<number, TestExecutionResult[]>()}
              uiTestExecutionResults={uiTestExecutionResults ?? new Map<string, UITestExecutionResult[]>()}
            />
          </div>
        )}

        {activeView === 'tests' && enableTestExplorer && (
          <div className="tests-panel">
            <div className="panel-header">
              <h3>API Tests</h3>
              <p className="panel-description">Request and unit tests</p>
            </div>
            <EnhancedTestExplorer
              requests={allRequests}
              testSuites={testSuites ?? new Map<number, TestSuite>()}
              uiTestSuites={uiTestSuites ?? new Map<string, UITestSuite>()}
              onRunTest={onRunTest ?? (async () => { throw new Error('Not implemented'); }) as any}
              onRunAllTests={onRunAllTests ?? (async () => [])}
              onRunTestSuite={onRunTestSuite ?? (async () => [])}
              onRunUITestSuite={onRunUITestSuite ?? (async () => [])}
              onRunAllUITests={onRunAllUITests ?? (async () => [])}
              onNewTestSuite={onNewTestSuite}
              onEditTestSuite={onEditTestSuite}
              onDeleteTestSuite={onDeleteTestSuite}
              onNewUITestSuite={onNewUITestSuite}
              onEditUITestSuite={onEditUITestSuite}
              onDeleteUITestSuite={onDeleteUITestSuite}
              testResults={testResults ?? new Map<number, TestResult[]>()}
              testExecutionResults={testExecutionResults ?? new Map<number, TestExecutionResult[]>()}
              uiTestExecutionResults={uiTestExecutionResults ?? new Map<string, UITestExecutionResult[]>()}
            />
          </div>
        )}

        {activeTab === 'tests' && enableTestExplorer && (
          <div className="tests-panel hidden">
            <EnhancedTestExplorer
          requests={allRequests}
          testSuites={testSuites ?? new Map<number, TestSuite>()}
          uiTestSuites={uiTestSuites ?? new Map<string, UITestSuite>()}
              onRunTest={onRunTest ?? (async () => { throw new Error('Not implemented'); }) as any}
          onRunAllTests={onRunAllTests ?? (async () => [])}
          onRunTestSuite={onRunTestSuite ?? (async () => [])}
          onRunUITestSuite={onRunUITestSuite ?? (async () => [])}
          onRunAllUITests={onRunAllUITests ?? (async () => [])}
          onNewTestSuite={onNewTestSuite}
          onEditTestSuite={onEditTestSuite}
          onDeleteTestSuite={onDeleteTestSuite}
          onNewUITestSuite={onNewUITestSuite}
          onEditUITestSuite={onEditUITestSuite}
          onDeleteUITestSuite={onDeleteUITestSuite}
          testResults={testResults ?? new Map<number, TestResult[]>()}
          testExecutionResults={testExecutionResults ?? new Map<number, TestExecutionResult[]>()}
          uiTestExecutionResults={uiTestExecutionResults ?? new Map<string, UITestExecutionResult[]>()}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="stats">
          <span className="stat-item">
            {collections.length} {collections.length === 1 ? 'collection' : 'collections'}
          </span>
          <span className="stat-item">
            {allRequests.length} {allRequests.length === 1 ? 'request' : 'requests'}
          </span>
        </div>
      </div>

      {/* Context Menu */}
  {contextMenu && (
  <div className="context-menu context-menu-positioned" data-x={contextMenu.x} data-y={contextMenu.y} onClick={(e) => e.stopPropagation()}>
          {contextMenu.type === 'collection' ? (
            <>
              <div className="context-menu-item" onClick={() => handleContextMenuAction('edit', 'collection', contextMenu.id)}>✏️ Edit Collection</div>
              <div className="context-menu-item danger" onClick={() => handleContextMenuAction('delete', 'collection', contextMenu.id)}>🗑️ Delete Collection</div>
            </>
          ) : (
            <>
              <div className="context-menu-item" onClick={() => handleContextMenuAction('edit', 'request', contextMenu.id)}>✏️ Edit Request</div>
              <div className="context-menu-item" onClick={() => handleContextMenuAction('duplicate', 'request', contextMenu.id)}>📋 Duplicate Request</div>
              <div className="context-menu-item danger" onClick={() => handleContextMenuAction('delete', 'request', contextMenu.id)}>🗑️ Delete Request</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};