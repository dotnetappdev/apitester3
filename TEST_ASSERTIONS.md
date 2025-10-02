# 🧪 Test Assertions Guide - VerifyApi

## Table of Contents
- [Overview](#overview)
- [Test Discovery](#test-discovery)
- [Test Types](#test-types)
- [API Test Assertions](#api-test-assertions)
- [UI Test Assertions](#ui-test-assertions)
- [Test Execution](#test-execution)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Overview

VerifyApi provides a comprehensive testing framework similar to Visual Studio Test Explorer. Tests can be discovered, organized, and executed with detailed assertion capabilities.

### Key Features
- **Test Discovery**: Automatically discover tests before running
- **Multiple Test Types**: Support for API tests, UI tests, and unit tests
- **Rich Assertions**: Comprehensive assertion framework for validation
- **Visual Studio-style UI**: Familiar test explorer interface
- **Real-time Results**: Live test execution feedback

## Test Discovery

### Discovering Tests

Tests must be **discovered** before they can be run. This process scans your test suites and identifies all available tests.

#### How to Discover Tests:

1. **Manual Discovery**:
   - Click the "Discover All Tests" button in the Test Explorer
   - Tests will be scanned and cataloged

2. **Auto Discovery**:
   - Tests are automatically discovered when you create or modify a test suite
   - Changes to test scripts trigger re-discovery

3. **Discovery Status Indicators**:
   - 🔍 **Not Discovered** - Test has not been scanned yet
   - ✅ **Discovered** - Test is ready to run
   - ▶️ **Running** - Test is currently executing
   - ✔️ **Passed** - Test completed successfully
   - ❌ **Failed** - Test failed with errors
   - ⚠️ **Skipped** - Test was skipped

### Discovery Process

```
1. Parse test suite structure
2. Validate test scripts
3. Extract test metadata (name, description, tags)
4. Register tests in the explorer
5. Display in organized hierarchy
```

## Test Types

### 1. Request Tests (API Tests)

Tests associated with specific HTTP requests. These validate API responses.

**Location**: Linked to individual requests in collections

**Use Cases**:
- Validate API response status codes
- Check response body structure
- Verify response headers
- Test authentication flows
- Validate data integrity

### 2. UI Tests

Browser-based tests using Playwright for UI automation and testing.

**Location**: Independent test suites in the Test Explorer

**Use Cases**:
- Test web application workflows
- Validate UI elements and interactions
- Test form submissions
- Check navigation flows
- Verify visual elements

### 3. Unit Tests (Coming Soon)

Standalone unit tests for testing individual functions and components.

## API Test Assertions

### Available Assertions

#### 1. assertEquals(expected, actual, message?)

Checks if two values are equal with deep comparison.

```javascript
// Example
assert.assertEquals(200, response.status, 'Status should be 200');
assert.assertEquals({ id: 1, name: 'Test' }, response.data);
```

**Parameters**:
- `expected`: The expected value
- `actual`: The actual value to compare
- `message` (optional): Custom error message

---

#### 2. assertNotEquals(expected, actual, message?)

Checks if two values are NOT equal.

```javascript
// Example
assert.assertNotEquals(null, response.data, 'Data should not be null');
assert.assertNotEquals(500, response.status, 'Should not be server error');
```

---

#### 3. assertContains(container, item, message?)

Checks if a container (string, array, or object) contains an item.

```javascript
// String contains
assert.assertContains('Hello World', 'World');

// Array contains
assert.assertContains([1, 2, 3], 2);

// Object contains property
assert.assertContains(response.data, { status: 'active' });
```

---

#### 4. assertNotContains(container, item, message?)

Checks if a container does NOT contain an item.

```javascript
// Example
assert.assertNotContains(response.body, 'error');
assert.assertNotContains(response.data.users, { role: 'banned' });
```

---

#### 5. assertStatusCode(expectedCode, response, message?)

Validates HTTP status code.

```javascript
// Example
assert.assertStatusCode(200, response);
assert.assertStatusCode(201, response, 'Should return Created status');
```

---

#### 6. assertResponseTime(maxTime, actualTime, message?)

Checks if response time is within acceptable limit.

```javascript
// Example
assert.assertResponseTime(1000, response.time, 'Response should be under 1s');
```

---

#### 7. assertJsonPath(path, expectedValue, json, message?)

Validates value at a specific JSON path.

```javascript
// Example
assert.assertJsonPath('$.user.name', 'John', response.data);
assert.assertJsonPath('$.items[0].id', 1, response.data);
```

---

#### 8. assertSchema(schema, data, message?)

Validates data against a JSON schema.

```javascript
// Example
const schema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' }
  },
  required: ['id', 'name']
};

assert.assertSchema(schema, response.data);
```

---

#### 9. assertArrayLength(expectedLength, array, message?)

Checks array length.

```javascript
// Example
assert.assertArrayLength(5, response.data.items);
assert.assertArrayLength(0, response.data.errors, 'No errors expected');
```

---

#### 10. assertObjectHasProperty(object, propertyName, message?)

Checks if object has a specific property.

```javascript
// Example
assert.assertObjectHasProperty(response.data, 'userId');
assert.assertObjectHasProperty(response.headers, 'content-type');
```

---

#### 11. assertObjectNotHasProperty(object, propertyName, message?)

Checks if object does NOT have a specific property.

```javascript
// Example
assert.assertObjectNotHasProperty(response.data, 'password');
```

---

#### 12. assertType(expectedType, value, message?)

Validates value type.

```javascript
// Example
assert.assertType('string', response.data.name);
assert.assertType('number', response.data.age);
assert.assertType('boolean', response.data.active);
```

---

#### 13. assertRegexMatch(pattern, value, message?)

Tests if value matches a regex pattern.

```javascript
// Example
assert.assertRegexMatch(/^[A-Z]{3}-\d{4}$/, response.data.code);
assert.assertRegexMatch(/@example\.com$/, response.data.email);
```

---

#### 14. assertGreaterThan(value, compareValue, message?)

Checks if value is greater than compareValue.

```javascript
// Example
assert.assertGreaterThan(response.data.count, 0);
assert.assertGreaterThan(response.data.score, 50);
```

---

#### 15. assertLessThan(value, compareValue, message?)

Checks if value is less than compareValue.

```javascript
// Example
assert.assertLessThan(response.time, 1000);
assert.assertLessThan(response.data.errorCount, 5);
```

## UI Test Assertions

UI tests use Playwright and have specific assertions for web elements.

### Available UI Assertions

#### 1. assertElementExists(selector, message?)

Checks if an element exists in the DOM.

```javascript
// Example
assert.assertElementExists('#login-button', 'Login button should exist');
assert.assertElementExists('.user-profile');
```

---

#### 2. assertElementNotExists(selector, message?)

Checks if an element does NOT exist in the DOM.

```javascript
// Example
assert.assertElementNotExists('.error-message', 'No errors should display');
```

---

#### 3. assertElementText(selector, expectedText, message?)

Validates text content of an element.

```javascript
// Example
assert.assertElementText('h1', 'Welcome', 'Heading should say Welcome');
assert.assertElementText('.username', 'JohnDoe');
```

---

#### 4. assertElementVisible(selector, message?)

Checks if element is visible to users.

```javascript
// Example
assert.assertElementVisible('#menu', 'Menu should be visible');
```

---

#### 5. assertElementHidden(selector, message?)

Checks if element is hidden.

```javascript
// Example
assert.assertElementHidden('.loading-spinner', 'Loading should be hidden');
```

---

#### 6. assertElementCount(selector, expectedCount, message?)

Validates number of elements matching selector.

```javascript
// Example
assert.assertElementCount('.list-item', 5, 'Should have 5 items');
```

---

#### 7. assertElementAttribute(selector, attributeName, expectedValue, message?)

Checks element attribute value.

```javascript
// Example
assert.assertElementAttribute('input[name="email"]', 'type', 'email');
assert.assertElementAttribute('button', 'disabled', 'true');
```

---

#### 8. assertUrlContains(expectedSubstring, message?)

Checks if current URL contains a substring.

```javascript
// Example
assert.assertUrlContains('/dashboard', 'Should be on dashboard');
assert.assertUrlContains('?success=true');
```

---

#### 9. assertUrlEquals(expectedUrl, message?)

Validates exact URL match.

```javascript
// Example
assert.assertUrlEquals('https://example.com/home');
```

---

#### 10. assertTitleContains(expectedSubstring, message?)

Checks page title.

```javascript
// Example
assert.assertTitleContains('Dashboard', 'Title should contain Dashboard');
```

## Test Execution

### Test Lifecycle

1. **Before All** (Optional): Runs once before all tests in suite
2. **Before Each** (Optional): Runs before each individual test
3. **Test Case**: The actual test execution
4. **After Each** (Optional): Runs after each individual test
5. **After All** (Optional): Runs once after all tests complete

### Writing Tests

#### API Test Example:

```javascript
// Available variables:
// - response: API response object
// - request: The request that was sent
// - assert: Assertion framework
// - console: Test console for logging

// Basic assertions
assert.assertStatusCode(200, response);
assert.assertResponseTime(1000, response.time);

// JSON validation
assert.assertJsonPath('$.status', 'success', response.data);
assert.assertArrayLength(5, response.data.items);

// Type checking
assert.assertType('string', response.data.token);

// Logging
console.log('Test completed successfully');
```

#### UI Test Example:

```javascript
// Available variables:
// - page: Playwright Page object
// - browser: Browser instance
// - context: Browser context
// - assert: UI assertion framework
// - console: Test console logging

// Navigate to page
await page.goto('https://example.com');

// Interact with elements
await page.click('#login-button');
await page.fill('input[name="username"]', 'testuser');
await page.fill('input[name="password"]', 'password123');
await page.click('button[type="submit"]');

// Wait for navigation
await page.waitForURL('**/dashboard');

// Assertions
assert.assertUrlContains('/dashboard');
assert.assertElementExists('.welcome-message');
assert.assertElementText('.welcome-message', 'Welcome, testuser');

console.log('UI test completed');
```

## Best Practices

### 1. Test Independence

Tests should be independent and not rely on other tests:

```javascript
// ✅ Good - Test is self-contained
assert.assertStatusCode(200, response);
assert.assertJsonPath('$.id', 1, response.data);

// ❌ Bad - Relies on external state
// Assumes previous test set globalUserId
assert.assertEquals(globalUserId, response.data.id);
```

### 2. Descriptive Messages

Always provide clear assertion messages:

```javascript
// ✅ Good - Clear message
assert.assertEquals(200, response.status, 
  'Login endpoint should return 200 OK');

// ❌ Bad - No context
assert.assertEquals(200, response.status);
```

### 3. Test Organization

Group related tests in suites:

```
📁 Authentication Tests
  ├── ✓ Login with valid credentials
  ├── ✓ Login with invalid credentials
  ├── ✓ Logout successfully
  └── ✓ Token refresh

📁 User Management Tests
  ├── ✓ Create user
  ├── ✓ Update user
  └── ✓ Delete user
```

### 4. Use Tags

Tag tests for easy filtering:

```javascript
// Tags: ['smoke', 'critical', 'auth']
// This test will appear in smoke test runs
```

### 5. Appropriate Timeouts

Set realistic timeouts:

```javascript
// API tests: 5-30 seconds
timeout: 10000

// UI tests: 30-60 seconds
timeout: 30000

// Integration tests: 1-5 minutes
timeout: 120000
```

### 6. Clean Test Data

Always clean up after tests:

```javascript
// After Each
// Clean up test data
await deleteTestUser(createdUserId);
```

### 7. Error Handling

Handle errors gracefully:

```javascript
try {
  await page.click('#submit');
  assert.assertUrlContains('/success');
} catch (error) {
  console.error('Test failed:', error.message);
  // Take screenshot for debugging
  throw error;
}
```

## Examples

### Complete API Test Suite Example

```javascript
// Test Suite: User API Tests

// Before Each: Setup
const baseUrl = 'https://api.example.com';
const testUser = {
  username: 'testuser',
  email: 'test@example.com'
};

// Test Case 1: Create User
assert.assertStatusCode(201, response, 'Should return Created status');
assert.assertObjectHasProperty(response.data, 'id');
assert.assertObjectHasProperty(response.data, 'username');
assert.assertEquals(testUser.username, response.data.username);

// Store created user ID for next tests
const userId = response.data.id;

// Test Case 2: Get User by ID
assert.assertStatusCode(200, response);
assert.assertEquals(userId, response.data.id);
assert.assertEquals(testUser.email, response.data.email);

// Test Case 3: Update User
assert.assertStatusCode(200, response);
assert.assertEquals('updateduser', response.data.username);

// Test Case 4: Delete User
assert.assertStatusCode(204, response);

// After Each: Cleanup
// (Automatic cleanup handled by API)
```

### Complete UI Test Suite Example

```javascript
// Test Suite: Login Flow UI Tests

// Before All: Setup browser
const testUrl = 'https://example.com';

// Test Case 1: Login Page Loads
await page.goto(testUrl + '/login');
assert.assertElementExists('form#login-form');
assert.assertElementExists('input[name="username"]');
assert.assertElementExists('input[name="password"]');
assert.assertElementExists('button[type="submit"]');

// Test Case 2: Login with Valid Credentials
await page.fill('input[name="username"]', 'testuser');
await page.fill('input[name="password"]', 'Test123!');
await page.click('button[type="submit"]');

await page.waitForURL('**/dashboard');
assert.assertUrlContains('/dashboard');
assert.assertElementExists('.user-profile');
assert.assertElementText('.welcome-message', 'Welcome, testuser');

// Test Case 3: Logout
await page.click('#logout-button');
await page.waitForURL('**/login');
assert.assertUrlContains('/login');
assert.assertElementNotExists('.user-profile');

// After All: Cleanup
// (Browser automatically closed)
```

## Additional Resources

- [API Testing Documentation](public/docs/unit-testing.html)
- [Playwright Documentation](https://playwright.dev)
- [JSON Path Documentation](https://goessner.net/articles/JsonPath/)
- [JSON Schema Documentation](https://json-schema.org)

## Support

For issues or questions about testing:
1. Check the in-app documentation (Help → Documentation → Unit Testing)
2. Review code examples in the UI Test Dialog templates
3. Report issues via Help → Report Problem

---

**Version**: 1.0  
**Last Updated**: 2024
