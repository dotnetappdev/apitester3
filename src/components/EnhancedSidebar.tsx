import React, { useState } from 'react';
import { Collection, Request, TestResult, User } from '../database/DatabaseManager';
import { TestExplorer } from './TestExplorer';
import { ModernButton, CollectionIcon, TestIcon, AddIcon } from './ModernButton';

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
  testResults: Map<number, TestResult[]>;
  onRunTest: (requestId: number) => Promise<TestResult>;
  onRunAllTests: () => Promise<TestResult[]>;
  onUserProfile: () => void;
  onSettings: () => void;
  onToggleOutput?: () => void;
  enableTestExplorer: boolean;
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
  onRunTest,
  onRunAllTests,
  onUserProfile,
  onSettings,
  onToggleOutput,
  enableTestExplorer
}) => {
  const [expandedCollections, setExpandedCollections] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'collections' | 'tests'>('collections');
  const [contextMenu, setContextMenu] = useState<{type: 'collection' | 'request', id: number, x: number, y: number} | null>(null);

  const toggleCollection = (collectionId: number) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  const getMethodColor = (method: string): string => {
    switch (method) {
      case 'GET': return '#4ec9b0';
      case 'POST': return '#ffcc02';
      case 'PUT': return '#007acc';
      case 'DELETE': return '#f44747';
      case 'PATCH': return '#ff8c00';
      case 'HEAD': return '#9370db';
      case 'OPTIONS': return '#20b2aa';
      default: return '#cccccc';
    }
  };

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
          // Create a duplicate request with "Copy of" prefix
          const duplicateData = {
            ...request,
            name: `Copy of ${request.name}`,
            id: undefined, // Remove ID so a new one gets created
            createdAt: undefined,
            updatedAt: undefined
          };
          // Remove the id, createdAt, updatedAt fields and call onSave instead
          onEditRequest({ ...duplicateData, id: -1 } as Request); // Use -1 as a flag for duplication
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
          <button className="header-action-button" onClick={onSettings} title="Settings">⚙️</button>
          <button className="header-action-button" onClick={onNewCollection} title="New Collection">📁+</button>
          <ModernButton onClick={onNewRequest} variant="primary" size="small" icon={<AddIcon />}>New</ModernButton>
          <button className="header-action-button" onClick={() => onToggleOutput?.()} title="Toggle Output">🖥️</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'collections' ? 'active' : ''}`}
          onClick={() => setActiveTab('collections')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <CollectionIcon />
          Collections
          <span className="tab-count">{collections.length}</span>
        </button>
        
        {enableTestExplorer && (
          <button
            className={`sidebar-tab ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <TestIcon />
            Tests
            <span className="tab-count">{allRequests.length}</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="sidebar-content">
        {activeTab === 'collections' && (
          <div className="collections-panel">
            {collections.length === 0 ? (
              <div className="empty-state">
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
              </div>
            ) : (
              collections.map(collection => (
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

        {activeTab === 'tests' && enableTestExplorer && (
          <div className="tests-panel">
            <TestExplorer
              requests={allRequests}
              testSuites={new Map()}
              onRunTest={onRunTest}
              onRunAllTests={onRunAllTests}
              onRunTestSuite={async () => []}
              testResults={testResults}
              testExecutionResults={new Map()}
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
        <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(e) => e.stopPropagation()}>
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