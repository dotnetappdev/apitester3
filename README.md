# API Tester 3

A professional, local-first desktop API testing tool inspired by Postman, built with Electron, React, and TypeScript.

## Features

- **Desktop Application**: Built with Electron for cross-platform compatibility
- **Modern UI**: React + TypeScript frontend with Visual Studio Code inspired design
- **Two-Pane Layout**: Familiar Postman-style interface with request and response panels
- **Multiple HTTP Methods**: Support for GET, POST, PUT, DELETE, PATCH, HEAD, and OPTIONS
- **Authentication**: Bearer token, Basic auth, and API key authentication
- **Request Organization**: Collections and folders to organize your API requests
- **Response Visualization**: JSON formatting, headers inspection, and response metrics
- **Import/Export Collections**: Share collections and tests in binary format (.apit) with team members
- **User ID Remapping**: Seamlessly import collections with automatic user ownership mapping
- **Test Suites**: Advanced test runner with Visual Studio-style assertions
- **Enterprise Security**: Local-first approach with secure request handling

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Desktop**: Electron 25
- **HTTP Client**: Axios
- **Styling**: Custom CSS with Visual Studio Code color scheme
- **Build**: TypeScript compilation + Electron Builder

## Development

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/dotnetappdev/apitester3.git
cd apitester3

# Install dependencies
npm install

# Start development server
npm run dev
```

📋 **For comprehensive setup instructions including Node.js requirements, development environment configuration, and SQLite database setup, see [SETUP.md](SETUP.md)**

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run package` - Package the application for distribution
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Build for Production

```bash
# Build React app and Electron main process
npm run build

# Package for current platform
npm run package
```

## Architecture

```
src/
├── components/          # React components
│   ├── Sidebar.tsx     # Request organization sidebar
│   ├── RequestPanel.tsx # HTTP request configuration
│   ├── ResponsePanel.tsx # Response display
│   └── ImportExportDialog.tsx # Import/Export functionality
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and API client
│   └── ImportExportManager.ts # Binary format handler
├── testing/            # Test runner and assertions
└── styles/             # CSS styling

electron/
├── main.ts             # Electron main process
├── preload.ts          # Preload script for security
└── utils.ts            # Electron utilities

docs/
└── IMPORT_EXPORT.md    # Import/Export documentation
```

## Import/Export Collections

API Tester 3 includes a powerful import/export system for sharing collections and tests between team members:

### Key Features
- **Binary Format (.apit)**: Secure, encrypted binary files for portability
- **User ID Remapping**: Automatic handling of user ownership during import
- **Team Collaboration**: Easy sharing of API collections across teams
- **Test Suite Inclusion**: Exports include all associated test cases
- **Import Options**: Choose to import as your own collections or preserve original ownership

### Quick Start
1. **Export**: File → Export Collection (Ctrl+E)
2. **Import**: File → Import Collection (Ctrl+I)
3. **Share**: Send the `.apit` file to team members
4. **Import Options**: Choose user mapping strategy during import

For detailed documentation, see [docs/IMPORT_EXPORT.md](docs/IMPORT_EXPORT.md)

## Seed Data & Test Accounts

The application comes with pre-configured test accounts for demonstration and testing purposes. All passwords are encrypted using AES-256 encryption with secure key management.

### Available Test Accounts

| Username    | Password     | Role      | Description                    |
|-------------|--------------|-----------|--------------------------------|
| `admin`     | `admin123`   | Admin     | System administrator account   |
| `testuser`  | `password123`| Standard  | Basic user for testing         |
| `developer` | `dev2024!`   | Standard  | Developer account              |
| `qa_lead`   | `quality123` | Admin     | QA team lead with admin rights |
| `api_tester`| `testing456` | Standard  | API testing specialist account |

### Security Implementation

- **AES-256 Encryption**: All passwords are encrypted using industry-standard AES-256 encryption
- **Secure Key Management**: 256-bit encryption key with proper salt generation
- **Password Hashing**: Implements secure password storage best practices
- **Session Management**: Secure session handling with automatic timeout
- **Role-Based Access**: Admin and standard user roles with appropriate permissions

### SQLite Database Schema

The application uses SQLite database with the following security features:

```sql
-- Users table with encrypted passwords
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

-- Collections with ownership and sharing
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

### Production Deployment

⚠️ **Important**: For production deployment:

1. **Change the encryption key** in `DatabaseManager.ts`
2. **Use environment variables** for sensitive configuration
3. **Implement proper key rotation** mechanisms
4. **Enable database encryption** at rest
5. **Set up secure backup procedures**

## Security Features

- **Context Isolation**: Renderer process is isolated from Node.js
- **Preload Scripts**: Secure communication between main and renderer
- **No Node Integration**: Frontend runs in sandboxed environment
- **Local Storage**: All data stored locally for privacy
- **Secure HTTP**: Proper SSL/TLS certificate validation

## License

MIT