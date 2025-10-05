# HTTP Monitoring Feature - Visual Guide

## UI Overview

This document provides a visual description of the HTTP Monitoring feature user interface.

---

## Main Interface

### Toolbar Button

```
┌─────────────────────────────────────────────────────────────────────┐
│ [📁] [🧪] [📡 Monitor] │ ... │ [▶️ Run] [🐞 Debug] │ ... │ [❓] [👤] │
└─────────────────────────────────────────────────────────────────────┘
```

**Monitor Button:**
- Location: Left side of toolbar, third button
- Icon: 📡 (satellite/radio tower icon)
- Label: "Monitor" or "Exit Monitor" when active
- Style: Orange background (#FF6C37) when active, gray when inactive
- Action: Toggles monitoring panel view

---

## Monitoring Panel Layout

### Full Panel View

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  🔍 HTTP Traffic Monitor                    [▶ Start Proxy] [🗑️ Clear]      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Configuration (when stopped):                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Proxy Port: [8888]                                                     │  │
│  │                                                                         │  │
│  │ Target Endpoints:                                                       │  │
│  │   ┌─────────────────────────────────────────────────┐                 │  │
│  │   │ http://localhost:3000                         [✕]│                 │  │
│  │   └─────────────────────────────────────────────────┘                 │  │
│  │   [http://localhost:____________________] [+]                          │  │
│  │                                                                         │  │
│  │ ☑ Enable Traffic Interception                                         │  │
│  │ ☐ Auto-forward Requests                                               │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Status (when running):                                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ ● Proxy running on port 8888                                           │  │
│  │                                                                         │  │
│  │ Configure your application to use proxy: http://localhost:8888         │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Traffic List and Details View

### Two-Panel Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Captured Traffic (15)                                                      │
├──────────────────────────┬──────────────────────────────────────────────────┤
│ Traffic List             │ Request Details                                  │
│                          │                                                  │
│ ┌──────────────────────┐ │ ┌──────────────────────────────────────────────┐ │
│ │ [GET] [200] 10:23:45│ │ │ Request                                      │ │
│ │ /api/users          │ │ │ ─────────────────────────────────────────────│ │
│ │ 125ms • 2.4KB       │ │ │ Method: GET                                  │ │
│ └──────────────────────┘ │ │ URL: /api/users?page=1                       │ │
│                          │ │ Time: 2024-01-15 10:23:45                    │ │
│ ┌──────────────────────┐ │ │ Client: 127.0.0.1                            │ │
│ │ [POST] [201] 10:23:48│ │ │                                              │ │
│ │ /api/users          │ │ │ Headers:                                     │ │
│ │ 342ms • 1.2KB       │ │ │ ┌────────────────┬─────────────────────────┐ │ │
│ └──────────────────────┘ │ │ │ Accept         │ application/json        │ │ │
│                          │ │ │ Content-Type   │ application/json        │ │ │
│ ┌──────────────────────┐ │ │ │ Authorization  │ Bearer eyJ0eXAi...     │ │ │
│ │ [GET] [200] 10:23:52│ │ │ └────────────────┴─────────────────────────┘ │ │
│ │ /api/posts          │ │ │                                              │ │
│ │ 89ms • 5.6KB        │ │ │ Body:                                        │ │
│ └──────────────────────┘ │ │ ┌────────────────────────────────────────┐ │ │
│                          │ │ │ {                                        │ │ │
│ ┌──────────────────────┐ │ │ │   "username": "john_doe",                │ │ │
│ │ [DELETE] [204] 10:24│ │ │ │   "email": "john@example.com"            │ │ │
│ │ /api/users/123      │ │ │ │ }                                        │ │ │
│ │ 67ms • 0KB          │ │ │ └────────────────────────────────────────┘ │ │
│ └──────────────────────┘ │ │                                              │ │
│                          │ │ Response                                     │ │
│ [Empty state if no      │ │ ─────────────────────────────────────────────│ │
│  traffic captured]      │ │ Status: 200 OK                               │ │
│                          │ │ Time: 125ms                                  │ │
│                          │ │ Size: 2.4KB                                  │ │
│                          │ │                                              │ │
│                          │ │ Headers:                                     │ │
│                          │ │ ┌────────────────┬─────────────────────────┐ │ │
│                          │ │ │ Content-Type   │ application/json        │ │ │
│                          │ │ │ Cache-Control  │ no-cache                │ │ │
│                          │ │ └────────────────┴─────────────────────────┘ │ │
│                          │ │                                              │ │
│                          │ │ Body:                                        │ │
│                          │ │ ┌────────────────────────────────────────┐ │ │
│                          │ │ │ [                                        │ │ │
│                          │ │ │   {                                      │ │ │
│                          │ │ │     "id": 1,                             │ │ │
│                          │ │ │     "name": "John Doe"                   │ │ │
│                          │ │ │   }                                      │ │ │
│                          │ │ │ ]                                        │ │ │
│                          │ │ └────────────────────────────────────────┘ │ │
│                          │ └──────────────────────────────────────────────┘ │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

---

## Method Badge Colors

Visual representation of HTTP method badges:

```
┌─────────────────────────────────────────────────┐
│  [GET]     Blue (#61AFFE)                       │
│  [POST]    Green (#49CC90)                      │
│  [PUT]     Orange (#FCA130)                     │
│  [DELETE]  Red (#F93E3E)                        │
│  [PATCH]   Teal (#50E3C2)                       │
│  [HEAD]    Purple (#9012FE)                     │
│  [OPTIONS] Dark Blue (#0D5AA7)                  │
│  [SOAP]    Purple (#6F42C1)                     │
│  [GRPC]    Orange (#FD7E14)                     │
└─────────────────────────────────────────────────┘
```

---

## Response Modification Interface

When "Modify Response" is clicked:

```
┌──────────────────────────────────────────────────────────────────────┐
│  Modify Response                                                      │
│  ─────────────────────────────────────────────────────────────────── │
│                                                                       │
│  Status Code:                                                         │
│  [200]                                                                │
│                                                                       │
│  Status Text:                                                         │
│  [OK]                                                                 │
│                                                                       │
│  Body:                                                                │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │ {                                                             │   │
│  │   "success": true,                                            │   │
│  │   "message": "Modified by proxy",                             │   │
│  │   "data": {                                                   │   │
│  │     "id": 123,                                                │   │
│  │     "status": "active"                                        │   │
│  │   }                                                           │   │
│  │ }                                                             │   │
│  │                                                               │   │
│  │                                                               │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  [Send Response]  [Cancel]                                            │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Sidebar Navigation

New monitoring tab in sidebar:

```
┌──────────────────────┐
│  [📁 Collections]    │
│  [🌍 Environments]   │
│  [📜 History]        │
│  [📡 Monitoring]  ◄── NEW
│  [🖥️ UI Tests]       │
│  [🧪 Tests]          │
└──────────────────────┘
```

When selected, shows info panel:

```
┌──────────────────────────────────────────────────┐
│  HTTP Monitoring                                  │
│  Intercept and inspect HTTP traffic               │
│                                                   │
│      📡                                           │
│  HTTP Traffic Monitor                             │
│                                                   │
│  Intercept, view, and modify HTTP requests        │
│  and responses in real-time                       │
│                                                   │
│  ┌─────────────────┐  ┌─────────────────┐       │
│  │ 🔍 Intercept    │  │ 👁️ View         │       │
│  │ traffic         │  │ headers & body  │       │
│  └─────────────────┘  └─────────────────┘       │
│                                                   │
│  ┌─────────────────┐  ┌─────────────────┐       │
│  │ ✏️ Modify       │  │ ⚡ Real-time    │       │
│  │ requests/resp   │  │ inspection      │       │
│  └─────────────────┘  └─────────────────┘       │
│                                                   │
│  Click a request in the main panel to             │
│  start monitoring HTTP traffic                    │
└──────────────────────────────────────────────────┘
```

---

## Button Styles (Postman-inspired)

### Primary Button (Send, Start Proxy, etc.)
```
┌──────────────┐
│ ▶ Start Proxy │  ← Orange background (#FF6C37)
└──────────────┘     White text, rounded corners (6px)
                     Shadow on hover, slight lift animation
```

### Secondary Button (Cancel, Clear, etc.)
```
┌──────────┐
│ 🗑️ Clear  │  ← Transparent background
└──────────┘     Border visible, hover shows fill
                 Gray text becomes white on hover
```

### Danger Button (Stop, Delete, etc.)
```
┌──────────────┐
│ ⏹ Stop Proxy  │  ← Red background (#E53935)
└──────────────┘     White text, same styling as primary
```

---

## Status Indicators

### Proxy Running
```
● Proxy running on port 8888
```
Green pulsing dot with text

### Proxy Stopped
```
○ Proxy stopped
```
Gray static dot with text

---

## Empty States

### No Traffic Captured
```
┌────────────────────────────────────────┐
│                                        │
│              📡                        │
│                                        │
│      No traffic captured yet           │
│                                        │
│  Start the proxy and configure your    │
│  app to use it                         │
│                                        │
└────────────────────────────────────────┘
```

### No Request Selected
```
┌────────────────────────────────────────┐
│                                        │
│              👈                        │
│                                        │
│    Select a request to view details    │
│                                        │
└────────────────────────────────────────┘
```

---

## Color Scheme

### Primary Colors
- **Orange (Primary):** #FF6C37 - Main actions, active states
- **Blue (Accent):** #61AFFE - Links, GET method
- **Dark Background:** #1E1E1E - Main background
- **Secondary Background:** #252526 - Panels, cards

### Status Colors
- **Success/Green:** #49CC90 - POST method, success states
- **Warning/Orange:** #FCA130 - PUT method, warnings
- **Error/Red:** #F93E3E - DELETE method, errors
- **Info/Teal:** #50E3C2 - PATCH method, info states

### Text Colors
- **Primary Text:** #CCCCCC - Main content
- **Secondary Text:** #969696 - Labels, hints
- **Muted Text:** #6A6A6A - Timestamps, metadata

---

## Responsive Behavior

### Traffic List Width
- Fixed width: 350px
- Scrollable vertically
- Shows 10-12 requests at a time

### Details Panel
- Flexible width (fills remaining space)
- Minimum width: 400px
- Scrollable vertically for long content

### Code Blocks
- Maximum height: 400px
- Scrollable if content exceeds
- Horizontal scroll for long lines
- Syntax highlighting for JSON

---

## Interaction States

### Traffic Item States
```
Normal:      [Light background, no border]
Hover:       [Slightly lighter background, cursor pointer]
Selected:    [Accent color border, highlighted background]
Loading:     [Dimmed, no response yet shown]
Error:       [Red left border indicator]
```

### Button States
```
Normal:      [Solid background, clear label]
Hover:       [Lighter background, slight elevation]
Active:      [Pressed down, no elevation]
Disabled:    [40% opacity, no interaction]
Loading:     [Spinner icon, no interaction]
```

---

## Typography

### Fonts
- **UI Font:** Segoe UI, system font stack
- **Code Font:** Consolas, Monaco, monospace

### Sizes
- **Headers:** 14-16px, bold (600-700)
- **Body:** 13px, regular (400)
- **Labels:** 12px, medium (500)
- **Code:** 12px, regular (400)
- **Small Text:** 11px, regular (400)

---

## Accessibility Features

- High contrast colors meet WCAG AA standards
- Clear focus indicators on interactive elements
- Keyboard navigation support (Tab, Enter, Escape)
- ARIA labels for screen readers
- Tooltips for icon-only buttons
- Adequate spacing between clickable elements (minimum 32px height)

---

**Note:** This is a textual representation of the visual design. The actual implementation may vary slightly in exact pixel measurements, but follows these design principles and color schemes.
