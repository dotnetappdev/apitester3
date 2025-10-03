import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { app } from 'electron';
import CryptoJS from 'crypto-js';

// Import interfaces from the renderer process types
export interface User {
  id: number;
  username: string;
  passwordHash: string;
  salt: string;
  role: 'admin' | 'standard';
  profilePicture?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Collection {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Request {
  id: number;
  collectionId: number;
  name: string;
  method: string;
  url: string;
  headers: string; // JSON string
  body?: string;
  params: string; // JSON string
  auth: string; // JSON string
  tests?: string; // JSON string for test scripts
  soap?: string; // JSON string for SOAP-specific configuration
  grpc?: string; // JSON string for gRPC-specific configuration
  createdAt: string;
  updatedAt: string;
}

export interface TestResult {
  id: number;
  requestId: number;
  status: 'pass' | 'fail';
  responseTime: number;
  statusCode: number;
  message?: string;
  runAt: string;
}

export interface TestSuite {
  id: number;
  requestId: number;
  name: string;
  testCases: string; // JSON string of test cases
  beforeEach?: string; // Setup script
  afterEach?: string;  // Cleanup script
  createdAt: string;
  updatedAt: string;
}

export class SqliteDatabaseManager {
  private static readonly ENCRYPTION_KEY = 'APITester3-SecureKey-256bit-ForPasswordEncryption-Change-In-Production';
  private db: Database | null = null;
  private dbPath: string;

  constructor() {
    // Store database in user data directory
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'apitester3.db');
  }

  async initialize(): Promise<void> {
    // Open database connection
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await this.db.exec('PRAGMA foreign_keys = ON;');

    // Create tables
    await this.createTables();
    
    // Initialize seed data if database is empty
    await this.initializeSeedData();
    
    console.log('SQLite database initialized at:', this.dbPath);
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Users table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        salt TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'standard')) DEFAULT 'standard',
        profilePicture TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastLogin DATETIME
      )
    `);

    // Collections table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        ownerId INTEGER NOT NULL,
        isShared BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users (id)
      )
    `);

    // Requests table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collectionId INTEGER NOT NULL,
        name TEXT NOT NULL,
        method TEXT NOT NULL,
        url TEXT NOT NULL,
        headers TEXT,
        body TEXT,
        params TEXT,
        auth TEXT,
        tests TEXT,
        soap TEXT,
        grpc TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (collectionId) REFERENCES collections (id)
      )
    `);

    // Test results table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS test_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requestId INTEGER NOT NULL,
        status TEXT CHECK(status IN ('pass', 'fail')) NOT NULL,
        responseTime INTEGER NOT NULL,
        statusCode INTEGER,
        message TEXT,
        runAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requestId) REFERENCES requests (id)
      )
    `);

    // Test suites table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS test_suites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requestId INTEGER NOT NULL,
        name TEXT NOT NULL,
        testCases TEXT NOT NULL,
        beforeEach TEXT,
        afterEach TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requestId) REFERENCES requests (id)
      )
    `);
  }

  private async initializeSeedData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const currentDate = new Date().toISOString();
    
    // Check if users already exist
    const userCount = await this.db.get('SELECT COUNT(*) as count FROM users');
    const shouldSeedUsers = userCount.count === 0;
    
    // Seed users if needed
    if (shouldSeedUsers) {
      // Insert seed users
      const seedUsers = [
        {
          username: 'admin',
          password: 'admin123',
          role: 'admin'
        },
        {
          username: 'testuser',
          password: 'password123',
          role: 'standard'
        },
        {
          username: 'developer',
          password: 'dev2024!',
          role: 'standard'
        },
        {
          username: 'qa_lead',
          password: 'quality123',
          role: 'admin'
        },
        {
          username: 'api_tester',
          password: 'testing456',
          role: 'standard'
        }
      ];

      for (const user of seedUsers) {
        const salt = this.generateSalt();
        await this.db.run(
          'INSERT INTO users (username, passwordHash, salt, role, createdAt) VALUES (?, ?, ?, ?, ?)',
          [
            user.username,
            this.hashPassword(user.password, salt),
            salt,
            user.role,
            currentDate
          ]
        );
      }
      console.log(`✓ Seeded ${seedUsers.length} users`);
    }

    // Check if collections already exist
    const collectionCount = await this.db.get('SELECT COUNT(*) as count FROM collections');
    const shouldSeedCollections = collectionCount.count === 0;

    // Seed collections and requests if needed
    if (shouldSeedCollections) {
      // Seed collections for demo purposes
      const seedCollections = [
        {
          name: 'JSONPlaceholder API Tests',
          description: 'Sample API requests using jsonplaceholder.typicode.com',
          ownerId: 1, // admin user
          isShared: true
        },
        {
          name: 'User Management APIs',
          description: 'Test collection for user-related endpoints',
          ownerId: 3, // developer user
          isShared: false
        }
      ];

      const collectionIds: number[] = [];
      for (const collection of seedCollections) {
        const result = await this.db.run(
          'INSERT INTO collections (name, description, ownerId, isShared, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
          [
            collection.name,
            collection.description,
            collection.ownerId,
            collection.isShared ? 1 : 0,
            currentDate,
            currentDate
          ]
        );
        collectionIds.push(result.lastID!);
        }

      // Seed requests with jsonplaceholder examples
      const seedRequests = [
      {
        collectionId: collectionIds[0],
        name: 'Get All Posts',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts',
        headers: JSON.stringify({ 'Content-Type': 'application/json' }),
        body: '',
        params: JSON.stringify({}),
        auth: JSON.stringify({ type: 'none' }),
        tests: `// Example test assertions
