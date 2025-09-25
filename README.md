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
│   └── ResponsePanel.tsx # Response display
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and API client
└── styles/             # CSS styling

electron/
├── main.ts             # Electron main process
├── preload.ts          # Preload script for security
└── utils.ts            # Electron utilities
```

## Security Features

- **Context Isolation**: Renderer process is isolated from Node.js
- **Preload Scripts**: Secure communication between main and renderer
- **No Node Integration**: Frontend runs in sandboxed environment
- **Local Storage**: All data stored locally for privacy
- **Secure HTTP**: Proper SSL/TLS certificate validation

## License

MIT