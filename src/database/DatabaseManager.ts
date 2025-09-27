// Enhanced database manager with AES encryption and seed data
// Mock implementation forRenderer process - production would use SQLite in main process
import CryptoJS from 'crypto-js';

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
  private static readonly ENCRYPTION_KEY = 'APITester3-SecureKey-256bit-ForPasswordEncryption-Change-In-Production';
  private seedUsers: User[] = [];

  constructor() {
    this.initializeSeedData();
  }

  private initializeSeedData(): void {
    // Generate secure seed data with AES-encrypted passwords
    const currentDate = new Date().toISOString();
    
    this.seedUsers = [
      {
        id: 1,
        username: 'admin',
        passwordHash: this.encryptPassword('admin123'),
        salt: this.generateSalt(),
        role: 'admin',
        createdAt: currentDate
      },
      {
        id: 2,
        username: 'testuser',
        passwordHash: this.encryptPassword('password123'),
        salt: this.generateSalt(),
        role: 'standard',
        createdAt: currentDate
      },
      {
        id: 3,
        username: 'developer',
        passwordHash: this.encryptPassword('dev2024!'),
        salt: this.generateSalt(),
        role: 'standard',
        createdAt: currentDate
      },
      {
        id: 4,
        username: 'qa_lead',
        passwordHash: this.encryptPassword('quality123'),
        salt: this.generateSalt(),
        role: 'admin',
        createdAt: currentDate
      },
      {
        id: 5,
        username: 'api_tester',
        passwordHash: this.encryptPassword('testing456'),
        salt: this.generateSalt(),
        role: 'standard',
        createdAt: currentDate
      }
    ];
  }

  private generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128/8).toString();
  }

  private encryptPassword(password: string): string {
    // AES-256 encryption with secure key
    const encrypted = CryptoJS.AES.encrypt(password, DatabaseManager.ENCRYPTION_KEY).toString();
    return encrypted;
  }

  private decryptPassword(encryptedPassword: string): string {
    const decrypted = CryptoJS.AES.decrypt(encryptedPassword, DatabaseManager.ENCRYPTION_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  private checkPassword(password: string, encryptedPassword: string): boolean {
    try {
      const decryptedPassword = this.decryptPassword(encryptedPassword);
      return password === decryptedPassword;
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  }

  async initialize(): Promise<void> {
    // Mock initialization - in production this would set up SQLite database
    console.log('Database initialized with seed data');
    return Promise.resolve();
  }

  async getAllUsers(): Promise<User[]> {
    // Return seed users
    return [...this.seedUsers];
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const user = this.seedUsers.find(u => u.username === username);
    return user || null;
  }

  async createUser(username: string, password: string, role: 'admin' | 'standard' = 'standard'): Promise<number> {
    const newUser: User = {
      id: this.seedUsers.length + 1,
      username,
      passwordHash: this.encryptPassword(password),
      salt: this.generateSalt(),
      role,
      createdAt: new Date().toISOString()
    };
    
    this.seedUsers.push(newUser);
    return newUser.id;
  }

  async verifyPassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = this.checkPassword(password, user.passwordHash);
    
    if (isValid) {
      // Update last login
      user.lastLogin = new Date().toISOString();
      return user;
    }
    
    return null;
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

  async createCollection(_name: string, _description: string, _ownerId: number): Promise<number> {
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

  async createRequest(_request: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    return Date.now();
  }

  async updateRequest(_id: number, _request: Partial<Request>): Promise<void> {
    // Mock update
    return Promise.resolve();
  }

  async saveTestResult(_result: Omit<TestResult, 'id' | 'runAt'>): Promise<number> {
    return Date.now();
  }

  async getTestResults(requestId: number, _limit: number = 50): Promise<TestResult[]> {
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