# API Tester 3 - Development Setup Guide

## Overview

API Tester 3 is a professional desktop API testing tool built with Electron, React, and TypeScript. This guide will help you set up the development environment and get the application running.

## Prerequisites

### Required Software Versions

- **Node.js**: `>=18.0.0` (Recommended: `v20.19.5` or latest LTS)
- **npm**: `>=9.0.0` (Comes with Node.js)
- **Git**: Latest version for version control

### System Requirements

- **Windows**: Windows 10/11 (64-bit)
- **macOS**: macOS 10.15+ (Intel/Apple Silicon)
- **Linux**: Ubuntu 18.04+, CentOS 7+, or equivalent

## Installation Instructions

### 1. Install Node.js

Visit [nodejs.org](https://nodejs.org/) and download the latest LTS version.

**Verify installation:**
```bash
node --version  # Should show v18.0.0 or higher
npm --version   # Should show 9.0.0 or higher
```

### 2. Clone the Repository

```bash
git clone https://github.com/dotnetappdev/apitester3.git
cd apitester3
```

### 3. Install Dependencies

```bash
npm install
```

This will install all required packages including:

#### Core Dependencies
- **React 18.2.0**: Frontend framework
- **Electron 25.0.0**: Desktop application wrapper
- **TypeScript 5.0.0**: Type-safe JavaScript
- **Vite 4.0.0**: Fast build tool and dev server

#### API & Security
- **Axios 1.4.0**: HTTP client for API requests
- **crypto-js 4.2.0**: AES-256 encryption for passwords
- **sqlite3 5.1.7**: Database for data persistence

#### UI Components
- **@monaco-editor/react 4.7.0**: Code editor with syntax highlighting
- **allotment 1.20.4**: Resizable split panes

#### Development Tools
- **ESLint**: Code linting and formatting
- **Jest**: Testing framework
- **electron-builder**: Desktop app packaging

## Running the Application

### Development Mode

Start both React frontend and Electron backend in development mode:

```bash
npm run dev
```

This runs:
- **React dev server** on `http://localhost:3000`
- **Electron app** with hot reloading enabled

### Individual Components

Run frontend only (for web testing):
```bash
npm run dev-react
```

Run Electron only (after building React):
```bash
npm run dev-electron
```

### Building for Production

Build the complete application:
```bash
npm run build
```

Package as desktop application:
```bash
npm run package
```

This creates distributable files in the `release/` directory.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development environment (React + Electron) |
| `npm run dev-react` | Start React dev server only |
| `npm run dev-electron` | Start Electron app only |
| `npm run build` | Build for production |
| `npm run build-react` | Build React frontend |
| `npm run build-electron` | Build Electron backend |
| `npm run package` | Create desktop app distributables |
| `npm run test` | Run Jest tests |
| `npm run lint` | Run ESLint code formatting |

## SQLite Database Setup

### Database Architecture

The application uses SQLite for local data storage with the following schema:

#### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,  -- AES-256 encrypted
  salt TEXT NOT NULL,          -- Cryptographic salt
  role TEXT CHECK(role IN ('admin', 'standard')) DEFAULT 'standard',
  profilePicture TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  lastLogin DATETIME
);
```

#### Collections Table
```sql
CREATE TABLE collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  ownerId INTEGER NOT NULL,
  isShared BOOLEAN DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerId) REFERENCES users (id)
);
```

#### Requests Table
```sql
CREATE TABLE requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collectionId INTEGER NOT NULL,
  name TEXT NOT NULL,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
  headers TEXT,  -- JSON string
  body TEXT,
  params TEXT,   -- JSON string
  auth TEXT,     -- JSON string
  tests TEXT,    -- JSON string for test scripts
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collectionId) REFERENCES collections (id)
);
```

#### Test Results Table
```sql
CREATE TABLE test_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requestId INTEGER NOT NULL,
  status TEXT CHECK(status IN ('pass', 'fail')) NOT NULL,
  responseTime INTEGER NOT NULL,
  statusCode INTEGER,
  message TEXT,
  runAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requestId) REFERENCES requests (id)
);
```

### Creating New Tables

To add new tables to the SQLite database:

1. **Define the schema** in `src/database/DatabaseManager.ts`:

```typescript
export interface NewTable {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}
```

2. **Add creation method**:

```typescript
async createNewTable(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS new_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  // Execute SQL (implementation depends on database connection)
}
```

3. **Add CRUD operations**:

```typescript
async insertNewRecord(data: Omit<NewTable, 'id' | 'createdAt'>): Promise<number> {
  // Insert implementation
}

