import React, { useState, useEffect } from 'react';
import { InterceptedTraffic, InterceptedRequest, InterceptedResponse, ProxyConfig } from '../types';
import { ModernButton } from './ModernButton';

interface MonitoringPanelProps {
  theme: 'dark' | 'light';
}

export const MonitoringPanel: React.FC<MonitoringPanelProps> = ({ theme }) => {
  const [proxyConfig, setProxyConfig] = useState<ProxyConfig>({
    enabled: false,
    port: 8888,
    targetEndpoints: ['http://localhost:3000'],
    interceptEnabled: true,
    autoRespond: false
  });
  
  const [traffic, setTraffic] = useState<InterceptedTraffic[]>([]);
  const [selectedTraffic, setSelectedTraffic] = useState<InterceptedTraffic | null>(null);
  const [targetEndpointInput, setTargetEndpointInput] = useState('http://localhost:3000');
  const [editingResponse, setEditingResponse] = useState(false);
  const [modifiedResponse, setModifiedResponse] = useState<Partial<InterceptedResponse>>({});

  useEffect(() => {
    // Listen for intercepted requests via postMessage
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'proxy-request-intercepted') {
        const request = event.data.data;
        setTraffic(prev => [...prev, { request }]);
      } else if (event.data.type === 'proxy-response-intercepted') {
        const { request, response } = event.data.data;
        setTraffic(prev => {
          const index = prev.findIndex(t => t.request.id === request.id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = { ...updated[index], response };
            return updated;
          }
          return [...prev, { request, response }];
        });
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const startProxy = async () => {
    try {
      const result = await window.electronAPI.proxyStart(proxyConfig);
      if (result.success) {
        setProxyConfig(prev => ({ ...prev, enabled: true }));
        console.log('Proxy server started on port', proxyConfig.port);
      } else {
        console.error('Failed to start proxy:', result.error);
        alert('Failed to start proxy: ' + result.error);
      }
    } catch (error) {
      console.error('Error starting proxy:', error);
      alert('Error starting proxy: ' + error);
    }
  };

  const stopProxy = async () => {
    try {
      const result = await window.electronAPI.proxyStop();
      if (result.success) {
        setProxyConfig(prev => ({ ...prev, enabled: false }));
        console.log('Proxy server stopped');
      } else {
        console.error('Failed to stop proxy:', result.error);
      }
    } catch (error) {
      console.error('Error stopping proxy:', error);
    }
  };

  const updateProxyConfig = async (updates: Partial<ProxyConfig>) => {
    const newConfig = { ...proxyConfig, ...updates };
    setProxyConfig(newConfig);
    
    if (proxyConfig.enabled) {
      try {
        await window.electronAPI.proxyUpdateConfig(updates);
      } catch (error) {
        console.error('Error updating proxy config:', error);
      }
    }
  };

  const addTargetEndpoint = () => {
    if (targetEndpointInput && !proxyConfig.targetEndpoints.includes(targetEndpointInput)) {
      updateProxyConfig({
        targetEndpoints: [...proxyConfig.targetEndpoints, targetEndpointInput]
      });
      setTargetEndpointInput('');
    }
  };

  const removeTargetEndpoint = (endpoint: string) => {
    updateProxyConfig({
      targetEndpoints: proxyConfig.targetEndpoints.filter(e => e !== endpoint)
    });
  };

  const clearTraffic = () => {
    setTraffic([]);
    setSelectedTraffic(null);
  };

  const respondWithModified = async () => {
    if (!selectedTraffic || !modifiedResponse) return;

    try {
      await window.electronAPI.proxyRespond({
        requestId: selectedTraffic.request.id,
        response: modifiedResponse
      });
      setEditingResponse(false);
    } catch (error) {
      console.error('Error responding to request:', error);
      alert('Error responding to request: ' + error);
    }
  };

  const formatJson = (data: any) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return data;
    }
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: '#61affe',
      POST: '#49cc90',
      PUT: '#fca130',
      DELETE: '#f93e3e',
      PATCH: '#50e3c2',
      HEAD: '#9012fe',
      OPTIONS: '#0d5aa7'
    };
    return colors[method] || '#808080';
  };

  const getStatusColor = (status?: number) => {
    if (!status) return '#808080';
    if (status >= 200 && status < 300) return '#49cc90';
    if (status >= 300 && status < 400) return '#fca130';
    if (status >= 400 && status < 500) return '#f93e3e';
    if (status >= 500) return '#dc143c';
    return '#808080';
  };

  return (
    <div className="monitoring-panel">
      {/* Proxy Configuration Section */}
      <div className="monitoring-config">
        <div className="config-header">
          <h3>🔍 HTTP Traffic Monitor</h3>
          <div className="proxy-controls">
            <ModernButton
              variant={proxyConfig.enabled ? 'danger' : 'primary'}
              onClick={proxyConfig.enabled ? stopProxy : startProxy}
              size="small"
            >
              {proxyConfig.enabled ? '⏹ Stop Proxy' : '▶ Start Proxy'}
            </ModernButton>
            <ModernButton
              variant="secondary"
              onClick={clearTraffic}
              size="small"
            >
              🗑️ Clear
            </ModernButton>
          </div>
        </div>

        {!proxyConfig.enabled && (
          <div className="config-section">
            <div className="config-row">
              <label>Proxy Port:</label>
              <input
                type="number"
                value={proxyConfig.port}
                onChange={(e) => setProxyConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                className="form-input"
                style={{ width: '100px' }}
              />
            </div>

            <div className="config-row">
              <label>Target Endpoints:</label>
              <div className="endpoint-list">
                {proxyConfig.targetEndpoints.map((endpoint, idx) => (
                  <div key={idx} className="endpoint-item">
                    <span>{endpoint}</span>
                    <button 
                      onClick={() => removeTargetEndpoint(endpoint)}
                      className="remove-btn"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <div className="endpoint-input">
                  <input
                    type="text"
                    value={targetEndpointInput}
                    onChange={(e) => setTargetEndpointInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTargetEndpoint()}
                    placeholder="http://localhost:3000"
                    className="form-input"
                  />
                  <button onClick={addTargetEndpoint} className="add-btn">+</button>
                </div>
              </div>
            </div>

            <div className="config-row">
              <label>
                <input
                  type="checkbox"
                  checked={proxyConfig.interceptEnabled}
                  onChange={(e) => setProxyConfig(prev => ({ ...prev, interceptEnabled: e.target.checked }))}
                />
                Enable Traffic Interception
              </label>
            </div>

            <div className="config-row">
              <label>
                <input
                  type="checkbox"
                  checked={proxyConfig.autoRespond}
                  onChange={(e) => setProxyConfig(prev => ({ ...prev, autoRespond: e.target.checked }))}
                />
                Auto-forward Requests
              </label>
            </div>
          </div>
        )}

        {proxyConfig.enabled && (
          <div className="proxy-status">
            <div className="status-indicator">
              <span className="status-dot active"></span>
              <span>Proxy running on port {proxyConfig.port}</span>
            </div>
            <div className="status-info">
              Configure your application to use proxy: <code>http://localhost:{proxyConfig.port}</code>
            </div>
          </div>
        )}
      </div>

      {/* Traffic List and Details */}
      <div className="monitoring-content">
        <div className="traffic-list">
          <div className="traffic-header">
            <h4>Captured Traffic ({traffic.length})</h4>
          </div>
          <div className="traffic-items">
            {traffic.map((item, idx) => (
              <div
                key={item.request.id}
                className={`traffic-item ${selectedTraffic?.request.id === item.request.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedTraffic(item);
                  setEditingResponse(false);
                  setModifiedResponse(item.response || {});
                }}
              >
                <div className="traffic-item-header">
                  <span
                    className="method-badge"
                    style={{ backgroundColor: getMethodColor(item.request.method) }}
                  >
                    {item.request.method}
                  </span>
                  {item.response && (
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(item.response.statusCode) }}
                    >
                      {item.response.statusCode}
                    </span>
                  )}
                  <span className="time-badge">
                    {new Date(item.request.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="traffic-item-url">{item.request.url}</div>
                {item.response && (
                  <div className="traffic-item-meta">
                    {item.response.responseTime}ms • {(item.response.size / 1024).toFixed(2)}KB
                  </div>
                )}
              </div>
            ))}
            {traffic.length === 0 && (
              <div className="empty-state">
                <p>No traffic captured yet</p>
                <p className="hint">Start the proxy and configure your app to use it</p>
              </div>
            )}
          </div>
        </div>

        <div className="traffic-details">
          {selectedTraffic ? (
            <>
              <div className="details-header">
                <h4>Request Details</h4>
                {!selectedTraffic.response && !proxyConfig.autoRespond && (
                  <ModernButton
                    variant="primary"
                    onClick={() => setEditingResponse(true)}
                    size="small"
                  >
                    ✏️ Modify Response
                  </ModernButton>
                )}
              </div>

              <div className="details-content">
                <div className="detail-section">
                  <h5>Request</h5>
                  <div className="detail-item">
                    <strong>Method:</strong> {selectedTraffic.request.method}
                  </div>
                  <div className="detail-item">
                    <strong>URL:</strong> {selectedTraffic.request.url}
                  </div>
                  <div className="detail-item">
                    <strong>Time:</strong> {new Date(selectedTraffic.request.timestamp).toLocaleString()}
                  </div>
                  {selectedTraffic.request.clientAddress && (
                    <div className="detail-item">
                      <strong>Client:</strong> {selectedTraffic.request.clientAddress}
                    </div>
                  )}

                  <h6>Headers</h6>
                  <div className="headers-table">
                    {Object.entries(selectedTraffic.request.headers).map(([key, value]) => (
                      <div key={key} className="header-row">
                        <div className="header-key">{key}</div>
                        <div className="header-value">{value}</div>
                      </div>
                    ))}
                  </div>

                  {selectedTraffic.request.body && (
                    <>
                      <h6>Body</h6>
                      <pre className="code-block">
                        {formatJson(selectedTraffic.request.body)}
                      </pre>
                    </>
                  )}
                </div>

                {selectedTraffic.response && (
                  <div className="detail-section">
                    <h5>Response</h5>
                    <div className="detail-item">
                      <strong>Status:</strong>{' '}
                      <span style={{ color: getStatusColor(selectedTraffic.response.statusCode) }}>
                        {selectedTraffic.response.statusCode} {selectedTraffic.response.statusText}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Time:</strong> {selectedTraffic.response.responseTime}ms
                    </div>
                    <div className="detail-item">
                      <strong>Size:</strong> {(selectedTraffic.response.size / 1024).toFixed(2)}KB
                    </div>

                    <h6>Headers</h6>
                    <div className="headers-table">
                      {Object.entries(selectedTraffic.response.headers).map(([key, value]) => (
                        <div key={key} className="header-row">
                          <div className="header-key">{key}</div>
                          <div className="header-value">{value}</div>
                        </div>
                      ))}
                    </div>

                    {selectedTraffic.response.body && (
                      <>
                        <h6>Body</h6>
                        <pre className="code-block">
                          {formatJson(selectedTraffic.response.body)}
                        </pre>
                      </>
                    )}
                  </div>
                )}

                {editingResponse && (
                  <div className="detail-section editing-section">
                    <h5>Modify Response</h5>
                    <div className="form-group">
                      <label>Status Code:</label>
                      <input
                        type="number"
                        value={modifiedResponse.statusCode || 200}
                        onChange={(e) => setModifiedResponse(prev => ({ ...prev, statusCode: parseInt(e.target.value) }))}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Status Text:</label>
                      <input
                        type="text"
                        value={modifiedResponse.statusText || 'OK'}
                        onChange={(e) => setModifiedResponse(prev => ({ ...prev, statusText: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Body:</label>
                      <textarea
                        value={modifiedResponse.body || ''}
                        onChange={(e) => setModifiedResponse(prev => ({ ...prev, body: e.target.value }))}
                        className="form-textarea"
                        rows={10}
                      />
                    </div>
                    <div className="button-group">
                      <ModernButton variant="primary" onClick={respondWithModified}>
                        Send Response
                      </ModernButton>
                      <ModernButton variant="secondary" onClick={() => setEditingResponse(false)}>
                        Cancel
                      </ModernButton>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Select a request to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
