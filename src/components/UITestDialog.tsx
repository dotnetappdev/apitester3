import React, { useState, useRef } from 'react';
import { UITestCase, UITestSuite, UITestRunner } from '../testing/UITestRunner';
import { MonacoEditor } from './MonacoEditor';
import '../styles/UITestDialog.css';

interface UITestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (testSuite: UITestSuite) => void;
  existingTestSuite?: UITestSuite;
  title?: string;
}

export const UITestDialog: React.FC<UITestDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  existingTestSuite,
  title = 'Create UI Test Suite'
}) => {
  const [suiteName, setSuiteName] = useState(existingTestSuite?.name || '');
  const [testCases, setTestCases] = useState<UITestCase[]>(
    existingTestSuite?.testCases || [UITestRunner.getInstance().createDefaultUITestCase('Sample Test')]
  );

  const [activeTestIndex, setActiveTestIndex] = useState(0);

  const dialogRef = useRef<HTMLDivElement>(null);

  const activeTest = testCases[activeTestIndex] || testCases[0];

  const handleSave = () => {
    if (!suiteName.trim()) {
      alert('Test suite name is required');
      return;
    }

    if (testCases.length === 0) {
      alert('At least one test case is required');
      return;
    }

    const testSuite: UITestSuite = {
      id: existingTestSuite?.id || `ui_test_suite_${Date.now()}`,
      name: suiteName.trim(),
      testCases: testCases.filter(tc => tc.name.trim() !== ''), // Filter out empty test cases
    };

    onSave(testSuite);
  };

  const handleCancel = () => {
    onClose();
  };

  const addTestCase = () => {
    const newTest = UITestRunner.getInstance().createDefaultUITestCase(`Test ${testCases.length + 1}`);
    setTestCases([...testCases, newTest]);
    setActiveTestIndex(testCases.length);
  };

  const removeTestCase = (index: number) => {
    if (testCases.length <= 1) {
      alert('At least one test case is required');
      return;
    }
    const newTestCases = testCases.filter((_, i) => i !== index);
    setTestCases(newTestCases);
    if (activeTestIndex >= newTestCases.length) {
      setActiveTestIndex(Math.max(0, newTestCases.length - 1));
    }
  };

  const updateActiveTest = (updates: Partial<UITestCase>) => {
    const updatedTestCases = [...testCases];
    updatedTestCases[activeTestIndex] = { ...activeTest, ...updates };
    setTestCases(updatedTestCases);
  };

  const loadTemplate = (templateName: string) => {
    let templateScript = '';
    
    switch (templateName) {
      case 'basic':
        templateScript = UITestRunner.getInstance().generateSampleUITestScript();
        break;
      case 'form':
        templateScript = `// Form Testing Template
await page.goto('https://example.com/form');

// Fill form fields
await page.fill('input[name="username"]', 'testuser');
await page.fill('input[name="email"]', 'test@example.com');
await page.fill('textarea[name="message"]', 'This is a test message');

// Select dropdown option
await page.selectOption('select[name="category"]', 'support');

// Check checkbox
await page.check('input[name="agree"]');

// Submit form
await page.click('button[type="submit"]');

// Wait for success message
await page.waitForSelector('.success-message');

// Assert success
assert.assertElementExists('.success-message', 'Success message should be displayed');
assert.assertElementText('.success-message', 'Form submitted successfully', 'Success message should have correct text');`;
        break;
      case 'navigation':
        templateScript = `// Navigation Testing Template
await page.goto('https://example.com');

// Test main navigation
await page.click('nav a[href="/about"]');
await page.waitForURL('**/about');
assert.assertUrlContains('/about', 'Should navigate to about page');

await page.click('nav a[href="/services"]');
await page.waitForURL('**/services');
assert.assertUrlContains('/services', 'Should navigate to services page');

await page.click('nav a[href="/contact"]');
await page.waitForURL('**/contact');
assert.assertUrlContains('/contact', 'Should navigate to contact page');

// Test breadcrumb navigation
assert.assertElementExists('.breadcrumb', 'Breadcrumb should be present');
await page.click('.breadcrumb a:first-child');
await page.waitForURL('**/');
assert.assertUrlContains('/', 'Should navigate back to home');`;
        break;
      case 'responsive':
        templateScript = `// Responsive Design Testing Template
await page.goto('https://example.com');

// Test desktop view
await page.setViewportSize({ width: 1920, height: 1080 });
assert.assertElementVisible('.desktop-menu', 'Desktop menu should be visible on large screens');

// Test tablet view
await page.setViewportSize({ width: 768, height: 1024 });
assert.assertElementVisible('.tablet-menu', 'Tablet menu should be visible on medium screens');

// Test mobile view
await page.setViewportSize({ width: 375, height: 667 });
assert.assertElementVisible('.mobile-menu-toggle', 'Mobile menu toggle should be visible on small screens');

// Test mobile menu interaction
await page.click('.mobile-menu-toggle');
assert.assertElementVisible('.mobile-menu', 'Mobile menu should appear when toggle is clicked');`;
        break;
    }
    
    updateActiveTest({ script: templateScript });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCancel()}>
      <div className="ui-test-dialog" ref={dialogRef}>
        <div className="dialog-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={handleCancel}>×</button>
        </div>
        
        <div className="dialog-content">
          <div className="dialog-left">
            <div className="form-group">
              <label htmlFor="suiteName">Test Suite Name *</label>
              <input
                id="suiteName"
                type="text"
                value={suiteName}
                onChange={(e) => setSuiteName(e.target.value)}
                placeholder="Enter test suite name"
                required
              />
            </div>

            <div className="test-cases-section">
              <div className="test-cases-header">
                <label>Test Cases ({testCases.length})</label>
                <button type="button" className="add-test-btn" onClick={addTestCase}>
                  + Add Test
                </button>
              </div>
              
              <div className="test-cases-list">
                {testCases.map((testCase, index) => (
                  <div 
                    key={testCase.id}
                    className={`test-case-tab ${index === activeTestIndex ? 'active' : ''}`}
                    onClick={() => setActiveTestIndex(index)}
                  >
                    <span className="test-case-name">{testCase.name || `Test ${index + 1}`}</span>
                    {testCases.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-test-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTestCase(index);
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {activeTest && (
              <>
                <div className="form-group">
                  <label htmlFor="testName">Test Name *</label>
                  <input
                    id="testName"
                    type="text"
                    value={activeTest.name}
                    onChange={(e) => updateActiveTest({ name: e.target.value })}
                    placeholder="Enter test name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="testDescription">Description</label>
                  <textarea
                    id="testDescription"
                    value={activeTest.description || ''}
                    onChange={(e) => updateActiveTest({ description: e.target.value })}
                    placeholder="Optional test description"
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="browser">Browser</label>
                    <select
                      id="browser"
                      value={activeTest.browser}
                      onChange={(e) => updateActiveTest({ browser: e.target.value as 'chromium' | 'firefox' | 'webkit' })}
                    >
                      <option value="chromium">Chromium</option>
                      <option value="firefox">Firefox</option>
                      <option value="webkit">WebKit (Safari)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="timeout">Timeout (ms)</label>
                    <input
                      id="timeout"
                      type="number"
                      value={activeTest.timeout}
                      onChange={(e) => updateActiveTest({ timeout: parseInt(e.target.value) || 30000 })}
                      min="1000"
                      max="300000"
                      step="1000"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="viewportWidth">Viewport Width</label>
                    <input
                      id="viewportWidth"
                      type="number"
                      value={activeTest.viewport?.width || 1280}
                      onChange={(e) => updateActiveTest({ 
                        viewport: { 
                          ...activeTest.viewport, 
                          width: parseInt(e.target.value) || 1280 
                        } 
                      })}
                      min="320"
                      max="1920"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="viewportHeight">Viewport Height</label>
                    <input
                      id="viewportHeight"
                      type="number"
                      value={activeTest.viewport?.height || 720}
                      onChange={(e) => updateActiveTest({ 
                        viewport: { 
                          ...activeTest.viewport, 
                          height: parseInt(e.target.value) || 720 
                        } 
                      })}
                      min="240"
                      max="1080"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={activeTest.headless}
                      onChange={(e) => updateActiveTest({ headless: e.target.checked })}
                    />
                    Run in headless mode
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="tags">Tags (comma-separated)</label>
                  <input
                    id="tags"
                    type="text"
                    value={activeTest.tags?.join(', ') || ''}
                    onChange={(e) => updateActiveTest({ 
                      tags: e.target.value.trim() ? e.target.value.split(',').map(t => t.trim()) : undefined 
                    })}
                    placeholder="e.g., smoke, regression, ui"
                  />
                </div>

                <div className="template-section">
                  <label>Load Template:</label>
                  <div className="template-buttons">
                    <button type="button" onClick={() => loadTemplate('basic')}>Basic</button>
                    <button type="button" onClick={() => loadTemplate('form')}>Form Testing</button>
                    <button type="button" onClick={() => loadTemplate('navigation')}>Navigation</button>
                    <button type="button" onClick={() => loadTemplate('responsive')}>Responsive</button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="dialog-right">
            {activeTest && (
              <div className="script-section">
                <label>Test Script (Playwright JavaScript)</label>
                <div className="script-editor">
                  <MonacoEditor
                    value={activeTest.script}
                    onChange={(value) => updateActiveTest({ script: value })}
                    language="javascript"
                    height="400px"
                    options={{
                      minimap: { enabled: false },
                      lineNumbers: 'on',
                      wordWrap: 'on',
                      automaticLayout: true,
                      suggestOnTriggerCharacters: true,
                      quickSuggestions: true,
                      snippetSuggestions: 'inline'
                    }}
                  />
                </div>
                <div className="script-help">
                  <p><strong>Available objects:</strong></p>
                  <ul>
                    <li><code>page</code> - Playwright Page object</li>
                    <li><code>browser</code> - Browser instance</li>
                    <li><code>context</code> - Browser context</li>
                    <li><code>assert</code> - UI assertion framework</li>
                    <li><code>console</code> - Test console logging</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn-secondary" onClick={handleCancel}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>
            {existingTestSuite ? 'Update Test Suite' : 'Create Test Suite'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UITestDialog;