async getNewRecords(): Promise<NewTable[]> {
  // Select implementation  
}

async updateNewRecord(id: number, data: Partial<NewTable>): Promise<void> {
  // Update implementation
}

async deleteNewRecord(id: number): Promise<void> {
  // Delete implementation
}
```

### Seed Data Management

The application comes with pre-configured seed data for testing:

#### Default Test Accounts

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `admin` | `admin123` | admin | System administrator |
| `testuser` | `password123` | standard | Basic user account |
| `developer` | `dev2024!` | standard | Developer account |
| `qa_lead` | `quality123` | admin | QA team lead |
| `api_tester` | `testing456` | standard | API testing specialist |

#### Adding New Seed Data

1. **Modify `src/database/DatabaseManager.ts`**:

```typescript
private initializeSeedData(): void {
  const currentDate = new Date().toISOString();
  
  this.seedUsers = [
    // Existing users...
    {
      id: 6,
      username: 'newuser',
      passwordHash: this.encryptPassword('newpassword'),
      salt: this.generateSalt(),
      role: 'standard',
      createdAt: currentDate
    }
  ];
}
```

2. **Add seed collections**:

```typescript
private initializeSeedCollections(): void {
  this.seedCollections = [
    {
      id: 1,
      name: 'Sample API Collection',
      description: 'Example API requests for testing',
      ownerId: 1, // admin user
      isShared: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}
```

3. **Update README.md** with new account information.

## Visual Studio-Style Test Runner

The application includes a comprehensive test automation framework similar to Visual Studio's test runner, providing powerful assertion capabilities and JSON response validation.

### Test Runner Features

#### **Visual Studio-Style Assertions**
```javascript
// Assert HTTP status codes
assert.assertStatusCode(200, response.status, 'Should return OK status');

// Assert response time performance
assert.assertResponseTime(1000, response.responseTime, 'Should respond within 1 second');

// Assert JSON path values
assert.assertJsonPath(response.data, 'status', 'success', 'Status should be success');
assert.assertJsonPath(response.data, 'data.users[0].id', 1, 'First user ID should be 1');

// Assert content contains expected values
assert.assertContains(response.data, { status: 'success' }, 'Response should contain success status');

// Assert equality with deep comparison
assert.assertEquals(expectedResponse, response.data, 'Response should match expected structure');
```

#### **Test Script Context**
Every test script has access to:
- **`response`**: Complete API response with status, data, headers, timing
- **`request`**: Original request configuration  
- **`assert`**: Assertion framework with Visual Studio-style methods
- **`console`**: Logging for test debugging

#### **Test Case Management**
- **Multiple test cases** per API request
- **Enable/disable** individual tests
- **Timeout configuration** for each test
- **Test descriptions** and metadata
- **Test execution history** with detailed results

#### **Advanced JSON Comparison**
```javascript
// Compare complex JSON structures
const expectedUser = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  profile: {
    role: "admin",
    permissions: ["read", "write"]
  }
};

assert.assertEquals(expectedUser, response.data.user, 'User object should match expected structure');

// Validate array contents
assert.assertJsonPath(response.data, 'users.length', 3, 'Should have 3 users');
assert.assertJsonPath(response.data, 'users[0].name', 'John Doe', 'First user should be John Doe');
```

#### **Test Results & Reporting**
- **Pass/Fail indicators** (✓ green / ✗ red / ○ pending)
- **Execution time tracking** for performance validation
- **Detailed assertion results** with expected vs actual values
- **Error messages** with stack traces for debugging
- **Test history** with timestamp and performance metrics

### Creating Test Scripts

#### **1. Access Test Editor**
1. Create or select an API request
2. Click the **"Tests"** tab in the request panel
3. Use the integrated test script editor with syntax highlighting

#### **2. Write Test Cases**
```javascript
// Example comprehensive test script
// Test response status
assert.assertStatusCode(200, response.status, 'API should return successful response');

// Test performance
assert.assertResponseTime(2000, response.responseTime, 'Response should be fast');

// Test JSON structure
assert.assertJsonPath(response.data, 'success', true, 'Response should indicate success');
assert.assertJsonPath(response.data, 'data.id', 123, 'Resource ID should match');

// Test data validation
if (response.data.users && Array.isArray(response.data.users)) {
  assert.assertEquals(true, response.data.users.length > 0, 'Should return user list');
  
  const firstUser = response.data.users[0];
  assert.assertContains(firstUser, { id: 1 }, 'First user should have valid ID');
}

// Custom validation logic
if (response.status === 200) {
  assert.assertContains(response.headers, { 'content-type': 'application/json' }, 
    'Content type should be JSON for successful responses');
}

console.log('All tests passed successfully!');
```

#### **3. Run Tests**
- **Individual test execution**: Click ▶ button next to specific test
- **Run all tests**: Use ⚡ button in Test Explorer
- **Batch testing**: Execute multiple API requests with their test suites

### Test Explorer Integration

The Test Explorer in the sidebar provides Visual Studio-style test management:

#### **Test Organization**
- **Hierarchical view** of requests and their test cases
- **Expandable tree structure** showing test case details
- **Test status indicators** with color coding
- **Test counts and statistics** (passed/failed/total)

#### **Test Execution Controls**
- **Run All Tests** (⚡): Execute all test suites across all requests
- **Run Individual Tests** (▶): Execute specific test cases
- **Test Progress Indicators**: Real-time execution status
- **Results Summary**: Pass/fail statistics with ratios

#### **Test Results Display**
```
Test Explorer
⚡ 🔄
✓5 ✗1 ○2 (6/8)

▼ GET User Profile Request
  ✓ Test Status Code (145ms)
  ✓ Test Response Time (145ms)  
  ✗ Test User Data (203ms)
    - Expected: "admin" but got: "user"
  ○ Test Permissions (not run)
```

### Production Test Integration

#### **Automated Testing Pipeline**
```javascript
// src/testing/TestRunner.ts - Production integration
const testSuite = {
  id: 'user-api-tests',
  name: 'User API Test Suite',
  requestId: 123,
  testCases: [
    {
      id: 'test-login',
      name: 'User Login Test',
      script: `
        assert.assertStatusCode(200, response.status);
        assert.assertJsonPath(response.data, 'token', expect.any(String));
        assert.assertResponseTime(1000, response.responseTime);
      `,
      enabled: true,
      timeout: 5000
    }
  ]
};

// Execute test suite
const results = await TestRunner.getInstance().executeTestSuite(
  testSuite, 
  apiResponse, 
  requestConfig
);
```

#### **CI/CD Integration Ready**
- **Structured test results** for automated reporting
- **JSON output format** for integration with build systems
- **Exit codes** based on test pass/fail status
- **Detailed logging** for debugging failed tests

### Database Schema for Tests

```sql
-- Test Results table for persistence
CREATE TABLE test_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requestId INTEGER NOT NULL,
  testCaseId TEXT NOT NULL,
  status TEXT CHECK(status IN ('pass', 'fail', 'error')) NOT NULL,
  executionTime INTEGER NOT NULL,
  message TEXT,
  assertions TEXT, -- JSON string of assertion results
  runAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requestId) REFERENCES requests (id)
);

