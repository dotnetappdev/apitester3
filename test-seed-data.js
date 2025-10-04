#!/usr/bin/env node

/**
 * Test script to verify seed data initialization
 * This script tests that the database is properly seeded with users, collections, and requests
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');

// Determine the database path (matches the path used in the Electron app)
let dbPath;
if (process.platform === 'darwin') {
  dbPath = path.join(os.homedir(), 'Library', 'Application Support', 'verifyapi', 'apitester3.db');
} else if (process.platform === 'win32') {
  dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'verifyapi', 'apitester3.db');
} else {
  dbPath = path.join(os.homedir(), '.config', 'verifyapi', 'apitester3.db');
}

console.log('Database path:', dbPath);
console.log('Testing seed data...\n');

// Open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    console.log('\n⚠️  Database file may not exist yet. Run the application first to create it.');
    process.exit(1);
  }
  
  console.log('✓ Database connection opened\n');
  runTests();
});

function runTests() {
  let allTestsPassed = true;
  
  // Test 1: Check if users table exists and has data
  db.all('SELECT * FROM users ORDER BY username', [], (err, users) => {
    if (err) {
      console.error('❌ Error querying users:', err.message);
      allTestsPassed = false;
      return;
    }
    
    console.log('📊 USERS TEST:');
    console.log(`   Found ${users.length} users`);
    
    const expectedUsers = ['admin', 'api_tester', 'developer', 'qa_lead', 'testuser'];
    const actualUsers = users.map(u => u.username).sort();
    
    if (users.length === 0) {
      console.log('   ❌ No users found in database!');
      console.log('   ⚠️  This means seed data was not initialized.');
      allTestsPassed = false;
    } else if (users.length === 5 && JSON.stringify(actualUsers) === JSON.stringify(expectedUsers)) {
      console.log('   ✓ All 5 expected users found:');
      users.forEach(u => {
        console.log(`      - ${u.username} (${u.role})`);
      });
    } else {
      console.log('   ⚠️  User count or names don\'t match expected values');
      console.log('   Expected:', expectedUsers);
      console.log('   Actual:', actualUsers);
    }
    console.log('');
    
    // Test 2: Check collections
    db.all('SELECT * FROM collections', [], (err, collections) => {
      if (err) {
        console.error('❌ Error querying collections:', err.message);
        allTestsPassed = false;
        return;
      }
      
      console.log('📊 COLLECTIONS TEST:');
      console.log(`   Found ${collections.length} collections`);
      
      const expectedCollections = [
        'JSONPlaceholder API Tests',
        'UI Test Examples',
        'Unit Test Examples'
      ];
      
      if (collections.length === 0) {
        console.log('   ❌ No collections found in database!');
        console.log('   ⚠️  Seed data for collections was not initialized.');
        allTestsPassed = false;
      } else if (collections.length === 3) {
        console.log('   ✓ All 3 expected collections found:');
        collections.forEach(c => {
          const shared = c.isShared ? 'shared' : 'private';
          console.log(`      - ${c.name} (${shared})`);
        });
      } else {
        console.log('   ⚠️  Collection count doesn\'t match expected (3)');
        collections.forEach(c => console.log(`      - ${c.name}`));
      }
      console.log('');
      
      // Test 3: Check requests
      db.all('SELECT * FROM requests', [], (err, requests) => {
        if (err) {
          console.error('❌ Error querying requests:', err.message);
          allTestsPassed = false;
          db.close();
          return;
        }
        
        console.log('📊 REQUESTS TEST:');
        console.log(`   Found ${requests.length} requests`);
        
        if (requests.length === 0) {
          console.log('   ❌ No requests found in database!');
          console.log('   ⚠️  Seed data for requests was not initialized.');
          allTestsPassed = false;
        } else if (requests.length >= 14) {
          console.log('   ✓ Expected number of requests found (14+)');
          
          // Group by collection
          const byCollection = {};
          requests.forEach(r => {
            if (!byCollection[r.collectionId]) byCollection[r.collectionId] = [];
            byCollection[r.collectionId].push(r);
          });
          
          Object.keys(byCollection).forEach(collId => {
            const collectionName = collections.find(c => c.id === parseInt(collId))?.name || 'Unknown';
            console.log(`      Collection "${collectionName}": ${byCollection[collId].length} requests`);
          });
        } else {
          console.log('   ⚠️  Request count is less than expected (14)');
        }
        console.log('');
        
        // Final summary
        db.close(() => {
          console.log('═══════════════════════════════════════');
          if (allTestsPassed && users.length === 5 && collections.length === 3 && requests.length >= 14) {
            console.log('✅ ALL TESTS PASSED!');
            console.log('   Seed data is properly initialized.');
            console.log('   Login screen should show all 5 profiles.');
            process.exit(0);
          } else {
            console.log('⚠️  SOME TESTS FAILED OR DATA INCOMPLETE');
            console.log('');
            console.log('To fix this issue:');
            console.log('1. Close the application if it\'s running');
            console.log('2. Delete the database file:');
            console.log(`   ${dbPath}`);
            console.log('3. Restart the application');
            console.log('4. The seed data will be recreated automatically');
            process.exit(1);
          }
        });
      });
    });
  });
}
