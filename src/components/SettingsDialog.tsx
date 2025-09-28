import React, { useState, useEffect } from 'react';
import { AppSettings, SettingsManager } from '../settings/SettingsManager';
import { ConfirmDialog } from './ConfirmDialog';
import { FileBrowserDialog } from './FileBrowserDialog';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settingsManager: SettingsManager;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  settingsManager
}) => {
  const [settings, setSettings] = useState<AppSettings>(settingsManager.getSettings());
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'network' | 'advanced'>('general');
  const [errors, setErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showFileBrowser, setShowFileBrowser] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(settingsManager.getSettings());
      setErrors([]);
      setHasChanges(false);
    }
  }, [isOpen, settingsManager]);

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setHasChanges(true);

    // Validate settings
    const validation = settingsManager.validateSettings({ [key]: value });
    setErrors(validation.errors);
  };

  const handleSave = () => {
    const validation = settingsManager.validateSettings(settings);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    settingsManager.updateSettings(settings);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const handleResetConfirm = () => {
    settingsManager.resetToDefaults();
    setSettings(settingsManager.getSettings());
    setHasChanges(false);
    setShowResetConfirm(false);
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  const handleCancelConfirm = () => {
    setShowCancelConfirm(false);
    onClose();
  };

  const selectDatabasePath = () => {
    setShowFileBrowser(true);
  };

  const handleDatabasePathSelect = (path: string) => {
    handleSettingChange('databasePath', path);
    setShowFileBrowser(false);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-dialog">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={handleCancel}>×</button>
        </div>

        <div className="settings-content">
          <div className="settings-tabs">
            {(['general', 'appearance', 'network', 'advanced'] as const).map(tab => (
              <button
                key={tab}
                className={`settings-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="settings-panel">
            {activeTab === 'general' && (
              <div className="settings-section">
                <h3>General Settings</h3>
                
                <div className="setting-item">
                  <label className="setting-label">Auto Save</label>
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    className="setting-checkbox"
                  />
                  <span className="setting-description">
                    Automatically save changes to requests and collections
                  </span>
                </div>

                <div className="setting-item">
                  <label className="setting-label">Enable Test Explorer</label>
                  <input
                    type="checkbox"
                    checked={settings.enableTestExplorer}
                    onChange={(e) => handleSettingChange('enableTestExplorer', e.target.checked)}
                    className="setting-checkbox"
                  />
                  <span className="setting-description">
                    Show the Test Explorer panel in the sidebar
                  </span>
                </div>

                <div className="setting-item">
                  <label className="setting-label">Database Path</label>
                  <div className="setting-input-group">
                    <input
                      type="text"
                      value={settings.databasePath}
                      onChange={(e) => handleSettingChange('databasePath', e.target.value)}
                      placeholder="Default location"
                      className="setting-input"
                    />
                    <button onClick={selectDatabasePath} className="browse-button">
                      Browse
                    </button>
                  </div>
                  <span className="setting-description">
                    Location of the SQLite database file
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="settings-section">
                <h3>Appearance</h3>
                
                <div className="setting-item">
                  <label className="setting-label">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="setting-select"
                  >
                    <option value="dark">Dark Theme</option>
                    <option value="light">Light Theme</option>
                  </select>
                  <span className="setting-description">
                    Choose between dark and light theme
                  </span>
                </div>

                <div className="setting-item">
                  <label className="setting-label">Enable Syntax Highlighting</label>
                  <input
                    type="checkbox"
                    checked={settings.enableSyntaxHighlighting}
                    onChange={(e) => handleSettingChange('enableSyntaxHighlighting', e.target.checked)}
                    className="setting-checkbox"
                  />
                  <span className="setting-description">
                    Highlight JSON and XML syntax in request/response bodies
                  </span>
                </div>

                <div className="setting-item">
                  <label className="setting-label">Sidebar Width</label>
                  <input
                    type="range"
                    min="200"
                    max="800"
                    value={settings.sidebarWidth}
                    onChange={(e) => handleSettingChange('sidebarWidth', parseInt(e.target.value))}
                    className="setting-range"
                  />
                  <span className="setting-value">{settings.sidebarWidth}px</span>
                  <span className="setting-description">
                    Width of the sidebar panel
                  </span>
                </div>

                <div className="setting-item">
                  <label className="setting-label">Splitter Position</label>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={settings.splitterPosition}
                    onChange={(e) => handleSettingChange('splitterPosition', parseInt(e.target.value))}
                    className="setting-range"
                  />
                  <span className="setting-value">{settings.splitterPosition}%</span>
                  <span className="setting-description">
                    Default position of the request/response splitter
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'network' && (
              <div className="settings-section">
                <h3>Network Settings</h3>
                
                <div className="setting-item">
                  <label className="setting-label">Request Timeout</label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={settings.requestTimeout / 1000}
                    onChange={(e) => handleSettingChange('requestTimeout', parseInt(e.target.value) * 1000)}
                    className="setting-input number"
                  />
                  <span className="setting-unit">seconds</span>
                  <span className="setting-description">
                    Maximum time to wait for a response
                  </span>
                </div>

                <div className="setting-item">
                  <label className="setting-label">Max Response Size</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.maxResponseSize / (1024 * 1024)}
                    onChange={(e) => handleSettingChange('maxResponseSize', parseInt(e.target.value) * 1024 * 1024)}
                    className="setting-input number"
                  />
                  <span className="setting-unit">MB</span>
                  <span className="setting-description">
                    Maximum size of response body to display
                  </span>
                </div>

                <div className="setting-item">
                  <label className="setting-label">Default Headers</label>
                  <div className="default-headers">
                    {Object.entries(settings.defaultHeaders).map(([key, value], index) => (
                      <div key={index} className="header-row">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const newHeaders = { ...settings.defaultHeaders };
                            delete newHeaders[key];
                            newHeaders[e.target.value] = value;
                            handleSettingChange('defaultHeaders', newHeaders);
                          }}
                          placeholder="Header name"
                          className="header-input"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => {
                            const newHeaders = { ...settings.defaultHeaders };
                            newHeaders[key] = e.target.value;
                            handleSettingChange('defaultHeaders', newHeaders);
                          }}
                          placeholder="Header value"
                          className="header-input"
                        />
                        <button
                          onClick={() => {
                            const newHeaders = { ...settings.defaultHeaders };
                            delete newHeaders[key];
                            handleSettingChange('defaultHeaders', newHeaders);
                          }}
                          className="remove-header-button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newHeaders = { ...settings.defaultHeaders, '': '' };
                        handleSettingChange('defaultHeaders', newHeaders);
                      }}
                      className="add-header-button"
                    >
                      Add Header
                    </button>
                  </div>
                  <span className="setting-description">
                    Headers automatically added to new requests
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="settings-section">
                <h3>Advanced Settings</h3>
                
                <div className="setting-item">
                  <label className="setting-label">Recent Collections</label>
                  <div className="recent-collections">
                    {settings.recentCollections.length > 0 ? (
                      <ul>
                        {settings.recentCollections.map((collection, index) => (
                          <li key={index}>{collection}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted">No recent collections</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleSettingChange('recentCollections', [])}
                    className="clear-button"
                  >
                    Clear History
                  </button>
                </div>

                <div className="setting-item">
                  <h3>Reporting</h3>
                  <label className="setting-label">Default Report Format</label>
                  <select
                    value={settings.reportFormat}
                    onChange={(e) => handleSettingChange('reportFormat', e.target.value as any)}
                    className="setting-select"
                    aria-label="Default report format"
                  >
                    <option value="html">HTML</option>
                    <option value="json">JSON</option>
                  </select>

                  <div className="setting-item">
                    <label className="setting-label">Report Per Collection</label>
                    <input
                      type="checkbox"
                      checked={!!settings.reportPerCollection}
                      onChange={(e) => handleSettingChange('reportPerCollection', e.target.checked)}
                      className="setting-checkbox"
                      aria-label="Report per collection"
                      title="Report per collection"
                    />
                  </div>

                  <div className="setting-item">
                    <label className="setting-label">Team Email</label>
                    <input
                      type="text"
                      value={settings.teamEmail || ''}
                      onChange={(e) => handleSettingChange('teamEmail', e.target.value)}
                      className="setting-input"
                      placeholder="team@yourdomain.com"
                      aria-label="Team email for reports"
                      title="Team email for reports"
                    />
                  </div>
                </div>

                <div className="setting-item">
                  <h3>Test Execution</h3>
                  <label className="setting-label">Parallel Execution</label>
                  <input
                    type="checkbox"
                    checked={!!settings.parallelExecution}
                    onChange={(e) => handleSettingChange('parallelExecution', e.target.checked)}
                    className="setting-checkbox"
                    aria-label="Enable parallel execution"
                    title="Enable parallel execution"
                  />

                  <div className="setting-item">
                    <label className="setting-label">Retry Count</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={settings.retryCount || 0}
                      onChange={(e) => handleSettingChange('retryCount', parseInt(e.target.value || '0'))}
                      className="setting-input number"
                      aria-label="Retry count for failed tests"
                      title="Retry count for failed tests"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="setting-item">
                  <label className="setting-label">Reset Settings</label>
                  <button onClick={handleReset} className="reset-button">
                    Reset to Defaults
                  </button>
                  <span className="setting-description">
                    Reset all settings to their default values
                  </span>
                </div>
                
                <div className="setting-item">
                  <h3>Email Notifications</h3>
                  <label className="setting-label">Enable Email Notifications</label>
                  <input
                    type="checkbox"
                    checked={!!settings.emailNotifications?.enabled}
                    onChange={(e) => handleSettingChange('emailNotifications', { ...settings.emailNotifications, enabled: e.target.checked })}
                    className="setting-checkbox"
                  />
                  <span className="setting-description">Send emails on test run events (fail/pass)</span>

                  {settings.emailNotifications?.enabled && (
                    <div className="email-settings-section">
                      <div className="setting-item">
                        <label className="setting-label">SendGrid API Key</label>
                        <input
                          type="password"
                          value={settings.emailNotifications?.sendGridApiKey || ''}
                          onChange={(e) => handleSettingChange('emailNotifications', { ...settings.emailNotifications, sendGridApiKey: e.target.value })}
                          className="setting-input"
                          placeholder="SG.xxxxx"
                          aria-label="SendGrid API Key"
                        />
                      </div>

                      <div className="setting-item">
                        <label className="setting-label">Default From</label>
                        <input
                          type="text"
                          value={settings.emailNotifications?.defaultFrom || ''}
                          onChange={(e) => handleSettingChange('emailNotifications', { ...settings.emailNotifications, defaultFrom: e.target.value })}
                          className="setting-input"
                          placeholder="no-reply@yourdomain.com"
                          aria-label="Default from email address"
                        />
                      </div>

                      <div className="setting-item">
                        <label className="setting-label">Default To</label>
                        <input
                          type="text"
                          value={settings.emailNotifications?.defaultTo || ''}
                          onChange={(e) => handleSettingChange('emailNotifications', { ...settings.emailNotifications, defaultTo: e.target.value })}
                          className="setting-input"
                          placeholder="team@yourdomain.com"
                          aria-label="Default to email address"
                        />
                      </div>

                      <div className="setting-item">
                        <label className="setting-label">Notify On Test Fail</label>
                        <input
                          type="checkbox"
                          checked={!!settings.emailNotifications?.notifyOnTestFail}
                          onChange={(e) => handleSettingChange('emailNotifications', { ...settings.emailNotifications, notifyOnTestFail: e.target.checked })}
                          className="setting-checkbox"
                          aria-label="Notify on test fail"
                          title="Notify on test fail"
                        />
                      </div>

                      <div className="setting-item">
                        <label className="setting-label">Notify On Test Pass</label>
                        <input
                          type="checkbox"
                          checked={!!settings.emailNotifications?.notifyOnTestPass}
                          onChange={(e) => handleSettingChange('emailNotifications', { ...settings.emailNotifications, notifyOnTestPass: e.target.checked })}
                          className="setting-checkbox"
                          aria-label="Notify on test pass"
                          title="Notify on test pass"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {errors.length > 0 && (
          <div className="settings-errors">
            {errors.map((error, index) => (
              <div key={index} className="error-message">{error}</div>
            ))}
          </div>
        )}

        <div className="settings-footer">
          <button onClick={handleCancel} className="cancel-button">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="save-button"
            disabled={errors.length > 0}
          >
            Save Changes
          </button>
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Settings"
        message="Are you sure you want to reset all settings to their default values? This action cannot be undone."
        confirmText="Reset"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showCancelConfirm}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to cancel without saving?"
        confirmText="Discard Changes"
        cancelText="Continue Editing"
        variant="danger"
        onConfirm={handleCancelConfirm}
        onCancel={() => setShowCancelConfirm(false)}
      />

      <FileBrowserDialog
        isOpen={showFileBrowser}
        title="Select Database Path"
        currentPath={settings.databasePath}
        mode="file"
        fileExtensions={['.db', '.sqlite', '.sqlite3']}
        onConfirm={handleDatabasePathSelect}
        onCancel={() => setShowFileBrowser(false)}
      />
    </div>
  );
};