-- Test Suites table for test configuration
CREATE TABLE test_suites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requestId INTEGER NOT NULL,
  name TEXT NOT NULL,
  testCases TEXT NOT NULL, -- JSON string of test cases
  beforeEach TEXT, -- Setup script
  afterEach TEXT,  -- Cleanup script
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requestId) REFERENCES requests (id)
);
```

## Security Configuration

### Password Encryption

The application uses AES-256 encryption for password storage:

```typescript
// Located in src/database/DatabaseManager.ts
private static readonly ENCRYPTION_KEY = 'APITester3-SecureKey-256bit-ForPasswordEncryption-Change-In-Production';

private encryptPassword(password: string): string {
  return CryptoJS.AES.encrypt(password, DatabaseManager.ENCRYPTION_KEY).toString();
}
```

**⚠️ Production Warning**: Change the encryption key before production deployment!

### Environment Variables

For production deployment, create a `.env` file:

```env
# Database Configuration
DB_PATH=/path/to/production/database.db
DB_ENCRYPTION_KEY=your-secure-256-bit-key

# Application Settings
NODE_ENV=production
LOG_LEVEL=info

# Security Settings
SESSION_TIMEOUT=3600000  # 1 hour in milliseconds
MAX_LOGIN_ATTEMPTS=5
```

## Troubleshooting

### Common Issues

#### 1. Node.js Version Issues
```bash
# Check version
node --version

