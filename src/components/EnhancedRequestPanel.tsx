import React, { useState } from 'react';
import { Request } from '../database/DatabaseManager';
import { MonacoEditor } from './MonacoEditor';
import TestScriptEditor from './TestScriptEditor';
import { TestSuite, TestExecutionResult } from '../testing/TestRunner';
import { ApiResponse } from '../types';

interface EnhancedRequestPanelProps {
  request: Request;
  onRequestChange: (request: Request) => void;
  onSendRequest: () => void;
  isLoading: boolean;
  enableSyntaxHighlighting: boolean;
  theme: 'dark' | 'light';
  testSuite?: TestSuite;
  onTestSuiteChange?: (testSuite: TestSuite) => void;
  onRunTests?: (testSuite: TestSuite, response: ApiResponse, request: any) => Promise<TestExecutionResult[]>;
  testResults?: TestExecutionResult[];
}

export const EnhancedRequestPanel: React.FC<EnhancedRequestPanelProps> = ({
  request,
  onRequestChange,
  onSendRequest,
  isLoading,
  enableSyntaxHighlighting,
  theme,
  testSuite: _testSuite,
  onTestSuiteChange,
  onRunTests,
  testResults = []
}) => {
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth' | 'tests' | 'soap' | 'grpc'>('params');
  const [bodyMode, setBodyMode] = useState<'raw' | 'json' | 'form'>('raw');
  const [headersMode, setHeadersMode] = useState<'kv' | 'raw'>('kv');

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

  const addRow = () => {
    // This function will be used by both params and headers to add new rows
    return {};
  };

  const removeRow = (index: number, data: Record<string, string>, onUpdate: (key: string, value: string, index: number) => void) => {
    const entries = Object.entries(data);
    if (index < entries.length) {
      onUpdate('', '', index); // This will remove the row
    }
  };

  const clearAll = (onUpdate: (key: string, value: string, index: number) => void) => {
    // Clear all entries by removing them one by one
    onUpdate('', '', 0);
  };

  const renderKeyValueEditor = (
    data: Record<string, string>,
    onUpdate: (key: string, value: string, index: number) => void,
    placeholder: { key: string; value: string }
  ) => {
    const entries = Object.entries(data);
    const rows = [...entries, ['', '']]; // Always show one empty row at the end

    return (
      <div className="key-value-editor">
        <div className="kv-header">
          <div className="kv-header-cell">
            <input 
              type="checkbox" 
              className="kv-checkbox" 
              title="Toggle all"
              checked={entries.length > 0}
              onChange={(e) => {
                if (!e.target.checked) {
                  // Clear all when unchecked
                  entries.forEach((_, index) => onUpdate('', '', index));
                }
              }}
            />
          </div>
          <div className="kv-header-cell">Key</div>
          <div className="kv-header-cell">Value</div>
          <div className="kv-header-cell">Description</div>
          <div className="kv-header-cell">Actions</div>
        </div>
        {rows.map(([key, value], index) => (
          <div key={index} className="key-value-row">
            <div className="kv-checkbox-cell">
              <input 
                type="checkbox" 
                className="kv-checkbox" 
                checked={!!(key && value)} 
                onChange={(e) => {
                  if (!e.target.checked && key && value) {
                    // Remove this row when unchecked
                    onUpdate('', '', index);
                  }
                }}
              />
            </div>
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
            <input
              type="text"
              className="form-input kv-input kv-description"
              placeholder="Description (optional)"
              value=""
              onChange={() => {}} // Description functionality could be added later
            />
            <div className="kv-actions">
              {(key || value) ? (
                <button
                  className="kv-action-button remove"
                  onClick={() => removeRow(index, data, onUpdate)}
                  title="Remove this parameter"
                  type="button"
                >
                  ×
                </button>
              ) : (
                <button
                  className="kv-action-button add"
                  onClick={() => {
                    // Focus on the key input to start adding
                    const keyInput = document.querySelector(`.key-value-row:nth-child(${index + 2}) .kv-input:first-of-type`) as HTMLInputElement;
                    if (keyInput) keyInput.focus();
                  }}
                  title="Add new parameter"
                  type="button"
                >
                  +
                </button>
              )}
            </div>
          </div>
        ))}
        
        <div className="kv-footer">
          <button 
            className="btn btn-secondary kv-add-button"
            onClick={() => {
              // Add a new empty row by focusing on the last empty row
              const lastRow = document.querySelector('.key-value-row:last-child .kv-input:first-of-type') as HTMLInputElement;
              if (lastRow) lastRow.focus();
            }}
            type="button"
          >
            + Add {placeholder.key.toLowerCase()}
          </button>
          <div className="kv-bulk-actions">
            <button 
              className="btn btn-link" 
              type="button"
              onClick={() => {
                // TODO: Implement bulk edit functionality
                console.log('Bulk edit clicked');
              }}
            >
              Bulk Edit
            </button>
            <button 
              className="btn btn-link" 
              type="button"
              onClick={() => {
                entries.forEach((_, index) => onUpdate('', '', index));
              }}
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    );
  };

  const headers = request.headers ? JSON.parse(request.headers) : {};
  const params = request.params ? JSON.parse(request.params) : {};
  const auth = request.auth ? JSON.parse(request.auth) : { type: 'none' };

  // method color handled via CSS classes (method-*)

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
            className={`method-selector method-${(request.method || '').toLowerCase()}`}
            value={request.method}
            onChange={(e) => updateRequest({ method: e.target.value })}
            aria-label="HTTP Method"
            disabled={!request.url}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
            <option value="SOAP">SOAP</option>
            <option value="GRPC">gRPC</option>
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
        {(() => {
          const baseTabs: Array<'params' | 'headers' | 'body' | 'auth' | 'tests' | 'soap' | 'grpc'> = ['params', 'headers', 'body', 'auth', 'tests'];
          
          // Add protocol-specific tabs
          if (request.method === 'SOAP') {
            baseTabs.splice(2, 0, 'soap'); // Insert SOAP tab before body
          } else if (request.method === 'GRPC') {
            baseTabs.splice(2, 0, 'grpc'); // Insert gRPC tab before body
          }
          
          return baseTabs.map(tab => (
            <button
              key={tab}
              className={`request-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="tab-label">
                {tab === 'soap' ? 'SOAP' : tab === 'grpc' ? 'gRPC' : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
          ));
        })()}
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
              <div className="mode-toggle">
                <label className="mode-label">
                  <input type="radio" name="headersMode" value="kv" checked={headersMode === 'kv'} onChange={() => setHeadersMode('kv')} /> KV
                </label>
                <label className="mode-label">
                  <input type="radio" name="headersMode" value="raw" checked={headersMode === 'raw'} onChange={() => setHeadersMode('raw')} /> Raw JSON
                </label>
              </div>
            </div>
            {headersMode === 'kv' ? (
              renderKeyValueEditor(
                headers,
                updateHeaders,
                { key: 'Header name', value: 'Header value' }
              )
            ) : (
              <textarea
                className="form-input form-textarea headers-raw-textarea"
                value={JSON.stringify(headers, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    updateRequest({ headers: JSON.stringify(parsed) });
                  } catch {
                    // keep text until valid
                    updateRequest({ headers: e.target.value });
                  }
                }}
                aria-label="Raw headers JSON"
              />
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
              <div className="mode-toggle">
                <label className="mode-label">
                  <input type="radio" name="bodyMode" value="raw" checked={bodyMode === 'raw'} onChange={() => setBodyMode('raw')} /> Raw
                </label>
                <label className="mode-label">
                  <input type="radio" name="bodyMode" value="json" checked={bodyMode === 'json'} onChange={() => setBodyMode('json')} /> JSON
                </label>
                <label className="mode-label">
                  <input type="radio" name="bodyMode" value="form" checked={bodyMode === 'form'} onChange={() => setBodyMode('form')} /> Form
                </label>
              </div>
            </div>
            
            <div className="body-editor">
              {bodyMode === 'form' ? (
                <div>
                  {/* Simple key/value form editor */}
                  {(() => {
                    const form = request.body ? (() => {
                      try { return JSON.parse(request.body); } catch { return {}; }
                    })() : {};
                    const entries = Object.entries(form as Record<string, any>);
                    return (
                      <div>
                        {entries.map(([k, v], i) => (
                          <div key={i} className="form-row">
                            <input className="form-input form-key-input" value={k} readOnly aria-label={`Field key ${i}`} />
                            <input className="form-input form-value-input" value={String(v)} onChange={(e) => {
                              const next = { ...(form as Record<string, any>) };
                              next[k] = e.target.value;
                              updateRequest({ body: JSON.stringify(next) });
                            }} aria-label={`Field value ${i}`} />
                          </div>
                        ))}
                        <div className="form-add-row">
                          <button className="btn btn-secondary" onClick={() => {
                            const next = { ...(form as Record<string, any>) };
                            next[`field_${Date.now()}`] = '';
                            updateRequest({ body: JSON.stringify(next) });
                          }}>Add Field</button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : enableSyntaxHighlighting ? (
                <MonacoEditor
                  value={request.body || ''}
                  onChange={(value) => updateRequest({ body: value })}
                  language={bodyMode === 'json' ? 'json' : 'text'}
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

        {activeTab === 'soap' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h4>SOAP Configuration</h4>
              <p className="panel-description">
                Configure SOAP-specific settings for this request
              </p>
            </div>
            
            <div className="soap-section">
              <div className="form-group">
                <label className="form-label">SOAP Action</label>
                <input
                  type="text"
                  className="form-input"
                  value={(() => {
                    try {
                      const soap = request.body ? JSON.parse(request.body) : {};
                      return soap.soapAction || '';
                    } catch {
                      return '';
                    }
                  })()}
                  onChange={(e) => {
                    try {
                      const soap = request.body ? JSON.parse(request.body) : {};
                      soap.soapAction = e.target.value;
                      updateRequest({ body: JSON.stringify(soap) });
                    } catch {
                      updateRequest({ body: JSON.stringify({ soapAction: e.target.value }) });
                    }
                  }}
                  placeholder="http://tempuri.org/SampleAction"
                />
                <small className="form-help">The SOAPAction HTTP header value</small>
              </div>
              
              <div className="form-group">
                <label className="form-label">WSDL URL (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={(() => {
                    try {
                      const soap = request.body ? JSON.parse(request.body) : {};
                      return soap.wsdlUrl || '';
                    } catch {
                      return '';
                    }
                  })()}
                  onChange={(e) => {
                    try {
                      const soap = request.body ? JSON.parse(request.body) : {};
                      soap.wsdlUrl = e.target.value;
                      updateRequest({ body: JSON.stringify(soap) });
                    } catch {
                      updateRequest({ body: JSON.stringify({ wsdlUrl: e.target.value }) });
                    }
                  }}
                  placeholder="http://example.com/service.wsdl"
                />
                <small className="form-help">URL to the WSDL document for reference</small>
              </div>
              
              <div className="form-group">
                <label className="form-label">Target Namespace</label>
                <input
                  type="text"
                  className="form-input"
                  value={(() => {
                    try {
                      const soap = request.body ? JSON.parse(request.body) : {};
                      return soap.namespace || '';
                    } catch {
                      return '';
                    }
                  })()}
                  onChange={(e) => {
                    try {
                      const soap = request.body ? JSON.parse(request.body) : {};
                      soap.namespace = e.target.value;
                      updateRequest({ body: JSON.stringify(soap) });
                    } catch {
                      updateRequest({ body: JSON.stringify({ namespace: e.target.value }) });
                    }
                  }}
                  placeholder="http://tempuri.org/"
                />
                <small className="form-help">The XML namespace for the SOAP service</small>
              </div>
              
              <div className="form-group">
                <label className="form-label">Operation Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={(() => {
                    try {
                      const soap = request.body ? JSON.parse(request.body) : {};
                      return soap.operation || '';
                    } catch {
                      return '';
                    }
                  })()}
                  onChange={(e) => {
                    try {
                      const soap = request.body ? JSON.parse(request.body) : {};
                      soap.operation = e.target.value;
                      updateRequest({ body: JSON.stringify(soap) });
                    } catch {
                      updateRequest({ body: JSON.stringify({ operation: e.target.value }) });
                    }
                  }}
                  placeholder="SampleOperation"
                />
                <small className="form-help">The SOAP operation/method name to call</small>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    const sampleEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://tempuri.org/">
  <soap:Header>
    <!-- Optional header content -->
  </soap:Header>
  <soap:Body>
    <tns:SampleOperation>
      <tns:parameter1>value1</tns:parameter1>
      <tns:parameter2>value2</tns:parameter2>
    </tns:SampleOperation>
  </soap:Body>
</soap:Envelope>`;
                    updateRequest({ body: sampleEnvelope });
                    setActiveTab('body');
                  }}
                >
                  Generate Sample Envelope
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'grpc' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h4>gRPC Configuration</h4>
              <p className="panel-description">
                Configure gRPC-specific settings for this request
              </p>
            </div>
            
            <div className="grpc-section">
              <div className="form-group">
                <label className="form-label">Service Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={(() => {
                    try {
                      const grpc = request.body ? JSON.parse(request.body) : {};
                      return grpc.service || '';
                    } catch {
                      return '';
                    }
                  })()}
                  onChange={(e) => {
                    try {
                      const grpc = request.body ? JSON.parse(request.body) : {};
                      grpc.service = e.target.value;
                      updateRequest({ body: JSON.stringify(grpc) });
                    } catch {
                      updateRequest({ body: JSON.stringify({ service: e.target.value }) });
                    }
                  }}
                  placeholder="com.example.SampleService"
                />
                <small className="form-help">The fully qualified gRPC service name</small>
              </div>
              
              <div className="form-group">
                <label className="form-label">Method Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={(() => {
                    try {
                      const grpc = request.body ? JSON.parse(request.body) : {};
                      return grpc.method || '';
                    } catch {
                      return '';
                    }
                  })()}
                  onChange={(e) => {
                    try {
                      const grpc = request.body ? JSON.parse(request.body) : {};
                      grpc.method = e.target.value;
                      updateRequest({ body: JSON.stringify(grpc) });
                    } catch {
                      updateRequest({ body: JSON.stringify({ method: e.target.value }) });
                    }
                  }}
                  placeholder="SampleMethod"
                />
                <small className="form-help">The gRPC method to call</small>
              </div>
              
              <div className="form-group">
                <label className="form-label">Streaming Type</label>
                <select
                  className="form-select"
                  aria-label="gRPC streaming type"
                  value={(() => {
                    try {
                      const grpc = request.body ? JSON.parse(request.body) : {};
                      return grpc.streaming || 'none';
                    } catch {
                      return 'none';
                    }
                  })()}
                  onChange={(e) => {
                    try {
                      const grpc = request.body ? JSON.parse(request.body) : {};
                      grpc.streaming = e.target.value;
                      updateRequest({ body: JSON.stringify(grpc) });
                    } catch {
                      updateRequest({ body: JSON.stringify({ streaming: e.target.value }) });
                    }
                  }}
                >
                  <option value="none">Unary (Request/Response)</option>
                  <option value="client">Client Streaming</option>
                  <option value="server">Server Streaming</option>
                  <option value="bidirectional">Bidirectional Streaming</option>
                </select>
                <small className="form-help">Select the type of gRPC streaming</small>
              </div>
              
              <div className="form-group">
                <label className="form-label">Proto File Content</label>
                <textarea
                  className="form-textarea"
                  rows={8}
                  value={(() => {
                    try {
                      const grpc = request.body ? JSON.parse(request.body) : {};
                      return grpc.protoFile || '';
                    } catch {
                      return '';
                    }
                  })()}
                  onChange={(e) => {
                    try {
                      const grpc = request.body ? JSON.parse(request.body) : {};
                      grpc.protoFile = e.target.value;
                      updateRequest({ body: JSON.stringify(grpc) });
                    } catch {
                      updateRequest({ body: JSON.stringify({ protoFile: e.target.value }) });
                    }
                  }}
                  placeholder="syntax = &quot;proto3&quot;;"
                />
                <small className="form-help">Paste your .proto file content here</small>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    const sampleProto = `syntax = "proto3";

package sample;

service SampleService {
  rpc SampleMethod (SampleRequest) returns (SampleResponse);
}

message SampleRequest {
  string message = 1;
  int32 number = 2;
}

message SampleResponse {
  string result = 1;
  bool success = 2;
}`;
                    const grpcConfig = {
                      service: 'sample.SampleService',
                      method: 'SampleMethod',
                      streaming: 'none',
                      protoFile: sampleProto
                    };
                    updateRequest({ body: JSON.stringify(grpcConfig) });
                    
                    // Also set a sample request body
                    setTimeout(() => {
                      setActiveTab('body');
                    }, 100);
                  }}
                >
                  Generate Sample Proto
                </button>
              </div>
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
              <div className="auth-radio-row" role="radiogroup" aria-label="Authentication Type">
                <label className="mode-label"><input type="radio" name="authType" value="none" checked={auth.type === 'none'} onChange={() => updateRequest({ auth: JSON.stringify({ type: 'none' }) })} /> None</label>
                <label className="mode-label"><input type="radio" name="authType" value="bearer" checked={auth.type === 'bearer'} onChange={() => updateRequest({ auth: JSON.stringify({ type: 'bearer', token: '' }) })} /> Bearer</label>
                <label className="mode-label"><input type="radio" name="authType" value="basic" checked={auth.type === 'basic'} onChange={() => updateRequest({ auth: JSON.stringify({ type: 'basic', username: '', password: '' }) })} /> Basic</label>
                <label className="mode-label"><input type="radio" name="authType" value="api-key" checked={auth.type === 'api-key'} onChange={() => updateRequest({ auth: JSON.stringify({ type: 'api-key', key: '', value: '' }) })} /> API Key</label>
                <label className="mode-label"><input type="radio" name="authType" value="ws-security" checked={auth.type === 'ws-security'} onChange={() => updateRequest({ auth: JSON.stringify({ type: 'ws-security', wssUsername: '', wssPassword: '' }) })} /> WS-Security</label>
              </div>

              {auth.type === 'bearer' && (
                <div className="form-group">
                  <label className="form-label">Bearer Token</label>
                  <input
                    type="password"
                    className="form-input"
                    value={auth.token || ''}
                    onChange={(e) => updateRequest({ auth: JSON.stringify({ ...auth, token: e.target.value }) })}
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
                      onChange={(e) => updateRequest({ auth: JSON.stringify({ ...auth, username: e.target.value }) })}
                      placeholder="Username"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={auth.password || ''}
                      onChange={(e) => updateRequest({ auth: JSON.stringify({ ...auth, password: e.target.value }) })}
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
                      onChange={(e) => updateRequest({ auth: JSON.stringify({ ...auth, key: e.target.value }) })}
                      placeholder="API key name (e.g., X-API-Key)"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Value</label>
                    <input
                      type="password"
                      className="form-input"
                      value={auth.value || ''}
                      onChange={(e) => updateRequest({ auth: JSON.stringify({ ...auth, value: e.target.value }) })}
                      placeholder="API key value"
                    />
                  </div>
                </>
              )}

              {auth.type === 'ws-security' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-input"
                      value={auth.wssUsername || ''}
                      onChange={(e) => updateRequest({ auth: JSON.stringify({ ...auth, wssUsername: e.target.value }) })}
                      placeholder="WS-Security username"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={auth.wssPassword || ''}
                      onChange={(e) => updateRequest({ auth: JSON.stringify({ ...auth, wssPassword: e.target.value }) })}
                      placeholder="WS-Security password"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password Type</label>
                    <select
                      className="form-select"
                      aria-label="WS-Security password type"
                      value={auth.wssPasswordType || 'PasswordText'}
                      onChange={(e) => updateRequest({ auth: JSON.stringify({ ...auth, wssPasswordType: e.target.value }) })}
                    >
                      <option value="PasswordText">Password Text</option>
                      <option value="PasswordDigest">Password Digest</option>
                    </select>
                    <small className="form-help">Choose how the password should be transmitted</small>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="tab-panel tests-panel">
            {onTestSuiteChange && onRunTests ? (
              <TestScriptEditor
                requestId={request.id}
                requestName={request.name}
                onTestSuiteChange={onTestSuiteChange}
                onRunTests={onRunTests}
                testResults={testResults}
              />
            ) : (
              <div className="panel-header">
                <h4>Test Scripts</h4>
                <p className="panel-description">
                  Advanced test runner is not available in this context
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .tests-panel {
          padding: 0;
          height: 100%;
        }
        
        .tests-panel .panel-header {
          padding: 16px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }
      `}</style>
    </div>
  );
};