import React, { useState } from 'react';
import { ApiRequest } from '../types';

interface RequestPanelProps {
  request: ApiRequest;
  onRequestChange: (request: ApiRequest) => void;
  onSendRequest: () => void;
  isLoading: boolean;
}

export const RequestPanel: React.FC<RequestPanelProps> = ({
  request,
  onRequestChange,
  onSendRequest,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth'>('params');

  const updateRequest = (updates: Partial<ApiRequest>) => {
    onRequestChange({ ...request, ...updates });
  };

  const updateHeaders = (key: string, value: string, index: number) => {
    const newHeaders = { ...request.headers };
    const headerKeys = Object.keys(newHeaders);
    
    if (index < headerKeys.length) {
      // Update existing header
      const oldKey = headerKeys[index];
      delete newHeaders[oldKey];
      if (key && value) {
        newHeaders[key] = value;
      }
    } else {
      // Add new header
      if (key && value) {
        newHeaders[key] = value;
      }
    }
    
    updateRequest({ headers: newHeaders });
  };

  const updateParams = (key: string, value: string, index: number) => {
    const newParams = { ...request.params };
    const paramKeys = Object.keys(newParams);
    
    if (index < paramKeys.length) {
      // Update existing param
      const oldKey = paramKeys[index];
      delete newParams[oldKey];
      if (key && value) {
        newParams[key] = value;
      }
    } else {
      // Add new param
      if (key && value) {
        newParams[key] = value;
      }
    }
    
    updateRequest({ params: newParams });
  };

  const renderKeyValueEditor = (
    data: Record<string, string>,
    onUpdate: (key: string, value: string, index: number) => void,
    placeholder: { key: string; value: string }
  ) => {
    const entries = Object.entries(data);
    const rows = [...entries, ['', '']]; // Add empty row for new entries

    return (
      <div className="key-value-editor">
        {rows.map(([key, value], index) => (
          <div key={index} className="key-value-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              className="form-input"
              placeholder={placeholder.key}
              value={key}
              onChange={(e) => onUpdate(e.target.value, value, index)}
              style={{ flex: 1 }}
            />
            <input
              type="text"
              className="form-input"
              placeholder={placeholder.value}
              value={value}
              onChange={(e) => onUpdate(key, e.target.value, index)}
              style={{ flex: 1 }}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="request-panel">
      {/* Request Name */}
      <div className="form-group">
        <label className="form-label">Request Name</label>
        <input
          type="text"
          className="form-input"
          value={request.name}
          onChange={(e) => updateRequest({ name: e.target.value })}
          placeholder="My API Request"
        />
      </div>

      {/* URL Bar */}
      <div className="url-bar">
        <select
          className="form-select method-select"
          value={request.method}
          onChange={(e) => updateRequest({ method: e.target.value as ApiRequest['method'] })}
          disabled={!request.url}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
          <option value="HEAD">HEAD</option>
          <option value="OPTIONS">OPTIONS</option>
        </select>
        
        <input
          type="text"
          className="form-input url-input"
          value={request.url}
          onChange={(e) => updateRequest({ url: e.target.value })}
          placeholder="https://api.example.com/endpoint"
        />
        
        <button
          className="btn btn-primary send-button"
          onClick={onSendRequest}
          disabled={isLoading || !request.url}
        >
          {isLoading ? <div className="spinner"></div> : 'Send'}
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {(['params', 'headers', 'body', 'auth'] as const).map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'params' && Object.keys(request.params).length > 0 && (
              <span style={{ marginLeft: '4px', fontSize: '11px', color: 'var(--accent-color)' }}>
                ({Object.keys(request.params).length})
              </span>
            )}
            {tab === 'headers' && Object.keys(request.headers).length > 0 && (
              <span style={{ marginLeft: '4px', fontSize: '11px', color: 'var(--accent-color)' }}>
                ({Object.keys(request.headers).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'params' && (
          <div>
            <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>Query Parameters</h4>
            {renderKeyValueEditor(
              request.params,
              updateParams,
              { key: 'Parameter name', value: 'Parameter value' }
            )}
          </div>
        )}

        {activeTab === 'headers' && (
          <div>
            <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>Headers</h4>
            {renderKeyValueEditor(
              request.headers,
              updateHeaders,
              { key: 'Header name', value: 'Header value' }
            )}
          </div>
        )}

        {activeTab === 'body' && (
          <div>
            <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>Request Body</h4>
            <textarea
              className="form-input form-textarea"
              value={request.body || ''}
              onChange={(e) => updateRequest({ body: e.target.value })}
              placeholder="Request body (JSON, XML, plain text, etc.)"
              style={{ minHeight: '200px' }}
            />
          </div>
        )}

        {activeTab === 'auth' && (
          <div>
            <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>Authentication</h4>
            
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={request.auth?.type || 'none'}
                onChange={(e) => updateRequest({
                  auth: { ...request.auth, type: e.target.value as ApiRequest['auth']['type'] }
                })}
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
                <option value="api-key">API Key</option>
              </select>
            </div>

            {request.auth?.type === 'bearer' && (
              <div className="form-group">
                <label className="form-label">Token</label>
                <input
                  type="text"
                  className="form-input"
                  value={request.auth.token || ''}
                  onChange={(e) => updateRequest({
                    auth: { ...request.auth, token: e.target.value }
                  })}
                  placeholder="Your bearer token"
                />
              </div>
            )}

            {request.auth?.type === 'basic' && (
              <>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-input"
                    value={request.auth.username || ''}
                    onChange={(e) => updateRequest({
                      auth: { ...request.auth, username: e.target.value }
                    })}
                    placeholder="Username"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={request.auth.password || ''}
                    onChange={(e) => updateRequest({
                      auth: { ...request.auth, password: e.target.value }
                    })}
                    placeholder="Password"
                  />
                </div>
              </>
            )}

            {request.auth?.type === 'api-key' && (
              <>
                <div className="form-group">
                  <label className="form-label">Key</label>
                  <input
                    type="text"
                    className="form-input"
                    value={request.auth.key || ''}
                    onChange={(e) => updateRequest({
                      auth: { ...request.auth, key: e.target.value }
                    })}
                    placeholder="API key name (e.g., X-API-Key)"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Value</label>
                  <input
                    type="text"
                    className="form-input"
                    value={request.auth.value || ''}
                    onChange={(e) => updateRequest({
                      auth: { ...request.auth, value: e.target.value }
                    })}
                    placeholder="API key value"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};