# Use Node Version Manager (nvm) to switch versions
nvm install 20
nvm use 20
```

#### 2. Permission Issues (Windows)
```bash
# Run as administrator or use:
npm install --global --production windows-build-tools
```

#### 3. Electron Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. SQLite Issues
```bash
# Rebuild SQLite native module
npm rebuild sqlite3
```

### Development Tools

#### Debugging Electron
```bash
# Enable Chrome DevTools
npm run dev
# Then: View > Toggle Developer Tools
```

#### Database Inspection
- Use [DB Browser for SQLite](https://sqlitebrowser.org/) to inspect the database
- Located at: `%APPDATA%/apitester3/database.db` (Windows)
- Located at: `~/Library/Application Support/apitester3/database.db` (macOS)

## Project Structure

```
apitester3/
├── electron/                 # Electron main process
│   ├── main.ts              # Application entry point
│   ├── preload.ts           # Secure IPC bridge
│   └── utils.ts             # Electron utilities
├── src/                     # React frontend
│   ├── components/          # UI components
│   │   ├── EnhancedApp.tsx         # Main application
│   │   ├── LoginDialog.tsx         # Authentication
│   │   ├── EnhancedSidebar.tsx     # Collections/Tests
│   │   ├── EnhancedRequestPanel.tsx # Request editor
│   │   ├── ResponsePanel.tsx        # Response viewer
│   │   └── SettingsDialog.tsx       # Settings
│   ├── database/            # Data layer
│   │   └── DatabaseManager.ts      # Database operations
│   ├── auth/                # Authentication
│   │   └── AuthManager.ts          # User management
│   ├── settings/            # Configuration
│   │   └── SettingsManager.ts      # Settings persistence
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Utilities
│   └── styles/              # CSS styling
├── dist/                    # Build output
├── release/                 # Packaged applications
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
└── README.md                # Project documentation
```

## Next Steps

1. **Start Development**: Run `npm run dev` to begin development
2. **Create Test Data**: Use the provided seed accounts or add your own
3. **Customize Settings**: Modify database path and encryption keys
4. **Add Features**: Extend the DatabaseManager for new functionality
5. **Build Release**: Use `npm run package` to create distributable

## Support

For issues and questions:
- Check this setup guide first
- Review the main README.md for feature documentation
- Create an issue in the GitHub repository
- Check the troubleshooting section above

---

**Happy API Testing!** 🚀