// Mock database manager for renderer process
// Real implementation will be in the main Electron process

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
  requests?: Request[];
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

export interface Permission {
  id: number;
  userId: number;
  collectionId: number;
  permission: 'read' | 'write' | 'admin';
}

export class DatabaseManager {
  async initialize(): Promise<void> {
    // This will be implemented via IPC to main process
    return Promise.resolve();
  }

  async getAllUsers(): Promise<User[]> {
    // Mock data for now
    return [
      {
        id: 1,
        username: 'admin',
        passwordHash: 'mock',
        salt: 'mock',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        username: 'user',
        passwordHash: 'mock',
        salt: 'mock',
        role: 'standard',
        createdAt: new Date().toISOString()
      }
    ];
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find(u => u.username === username) || null;
  }

  async createUser(username: string, password: string, role: 'admin' | 'standard' = 'standard'): Promise<number> {
    // Mock implementation
    return Date.now();
  }

  async verifyPassword(username: string, password: string): Promise<User | null> {
    // Mock verification - accept any password for demo
    const user = await this.getUserByUsername(username);
    return user;
  }

  async getUserCollections(userId: number): Promise<Collection[]> {
    // Mock collections
    return [
      {
        id: 1,
        name: 'My API Collection',
        description: 'Sample collection for testing',
        ownerId: userId,
        isShared: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requests: []
      }
    ];
  }

  async createCollection(name: string, description: string, ownerId: number): Promise<number> {
    return Date.now();
  }

  async getCollectionRequests(collectionId: number): Promise<Request[]> {
    // Mock requests
    return [
      {
        id: 1,
        collectionId,
        name: 'Sample GET Request',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        headers: JSON.stringify({ 'Content-Type': 'application/json' }),
        body: '',
        params: JSON.stringify({}),
        auth: JSON.stringify({ type: 'none' }),
        tests: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async createRequest(request: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    return Date.now();
  }

  async updateRequest(id: number, request: Partial<Request>): Promise<void> {
    // Mock update
    return Promise.resolve();
  }

  async saveTestResult(result: Omit<TestResult, 'id' | 'runAt'>): Promise<number> {
    return Date.now();
  }

  async getTestResults(requestId: number, limit: number = 50): Promise<TestResult[]> {
    // Mock test results
    return [
      {
        id: 1,
        requestId,
        status: 'pass',
        responseTime: 145,
        statusCode: 200,
        message: 'Request succeeded',
        runAt: new Date().toISOString()
      }
    ];
  }

  async close(): Promise<void> {
    return Promise.resolve();
  }
}