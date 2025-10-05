# Debugging Guide for Palis

## Overview
Palis provides comprehensive debugging capabilities for both Unit Tests (API tests) and UI Tests (Playwright tests). This guide will help you understand how to use the debugging features effectively.

## Table of Contents
1. [Accessing Test Editors](#accessing-test-editors)
2. [Debugging Unit Tests](#debugging-unit-tests)
3. [Debugging UI Tests](#debugging-ui-tests)
4. [Using the Monaco Editor](#using-the-monaco-editor)
5. [Playwright Automation](#playwright-automation)
6. [Understanding Test Results](#understanding-test-results)

---

## Accessing Test Editors

### Opening Test Editors

Test editors are now integrated as **panels** (not modal dialogs) for a better workflow experience.

**To open test editors:**

1. **Via Ribbon Buttons** (Home Tab > Test Group):
   - Click **🧪 Unit Tests** button to open the Unit Test Editor panel
   - Click **🖥️ UI Tests** button to open the UI Test Editor panel

2. **Via Debug Dropdown** (Home Tab > Test Group):
   - Click the **🐞 Debug** dropdown arrow
   - Select:
     - **Debug Selected** - Debug the currently selected request
     - **Debug Unit Tests** - Open Unit Test Editor in the panel
     - **Debug UI Tests** - Open UI Test Editor in the panel

### Panel vs Modal
- **Previous behavior:** Test editors opened in modal dialogs
- **New behavior:** Test editors open in panels integrated into the main layout
- **Benefits:**
  - No overlay blocking other UI elements
  - Can remain open while working with other features
  - Better screen real estate usage
  - Close button (✕) in the top-right corner

---

## Debugging Unit Tests

Unit tests are API tests that verify HTTP responses, status codes, headers, and body content.

### Creating Unit Tests

1. **Select a request** from the Collections panel
2. Click **🧪 Unit Tests** button
3. The Unit Test Editor panel opens showing:
   - Test case list on the left
   - Monaco code editor on the right
   - Example assertions already loaded

### Writing Unit Tests

The Monaco editor provides a full-featured JavaScript/TypeScript environment:

```javascript
// Example Unit Test
describe('API Test: Get Users', () => {
  it('should return 200 status code', async () => {
    const response = await sendRequest();
    
    // Assert status code
    assert.assertStatusCode(200, response.status);
    
    // Assert response time
    assert.assertResponseTime(1000, response.responseTime);
    
    // Assert body contains expected data
    assert.assertBodyContains('users', response.body);
    
    // Assert JSON path value
    assert.assertJSONPath('$.users[0].name', 'John', response.body);
  });
});
```

### Available Assertions

Palis provides built-in assertion functions:

| Assertion | Description | Example |
|-----------|-------------|---------|
| `assertStatusCode(expected, actual)` | Verify HTTP status code | `assert.assertStatusCode(200, response.status)` |
| `assertResponseTime(maxTime, actual)` | Verify response time is within limit | `assert.assertResponseTime(1000, response.responseTime)` |
| `assertBodyContains(text, body)` | Verify response body contains text | `assert.assertBodyContains('success', response.body)` |
| `assertJSONPath(path, expected, body)` | Verify JSON path value | `assert.assertJSONPath('$.data.id', 123, response.body)` |
| `assertHeaderExists(header, headers)` | Verify header exists | `assert.assertHeaderExists('Content-Type', response.headers)` |
| `assertHeaderValue(header, expected, headers)` | Verify header value | `assert.assertHeaderValue('Content-Type', 'application/json', response.headers)` |

### Debugging Features

#### 1. Hover for Variable Inspection
- **Hover your mouse** over any variable in the Monaco editor
- A tooltip will appear showing the variable's current value
- Example: Hover over `response` to see the full response object

#### 2. Setting Breakpoints (Planned Feature)
- Click in the left gutter margin to set breakpoints
- Code execution will pause at breakpoints
- Inspect variables at that point in execution

#### 3. Running Tests
- Click **▶️ Run** button to execute all tests
- Click **🐞 Debug** > **Debug Unit Tests** to run in debug mode
- Test results appear below the editor

### Understanding Test Results

Test results show for each assertion:
- ✅ **Passed**: Green checkmark - assertion succeeded
- ❌ **Failed**: Red X - assertion failed with details
- **Execution Time**: Time taken for the test
- **Error Messages**: Detailed failure reasons

---

## Debugging UI Tests

UI tests automate browser interactions using Playwright (Chromium, Firefox, or WebKit).

### Creating UI Tests

1. Click **🖥️ UI Tests** button
2. The UI Test Editor panel opens
3. Add test cases with Playwright scripts

### Writing UI Tests

UI tests use Playwright syntax for browser automation:

```javascript
// Example UI Test
test('Login flow', async ({ page }) => {
  // Navigate to login page
  await page.goto('https://example.com/login');
  
  // Fill in login form
  await page.fill('input[name="username"]', 'testuser');
  await page.fill('input[name="password"]', 'password123');
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Assert successful login
  await expect(page.locator('.welcome-message')).toBeVisible();
  await expect(page).toHaveURL('https://example.com/dashboard');
});
```

### Playwright Assertions

Common Playwright assertions:

| Assertion | Description | Example |
|-----------|-------------|---------|
| `expect(locator).toBeVisible()` | Element is visible | `await expect(page.locator('.button')).toBeVisible()` |
| `expect(locator).toHaveText(text)` | Element has text | `await expect(page.locator('h1')).toHaveText('Welcome')` |
| `expect(page).toHaveURL(url)` | Page has URL | `await expect(page).toHaveURL('https://example.com')` |
| `expect(locator).toBeEnabled()` | Element is enabled | `await expect(page.locator('button')).toBeEnabled()` |
| `expect(locator).toHaveCount(n)` | Elements count | `await expect(page.locator('.item')).toHaveCount(5)` |

### Browser Selection

Choose the browser for your UI tests:
- **Chromium** - Default, fastest, Google Chrome engine
- **Firefox** - Mozilla Firefox engine
- **WebKit** - Safari engine

### Headless Mode

- **Headless: true** - Browser runs in background (faster, for CI/CD)
- **Headless: false** - Browser window visible (better for debugging)

### Screenshot Capture

Configure when screenshots are captured:
- **Always** - Capture screenshot for every test
- **On Failure** - Capture only when test fails (recommended)
- **Never** - No screenshots

### Running UI Tests

1. **Run Single Test**: Click ▶️ next to test case
2. **Run All Tests**: Click ▶️ Run button in toolbar
3. **Debug Mode**: Use 🐞 Debug dropdown > Debug UI Tests

### Playwright Automation Results

After running UI tests, results include:

- ✅/❌ **Pass/Fail Status**
- **Execution Time**: Duration of test
- **Screenshot**: Visual proof (if enabled)
- **Browser Logs**: Console output from browser
- **Error Details**: Stack trace for failures
- **Traces**: Playwright trace files for deep debugging

---

## Using the Monaco Editor

The Monaco Editor (same as VS Code) provides powerful code editing features.

### Features

1. **Syntax Highlighting**
   - JavaScript/TypeScript syntax coloring
   - Automatic indentation
   - Bracket matching

2. **IntelliSense**
   - Auto-completion suggestions
   - Parameter hints
   - Quick info on hover

3. **Hover for Values** (New!)
   - Hover over variables to see their values
   - Works during debugging sessions
   - Shows type information

4. **Code Formatting**
   - Auto-format JSON
   - Consistent indentation
   - Clean code structure

5. **Find & Replace**
   - `Ctrl+F` - Find
   - `Ctrl+H` - Replace
   - Regex support

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Space` | Trigger IntelliSense |
| `Ctrl+S` | Save (auto-saves) |
| `Ctrl+F` | Find |
| `Ctrl+H` | Replace |
| `Ctrl+/` | Toggle comment |
| `Alt+Up/Down` | Move line up/down |
| `Ctrl+D` | Select next occurrence |

---

## Playwright Automation

### Setting Up Playwright Tests

1. **Create Test Suite**
   - Click 🖥️ UI Tests
   - Click "+ Add Test" button
   - Enter test name and description

2. **Write Test Script**
   - Use Playwright syntax
   - Add page interactions
   - Include assertions

3. **Configure Settings**
   - Select browser (Chromium/Firefox/WebKit)
   - Set headless mode
   - Configure screenshot capture
   - Set timeout (default: 30000ms)

### Example: Full E2E Test

```javascript
test('Complete user registration', async ({ page }) => {
  // Step 1: Navigate to registration page
  await page.goto('https://example.com/register');
  
  // Step 2: Fill registration form
  await page.fill('#firstName', 'John');
  await page.fill('#lastName', 'Doe');
  await page.fill('#email', 'john.doe@example.com');
  await page.fill('#password', 'SecurePass123!');
  await page.fill('#confirmPassword', 'SecurePass123!');
  
  // Step 3: Accept terms
  await page.check('#terms');
  
  // Step 4: Submit form
  await page.click('button[type="submit"]');
  
  // Step 5: Wait for success message
  await page.waitForSelector('.success-message', { timeout: 5000 });
  
  // Step 6: Verify success
  const message = await page.textContent('.success-message');
  expect(message).toContain('Registration successful');
  
  // Step 7: Verify redirect
  await expect(page).toHaveURL('https://example.com/welcome');
});
```

### Playwright Best Practices

1. **Use Explicit Waits**
   ```javascript
   await page.waitForSelector('.element');
   await page.waitForLoadState('networkidle');
   ```

2. **Use Data-Test IDs**
   ```javascript
   await page.click('[data-testid="submit-button"]');
   ```

3. **Take Screenshots**
   ```javascript
   await page.screenshot({ path: 'screenshot.png' });
   ```

4. **Handle Dynamic Content**
   ```javascript
   await page.waitForFunction(() => {
     return document.querySelectorAll('.item').length > 0;
   });
   ```

---

## Understanding Test Results

### Unit Test Results

Results display in the Test Results panel:

```
✅ Test 1: Status Code Check (Passed)
   - Execution Time: 234ms
   - Assertions: 3 passed, 0 failed

❌ Test 2: Response Body Check (Failed)
   - Execution Time: 456ms
   - Assertions: 2 passed, 1 failed
   - Error: Expected 'success' but got 'error'
```

### UI Test Results

Results include rich debugging information:

```
✅ Test: Login Flow (Passed)
   - Browser: Chromium (headless)
   - Execution Time: 3.2s
   - Screenshot: Available
   - Console Logs: 5 messages
   
❌ Test: Checkout Process (Failed)
   - Browser: Chromium (headless)
   - Execution Time: 5.8s
   - Screenshot: captured
   - Error: Element not found: button[id="checkout"]
   - Stack Trace: [View Details]
```

### Analyzing Failures

When a test fails:

1. **Check Error Message** - Tells you what went wrong
2. **View Screenshot** - Visual proof of failure state
3. **Read Browser Logs** - Console errors or warnings
4. **Inspect Stack Trace** - Exact line where failure occurred
5. **Review Execution Time** - Identify performance issues

### Pass/Fail Statistics

The dashboard shows aggregate results:
- **Total Tests**: All tests executed
- **Passed**: Successful tests (green)
- **Failed**: Failed tests (red)
- **Skipped**: Tests not executed
- **Pass Rate**: Percentage of successful tests

---

## Tips and Tricks

### 1. Debugging Tips

- **Start Simple**: Write basic tests first, add complexity gradually
- **Use Console Logs**: Add `console.log()` statements for debugging
- **Test Incrementally**: Run tests after each change
- **Use Descriptive Names**: Name tests clearly for easy identification

### 2. Performance Tips

- **Reduce Timeouts**: Don't wait longer than necessary
- **Use Headless Mode**: Faster execution for CI/CD
- **Parallel Execution**: Run multiple tests simultaneously (coming soon)
- **Mock External Services**: Reduce dependencies and flakiness

### 3. Maintenance Tips

- **Keep Tests Updated**: Update when UI changes
- **Remove Flaky Tests**: Fix or remove unreliable tests
- **Use Page Objects**: Organize UI test code better
- **Version Control**: Track test changes in Git

---

## Troubleshooting

### Common Issues

**Issue: Monaco editor not showing hover values**
- **Solution**: Ensure you're hovering over a variable, not a string or keyword
- **Workaround**: Use `console.log()` to inspect values

**Issue: Playwright test fails with timeout**
- **Solution**: Increase timeout in test configuration
- **Solution**: Check if element selector is correct
- **Solution**: Add explicit waits with `waitForSelector()`

**Issue: Test passes locally but fails in CI**
- **Solution**: Use headless mode consistently
- **Solution**: Add network idle wait: `page.waitForLoadState('networkidle')`
- **Solution**: Increase timeouts for slower CI environments

**Issue: Cannot close test editor panel**
- **Solution**: Click the ✕ button in the top-right corner
- **Alternative**: Click another ribbon button to switch views

---

## Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+U` | Open Unit Tests panel |
| `Ctrl+Shift+I` | Open UI Tests panel |
| `F5` | Run current test |
| `Shift+F5` | Debug current test |
| `Ctrl+K Ctrl+D` | Close test panel |

---

## Additional Resources

- **Playwright Documentation**: https://playwright.dev/
- **Chai Assertions**: https://www.chaijs.com/api/assert/
- **JSONPath Syntax**: https://goessner.net/articles/JsonPath/
- **Monaco Editor**: https://microsoft.github.io/monaco-editor/

---

## Support

If you encounter issues or have questions:
1. Check this documentation first
2. Review example tests in the application
3. Report issues on GitHub: https://github.com/dotnetappdev/verifyapi

---

**Last Updated**: December 2024  
**Version**: 1.0