assert.assertStatusCode(200, response);
assert.assertResponseTime(2000, response.time);
assert.assertJsonPath('$[0].userId', 1, response.data);
console.log('✓ Successfully retrieved posts');`
      },
      {
        collectionId: collectionIds[0],
        name: 'Get Post by ID',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        headers: JSON.stringify({ 'Content-Type': 'application/json' }),
        body: '',
        params: JSON.stringify({}),
        auth: JSON.stringify({ type: 'none' }),
        tests: `// Validate post response
assert.assertStatusCode(200, response);
assert.assertJsonPath('$.id', 1, response.data);
assert.assertJsonPath('$.userId', 1, response.data);
assert.assertType('string', response.data.title);
console.log('✓ Post retrieved successfully:', response.data.title);`
      },
      {
        collectionId: collectionIds[0],
        name: 'Create New Post',
        method: 'POST',
        url: 'https://jsonplaceholder.typicode.com/posts',
        headers: JSON.stringify({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          title: 'Test Post',
          body: 'This is a test post created via VerifyApi',
          userId: 1
        }, null, 2),
        params: JSON.stringify({}),
        auth: JSON.stringify({ type: 'none' }),
        tests: `// Validate post creation
assert.assertStatusCode(201, response);
assert.assertJsonPath('$.title', 'Test Post', response.data);
assert.assertJsonPath('$.body', 'This is a test post created via VerifyApi', response.data);
assert.assertJsonPath('$.userId', 1, response.data);
assert.assertType('number', response.data.id);
console.log('✓ Post created with ID:', response.data.id);`
      },
      {
        collectionId: collectionIds[0],
        name: 'Update Post',
        method: 'PUT',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        headers: JSON.stringify({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          id: 1,
          title: 'Updated Post Title',
          body: 'Updated post content',
          userId: 1
        }, null, 2),
        params: JSON.stringify({}),
        auth: JSON.stringify({ type: 'none' }),
        tests: `// Validate post update
assert.assertStatusCode(200, response);
assert.assertJsonPath('$.id', 1, response.data);
assert.assertJsonPath('$.title', 'Updated Post Title', response.data);
console.log('✓ Post updated successfully');`
      },
      {
        collectionId: collectionIds[0],
        name: 'Delete Post',
        method: 'DELETE',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        headers: JSON.stringify({ 'Content-Type': 'application/json' }),
        body: '',
        params: JSON.stringify({}),
        auth: JSON.stringify({ type: 'none' }),
        tests: `// Validate deletion
assert.assertStatusCode(200, response);
console.log('✓ Post deleted successfully');`
      },
      {
        collectionId: collectionIds[0],
        name: 'Get All Users',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users',
        headers: JSON.stringify({ 'Content-Type': 'application/json' }),
        body: '',
        params: JSON.stringify({}),
        auth: JSON.stringify({ type: 'none' }),
        tests: `// Validate users list
