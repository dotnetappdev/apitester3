# API Tester 3

A professional, local-first desktop API testing tool inspired by Postman, built with Electron, React, and TypeScript.

## Features

- **Desktop Application**: Built with Electron for cross-platform compatibility (Windows, macOS, Linux)
- **Dockable Layout**: Visual Studio-style dockable panels with drag-and-drop resizing and layout persistence
  - **Test Explorer Panel**: Dedicated dockable test runner similar to VS Code Test Explorer
  - **Collections Panel**: Organized request management with expand/collapse functionality
  - **Request/Response Panels**: Resizable split-pane interface with vertical/horizontal layouts
  - **Layout Persistence**: Save and restore custom panel arrangements and sizes
  - **Responsive Design**: Mobile/tablet optimized with collapsible panels and touch-friendly controls
- **Modern UI**: React + TypeScript frontend with Visual Studio Code inspired dark theme
- **Multiple HTTP Methods**: Support for GET, POST, PUT, DELETE, PATCH, HEAD, and OPTIONS
- **Authentication**: Bearer token, Basic auth, and API key authentication
- **Request Organization**: Collections and folders to organize your API requests
- **Response Visualization**: JSON formatting, headers inspection, and response metrics
- **Real-time Updates**: Live synchronization of data changes across all panels and views
- **Code Generation**: Generate client and server code from Swagger/OpenAPI specifications
  - **C# Support**: ASP.NET Core controllers with JWT authentication
  - **TypeScript Support**: Service classes with Axios or Fetch HTTP clients
  - **Monaco Editor**: View and edit generated code with syntax highlighting
  - **Export Options**: Download as ZIP or save to directory
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

## Email Notifications (SendGrid)

API Tester 3 can send test run notifications via SendGrid. To enable email notifications:

1. In the app open Settings → Advanced → Email Notifications and enable the feature.
2. Enter your SendGrid API key and default From/To addresses.
3. Toggle whether to notify on test pass/fail.

For automated or CI setups, you can store the SendGrid key in an environment file and pass it to the Electron main process. Create a `.env` file in the project root with:

```env
SENDGRID_API_KEY=SG.xxxxx
```

The Electron main process can read this env variable and use it when renderer passes email requests. In development you can also paste the API key into the Settings dialog. In production consider using a secure secret store and not storing plaintext API keys.


### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run package` - Package the application for distribution
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Build for Production

#### Cross-Platform Build Instructions

**All Platforms:**
```bash
# Build React app and Electron main process
npm run build

# Package for current platform
npm run package
```

**Windows:**
```bash
# Install Windows-specific dependencies (if needed)
npm install --platform=win32

# Build and package for Windows
npm run build
npm run package

# The built application will be in release/ directory
# Look for API-Tester-3-Setup.exe or similar
```

**macOS:**
```bash
# Ensure Xcode Command Line Tools are installed
xcode-select --install

# Build and package for macOS
npm run build
npm run package

# The built application will be in release/ directory
# Look for API Tester 3.dmg or API Tester 3.app
```

**Linux:**
```bash
# Install build dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install build-essential libnss3-dev libatk-bridge2.0-dev libxss1 libgconf-2-4

# Or for Red Hat/CentOS/Fedora
sudo yum groupinstall "Development Tools"
sudo yum install nss atk at-spi2-atk libXScrnSaver

# Build and package for Linux
npm run build
npm run package

# The built application will be in release/ directory
# Look for API Tester 3.AppImage or .deb/.rpm files
```

**Build for Specific Platforms (Cross-compilation):**
```bash
# Build for Windows (from any platform)
npm run build
npx electron-builder --win

# Build for macOS (requires macOS or special setup)
npm run build
npx electron-builder --mac

# Build for Linux (from any platform)
npm run build
npx electron-builder --linux
```

**Platform-Specific Notes:**
- **Windows**: No additional setup required. Builds work on Windows 10/11.
- **macOS**: Requires macOS 10.15+ (Catalina) or later. Apple Silicon (M1/M2) supported.
- **Linux**: Tested on Ubuntu 18.04+, CentOS 7+, Debian 10+, Fedora 32+.

**Package Formats by Platform:**
- Windows: `.exe` installer, `.zip` portable
- macOS: `.dmg` disk image, `.app` application bundle  
- Linux: `.AppImage` universal, `.deb` (Debian/Ubuntu), `.rpm` (Red Hat/CentOS), `.snap` (Universal Linux)

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

## Code Generation

API Tester 3 includes a powerful code generation feature that creates client and server code from Swagger/OpenAPI specifications:

### How to Use

1. **Access Code Generation**: File → Code Generation (Ctrl+G) or use the menu
2. **Select Language**: Choose between C# or TypeScript
3. **Enter Swagger JSON**: Paste the content of your swagger.json file
4. **Configure Options**: 
   - Choose authentication type (None or JWT Bearer)
   - For TypeScript: Select HTTP client (Axios or Fetch)
   - For C#: Set namespace (default: ApiClient)
5. **Generate Code**: Click "Generate Code" to create the files
6. **Review & Edit**: Use the built-in Monaco Editor to review and modify generated code
7. **Export**: Download as ZIP or save to a directory

### Supported Languages

#### C# (.NET)
- **Program.cs**: ASP.NET Core startup configuration
- **Controllers**: RESTful API controllers with dependency injection
- **JWT Authentication**: Optional Bearer token authentication setup
- **CRUD Operations**: Generated endpoints for Create, Read, Update, Delete operations

#### TypeScript
- **Interfaces**: Type-safe data models from OpenAPI schemas
- **Service Classes**: HTTP client wrappers for API endpoints
- **Axios Support**: Full-featured HTTP client with interceptors
- **Fetch Support**: Native browser fetch API implementation
- **JWT Integration**: Optional Bearer token authentication

### Features
- **Template-based Generation**: Customizable code templates stored in `/src/templates/`
- **Real-time Preview**: View generated code with syntax highlighting
- **Error Handling**: Comprehensive error handling in generated code
- **Type Safety**: Strong typing for TypeScript, proper C# types
- **Documentation**: Auto-generated JSDoc/XML documentation comments

### Example Usage

For testing, you can enter "test" in the JSON content area, which will generate sample code with basic CRUD operations.

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