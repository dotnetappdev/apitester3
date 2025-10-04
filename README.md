# VerifyApi

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
- **Advanced Test Suite**:
  - **Test Discovery**: Professional workflow with explicit test discovery and validation
  - **Visual Test Explorer**: Visual Studio-style test runner with status indicators
  - **Multiple Test Types**: Request Tests (API), UI Tests (Browser), and Unit Tests
  - **Rich Assertions**: 25+ assertion methods for comprehensive validation
  - **Test Type Selector**: Guided dialog to choose the right test type
  - **Discovery Banner**: Clear prompts to discover and validate tests
  - **Status Indicators**: 6 different status icons (Not Discovered, Discovered, Running, Passed, Failed, Skipped)
  - **Comprehensive Documentation**: Detailed guides for all testing features
- **Enhanced Team Collaboration**:
  - **Prominent Teams Button**: Gradient-styled button for easy access to team features
  - **Team Management**: Share collections and collaborate with team members
  - **User Roles**: Admin, member, and viewer permissions
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

VerifyApi can send test run notifications via SendGrid. To enable email notifications:

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
# Look for VerifyApi.dmg or VerifyApi.app
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
# Look for VerifyApi.AppImage or .deb/.rpm files
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
- **Windows**: `.appx` package for Windows Store (MSIX format, x64 and x86/32-bit support)
- **macOS**: `.dmg` disk image, `.zip` application bundle (Universal: Intel + Apple Silicon)
- **Linux**: `.AppImage` universal, `.deb` (Debian/Ubuntu), `.rpm` (Red Hat/CentOS), `.tar.gz` archive

**Verified Working Packages:**
- ✅ Linux: AppImage, DEB, RPM, TAR.GZ (tested on Ubuntu)
- 🔧 Windows: APPX/MSIX for Windows Store (x64 + x86 architectures ready)  
- 🔧 macOS: DMG, ZIP (configuration ready)

**Quick Build Commands:**
```bash
npm run package:linux    # Linux packages
npm run package:win      # Windows packages  
npm run package:mac      # macOS packages
npm run package:all      # All platforms
```

📋 **For detailed build instructions and installer configuration, see [docs/INSTALLERS.md](docs/INSTALLERS.md) and [docs/BUILD.md](docs/BUILD.md)**

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

VerifyApi includes a powerful import/export system for sharing collections and tests between team members:

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

VerifyApi includes a powerful code generation feature that creates client and server code from Swagger/OpenAPI specifications:

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

### Verifying Seed Data

The application automatically creates seed data on first launch. To verify that all user profiles and sample collections are properly loaded:

```bash
# Run the automated seed data test
npm run test:seed
```

This will verify:
- ✅ All 5 user profiles are created
- ✅ All 3 sample collections exist
- ✅ All 14 sample requests are present

If profiles are not showing up in the login screen, see **[SEED_DATA_VERIFICATION.md](SEED_DATA_VERIFICATION.md)** for troubleshooting steps.

## Security Features

- **Context Isolation**: Renderer process is isolated from Node.js
- **Preload Scripts**: Secure communication between main and renderer
- **No Node Integration**: Frontend runs in sandboxed environment
- **Local Storage**: All data stored locally for privacy
- **Secure HTTP**: Proper SSL/TLS certificate validation

## Documentation

### Testing Documentation

VerifyApi includes comprehensive testing documentation:

- **[TEST_ASSERTIONS.md](TEST_ASSERTIONS.md)** - Complete reference guide for all test assertions
  - Test Discovery workflow
  - Test Types (Request, UI, Unit)
  - API Test Assertions (15 methods)
  - UI Test Assertions (10 methods)
  - Best practices and examples

- **[UI_CHANGES_GUIDE.md](UI_CHANGES_GUIDE.md)** - Technical documentation of recent UI improvements
  - Teams button enhancement details
  - Test discovery system architecture
  - Component specifications
  - Color schemes and styling

- **[VISUAL_MOCKUPS.md](VISUAL_MOCKUPS.md)** - Visual mockups and before/after comparisons
  - ASCII art mockups
  - UI element examples
  - Icon usage guide
  - Color palette reference

- **[TEST_DISCOVERY_FLOW.md](TEST_DISCOVERY_FLOW.md)** - Detailed workflow documentation
  - User journey diagrams
  - Component architecture
  - State flow diagrams
  - Keyboard shortcuts

- **[public/docs/unit-testing.html](public/docs/unit-testing.html)** - In-app HTML documentation
  - Interactive guides
  - Code examples
  - Assertion tables
  - Getting started tutorials

### Additional Documentation

- **[SETUP.md](SETUP.md)** - Development environment setup
- **[UI_COMPONENTS_GUIDE.md](UI_COMPONENTS_GUIDE.md)** - Component library
- **[UI_IMPROVEMENTS.md](UI_IMPROVEMENTS.md)** - UI enhancement history

## License

MIT