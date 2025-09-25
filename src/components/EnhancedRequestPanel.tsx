import React, { useState } from 'react';
import { Request } from '../database/DatabaseManager';
import { MonacoEditor } from './MonacoEditor';

interface EnhancedRequestPanelProps {
  request: Request;
  onRequestChange: (request: Request) => void;
  onSendRequest: () => void;
  isLoading: boolean;
  enableSyntaxHighlighting: boolean;
  theme: 'dark' | 'light';
}

export const EnhancedRequestPanel: React.FC<EnhancedRequestPanelProps> = ({
  request,
  onRequestChange,
  onSendRequest,
  isLoading,
  enableSyntaxHighlighting,
  theme
}) => {
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth' | 'tests'>('params');

  const updateRequest = (updates: Partial<Request>) => {
    onRequestChange({ ...request, ...updates });
  };

  const updateHeaders = (key: string, value: string, index: number) => {
    const headers = request.headers ? JSON.parse(request.headers) : {};
    const headerKeys = Object.keys(headers);
    
    if (index < headerKeys.length) {
      const oldKey = headerKeys[index];
      delete headers[oldKey];
      if (key && value) {
        headers[key] = value;
      }
    } else {
      if (key && value) {
        headers[key] = value;
      }
    }
    
    updateRequest({ headers: JSON.stringify(headers) });
  };

  const updateParams = (key: string, value: string, index: number) => {
    const params = request.params ? JSON.parse(request.params) : {};
    const paramKeys = Object.keys(params);
    
    if (index < paramKeys.length) {
      const oldKey = paramKeys[index];
      delete params[oldKey];
      if (key && value) {
        params[key] = value;
      }
    } else {
      if (key && value) {
        params[key] = value;
      }
    }
    
    updateRequest({ params: JSON.stringify(params) });
  };

  const renderKeyValueEditor = (
    data: Record<string, string>,
    onUpdate: (key: string, value: string, index: number) => void,
    placeholder: { key: string; value: string }
  ) => {
    const entries = Object.entries(data);
    const rows = [...entries, ['', '']];

    return (
      <div className="key-value-editor">
        <div className="kv-header">
          <div className="kv-header-cell">Key</div>
          <div className="kv-header-cell">Value</div>
          <div className="kv-header-cell">Actions</div>
        </div>
        {rows.map(([key, value], index) => (
          <div key={index} className="key-value-row">
            <input
              type="text"
              className="form-input kv-input"
              placeholder={placeholder.key}
              value={key}
              onChange={(e) => onUpdate(e.target.value, value, index)}
            />
            <input
              type="text"
              className="form-input kv-input"
              placeholder={placeholder.value}
              value={value}
              onChange={(e) => onUpdate(key, e.target.value, index)}
            />
            <div className="kv-actions">
              {(key || value) && (
                <button
                  className="kv-action-button remove"
                  onClick={() => onUpdate('', '', index)}
                  title="Remove"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const headers = request.headers ? JSON.parse(request.headers) : {};
  const params = request.params ? JSON.parse(request.params) : {};
  const auth = request.auth ? JSON.parse(request.auth) : { type: 'none' };

  const getMethodColor = (method: string): string => {
    switch (method) {
      case 'GET': return '#4ec9b0';
      case 'POST': return '#ffcc02';
      case 'PUT': return '#007acc';
      case 'DELETE': return '#f72585';
      case 'PATCH': return '#ff8c00';
      case 'HEAD': return '#9370db';
      case 'OPTIONS': return '#20b2aa';
      default: return '#cccccc';
    }
  };

  return (
    <div className="enhanced-request-panel">
      {/* Request Header */}
      <div className="request-header">
        <div className="request-title-section">
          <input
            type="text"
            className="request-name-input"
            value={request.name}
            onChange={(e) => updateRequest({ name: e.target.value })}
            placeholder="Request Name"
          />
        </div>

        <div className="url-section">
          <select
            className="method-selector"
            value={request.method}
            onChange={(e) => updateRequest({ method: e.target.value })}
            style={{ borderColor: getMethodColor(request.method) }}
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
            className="url-input"
            value={request.url}
            onChange={(e) => updateRequest({ url: e.target.value })}
            placeholder="https://api.example.com/endpoint"
          />
          
          <button
            className="send-button"
            onClick={onSendRequest}
            disabled={isLoading || !request.url}
          >
            {isLoading ? (
              <>
                <div className="spinner small"></div>
                <span>Sending</span>
              </>
            ) : (
              <span>Send</span>
            )}
          </button>
        </div>
      </div>

      {/* Request Tabs */}
      <div className="request-tabs">
        {(['params', 'headers', 'body', 'auth', 'tests'] as const).map(tab => (
          <button
            key={tab}
            className={`request-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="tab-label">
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </span>
            {tab === 'params' && Object.keys(params).length > 0 && (
              <span className="tab-badge">{Object.keys(params).length}</span>
            )}
            {tab === 'headers' && Object.keys(headers).length > 0 && (
              <span className="tab-badge">{Object.keys(headers).length}</span>
            )}
            {tab === 'tests' && request.tests && (
              <span className="tab-badge">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="request-tab-content">
        {activeTab === 'params' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h4>Query Parameters</h4>
              <p className="panel-description">
                Parameters will be automatically URL-encoded and appended to the request URL
              </p>
            </div>
            {renderKeyValueEditor(
              params,
              updateParams,
              { key: 'Parameter name', value: 'Parameter value' }
            )}
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h4>Headers</h4>
              <p className="panel-description">
                HTTP headers to be sent with the request
              </p>
            </div>
            {renderKeyValueEditor(
              headers,
              updateHeaders,
              { key: 'Header name', value: 'Header value' }
            )}
          </div>
        )}

        {activeTab === 'body' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h4>Request Body</h4>
              <p className="panel-description">
                Raw request body content (JSON, XML, plain text, etc.)
              </p>
            </div>
            
            <div className="body-editor">
              {enableSyntaxHighlighting ? (
                <MonacoEditor
                  value={request.body || ''}
                  onChange={(value) => updateRequest({ body: value })}
                  language="json"
                  height="300px"
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  placeholder="Enter request body..."
                />
              ) : (
                <textarea
                  className="form-input form-textarea body-textarea"
                  value={request.body || ''}
                  onChange={(e) => updateRequest({ body: e.target.value })}
                  placeholder="Enter request body (JSON, XML, plain text, etc.)"
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'auth' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h4>Authentication</h4>
              <p className="panel-description">
                Configure authentication for this request
              </p>
            </div>
            
            <div className="auth-section">
              <div className="form-group">
                <label className="form-label">Authentication Type</label>
                <select
                  className="form-select"
                  value={auth.type || 'none'}
                  onChange={(e) => updateRequest({
                    auth: JSON.stringify({ ...auth, type: e.target.value })
                  })}
                >
                  <option value="none">No Authentication</option>
                  <option value="bearer">****** Authentication</option>
                  <option value="basic">Basic Auth</option>
                  <option value="api-key">API Key</option>
                </select>
              </div>

              {auth.type === 'bearer' && (
                <div className="form-group">
                  <label className="form-label">****** Token</label>
                  <input
                    type="password"
                    className="form-input"
                    value={auth.token || ''}
                    onChange={(e) => updateRequest({
                      auth: JSON.stringify({ ...auth, token: e.target.value })
                    })}
                    placeholder="Enter your bearer token"
                  />
                </div>
              )}

              {auth.type === 'basic' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-input"
                      value={auth.username || ''}
                      onChange={(e) => updateRequest({
                        auth: JSON.stringify({ ...auth, username: e.target.value })
                      })}
                      placeholder="Username"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={auth.password || ''}
                      onChange={(e) => updateRequest({
                        auth: JSON.stringify({ ...auth, password: e.target.value })
                      })}
                      placeholder="Password"
                    />
                  </div>
                </>
              )}

              {auth.type === 'api-key' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Key</label>
                    <input
                      type="text"
                      className="form-input"
                      value={auth.key || ''}
                      onChange={(e) => updateRequest({
                        auth: JSON.stringify({ ...auth, key: e.target.value })
                      })}
                      placeholder="API key name (e.g., X-API-Key)"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Value</label>
                    <input
                      type="password"
                      className="form-input"
                      value={auth.value || ''}
                      onChange={(e) => updateRequest({
                        auth: JSON.stringify({ ...auth, value: e.target.value })
                      })}
                      placeholder="API key value"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h4>Test Scripts</h4>
              <p className="panel-description">
                JavaScript code to validate the response
              </p>
            </div>
            
            <div className="tests-editor">
              {enableSyntaxHighlighting ? (
                <MonacoEditor
                  value={request.tests || ''}
                  onChange={(value) => updateRequest({ tests: value })}
                  language="javascript"
                  height="300px"
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  placeholder="// Test script example:
// pm.test('Status code is 200', function () {
//     pm.response.to.have.status(200);
// });"
                />
              ) : (
                <textarea
                  className="form-input form-textarea tests-textarea"
                  value={request.tests || ''}
                  onChange={(e) => updateRequest({ tests: e.target.value })}
                  placeholder="Write test scripts here..."
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};