assert.assertStatusCode(200, response);
assert.assertArrayLength(10, response.data);
assert.assertJsonPath('$[0].name', 'Leanne Graham', response.data);
console.log('✓ Retrieved', response.data.length, 'users');`
      },
      {
        collectionId: collectionIds[0],
        name: 'Get User Albums',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users/1/albums',
        headers: JSON.stringify({ 'Content-Type': 'application/json' }),
        body: '',
        params: JSON.stringify({}),
        auth: JSON.stringify({ type: 'none' }),
        tests: `// Validate user albums
assert.assertStatusCode(200, response);
assert.assertType('array', response.data);
assert.assertJsonPath('$[0].userId', 1, response.data);
console.log('✓ Retrieved', response.data.length, 'albums for user');`
      },
      {
        collectionId: collectionIds[1],
        name: 'Search Users by Name',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users?username=Bret',
        headers: JSON.stringify({ 'Content-Type': 'application/json' }),
        body: '',
        params: JSON.stringify({ username: 'Bret' }),
        auth: JSON.stringify({ type: 'none' }),
        tests: `// Validate user search
assert.assertStatusCode(200, response);
assert.assertType('array', response.data);
if (response.data.length > 0) {
  assert.assertJsonPath('$[0].username', 'Bret', response.data);
  console.log('✓ Found user:', response.data[0].name);
}`
      }
    ];

    for (const request of seedRequests) {
      await this.db.run(
        'INSERT INTO requests (collectionId, name, method, url, headers, body, params, auth, tests, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          request.collectionId,
          request.name,
          request.method,
          request.url,
          request.headers,
          request.body,
          request.params,
          request.auth,
          request.tests,
          currentDate,
          currentDate
        ]
      );
    }

      console.log('✓ Seeded 2 collections');
      console.log('✓ Seeded 8 sample requests');
    }

    console.log('Seed data initialization complete');
  }

  private generateSalt(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  private hashPassword(password: string, salt: string): string {
    // Use PBKDF2 with 600,000 iterations for strong password hashing
    const hash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 600000,
      hasher: CryptoJS.algo.SHA256
    });
    return hash.toString();
  }

  private checkPassword(password: string, storedHash: string, salt: string): boolean {
    try {
      const testHash = this.hashPassword(password, salt);
      return testHash === storedHash;
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  }

  // User operations
  async getAllUsers(): Promise<User[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.all('SELECT * FROM users ORDER BY username');
  }

  async getUserByUsername(username: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');
    const user = await this.db.get('SELECT * FROM users WHERE username = ?', [username]);
    return user || null;
  }

  async createUser(username: string, password: string, role: 'admin' | 'standard' = 'standard'): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const salt = this.generateSalt();
    const result = await this.db.run(
      'INSERT INTO users (username, passwordHash, salt, role, createdAt) VALUES (?, ?, ?, ?, ?)',
      [
        username,
        this.hashPassword(password, salt),
        salt,
        role,
        new Date().toISOString()
      ]
    );
    
    return result.lastID!;
  }

  async verifyPassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = this.checkPassword(password, user.passwordHash, user.salt);
    
    if (isValid) {
      // Update last login
      if (this.db) {
        await this.db.run(
          'UPDATE users SET lastLogin = ? WHERE id = ?',
          [new Date().toISOString(), user.id]
        );
        user.lastLogin = new Date().toISOString();
      }
      return user;
    }
    
    return null;
  }

  async resetPassword(username: string, newPassword: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    
    const user = await this.getUserByUsername(username);
    if (!user) return false;
    
    const salt = this.generateSalt();
    const hashedPassword = this.hashPassword(newPassword, salt);
    
    const result = await this.db.run(
      'UPDATE users SET passwordHash = ?, salt = ? WHERE username = ?',
      [hashedPassword, salt, username]
    );
    
    return result.changes! > 0;
  }

  // Collection operations
  async getUserCollections(userId: number): Promise<Collection[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.all(
      'SELECT * FROM collections WHERE ownerId = ? OR isShared = 1 ORDER BY name',
      [userId]
    );
  }

  async createCollection(name: string, description: string, ownerId: number): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const currentDate = new Date().toISOString();
    const result = await this.db.run(
      'INSERT INTO collections (name, description, ownerId, isShared, createdAt, updatedAt) VALUES (?, ?, ?, 0, ?, ?)',
      [name, description, ownerId, currentDate, currentDate]
    );
    
    return result.lastID!;
  }

  async updateCollection(id: number, updates: Partial<Collection>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const currentDate = new Date().toISOString();
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.isShared !== undefined) {
      updateFields.push('isShared = ?');
      values.push(updates.isShared ? 1 : 0);
    }
    
    updateFields.push('updatedAt = ?');
    values.push(currentDate);
    values.push(id);
    
    await this.db.run(
      `UPDATE collections SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteCollection(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    // Delete all requests in this collection first
    await this.db.run('DELETE FROM requests WHERE collectionId = ?', [id]);
    
    // Delete the collection
    await this.db.run('DELETE FROM collections WHERE id = ?', [id]);
  }

  // Request operations
  async getCollectionRequests(collectionId: number): Promise<Request[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.all(
      'SELECT * FROM requests WHERE collectionId = ? ORDER BY name',
      [collectionId]
    );
  }

  async createRequest(request: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const currentDate = new Date().toISOString();
    const result = await this.db.run(
      'INSERT INTO requests (collectionId, name, method, url, headers, body, params, auth, tests, soap, grpc, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        request.collectionId,
        request.name,
        request.method,
        request.url,
        request.headers,
        request.body || '',
        request.params,
        request.auth,
        request.tests || '',
        request.soap || '',
        request.grpc || '',
        currentDate,
        currentDate
      ]
    );
    
    return result.lastID!;
  }

  async updateRequest(id: number, request: Partial<Request>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const currentDate = new Date().toISOString();
    const updateFields: string[] = [];
    const values: any[] = [];
    
    const fields = ['name', 'method', 'url', 'headers', 'body', 'params', 'auth', 'tests', 'soap', 'grpc'];
    
    for (const field of fields) {
      if (request[field as keyof Request] !== undefined) {
        updateFields.push(`${field} = ?`);
        values.push(request[field as keyof Request]);
      }
    }
    
    updateFields.push('updatedAt = ?');
    values.push(currentDate);
    values.push(id);
    
    await this.db.run(
      `UPDATE requests SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteRequest(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    // Delete test results first
    await this.db.run('DELETE FROM test_results WHERE requestId = ?', [id]);
    
    // Delete test suites
    await this.db.run('DELETE FROM test_suites WHERE requestId = ?', [id]);
    
    // Delete the request
    await this.db.run('DELETE FROM requests WHERE id = ?', [id]);
  }

  // Test result operations
  async saveTestResult(result: Omit<TestResult, 'id' | 'runAt'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const dbResult = await this.db.run(
      'INSERT INTO test_results (requestId, status, responseTime, statusCode, message, runAt) VALUES (?, ?, ?, ?, ?, ?)',
      [
        result.requestId,
        result.status,
        result.responseTime,
        result.statusCode,
        result.message || '',
        new Date().toISOString()
      ]
    );
    
    return dbResult.lastID!;
  }

  async getTestResults(requestId: number, limit: number = 50): Promise<TestResult[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.all(
      'SELECT * FROM test_results WHERE requestId = ? ORDER BY runAt DESC LIMIT ?',
      [requestId, limit]
    );
  }

  // Test suite operations
  async saveTestSuite(testSuite: Omit<TestSuite, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const currentDate = new Date().toISOString();
    const result = await this.db.run(
      'INSERT INTO test_suites (requestId, name, testCases, beforeEach, afterEach, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        testSuite.requestId,
        testSuite.name,
        testSuite.testCases,
        testSuite.beforeEach || '',
        testSuite.afterEach || '',
        currentDate,
        currentDate
      ]
    );
    
    return result.lastID!;
  }

  async getTestSuites(requestId: number): Promise<TestSuite[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.all(
      'SELECT * FROM test_suites WHERE requestId = ? ORDER BY name',
      [requestId]
    );
  }

  async updateTestSuite(id: number, updates: Partial<TestSuite>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const currentDate = new Date().toISOString();
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.testCases !== undefined) {
      updateFields.push('testCases = ?');
      values.push(updates.testCases);
    }
    if (updates.beforeEach !== undefined) {
      updateFields.push('beforeEach = ?');
      values.push(updates.beforeEach);
    }
    if (updates.afterEach !== undefined) {
      updateFields.push('afterEach = ?');
      values.push(updates.afterEach);
    }
    
    updateFields.push('updatedAt = ?');
    values.push(currentDate);
    values.push(id);
    
    await this.db.run(
      `UPDATE test_suites SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteTestSuite(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run('DELETE FROM test_suites WHERE id = ?', [id]);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}