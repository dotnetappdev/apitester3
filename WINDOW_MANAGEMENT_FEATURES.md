# Window Management & Test Debugging Features

This document describes the new window management and test debugging features implemented for Palis.

## View Menu

The application now includes a **View** menu in the main menu bar with the following options:

### Panel Management

- **Show Collections Panel** (Ctrl+Shift+C / Cmd+Shift+C)
  - Makes the Collections panel visible if it was previously hidden
  - Useful for restoring the panel after accidentally closing it

- **Show Test Explorer Panel** (Ctrl+Shift+T / Cmd+Shift+T)
  - Makes the Test Explorer panel visible if it was previously hidden
  - Brings back the test runner interface

- **Restore All Panels** (Ctrl+Shift+R / Cmd+Shift+R)
  - Restores all panels to their default visible state
  - Quick way to reset your workspace layout

### Panel Features

All panels in Palis support:

1. **Docking**: Panels can be docked to the left, right, top, or bottom of the window
2. **Floating**: Panels can float as independent windows, perfect for multi-monitor setups
3. **Closing**: Panels can be closed to maximize screen space
4. **Restoring**: Hidden panels can be restored via the View menu

## Test Debugging

The application now includes a comprehensive test debugging interface accessible via the **Debug Tests** button or **F6** keyboard shortcut.

### Debug Button

Located in the Test Explorer toolbar, the Debug button (🐛) opens the Test Debugger dialog with:

- **Green Run Button**: Styled with a vibrant green gradient and shadow effect for easy identification
- **Orange Debug Button**: Styled with an orange gradient indicating debug mode
- **Red Stop Button**: Styled with a red gradient for stopping test execution

### Test Debugger Features

When you click the Debug button or press F6, the Test Debugger opens with:

#### 1. Code Editor Panel
- **Monaco Editor**: Full-featured code editor with syntax highlighting
- **Language Support**: JavaScript/TypeScript for API tests
- **Read-Only/Editable**: View test code with the option to edit

#### 2. Debug Controls Toolbar
- **Start Debug (▶️)**: Begin debugging the selected test
- **Stop (⏹️)**: Stop the current debug session
- **Continue (▶️)**: Resume execution when paused at a breakpoint
- **Step Over (⤵️)**: Execute the current line and move to the next
- **Step Into (⤷)**: Step into function calls for detailed debugging

#### 3. Debug Panels

**Variables Panel**
- Shows all variables in the current scope
- Updates in real-time during debugging
- Displays variable names and values

**Exceptions Panel**
- Displays any exceptions thrown during test execution
- Shows detailed error messages
- Helps identify failure points quickly

**Breakpoints Panel**
- Lists all set breakpoints
- Toggle breakpoints on/off
- Remove breakpoints individually
- Shows line numbers for each breakpoint

### Debug Workflow

1. Select a test in the Test Explorer
2. Click the Debug button (🐛) or press F6
3. The Test Debugger opens showing the test code
4. Click "Start Debug" to begin execution
5. Test will pause at breakpoints
6. Use Step Over/Step Into to navigate through code
7. View variables and exceptions in the side panels
8. Click Continue to resume or Stop to end the session

### Keyboard Shortcuts

- **F5**: Run all tests (without debugging)
- **F6**: Open Test Debugger
- **Ctrl+Shift+C/Cmd+Shift+C**: Show Collections Panel
- **Ctrl+Shift+T/Cmd+Shift+T**: Show Test Explorer Panel
- **Ctrl+Shift+R/Cmd+Shift+R**: Restore All Panels

## Multi-Monitor Support

The dockable panel system is designed for multi-monitor workflows:

1. **Float Panels**: Click the float button (⤢) on any panel header
2. **Drag to Monitor**: Drag the floating panel to a secondary monitor
3. **Independent Windows**: Floating panels act as independent windows
4. **Redock Anytime**: Use the dock buttons (▀ ▌ ▄ ▐) to return panels to the main window

## Benefits

- **Flexible Layout**: Arrange panels to suit your workflow
- **Screen Space**: Hide panels when not needed
- **Easy Recovery**: Restore hidden panels via the View menu
- **Multi-Monitor**: Float panels to secondary displays
- **Professional Debugging**: Debug tests with breakpoints and variable inspection
- **Efficient Testing**: Visual Studio-style testing experience

## Implementation Details

The implementation uses:
- **Electron IPC**: Communication between main and renderer processes
- **React State Management**: Panel visibility and layout state
- **Monaco Editor**: Code editor component
- **CSS Gradients**: Enhanced button styling
- **Context Bridge**: Secure API exposure to renderer

For developers integrating these features, see the following components:
- `DockableLayout.tsx`: Main layout manager
- `DockablePanel.tsx`: Individual panel component
- `EnhancedTestExplorer.tsx`: Test explorer with enhanced buttons
- `TestDebugger.tsx`: Test debugging interface
- `electron/main.ts`: Main process menu setup
- `electron/preload.ts`: Renderer API exposure
