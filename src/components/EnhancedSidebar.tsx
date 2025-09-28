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
          <button
            className="header-action-button"
            onClick={onSettings}
            title="Settings"
          >
            ⚙️
          </button>
          <button
            className="header-action-button"
            onClick={onNewCollection}
            title="New Collection"
          >
            📁+
          </button>
          <ModernButton
            onClick={onNewRequest}
            variant="primary"
            size="small"
            icon={<AddIcon />}
            style={{ 
              padding: '6px 8px',
              minWidth: '32px',
              minHeight: '32px'
            }}
          >
            New
          </ModernButton>
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
                      className="expand-icon"
                      onClick={() => toggleCollection(collection.id)}
                      style={{
                        transform: expandedCollections.has(collection.id) ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.15s ease',
                        cursor: 'pointer'
                      }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, 'collection', collection.id);
                        }}
                        title="Collection actions"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '2px',
                          fontSize: '12px',
                          opacity: 0.6,
                          transition: 'opacity 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLElement).style.opacity = '1';
                          (e.target as HTMLElement).style.backgroundColor = 'var(--bg-hover)';
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLElement).style.opacity = '0.6';
                          (e.target as HTMLElement).style.backgroundColor = 'transparent';
                        }}
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
                              <span
                                className="method-text"
                                style={{ color: getMethodColor(request.method) }}
                              >
                                {request.method}
                              </span>
                            </div>
                            <div 
                              className="request-info"
                              onClick={() => onRequestSelect(request)}
                              style={{ flex: 1, cursor: 'pointer' }}
                            >
                              <div className="request-name">{request.name}</div>
                              <div className="request-url">{request.url}</div>
                            </div>
                            <div className="request-actions">
                              {request.tests && (
                                <span className="test-indicator" title="Has tests">
                                  🧪
                                </span>
                              )}
                              <button
                                className="action-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleContextMenu(e, 'request', request.id);
                                }}
                                title="Request actions"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  borderRadius: '2px',
                                  fontSize: '12px',
                                  marginLeft: '4px',
                                  opacity: 0.6,
                                  transition: 'opacity 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  (e.target as HTMLElement).style.opacity = '1';
                                  (e.target as HTMLElement).style.backgroundColor = 'var(--bg-hover)';
                                }}
                                onMouseLeave={(e) => {
                                  (e.target as HTMLElement).style.opacity = '0.6';
                                  (e.target as HTMLElement).style.backgroundColor = 'transparent';
                                }}
                              >
                                ⋮
                              </button>
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
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: '#2d2d30',
            border: '1px solid #404040',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            minWidth: '120px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'collection' ? (
            <>
              <div
                className="context-menu-item"
                onClick={() => handleContextMenuAction('edit', 'collection', contextMenu.id)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  color: '#cccccc',
                  fontSize: '13px',
                  borderBottom: '1px solid #404040'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#3c3c3c';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                ✏️ Edit Collection
              </div>
              <div
                className="context-menu-item"
                onClick={() => handleContextMenuAction('delete', 'collection', contextMenu.id)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  color: '#f44747',
                  fontSize: '13px'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#3c3c3c';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                🗑️ Delete Collection
              </div>
            </>
          ) : (
            <>
              <div
                className="context-menu-item"
                onClick={() => handleContextMenuAction('edit', 'request', contextMenu.id)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  color: '#cccccc',
                  fontSize: '13px',
                  borderBottom: '1px solid #404040'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#3c3c3c';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                ✏️ Edit Request
              </div>
              <div
                className="context-menu-item"
                onClick={() => handleContextMenuAction('duplicate', 'request', contextMenu.id)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  color: '#cccccc',
                  fontSize: '13px',
                  borderBottom: '1px solid #404040'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#3c3c3c';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                📋 Duplicate Request
              </div>
              <div
                className="context-menu-item"
                onClick={() => handleContextMenuAction('delete', 'request', contextMenu.id)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  color: '#f44747',
                  fontSize: '13px'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#3c3c3c';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                🗑️ Delete Request
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};