# Test Code Tab - Visual Mockup

## Main Interface with Test Code Tab

### Tabbed Layout View
```
┌────────────────────────────────────────────────────────────────────────────┐
│ VerifyApi                                                        ─  □  ✕   │
├────────────────────────────────────────────────────────────────────────────┤
│ File  Edit  View  Layout  Help                                             │
├────────────────────────────────────────────────────────────────────────────┤
│ ┏━━━━━━━━━━━━━┓ ┏━━━━━━━━┓ ┏━━━━━━━━┓             ┏━━━━━━━━┓           │
│ ┃📁 Collections┃ ┃🧪 Tests┃ ┃📑 Tabs ┃             ┃❓ Help┃           │
│ ┗━━━━━━━━━━━━━┛ ┗━━━━━━━━┛ ┗━━━━━━━━┛             ┗━━━━━━━━┛           │
├───────────────┬────────────────────────────────────────────────────────────┤
│ Collections   │ ┌─────────────────────────────────────────────────────────┐│
│               │ │ [📝 Request Editor] [📄 Response] [🧪 Test Code (3)] ◄─┤│
│  ▼ rest       │ └─────────────────────────────────────────────────────────┘│
│    → Test Lo  │                                                             │
│               │ Test Scripts for Test Login                                │
│               │                                                             │
│               │ ┌───────────────┬───────────────────────────────────────┐  │
│               │ │ Test Cases (3)│ Test Name: [Login Success Test     ] │  │
│               │ ├───────────────┤ Description: [Verify 200 response   ] │  │
│               │ │ ✓ ☑ Success   │                                       │  │
│               │ │   Login       │ ┌─────────────────────────────────────┐│  │
│               │ │   (selected)  │ │ 1 // Test successful login         ││  │
│               │ │               │ │ 2 assert.assertStatusCode(200,     ││  │
│               │ │ ○ ☑ Invalid   │ │ 3   response.status,               ││  │
│               │ │   Password    │ │ 4   'Should return 200 OK'         ││  │
│               │ │               │ │ 5 );                               ││  │
│               │ │ ○ ☑ Missing   │ │ 6                                  ││  │
│               │ │   Field ✗     │ │ 7 assert.assertResponseTime(1000,  ││  │
│               │ └───────────────┤ │ 8   response.responseTime,         ││  │
│               │                 │ │ 9   'Should respond quickly'       ││  │
│               │ [➕ Add Test]   │ │10 );                               ││  │
│               │                 │ │11                                  ││  │
│               │                 │ │12 // Verify token in response      ││  │
│               │                 │ │13 assert.assertJsonPath(           ││  │
│               │                 │ │14   response.data,                 ││  │
│               │                 │ │15   'token',                       ││  │
│               │                 │ │16   null,                          ││  │
│               │                 │ │17   'Should contain token'         ││  │
│               │                 │ │18 );                               ││  │
│               │                 │ └─────────────────────────────────────┘│  │
│               │                 │                                       │  │
│               │                 │ Quick Insert: [Status Code] [Time]   │  │
│               │                 │               [JSON Path] [Contains] │  │
│               │                 └───────────────────────────────────────┘  │
├───────────────┴────────────────────────────────────────────────────────────┤
│ Test Explorer                                          [🔍][▶][🐛][⏹][🔄] │
│ ▼ Test Explorer                                                0/3       │
│   ✓ Test Login - Success Login                                         │
│   ○ Test Login - Invalid Password                                      │
│   ○ Test Login - Missing Field                                         │
└────────────────────────────────────────────────────────────────────────────┘
```

## Feature Highlights

### 1. Test Code Tab Button
```
┌─────────────────────────────────────────────────────────────────┐
│ [📝 Request Editor] [📄 Response] [🧪 Test Code (3 tests)]     │
│                                    ↑                             │
│                                    │                             │
│                              NEW TAB ADDED                       │
│                                    │                             │
│                         Shows test count badge                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Test Cases Sidebar
```
┌──────────────────┐
│ Test Cases (3)   │  ← Header shows total count
├──────────────────┤
│ ✓ ☑ Test 1      │  ← Status icon (✓=pass, ○=not run, ✗=fail)
│   Success Login  │     Checkbox to enable/disable
│   (selected)     │     Selection indicator
│                  │
│ ○ ☑ Test 2      │
│   Invalid Pass   │
│                  │
│ ○ ☑ Test 3  ✗   │  ← Remove button (keeps min 1 test)
│   Missing Field  │
└──────────────────┘
      ↓
