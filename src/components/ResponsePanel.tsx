import React, { useState } from 'react';
import { ApiResponse } from '../types';
import { formatResponseTime, formatFileSize, getStatusColor } from '../utils/api';

interface ResponsePanelProps {
  response: ApiResponse | null;
  isLoading: boolean;
}

export const ResponsePanel: React.FC<ResponsePanelProps> = ({ response, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');

  const formatJson = (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const getContentType = (headers: Record<string, string>): string => {
    const contentType = headers['content-type'] || headers['Content-Type'] || '';
    return contentType.toLowerCase();
  };

  const isJsonResponse = (headers: Record<string, string>): boolean => {
    return getContentType(headers).includes('application/json');
  };

  if (isLoading) {
    return (
      <div className="response-panel">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div className="spinner" style={{ width: '32px', height: '32px' }}></div>
          <p className="text-muted">Sending request...</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="response-panel">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <p className="text-muted">No response yet</p>
          <p className="text-small text-muted">Send a request to see the response here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="response-panel">
      {/* Response Status Bar */}
      <div 
        className="response-status-bar"
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="text-small text-muted">Status:</span>
          <span className={`${getStatusColor(response.status)}`} style={{ fontWeight: 'bold' }}>
            {response.status} {response.statusText}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="text-small text-muted">Time:</span>
          <span className="text-small">{formatResponseTime(response.responseTime)}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="text-small text-muted">Size:</span>
          <span className="text-small">{formatFileSize(response.size)}</span>
        </div>
      </div>

      {/* Response Tabs */}
      <div className="tabs">
        {(['body', 'headers'] as const).map(tab => {
          const tabIcons: Record<string, string> = {
            body: '📄',
            headers: '📋'
          };
          
          return (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="tab-icon">{tabIcons[tab]}</span>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'headers' && (
                <span style={{ marginLeft: '4px', fontSize: '11px', color: 'var(--accent-color)' }}>
                  ({Object.keys(response.headers).length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="tab-content" style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'body' && (
          <div style={{ height: '100%' }}>
            {response.data ? (
              <pre
                style={{
                  margin: 0,
                  padding: '16px',
                  fontSize: '12px',
                  lineHeight: '1.4',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-primary)',
                  overflow: 'auto',
                  height: '100%',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {isJsonResponse(response.headers) 
                  ? formatJson(response.data)
                  : typeof response.data === 'string'
                    ? response.data
                    : formatJson(response.data)
                }
              </pre>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <p className="text-muted">No response body</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'headers' && (
          <div style={{ padding: '16px' }}>
            {Object.keys(response.headers).length > 0 ? (
              <div className="response-headers">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      marginBottom: '8px',
                      fontSize: '12px',
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace'
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 'bold',
                        color: 'var(--accent-color)',
                        minWidth: '200px',
                        marginRight: '16px'
                      }}
                    >
                      {key}:
                    </span>
                    <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                      {Array.isArray(value) ? value.join(', ') : value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No response headers</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};