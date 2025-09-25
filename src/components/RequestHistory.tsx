import React, { useState } from 'react';
import { RequestHistory as IRequestHistory, ApiRequest } from '../types';
import { formatResponseTime, getStatusColor } from '../utils/api';

interface RequestHistoryProps {
  history: IRequestHistory[];
  onRequestSelect: (request: ApiRequest) => void;
  onToggleFavorite: (historyId: string) => void;
  onClearHistory: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const RequestHistory: React.FC<RequestHistoryProps> = ({
  history,
  onRequestSelect,
  onToggleFavorite,
  onClearHistory,
  isOpen,
  onClose
}) => {
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history
    .filter(item => filter === 'all' || item.isFavorite)
    .filter(item => 
      searchTerm === '' || 
      item.request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.request.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.request.method.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleRequestSelect = (historyItem: IRequestHistory) => {
    onRequestSelect(historyItem.request);
    onClose();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="request-history-overlay">
      <div className="request-history">
        <div className="request-history-header">
          <h2>Request History</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="request-history-controls">
          <div className="search-box">
            <input
              type="text"
              className="form-input"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({history.length})
            </button>
            <button
              className={`filter-tab ${filter === 'favorites' ? 'active' : ''}`}
              onClick={() => setFilter('favorites')}
            >
              Favorites ({history.filter(h => h.isFavorite).length})
            </button>
          </div>

          <div className="history-actions">
            <button className="btn btn-danger" onClick={onClearHistory}>
              Clear History
            </button>
          </div>
        </div>

        <div className="request-history-content">
          {filteredHistory.length === 0 ? (
            <div className="empty-history">
              <p>No requests found</p>
              {searchTerm && (
                <button className="btn btn-secondary" onClick={() => setSearchTerm('')}>
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="history-list">
              {filteredHistory.map(historyItem => (
                <div key={historyItem.id} className="history-item">
                  <div className="history-item-content" onClick={() => handleRequestSelect(historyItem)}>
                    <div className="history-item-header">
                      <div className="method-url">
                        <span className={`method-badge method-${historyItem.request.method.toLowerCase()}`}>
                          {historyItem.request.method}
                        </span>
                        <span className="request-url" title={historyItem.request.url}>
                          {historyItem.request.url}
                        </span>
                      </div>
                      <div className="response-info">
                        <span className={`status-badge ${getStatusColor(historyItem.response.status)}`}>
                          {historyItem.response.status}
                        </span>
                        <span className="response-time">
                          {formatResponseTime(historyItem.response.responseTime)}
                        </span>
                      </div>
                    </div>

                    <div className="history-item-details">
                      <div className="request-details">
                        <span className="request-name">{historyItem.request.name}</span>
                        <span className="timestamp">{formatTimestamp(historyItem.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="history-item-actions">
                    <button
                      className={`favorite-button ${historyItem.isFavorite ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(historyItem.id);
                      }}
                      title={historyItem.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {historyItem.isFavorite ? '★' : '☆'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};