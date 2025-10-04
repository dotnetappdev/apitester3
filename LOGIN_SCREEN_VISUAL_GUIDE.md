# Login Screen - Visual Guide and Verification

## Overview
This document provides a visual guide to the VerifyApi login screen and helps verify that all seed data is properly loaded and displayed.

## Expected Login Screen Layout

The login screen should display:
1. **Title**: "VerifyApi" with subtitle "Who's testing APIs today?"
2. **5 User Profile Cards**: Each with a colored avatar and "Switch Account" button
3. **3 Action Cards**: Add Profile, Reset Password, Delete Account
4. **Password Field**: Appears below when a profile is selected
5. **Continue Button**: For logging in

## Visual Structure

```
┌──────────────────────────────────────────────────────────────┐
│                        VerifyApi                              │
│                  Who's testing APIs today?                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────┐│
│  │    A    │  │    T    │  │    D    │  │    Q    │  │ A  ││
│  │ (blue)  │  │ (teal)  │  │(yellow) │  │(purple) │  │(gn)││
│  │         │  │         │  │         │  │         │  │    ││
│  │ admin   │  │testuser │  │developer│  │ qa_lead │  │api_││
│  │         │  │         │  │         │  │         │  │test││
│  │ SWITCH  │  │ SWITCH  │  │ SWITCH  │  │ SWITCH  │  │SWIT││
│  │ ACCOUNT │  │ ACCOUNT │  │ ACCOUNT │  │ ACCOUNT │  │ACCO││
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └────┘│
│                                                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                      │
│  │    +    │  │    🔑   │  │    🗑️   │                      │
│  │         │  │         │  │         │                      │
│  │   Add   │  │  Reset  │  │ Delete  │                      │
│  │ Profile │  │Password │  │ Account │                      │
│  └─────────┘  └─────────┘  └─────────┘                      │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Selected: [A] admin                                     │ │
│  │                                                         │ │
│  │ Password: [__________________]                          │ │
│  │                                                         │ │
│  │          [       Continue       ]                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## 5 Default User Profiles

### Profile 1: admin
- **Avatar**: Blue background with "A"
- **Username**: admin
- **Role**: Admin (orange badge)
- **Password**: admin123
- **Avatar Color**: #4682B4 (Steel Blue)

### Profile 2: testuser
- **Avatar**: Teal background with "T"
- **Username**: testuser
- **Role**: Standard (teal badge)
- **Password**: password123
- **Avatar Color**: #20B2AA (Light Sea Green)

### Profile 3: developer
- **Avatar**: Yellow background with "D"
- **Username**: developer
- **Role**: Standard (teal badge)
- **Password**: dev2024!
- **Avatar Color**: #FFD700 (Gold)

### Profile 4: qa_lead
- **Avatar**: Purple background with "Q"
- **Username**: qa_lead
- **Role**: Admin (orange badge)
- **Password**: quality123
- **Avatar Color**: #9370DB (Medium Purple)

### Profile 5: api_tester
- **Avatar**: Green background with "A"
- **Username**: api_tester
- **Role**: Standard (teal badge)
- **Password**: testing456
- **Avatar Color**: #00CED1 (Dark Turquoise)

## Switch Account Screen

When clicking "Switch Account" button, a modal displays:

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back              Switch Account                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [A] admin            [ADMIN]                 [SWITCH]  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [T] testuser         [STANDARD]              [SWITCH]  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [D] developer        [STANDARD]              [SWITCH]  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [Q] qa_lead          [ADMIN]                 [SWITCH]  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [A] api_tester       [STANDARD]              [SWITCH]  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ 🔑 Change Password  │  │ 🗑️ Delete Profile  │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Verification Checklist

Use this checklist when verifying the login screen:

### Visual Elements
- [ ] Application title "VerifyApi" is visible
- [ ] Subtitle "Who's testing APIs today?" is visible
- [ ] 5 user profile cards are displayed in a grid
- [ ] Each profile has a colored avatar with the first letter
- [ ] Each profile shows the username below the avatar
- [ ] Each profile has a "Switch Account" button
- [ ] 3 action cards are visible: Add Profile, Reset Password, Delete Account
- [ ] All elements are properly aligned and spaced

### Profile Cards
- [ ] **admin** profile with blue "A" avatar
- [ ] **testuser** profile with teal "T" avatar
- [ ] **developer** profile with yellow "D" avatar
- [ ] **qa_lead** profile with purple "Q" avatar
- [ ] **api_tester** profile with green "A" avatar

### Interaction
- [ ] Clicking a profile card selects it (shows blue border)
- [ ] Password field appears when a profile is selected
- [ ] Can switch between profiles by clicking different avatars
- [ ] "Switch Account" button opens the account switcher modal
- [ ] All 5 profiles are listed in the switch account modal
- [ ] Each profile in the modal shows username and role badge
- [ ] Admin profiles show orange "ADMIN" badge
- [ ] Standard profiles show teal "STANDARD" badge

### Login Functionality
- [ ] Can select a profile by clicking its avatar
- [ ] Can enter password in the password field
- [ ] "Continue" button is enabled when profile selected and password entered
- [ ] Pressing Enter in password field submits the login
- [ ] Successful login redirects to main application
- [ ] Incorrect password shows error message

## Common Issues and Solutions

### Issue: No profiles are showing
**Symptoms:**
- Empty login screen
- No user profile cards visible
- Only action cards (Add Profile, etc.) are visible

**Solution:**
1. Run the test script: `npm run test:login`
2. Check if database exists and has users
3. If no users found, delete database and restart app
4. Database location varies by OS (see SEED_DATA_VERIFICATION.md)

### Issue: Only some profiles showing (less than 5)
**Symptoms:**
- 1-4 profiles visible instead of 5
- Some expected profiles are missing

**Solution:**
1. Run `npm run test:login` to verify database state
2. Check console for seed data initialization messages
3. Delete database and restart to re-seed all 5 profiles

### Issue: Profiles show but can't login
**Symptoms:**
- All 5 profiles are visible
- Password field appears
- Login fails with error

**Solution:**
1. Verify you're using the correct password (see profile list above)
2. Check browser/electron console for error messages
3. Verify database has proper password hashes: `npm run test:login`
4. Try with default passwords:
   - admin: admin123
   - testuser: password123
   - developer: dev2024!
   - qa_lead: quality123
   - api_tester: testing456

### Issue: Switch Account button not working
**Symptoms:**
- "Switch Account" button visible but doesn't open modal
- Modal opens but empty

**Solution:**
1. Check browser console for JavaScript errors
2. Verify all profiles are loaded: `npm run test:login`
3. Refresh the application
4. Clear browser cache if running in development mode

## Automated Testing

### Quick Database Check
```bash
npm run test:seed
```
Expected output:
- ✓ Found 5 users
- ✓ All users have proper usernames
- Database connection successful

### Comprehensive Profile Test
```bash
npm run test:login
```
Expected output:
- ✅ All 5 user profiles exist with correct roles
- ✅ Password encryption is properly implemented
- ✅ All 3 sample collections are present
- ✅ All 14+ sample requests exist
- 🎉 ALL TESTS PASSED!

## After Login: Collections Panel

After logging in, verify the collections panel shows:

### 3 Default Collections

1. **JSONPlaceholder API Tests** (shared)
   - Description: Sample API requests using jsonplaceholder.typicode.com
   - Owner: admin
   - Contains 7 API test requests

2. **UI Test Examples** (shared)
   - Description: Browser-based UI test examples using Playwright
   - Owner: admin
   - Contains 3 UI test requests

3. **Unit Test Examples** (private)
   - Description: Standalone unit test examples for functions and components
   - Owner: developer
   - Contains 4 unit test requests

## Sample Requests

After opening a collection, you should see multiple requests:

### JSONPlaceholder API Tests (7 requests)
1. Get All Posts
2. Get Post by ID
3. Create New Post
4. Update Post
5. Delete Post
6. Get All Users
7. Get User Albums

### UI Test Examples (3 requests)
1. Login Page UI Test
2. User Authentication Flow
3. Navigation Menu Test

### Unit Test Examples (4 requests)
1. String Utility Functions
2. Array Operations Test
3. Object Validation Test
4. Search Users by Name (part of JSONPlaceholder)

## Color Scheme Reference

### Avatar Colors
- Blue (#4682B4): admin
- Teal (#20B2AA): testuser
- Yellow (#FFD700): developer
- Purple (#9370DB): qa_lead
- Green (#00CED1): api_tester

### Role Badge Colors
- Orange (#ff6b35): Admin role
- Teal (#4ec9b0): Standard role

### UI Colors
- Background: Dark theme (#1e1e1e)
- Text: Light (#cccccc)
- Selected border: Blue (#007acc)
- Error: Red (#f72585)
- Success: Green (#4caf50)

## Screenshots Reference

The issue includes two reference screenshots showing the expected appearance:

1. **Login Screen** (image b2050e30-650f-4c6a-8b5a-00686bd07591):
   - Shows 5 user profiles in a grid layout
   - Each with colored avatar and username
   - "Switch Account" button visible on each card
   - Password field below the profiles
   - "Continue" button at bottom

2. **Switch Account Modal** (image 7e20365e-3c33-42b7-a3bf-d2034231ac40):
   - List view of all 5 profiles
   - Each profile shows avatar, username, role badge, and Switch button
   - Admin profiles have orange "ADMIN" badge
   - Standard profiles have teal "STANDARD" badge
   - "Change Password" and "Delete Profile" buttons at bottom

## Developer Notes

### Where Avatar Colors are Generated
The avatar colors are generated using a hash of the username in the CSS. Each profile card has a `.avatar-placeholder` div that displays the first letter of the username with a colored background.

### Database Schema
Users are stored in the SQLite database with:
- `username`: Unique identifier
- `passwordHash`: Encrypted password
- `salt`: Cryptographic salt
- `role`: 'admin' or 'standard'
- `profilePicture`: Optional custom avatar (null by default)

### Seed Data Location
Seed data is initialized in:
- File: `electron/sqliteManager.ts`
- Method: `initializeSeedData()`
- Called from: `initialize()` during database setup

### Testing in Development
When running in development mode (`npm run dev`):
1. Check console for seed data logs:
   ```
   🌱 Initializing seed data...
   ✅ Seeded 5 users (admin, testuser, developer, qa_lead, api_tester)
   ✅ Seeded 3 collections
   ✅ Seeded 14 sample requests
   ✅ Seed data initialization complete
   ```

2. Database is located at:
   - macOS: `~/Library/Application Support/verifyapi/apitester3.db`
   - Windows: `%APPDATA%/verifyapi/apitester3.db`
   - Linux: `~/.config/verifyapi/apitester3.db`

## Support

If you encounter issues with the login screen or seed data:

1. Run automated tests:
   - `npm run test:seed` - Quick database check
   - `npm run test:login` - Comprehensive verification

2. Check console output for errors

3. Review SEED_DATA_VERIFICATION.md for detailed troubleshooting

4. Delete database and restart app to re-seed data

5. Create GitHub issue with:
   - Output of `npm run test:login`
   - Console error messages
   - Screenshots of actual vs. expected behavior
   - Operating system and Node.js version