[➕ Add Test]        ← Button to create new test case
```

### 3. Test Editor Panel
```
┌───────────────────────────────────────────────────────────┐
│ Test Name: [Login Success Test                        ]  │
│ Description: [Verify successful login with valid creds]  │
├───────────────────────────────────────────────────────────┤
│ Monaco Code Editor (with syntax highlighting):           │
│ ┌───────────────────────────────────────────────────────┐│
│ │ 1  // Verify HTTP status                             ││
│ │ 2  assert.assertStatusCode(200, response.status,     ││
│ │ 3    'Should return 200 OK');                        ││
│ │ 4                                                     ││
│ │ 5  // Verify response time                           ││
│ │ 6  assert.assertResponseTime(1000,                   ││
│ │ 7    response.responseTime,                          ││
│ │ 8    'Should respond within 1 second');              ││
│ │ 9                                                     ││
│ │10  // Verify response structure                      ││
│ │11  assert.assertJsonPath(response.data,              ││
│ │12    'token', null, 'Should contain auth token');    ││
│ │13                                                     ││
│ │14  // Verify user data                               ││
│ │15  assert.assertContains(response.data,              ││
│ │16    { user: { email: null } },                      ││
│ │17    'Should contain user email');                   ││
│ └───────────────────────────────────────────────────────┘│
├───────────────────────────────────────────────────────────┤
│ Quick Insert:                                             │
│ [Status Code] [Response Time] [JSON Path] [Contains]     │
└───────────────────────────────────────────────────────────┘
```

### 4. Test Status Icons
```
✓  = Test Passed (green)
✗  = Test Failed (red)
⚠  = Test Error (orange)
○  = Not Run Yet (gray)
⊝  = Test Skipped (gray)
```

### 5. Empty State (No Request Selected)
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                                                              │
│                          🧪                                  │
│                                                              │
│                   No Request Selected                       │
│                                                              │
│        Select a request from the Collections panel          │
│                  to write test code                         │
│                                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Workflow Example

### Step 1: Select Request
```
Collections Panel:
  ▼ rest
    → Test Login  ← Click this
```

### Step 2: Switch to Test Code Tab
```
Tabs: [Request Editor] [Response] [Test Code] ← Click here
                                    ↑
                                Selected
```

### Step 3: Add New Test
```
Test Cases Sidebar:
  [➕ Add Test] ← Click to create new test case
```

### Step 4: Write Test Code
```
Editor:
1. Enter test name: "Login Success Test"
2. Enter description: "Verify 200 response"
3. Write assertions in Monaco editor:
   assert.assertStatusCode(200, response.status);
```

### Step 5: Run Tests
```
Test Explorer:
  [▶] ← Click Run button
       ↓
  Tests execute
       ↓
  Results display: ✓ 2 passed, ✗ 1 failed
```

## Assertion Examples

### HTTP Status Code
```javascript
assert.assertStatusCode(200, response.status, 
  'Should return 200 OK');
```

### Response Time
```javascript
assert.assertResponseTime(1000, response.responseTime,
  'Should respond within 1 second');
```

### JSON Path Validation
```javascript
assert.assertJsonPath(response.data, 'user.id', null,
  'Should contain user ID');
```

### Content Validation
```javascript
assert.assertContains(response.data, 
  { status: 'success' },
  'Response should indicate success');
```

### Equality Check
```javascript
assert.assertEquals('success', response.data.status,
  'Status should be success');
```

## Integration with Test Explorer

```
Test Explorer Panel (Bottom):
┌────────────────────────────────────────────────────────┐
│ Test Explorer              [🔍][▶][🐛][⏹][🔄]        │
│ ▼ Test Explorer                           ✓2 ✗1  0/3  │
├────────────────────────────────────────────────────────┤
│   ✓ Test Login - Success Login                        │
│       ✓ Assert status code 200          ← Individual  │
│       ✓ Assert response time < 1000ms      assertions │
│       ✓ Assert token present                          │
│                                                        │
│   ✗ Test Login - Invalid Password                     │
│       ✗ Assert status code 401          ← Failed      │
│                                                        │
│   ○ Test Login - Missing Field                        │
│       (not run yet)                                    │
└────────────────────────────────────────────────────────┘
```

## Benefits

### For Developers:
- ✅ Write tests alongside API requests
- ✅ Full IDE experience with Monaco editor
- ✅ IntelliSense and syntax highlighting
- ✅ Quick templates for common assertions
- ✅ Visual test status feedback

### For QA/Testing:
- ✅ Organize multiple test scenarios per request
- ✅ Enable/disable tests for different scenarios
- ✅ See pass/fail results immediately
- ✅ Write descriptive test names and descriptions
- ✅ Maintain test suites in version control

### For Teams:
- ✅ Share test code with requests
- ✅ Standardized assertion framework
- ✅ Clear test documentation
- ✅ Easy collaboration on test coverage
- ✅ Professional testing workflow
