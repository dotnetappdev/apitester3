// Enhanced database manager with SQLite backend via Electron IPC
// This replaces the mock implementation with actual database operations

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

export interface Permission {
  id: number;
  userId: number;
  collectionId: number;
  permission: 'read' | 'write' | 'admin';
}

export class DatabaseManager {
  async initialize(): Promise<void> {
    // Database initialization is handled by the main process
    console.log('Database manager initialized - using SQLite backend');
    return Promise.resolve();
  }

  // User operations
  async getAllUsers(): Promise<User[]> {
    return await window.electronAPI.dbGetAllUsers();
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return await window.electronAPI.dbGetUserByUsername(username);
  }

  async createUser(username: string, password: string, role: 'admin' | 'standard' = 'standard'): Promise<number> {
    return await window.electronAPI.dbCreateUser(username, password, role);
  }

  async verifyPassword(username: string, password: string): Promise<User | null> {
    return await window.electronAPI.dbVerifyPassword(username, password);
  }

  async resetPassword(username: string, newPassword: string): Promise<boolean> {
    return await window.electronAPI.dbResetPassword(username, newPassword);
  }

  // Collection operations
  async getUserCollections(userId: number): Promise<Collection[]> {
    return await window.electronAPI.dbGetUserCollections(userId);
  }

  async createCollection(name: string, description: string, ownerId: number): Promise<number> {
    return await window.electronAPI.dbCreateCollection(name, description, ownerId);
  }

  async updateCollection(id: number, updates: Partial<Collection>): Promise<void> {
    return await window.electronAPI.dbUpdateCollection(id, updates);
  }

  async deleteCollection(id: number): Promise<void> {
    return await window.electronAPI.dbDeleteCollection(id);
  }

  // Request operations
  async getCollectionRequests(collectionId: number): Promise<Request[]> {
    return await window.electronAPI.dbGetCollectionRequests(collectionId);
  }

  async createRequest(request: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    return await window.electronAPI.dbCreateRequest(request);
  }

  async updateRequest(id: number, request: Partial<Request>): Promise<void> {
    return await window.electronAPI.dbUpdateRequest(id, request);
  }

  async deleteRequest(id: number): Promise<void> {
    return await window.electronAPI.dbDeleteRequest(id);
  }

  // Test result operations
  async saveTestResult(result: Omit<TestResult, 'id' | 'runAt'>): Promise<number> {
    return await window.electronAPI.dbSaveTestResult(result);
  }

  async getTestResults(requestId: number, limit: number = 50): Promise<TestResult[]> {
    return await window.electronAPI.dbGetTestResults(requestId, limit);
  }

  // Test suite operations (not in original interface but adding for completeness)
  async saveTestSuite(testSuite: any): Promise<number> {
    return await window.electronAPI.dbSaveTestSuite(testSuite);
  }

  async getTestSuites(requestId: number): Promise<any[]> {
    return await window.electronAPI.dbGetTestSuites(requestId);
  }

  async updateTestSuite(id: number, updates: any): Promise<void> {
    return await window.electronAPI.dbUpdateTestSuite(id, updates);
  }

  async deleteTestSuite(id: number): Promise<void> {
    return await window.electronAPI.dbDeleteTestSuite(id);
  }

  async close(): Promise<void> {
    // Database closing is handled by the main process
    return Promise.resolve();
  }
}