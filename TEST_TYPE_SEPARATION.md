# Test Type Separation - Visual Guide

## Test Explorer with Clear Separation

```
┌─────────────────────────────────────────────────────────────────┐
│ Test Explorer                    [🔍][▶️][🐛][🔄]               │
├─────────────────────────────────────────────────────────────────┤
│ Summary: 🔍 8  ✔️ 5  ❌ 1  ○ 2  (6/8)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 🌐 Request Tests (3)  [LIVE DATA]                          │ │
│ │ API endpoint tests using live request/response data        │ │
│ ├────────────────────────────────────────────────────────────┤ │
│ │ ✔️ POST Test Login                                          │ │
│ │    ↳ ✔ Login with valid credentials                        │ │
│ │    ↳ ✔ Login with invalid credentials                      │ │
│ │ ✔️ GET Test User API                                        │ │
│ │    ↳ ✔ Get user by ID                                      │ │
│ │ ❌ PUT Update User                                          │ │
│ │    ↳ ✗ Update user profile (Expected 200, got 400)        │ │
│ └────────────────────────────────────────────────────────────┘ │
│   ^ Blue left border = Live Data                               │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 🖥️ UI Tests (2)  [MOCK DATA]                       [+]     │ │
│ │ Browser automation tests using Playwright with mock data   │ │
│ ├────────────────────────────────────────────────────────────┤ │
│ │ ✔️ Login Flow Test                                          │ │
│ │    ↳ ✔ Navigate to login page                             │ │
│ │    ↳ ✔ Fill and submit login form                         │ │
│ │    ↳ ✔ Verify redirect to dashboard                       │ │
│ │ ✔️ Homepage Test                                            │ │
│ │    ↳ ✔ Check homepage elements                            │ │
│ │    ↳ ✔ Validate navigation menu                           │ │
│ └────────────────────────────────────────────────────────────┘ │
│   ^ Purple left border = Mock Data                             │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 🧪 Unit Tests (0)  [MOCK DATA]                             │ │
│ │ Standalone unit tests for testing logic with mock data     │ │
│ ├────────────────────────────────────────────────────────────┤ │
│ │ No unit tests available                                     │ │
│ │ Unit tests are standalone tests independent of requests     │ │
│ │ Coming soon: Create tests for utilities and business logic  │ │
│ └────────────────────────────────────────────────────────────┘ │
│   ^ Green left border = Mock Data                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Visual Indicators

### Test Type Cards

Each test type now has a distinct visual appearance:

**1. Request Tests - Blue Theme**
```
┌────────────────────────────────────────┐
│ 🌐 Request Tests (3)  [LIVE DATA]     │ ← Blue badge
│ API endpoint tests using live data     │
└────────────────────────────────────────┘
    ↑ Blue left border (#4fc3f7)
```

**2. UI Tests - Purple Theme**
```
┌────────────────────────────────────────┐
│ 🖥️ UI Tests (2)  [MOCK DATA]    [+]   │ ← Purple badge
│ Browser automation with mock data      │
└────────────────────────────────────────┘
    ↑ Purple left border (#9c27b0)
```

**3. Unit Tests - Green Theme**
```
┌────────────────────────────────────────┐
│ 🧪 Unit Tests (0)  [MOCK DATA]         │ ← Purple badge
│ Standalone tests with mock data        │
└────────────────────────────────────────┘
    ↑ Green left border (#4caf50)
```

## Data Type Badges

### Live Data Badge (Blue)
```
┌─────────────┐
│ LIVE DATA   │ ← Blue background (#4fc3f7 with 20% opacity)
└─────────────┘   Blue text and border
```
- Indicates tests use actual API responses
- Tests execute against real endpoints
- Results reflect current API state

### Mock Data Badge (Purple)
```
┌─────────────┐
│ MOCK DATA   │ ← Purple background (#9c27b0 with 20% opacity)
└─────────────┘   Purple text and border
```
- Indicates tests use predefined mock data
- Assertions compare against expected mock values
- Predictable, repeatable test results

## Test Status Icons (Enhanced)

```
🔍  Not Discovered     (Gray)    - Needs validation
✅  Discovered         (Green)   - Ready to run
▶️  Running            (Blue)    - Currently executing
✔️  Passed             (Green)   - Test successful
❌  Failed             (Red)     - Test failed
⚠️  Skipped            (Yellow)  - Test skipped
```

## How Tests Use Data

### Request Tests (Live Data)
```javascript
// Test runs actual HTTP request
const response = await api.post('/login', credentials);

// Assertions use LIVE response data
assert.assertEquals(200, response.status);
assert.assertJsonPath('$.token', actualToken, response.data);
```

### UI Tests (Mock Data)
```javascript
// Test can fetch live data from request
const userData = await api.get('/user/123');

// But assertions use MOCK expected data
const expectedMockData = {
  id: 123,
  name: "John Doe",
  email: "john@example.com"
};

// Compare live data with mock expectations
assert.assertEquals(expectedMockData.name, userData.name);
```

### Unit Tests (Mock Data)
```javascript
// Completely independent, no live requests
const mockInput = { value: 42 };
const result = myUtilityFunction(mockInput);

// Assertions use mock expected output
const expectedMock = { processed: true, value: 84 };
assert.assertEquals(expectedMock, result);
```

## Benefits of Clear Separation

1. **Immediate Visual Recognition**
   - Blue = Live data from real APIs
   - Purple = Mock data for predictable tests
   - Green = Standalone mock tests

2. **Better Test Organization**
   - Request tests grouped together
   - UI tests in separate section
   - Unit tests independent

3. **Clear Test Behavior**
   - Developers know if test hits real API
   - Mock data tests are predictable
   - No confusion about test dependencies

4. **Improved Discoverability**
   - Icons and colors guide users
   - Badges explain data source
   - Descriptions clarify purpose

## Color Palette Reference

```
Request Tests (Blue):
  Border: #4fc3f7 (Light Blue)
  Badge BG: rgba(79, 195, 247, 0.2)
  Badge Text: #4fc3f7
  Icon: 🌐

UI Tests (Purple):
  Border: #9c27b0 (Purple)
  Badge BG: rgba(156, 39, 176, 0.2)
  Badge Text: #ce93d8
  Icon: 🖥️

Unit Tests (Green):
  Border: #4caf50 (Green)
  Badge BG: rgba(76, 175, 80, 0.2)
  Badge Text: #4caf50
  Icon: 🧪
```

## Future Enhancements

- Mock data editor for defining expected values
- Mock data library for reusable test data
- Visual diff viewer for comparing live vs mock
- Test coverage reporting per type
- Export/import mock data sets
