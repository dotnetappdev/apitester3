import React, { useState } from 'react';
import { Collection, ApiRequest } from '../types';

interface SidebarProps {
  collections: Collection[];
  onRequestSelect: (request: ApiRequest) => void;
  onNewRequest: () => void;
  activeRequest: ApiRequest | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collections,
  onRequestSelect,
  onNewRequest,
  activeRequest
}) => {
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

  const toggleCollection = (collectionId: string) => {
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
      default: return '#cccccc';
    }
  };

  return (
    <div className="sidebar">
      <div className="p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-primary)' }}>
          VeriAPI
        </h2>
        <button
          className="btn btn-primary"
          onClick={onNewRequest}
          style={{ width: '100%' }}
        >
          + New Request
        </button>
      </div>

      <div className="flex-1" style={{ overflow: 'auto' }}>
        {collections.length === 0 ? (
          <div className="p-4 text-center text-muted">
            <p>No collections yet.</p>
            <p className="text-small">Create a new request to get started.</p>
          </div>
        ) : (
          collections.map(collection => (
            <div key={collection.id} className="collection">
              <div
                className="collection-header"
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
                onClick={() => toggleCollection(collection.id)}
              >
                <span
                  style={{
                    marginRight: '8px',
                    transform: expandedCollections.has(collection.id) ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  ▶
                </span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {collection.name}
                </span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '12px',
                    color: 'var(--text-muted)'
                  }}
                >
                  {collection.requests.length}
                </span>
              </div>

              {expandedCollections.has(collection.id) && (
                <div className="collection-requests">
                  {collection.requests.map(request => (
                    <div
                      key={request.id}
                      className={`request-item ${activeRequest?.id === request.id ? 'active' : ''}`}
                      style={{
                        padding: '8px 16px 8px 40px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: activeRequest?.id === request.id 
                          ? 'var(--bg-tertiary)' 
                          : 'transparent'
                      }}
                      onClick={() => onRequestSelect(request)}
                      onMouseEnter={(e) => {
                        if (activeRequest?.id !== request.id) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeRequest?.id !== request.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 'bold',
                          color: getMethodColor(request.method),
                          marginRight: '8px',
                          minWidth: '35px'
                        }}
                      >
                        {request.method}
                      </span>
                      <span
                        style={{
                          fontSize: '13px',
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {request.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};