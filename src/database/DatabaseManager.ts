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

export interface Project {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  collections?: Collection[];
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: number;
  teamId: number;
  userId: number;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface Collection {
  id: number;
  projectId: number; // Link to parent project
  name: string;
  description?: string;
  ownerId: number;
  teamId?: number; // Optional team association
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

  // Team operations
  async createTeam(name: string, description: string, ownerId: number): Promise<number> {
    return await window.electronAPI.dbCreateTeam(name, description, ownerId);
  }

  async getUserTeams(userId: number): Promise<Team[]> {
    return await window.electronAPI.dbGetUserTeams(userId);
  }

  async getTeamById(teamId: number): Promise<Team | null> {
    return await window.electronAPI.dbGetTeamById(teamId);
  }

  async updateTeam(id: number, updates: Partial<Team>): Promise<void> {
    return await window.electronAPI.dbUpdateTeam(id, updates);
  }

  async deleteTeam(id: number): Promise<void> {
    return await window.electronAPI.dbDeleteTeam(id);
  }

  async addTeamMember(teamId: number, userId: number, role: 'admin' | 'member' | 'viewer' = 'member'): Promise<void> {
    return await window.electronAPI.dbAddTeamMember(teamId, userId, role);
  }

  async removeTeamMember(teamId: number, userId: number): Promise<void> {
    return await window.electronAPI.dbRemoveTeamMember(teamId, userId);
  }

  async updateTeamMemberRole(teamId: number, userId: number, role: 'admin' | 'member' | 'viewer'): Promise<void> {
    return await window.electronAPI.dbUpdateTeamMemberRole(teamId, userId, role);
  }

  async getTeamCollections(teamId: number): Promise<Collection[]> {
    return await window.electronAPI.dbGetTeamCollections(teamId);
  }

  async assignCollectionToTeam(collectionId: number, teamId: number): Promise<void> {
    return await window.electronAPI.dbAssignCollectionToTeam(collectionId, teamId);
  }

  async removeCollectionFromTeam(collectionId: number): Promise<void> {
    return await window.electronAPI.dbRemoveCollectionFromTeam(collectionId);
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

  // Project operations
  async createProject(name: string, description: string, ownerId: number): Promise<number> {
    return await window.electronAPI.dbCreateProject({ name, description, ownerId });
  }

  async getUserProjects(userId: number): Promise<Project[]> {
    return await window.electronAPI.dbGetUserProjects(userId);
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<void> {
    return await window.electronAPI.dbUpdateProject(id, updates);
  }

  async deleteProject(id: number): Promise<void> {
    return await window.electronAPI.dbDeleteProject(id);
  }

  async getProjectCollections(projectId: number): Promise<Collection[]> {
    return await window.electronAPI.dbGetProjectCollections(projectId);
  }

  async close(): Promise<void> {
    // Database closing is handled by the main process
    return Promise.resolve();
  }
}