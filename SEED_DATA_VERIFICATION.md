# Seed Data Verification and Troubleshooting Guide

## Overview
This guide helps you verify that the seed data is properly loaded in your VerifyApi installation and provides troubleshooting steps if the login profiles are not showing up.

## Expected Seed Data

When you first run VerifyApi, the application should automatically create:

### 5 User Profiles
1. **admin** (admin role) - Password: `admin123`
2. **testuser** (standard role) - Password: `password123`
3. **developer** (standard role) - Password: `dev2024!`
4. **qa_lead** (admin role) - Password: `quality123`
5. **api_tester** (standard role) - Password: `testing456`

### 3 Collections
1. **JSONPlaceholder API Tests** (shared) - 7 API test requests
2. **UI Test Examples** (shared) - 3 UI test requests
3. **Unit Test Examples** (private) - 4 unit test requests

### 14 Sample Requests
- 7 API tests using jsonplaceholder.typicode.com
- 3 UI tests using Playwright
- 4 Unit test examples

## Verifying Seed Data

### Method 1: Visual Verification
1. Launch the VerifyApi application
2. The login screen should display all 5 user profiles with colored avatars
3. Click "Switch Account" to see the full list of profiles with their roles
4. Log in with any of the default accounts (e.g., admin/admin123)
5. Check the Collections panel for the 3 sample collections
6. Open a collection to see the seeded requests

### Method 2: Automated Test Script
Run the automated test script to verify the database:

```bash
npm run test:seed
```

This will check:
- ✓ All 5 users are present
- ✓ All 3 collections are created
- ✓ All 14 sample requests exist

### Method 3: Comprehensive Login Profile Test
Run the comprehensive automated test for login profiles:

```bash
npm run test:login
```

This advanced test verifies:
- ✓ All 5 user profiles exist with correct roles
- ✓ Password encryption is properly implemented
- ✓ All 3 sample collections are present
- ✓ All 14+ sample requests exist
- ✓ Database schema integrity

Expected output:
```
Database path: /path/to/apitester3.db
Testing seed data...

✓ Database connection opened

📊 USERS TEST:
   Found 5 users
   ✓ All 5 expected users found:
      - admin (admin)
      - api_tester (standard)
      - developer (standard)
      - qa_lead (admin)
      - testuser (standard)

📊 COLLECTIONS TEST:
   Found 3 collections
   ✓ All 3 expected collections found:
      - JSONPlaceholder API Tests (shared)
      - UI Test Examples (shared)
      - Unit Test Examples (private)

📊 REQUESTS TEST:
   Found 14 requests
   ✓ Expected number of requests found (14+)

═══════════════════════════════════════
✅ ALL TESTS PASSED!
   Seed data is properly initialized.
   Login screen should show all 5 profiles.
```

## Troubleshooting: Missing Profiles

If the login screen is not showing the 5 default profiles, follow these steps:

### Step 1: Locate Your Database File
The database file is stored in your user data directory:

**Windows:**
```
C:\Users\<YourUsername>\AppData\Roaming\verifyapi\apitester3.db
```

**macOS:**
```
~/Library/Application Support/verifyapi/apitester3.db
```

**Linux:**
```
~/.config/verifyapi/apitester3.db
```

### Step 2: Reset the Database
To force the seed data to be recreated:

1. **Close the VerifyApi application** (make sure it's not running)
2. **Delete the database file** at the location identified in Step 1
3. **Restart the VerifyApi application**
4. The seed data will be automatically created on first launch

### Step 3: Verify Console Output
When the application starts, check the console output (if running in development mode) for:
```
✓ Seeded 5 users
✓ Seeded 3 collections
✓ Seeded 14 sample requests (7 API + 3 UI + 4 Unit tests)
Seed data initialization complete
```

### Step 4: Run the Test Script
After resetting the database, run the test script to confirm:
```bash
npm run test:seed
```

## Common Issues and Solutions

### Issue 1: "No users found in database"
**Cause:** The database was created but seed data initialization failed.

**Solution:**
1. Close the application
2. Delete the database file
3. Check the console for any error messages when restarting
4. If errors persist, check file permissions on the user data directory

### Issue 2: "Some users missing"
**Cause:** Partial seed data was loaded, possibly due to an interruption during initialization.

**Solution:**
1. Close the application
2. Delete the database file completely (not just some users)
3. Restart the application for a clean seed

### Issue 3: "Collections exist but no users"
**Cause:** The seed logic checks users and collections separately. If users were manually created before, only collections would be seeded.

**Solution:**
Option A: Keep existing users and just verify collections are there
Option B: For a fresh start, delete the database and restart

### Issue 4: Database file doesn't exist
**Cause:** Application hasn't been run yet, or there was an error during first launch.

**Solution:**
1. Run the application at least once
2. Check for error messages in the console
3. Verify you have write permissions to the user data directory

## Development Mode
If you're running in development mode:

```bash
npm run dev
```

You can see the console output directly, which includes:
- Database path
- Seed data initialization messages
- Any errors that occur

## For Developers

### Adding More Seed Data
To add more default users, collections, or requests, edit the `initializeSeedData()` method in:
```
electron/sqliteManager.ts
```

### Testing Seed Logic
The seed logic is idempotent - it checks if data already exists before seeding:
- Users are only seeded if the users table is empty
- Collections are only seeded if the collections table is empty
- This prevents duplicate data on application restarts

### Database Schema
To inspect the database schema or manually query the database, you can use any SQLite browser tool:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- SQLite CLI: `sqlite3 /path/to/apitester3.db`

Example queries:
```sql
-- Check all users
SELECT username, role FROM users;

-- Check all collections
SELECT name, isShared FROM collections;

-- Count requests per collection
SELECT c.name, COUNT(r.id) as request_count 
FROM collections c 
LEFT JOIN requests r ON c.id = r.collectionId 
GROUP BY c.id;
```

## Support

If you continue to experience issues with seed data:
1. Run `npm run test:seed` and save the output
2. Check the application console for error messages
3. Create a GitHub issue with the test output and any error messages
4. Include your operating system and Node.js version

## Summary
✅ Seed data should load automatically on first run
✅ Login screen should show 5 default profiles
✅ Collections panel should show 3 sample collections
✅ Use `npm run test:seed` to verify
✅ Delete database file to reset if needed
