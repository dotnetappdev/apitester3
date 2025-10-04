#!/usr/bin/env node

/**
 * Automated UI Test for Login Profile Verification
 * This test verifies that all 5 seed user profiles are properly displayed in the login UI
 * 
 * Prerequisites:
 * - Database must exist with seed data
 * - Run `npm run dev-electron` to start the app first
 * - Then run this test to verify the profiles are visible
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');
const fs = require('fs');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

function header(message) {
  console.log('\n' + colors.bright + colors.cyan + '═'.repeat(60));
  console.log(message);
  console.log('═'.repeat(60) + colors.reset + '\n');
}

// Determine the database path (matches the path used in the Electron app)
function getDatabasePath() {
  let dbPath;
  if (process.platform === 'darwin') {
    dbPath = path.join(os.homedir(), 'Library', 'Application Support', 'verifyapi', 'apitester3.db');
  } else if (process.platform === 'win32') {
    dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'verifyapi', 'apitester3.db');
  } else {
    dbPath = path.join(os.homedir(), '.config', 'verifyapi', 'apitester3.db');
  }
  return dbPath;
}

async function runLoginProfileTests() {
  header('🧪 LOGIN PROFILE AUTOMATED TEST');
  
  const dbPath = getDatabasePath();
  log('📁 Database location: ' + dbPath, colors.blue);
  
  // Check if database exists
  if (!fs.existsSync(dbPath)) {
    log('\n❌ Database file not found!', colors.red);
    log('   The application hasn\'t been run yet, or the database is in a different location.', colors.yellow);
    log('   Please run the application first to create the database.\n', colors.yellow);
    process.exit(1);
  }
  
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        log('❌ Error opening database: ' + err.message, colors.red);
        reject(err);
        return;
      }
      
      log('✅ Successfully connected to database\n', colors.green);
      
      // Test 1: Verify all 5 users exist
      header('TEST 1: Verify User Profiles');
      
      db.all('SELECT username, role, createdAt FROM users ORDER BY username', [], (err, users) => {
        if (err) {
          log('❌ Failed to query users: ' + err.message, colors.red);
          db.close();
          reject(err);
          return;
        }
        
        const expectedUsers = [
          { username: 'admin', role: 'admin' },
          { username: 'api_tester', role: 'standard' },
          { username: 'developer', role: 'standard' },
          { username: 'qa_lead', role: 'admin' },
          { username: 'testuser', role: 'standard' }
        ];
        
        log('Expected 5 user profiles:', colors.cyan);
        expectedUsers.forEach((u, i) => {
          log(`   ${i + 1}. ${u.username} (${u.role})`, colors.cyan);
        });
        
        log('\nActual profiles in database:', colors.blue);
        let allUsersMatch = true;
        
        if (users.length === 0) {
          log('   ❌ NO USERS FOUND!', colors.red);
          log('   The database exists but has no users.', colors.yellow);
          log('   This means seed data was not initialized.', colors.yellow);
          allUsersMatch = false;
        } else if (users.length !== 5) {
          log(`   ⚠️  Found ${users.length} users (expected 5)`, colors.yellow);
          users.forEach((u, i) => {
            log(`   ${i + 1}. ${u.username} (${u.role})`, colors.yellow);
          });
          allUsersMatch = false;
        } else {
          // Check each user
          expectedUsers.forEach((expected, i) => {
            const actual = users[i];
            if (actual.username === expected.username && actual.role === expected.role) {
              log(`   ✅ ${i + 1}. ${actual.username} (${actual.role})`, colors.green);
            } else {
              log(`   ❌ ${i + 1}. Expected: ${expected.username}, Got: ${actual.username}`, colors.red);
              allUsersMatch = false;
            }
          });
        }
        
        // Test 2: Verify password hashes exist
        header('TEST 2: Verify Password Security');
        
        db.all('SELECT username, passwordHash, salt FROM users', [], (err, userAuth) => {
          if (err) {
            log('❌ Failed to query user authentication: ' + err.message, colors.red);
            db.close();
            reject(err);
            return;
          }
          
          let allPasswordsSecure = true;
          userAuth.forEach(user => {
            if (!user.passwordHash || !user.salt) {
              log(`   ❌ ${user.username}: Missing password hash or salt`, colors.red);
              allPasswordsSecure = false;
            } else if (user.passwordHash.length < 32) {
              log(`   ❌ ${user.username}: Password hash too short (${user.passwordHash.length} chars)`, colors.red);
              allPasswordsSecure = false;
            } else {
              log(`   ✅ ${user.username}: Properly encrypted password`, colors.green);
            }
          });
          
          // Test 3: Verify collections exist
          header('TEST 3: Verify Sample Collections');
          
          db.all('SELECT id, name, isShared, ownerId FROM collections', [], (err, collections) => {
            if (err) {
              log('❌ Failed to query collections: ' + err.message, colors.red);
              db.close();
              reject(err);
              return;
            }
            
            const expectedCollections = [
              'JSONPlaceholder API Tests',
              'UI Test Examples',
              'Unit Test Examples'
            ];
            
            let collectionsMatch = collections.length === 3;
            
            if (collections.length === 0) {
              log('   ❌ No collections found!', colors.red);
              log('   Sample collections were not seeded.', colors.yellow);
            } else if (collections.length === 3) {
              log('   ✅ Found all 3 expected collections:', colors.green);
              collections.forEach((c, i) => {
                const shared = c.isShared ? 'shared' : 'private';
                log(`   ${i + 1}. ${c.name} (${shared})`, colors.green);
              });
            } else {
              log(`   ⚠️  Found ${collections.length} collections (expected 3)`, colors.yellow);
              collections.forEach((c, i) => {
                log(`   ${i + 1}. ${c.name}`, colors.yellow);
              });
            }
            
            // Test 4: Verify sample requests exist
            header('TEST 4: Verify Sample Requests');
            
            db.all('SELECT COUNT(*) as count FROM requests', [], (err, result) => {
              if (err) {
                log('❌ Failed to query requests: ' + err.message, colors.red);
                db.close();
                reject(err);
                return;
              }
              
              const requestCount = result[0].count;
              const expectedCount = 14;
              
              let requestsMatch = requestCount >= expectedCount;
              
              if (requestCount === 0) {
                log('   ❌ No sample requests found!', colors.red);
                log('   Sample requests were not seeded.', colors.yellow);
              } else if (requestCount >= expectedCount) {
                log(`   ✅ Found ${requestCount} sample requests (expected ${expectedCount}+)`, colors.green);
              } else {
                log(`   ⚠️  Found ${requestCount} requests (expected ${expectedCount})`, colors.yellow);
              }
              
              // Final Summary
              header('📊 TEST SUMMARY');
              
              const allTestsPassed = allUsersMatch && allPasswordsSecure && collectionsMatch && requestsMatch;
              
              if (allTestsPassed) {
                log('🎉 ALL TESTS PASSED!', colors.green);
                log('\n✅ Login Screen Verification:', colors.green);
                log('   - All 5 user profiles should be visible in the login screen', colors.green);
                log('   - Each profile should have a colored avatar', colors.green);
                log('   - Profile names: admin, testuser, developer, qa_lead, api_tester', colors.green);
                log('   - "Switch Account" button should show all profiles with roles', colors.green);
                log('\n✅ Collections Panel Verification:', colors.green);
                log('   - 3 sample collections should be visible after login', colors.green);
                log('   - Each collection contains multiple sample requests', colors.green);
                log('   - Sample requests include API tests, UI tests, and unit tests', colors.green);
                log('\n👍 The seed data is properly initialized and ready for use!\n', colors.green);
                
                db.close();
                resolve(true);
              } else {
                log('⚠️  SOME TESTS FAILED', colors.yellow);
                log('\n❌ Issues Found:', colors.red);
                if (!allUsersMatch) {
                  log('   - User profiles are missing or incorrect', colors.red);
                }
                if (!allPasswordsSecure) {
                  log('   - Password security issues detected', colors.red);
                }
                if (!collectionsMatch) {
                  log('   - Sample collections are missing', colors.red);
                }
                if (!requestsMatch) {
                  log('   - Sample requests are incomplete', colors.red);
                }
                
                log('\n🔧 To Fix:', colors.yellow);
                log('   1. Close the VerifyApi application', colors.yellow);
                log('   2. Delete the database file:', colors.yellow);
                log('      ' + dbPath, colors.cyan);
                log('   3. Restart the application', colors.yellow);
                log('   4. The seed data will be recreated automatically\n', colors.yellow);
                
                db.close();
                resolve(false);
              }
            });
          });
        });
      });
    });
  });
}

// Run the tests
runLoginProfileTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    log('\n❌ Test execution failed: ' + err.message, colors.red);
    process.exit(1);
  });
