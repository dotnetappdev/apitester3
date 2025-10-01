# UI Components Visual Guide

## 1. Help Menu in Toolbar

**Location**: Top toolbar, right side (before Reset button)

```
┌─────────────────────────────────────────────────────────────────┐
│ 📁 Collections  🧪 Tests          [?] Help   🔄 Reset          │
│                                      │                           │
│                                      ▼                           │
│                               ┌──────────────────────┐           │
│                               │ ℹ️ About API Tester 3 │           │
│                               │ 🐛 Report a Problem  │           │
│                               │ ──────────────────── │           │
│                               │ 🔗 GitHub Repository │           │
│                               │ 📖 Documentation     │           │
│                               └──────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features**:
- Hover effect on help button
- Dropdown menu with professional styling
- Links open in external browser
- Click outside to close

---

## 2. About Dialog

**Trigger**: Help menu → "About API Tester 3"

```
┌─────────────────────────────────────────────────┐
│  About API Tester 3                          × │
├─────────────────────────────────────────────────┤
│                                                 │
│                    🚀                           │
│               API Tester 3                      │
│               Version 1.0.0                     │
│                                                 │
│  Professional API testing tool with Visual      │
│  Studio-style dockable layout                   │
│                                                 │
│  📚 Resources                                   │
│  ┌───────────────────────────────────────────┐ │
│  │ 🔗 GitHub Repository                      │ │
│  │ 📖 Documentation                          │ │
│  │ 📦 Releases & Changelog                   │ │
│  │ 💬 Discussions                            │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ℹ️ Information                                │
│  Author: dotnetappdev                           │
│  License: MIT                                   │
│  Repository: dotnetappdev/apitester3            │
│                                                 │
│  Built with ❤️ for developers                   │
│                                                 │
├─────────────────────────────────────────────────┤
│                              [Close]            │
└─────────────────────────────────────────────────┘
```

**Key Features**:
- Clean, centered layout
- Clickable resource links
- Professional footer
- Responsive design

---

## 3. Report a Problem Dialog

**Trigger**: Help menu → "Report a Problem"

```
┌─────────────────────────────────────────────────┐
│  🐛 Report a Problem                         × │
├─────────────────────────────────────────────────┤
│                                                 │
│  Issue Type                                     │
│  [🐛 Bug Report ▼]                              │
│                                                 │
│  Title *                                        │
│  [Brief description of the bug         ] 0/100 │
│                                                 │
│  Description *                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ Describe the bug in detail              │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Steps to Reproduce                             │
│  ┌─────────────────────────────────────────┐   │
│  │ 1. Go to...                             │   │
│  │ 2. Click on...                          │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Expected Behavior                              │
│  [What you expected to happen        ]          │
│                                                 │
│  Actual Behavior                                │
│  [What actually happened             ]          │
│                                                 │
│  📝 Note: Clicking "Open GitHub Issue" will     │
│  open your browser with a pre-filled issue      │
│  form on GitHub. You'll need to be logged in    │
│  to GitHub to submit the issue.                 │
│                                                 │
├─────────────────────────────────────────────────┤
│  [Cancel]              [Open GitHub Issue]      │
└─────────────────────────────────────────────────┘
```

**Key Features**:
- Three issue types: Bug Report, Feature Request, Question
- Dynamic form fields based on issue type
- Character counter
- Form validation
- Generates GitHub issue template
- Opens in browser

---

## 4. Search Filter in Sidebar

**Location**: Sidebar, below user profile header

```
┌───────────────────────────────┐
│ User Profile              ⚙️👥│
├───────────────────────────────┤
│ 🔍 Search collections and     │
│    requests... (Ctrl+P)    ✕  │
├───────────────────────────────┤
│ Collections (5)  Tests (12)   │
├───────────────────────────────┤
│ 📁 API Collection           ▶ │
│   └─ GET /users               │
│   └─ POST /users              │
│   └─ DELETE /users/:id        │
│                               │
│ 📁 Auth Collection          ▶ │
│   └─ POST /login              │
│   └─ POST /register           │
└───────────────────────────────┘
```

**When Searching**:
```
┌───────────────────────────────┐
│ User Profile              ⚙️👥│
├───────────────────────────────┤
│ 🔍 post                     ✕ │
├───────────────────────────────┤
│ Collections (5)  Tests (12)   │
├───────────────────────────────┤
│ 📁 API Collection           ▼ │
│   └─ POST /users          ◀── │
│                               │
│ 📁 Auth Collection          ▼ │
│   └─ POST /login          ◀── │
│   └─ POST /register       ◀── │
└───────────────────────────────┘
```

**Key Features**:
- Real-time filtering
- Auto-expands matching collections
- Clear button (✕) when text entered
- Press Escape to clear
- Professional styling
- Searches: collection names, request names, methods, URLs

---

## 5. Enhanced Test Runner UI

**Location**: Test Explorer panel

**Before (Original)**:
```
┌───────────────────────────────┐
│ ▶ Test Explorer        ⚡ 🔄  │
└───────────────────────────────┘
```

**After (Enhanced)**:
```
┌───────────────────────────────┐
│ ▶ Test Explorer   ▶️ 🐛 🔄    │
│                   ↑  ↑  ↑     │
│                Play Debug Refresh
└───────────────────────────────┘
```

**When Running**:
```
┌───────────────────────────────┐
│ ▶ Test Explorer   ⏹️ 🐛 🔄    │
│                   ↑  ↑  ↑     │
│                Stop Debug Refresh
└───────────────────────────────┘
```

**Button States**:
- **Play (▶️)**: Green, runs all tests, F5 shortcut
- **Stop (⏹️)**: Red, stops running tests, appears during execution
- **Debug (🐛)**: Orange, debug mode (prepared for future), F6 shortcut
- **Refresh (🔄)**: Gray, refreshes test list

**Keyboard Shortcuts**:
- `F5`: Run all tests
- `F6`: Debug tests
- `Escape`: (in search) Clear search

---

## 6. Theme Support

Both **Dark** and **Light** themes are fully supported:

### Dark Theme Colors
- Success: #4caf50 (green)
- Error: #f44747 (red)
- Warning: #ffc107 (amber)
- Info: #2196f3 (blue)
- Backgrounds: #1e1e1e, #252526, #2d2d30
- Text: #cccccc, #969696, #6a6a6a

### Light Theme Colors
- Success: #2e7d32 (dark green)
- Error: #d32f2f (dark red)
- Warning: #f57c00 (dark orange)
- Info: #1976d2 (dark blue)
- Backgrounds: #ffffff, #f8f8f8, #f0f0f0
- Text: #1e1e1e, #616161, #9e9e9e

All colors tested for proper contrast and accessibility.

---

## File Structure

```
src/
├── components/
│   ├── AboutDialog.tsx              (NEW)
│   ├── ReportProblemDialog.tsx      (NEW)
│   ├── DockableLayout.tsx           (Modified: Help menu)
│   ├── EnhancedApp.tsx              (Modified: Dialog integration)
│   ├── EnhancedSidebar.tsx          (Modified: Search filter)
│   └── EnhancedTestExplorer.tsx     (Modified: Enhanced buttons)
├── constants/
│   └── appInfo.ts                   (NEW)
└── styles/
    └── index.css                    (Modified: Theme colors, search styles)
```

---

## Summary

All UI improvements successfully implemented:
- ✅ Professional Help menu with dropdown
- ✅ About dialog with version and links
- ✅ Report Problem dialog with GitHub integration
- ✅ VS Code-style search filter
- ✅ Enhanced test runner with play/stop/debug buttons
- ✅ Improved theme colors for dark and light modes
- ✅ Keyboard shortcuts for power users
- ✅ Responsive design for all screen sizes
