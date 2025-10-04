#!/usr/bin/env node

/**
 * Diagnostic script to verify database initialization and seed data
 * This script provides detailed diagnostics and troubleshooting
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');
const fs = require('fs');

console.log('═══════════════════════════════════════════════════════════');
console.log('🔍 Database Diagnostic Tool');
console.log('═══════════════════════════════════════════════════════════\n');

// Determine the database path (matches the path used in the Electron app)
let dbPath;
if (process.platform === 'darwin') {
  dbPath = path.join(os.homedir(), 'Library', 'Application Support', 'verifyapi', 'apitester3.db');
} else if (process.platform === 'win32') {
  dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'verifyapi', 'apitester3.db');
} else {
  dbPath = path.join(os.homedir(), '.config', 'verifyapi', 'apitester3.db');
}

console.log('📍 Expected Database Location:');
console.log('   ' + dbPath);
console.log('');

// Check if database file exists
if (!fs.existsSync(dbPath)) {
  console.log('❌ Database file does NOT exist');
  console.log('');
  console.log('🔧 This is likely because:');
  console.log('   1. The application has never been run');
  console.log('   2. The database was deleted manually');
  console.log('   3. The application failed to initialize');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('   1. Build the application: npm run build');
  console.log('   2. Run the application: npm run dev');
  console.log('   3. Check the console logs for errors');
  console.log('   4. Run this diagnostic script again');
  console.log('');
  process.exit(1);
}

console.log('✅ Database file exists');
console.log('');

// Check file size
const stats = fs.statSync(dbPath);
console.log('📊 Database File Info:');
console.log(`   Size: ${stats.size} bytes`);
console.log(`   Created: ${stats.birthtime.toISOString()}`);
console.log(`   Modified: ${stats.mtime.toISOString()}`);
console.log('');

if (stats.size < 1000) {
  console.log('⚠️  WARNING: Database file is very small (< 1KB)');
  console.log('   This might indicate an empty or corrupted database');
  console.log('');
}

// Open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    console.log('');
    console.log('🔧 The database file exists but cannot be opened.');
    console.log('   This indicates corruption or permission issues.');
    console.log('');
    console.log('📋 Recommended Actions:');
    console.log('   1. Close the application if it\'s running');
    console.log('   2. Delete the database file:');
    console.log('      ' + dbPath);
    console.log('   3. Restart the application');
    console.log('');
    process.exit(1);
  }
  
  console.log('✅ Successfully opened database connection');
  console.log('');
  runDiagnostics();
});

function runDiagnostics() {
  console.log('🔬 Running Diagnostics...');
  console.log('');
  
  // Check tables exist
  db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, tables) => {
    if (err) {
      console.error('❌ Error querying tables:', err.message);
      db.close();
      process.exit(1);
    }
    
    console.log('📋 Database Tables:');
    if (tables.length === 0) {
      console.log('   ❌ No tables found! Database is empty.');
      console.log('');
      console.log('🔧 This indicates the initialization failed or was interrupted.');
      console.log('   The tables should have been created but weren\'t.');
      db.close();
      process.exit(1);
    }
    
    tables.forEach(table => {
      console.log(`   ✓ ${table.name}`);
    });
    console.log('');
    
    // Expected tables
    const expectedTables = ['users', 'collections', 'requests', 'test_results', 'test_suites'];
    const foundTables = tables.map(t => t.name);
    const missingTables = expectedTables.filter(t => !foundTables.includes(t));
    
    if (missingTables.length > 0) {
      console.log('⚠️  WARNING: Missing expected tables:');
      missingTables.forEach(t => console.log(`   - ${t}`));
      console.log('');
    }
    
    // Check data in each table
    checkTableData();
  });
}

function checkTableData() {
  const checks = [
    { table: 'users', expected: 5, key: 'username' },
    { table: 'collections', expected: 3, key: 'name' },
    { table: 'requests', expected: 14, key: 'name' }
  ];
  
  let completed = 0;
  let allPassed = true;
  
  checks.forEach(check => {
    db.all(`SELECT * FROM ${check.table}`, [], (err, rows) => {
      if (err) {
        console.log(`❌ Error querying ${check.table}:`, err.message);
        allPassed = false;
      } else {
        console.log(`📊 ${check.table.toUpperCase()} Table:`);
        console.log(`   Found: ${rows.length} rows`);
        console.log(`   Expected: ${check.expected} rows`);
        
        if (rows.length === 0) {
          console.log(`   ❌ FAIL: No data found in ${check.table}`);
          console.log(`   🔧 Seed data was not initialized properly`);
          allPassed = false;
        } else if (rows.length < check.expected) {
          console.log(`   ⚠️  WARNING: Less data than expected`);
          allPassed = false;
        } else {
          console.log(`   ✅ PASS: Data count matches or exceeds expected`);
        }
        
        // Show sample data
        if (rows.length > 0 && rows.length <= 10) {
          console.log(`   Sample data:`);
          rows.forEach(row => {
            console.log(`      - ${row[check.key]} (ID: ${row.id})`);
          });
        }
        console.log('');
      }
      
      completed++;
      if (completed === checks.length) {
        finalizeDiagnostics(allPassed);
      }
    });
  });
}

function finalizeDiagnostics(allPassed) {
  db.close();
  
  console.log('═══════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('✅ ALL DIAGNOSTICS PASSED');
    console.log('');
    console.log('The database is properly initialized with seed data.');
    console.log('Login screen should show all 5 user profiles.');
    console.log('');
  } else {
    console.log('❌ DIAGNOSTICS FAILED');
    console.log('');
    console.log('🔧 Recommended Actions:');
    console.log('   1. Close the application if it\'s running');
    console.log('   2. Delete the database file:');
    console.log('      ' + dbPath);
    console.log('   3. Rebuild the application: npm run build');
    console.log('   4. Restart the application: npm run dev');
    console.log('   5. Check console logs for initialization errors');
    console.log('   6. Run this diagnostic script again');
    console.log('');
  }
  console.log('═══════════════════════════════════════════════════════════');
  
  process.exit(allPassed ? 0 : 1);
}
