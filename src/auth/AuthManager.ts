import { DatabaseManager, User } from '../database/DatabaseManager';

export interface UserSession {
  user: User;
  loginTime: Date;
  isActive: boolean;
}

export class AuthManager {
  private static instance: AuthManager;
  private currentSession: UserSession | null = null;
  private dbManager: DatabaseManager;
  private sessionListeners: ((session: UserSession | null) => void)[] = [];

  private constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  static getInstance(dbManager: DatabaseManager): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager(dbManager);
    }
    return AuthManager.instance;
  }

  async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await this.dbManager.verifyPassword(username, password);
      
      if (user) {
        this.currentSession = {
          user,
          loginTime: new Date(),
          isActive: true
        };
        
        this.notifySessionChange();
        
        return { success: true, user };
      } else {
        return { success: false, error: 'Invalid username or password' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed: ' + (error as Error).message };
    }
  }

  logout(): void {
    this.currentSession = null;
    this.notifySessionChange();
  }

  getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return this.currentSession !== null && this.currentSession.isActive;
  }

  isAdmin(): boolean {
    return this.currentSession?.user.role === 'admin';
  }

  canAccessCollection(_collectionId: number, ownerId: number): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Admin can access everything
    if (user.role === 'admin') return true;
    
    // Owner can access their own collections
    if (user.id === ownerId) return true;
    
    // TODO: Check permissions table for shared collections
    return false;
  }

  canModifyCollection(_collectionId: number, ownerId: number): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Admin can modify everything
    if (user.role === 'admin') return true;
    
    // Owner can modify their own collections
    if (user.id === ownerId) return true;
    
    // TODO: Check write permissions for shared collections
    return false;
  }

  async getAllProfiles(): Promise<User[]> {
    try {
      return await this.dbManager.getAllUsers();
    } catch (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }
  }

  async createProfile(username: string, password: string, role: 'admin' | 'standard' = 'standard'): Promise<{ success: boolean; error?: string }> {
    const currentUser = this.getCurrentUser();
    
    // Only admins can create new profiles
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Only administrators can create new profiles' };
    }

    try {
      await this.dbManager.createUser(username, password, role);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to create profile: ' + (error as Error).message };
    }
  }

  async resetPassword(username: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const success = await this.dbManager.resetPassword(username, newPassword);
      if (success) {
        return { success: true };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to reset password: ' + (error as Error).message };
    }
  }

  onSessionChange(callback: (session: UserSession | null) => void): () => void {
    this.sessionListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.sessionListeners = this.sessionListeners.filter(cb => cb !== callback);
    };
  }

  private notifySessionChange(): void {
    this.sessionListeners.forEach(callback => {
      callback(this.currentSession);
    });
  }

  // Session management for security
  refreshSession(): void {
    if (this.currentSession) {
      this.currentSession.loginTime = new Date();
    }
  }

  isSessionExpired(maxHours: number = 24): boolean {
    if (!this.currentSession) return true;
    
    const now = new Date();
    const sessionAge = (now.getTime() - this.currentSession.loginTime.getTime()) / (1000 * 60 * 60);
    
    return sessionAge > maxHours;
  }

  validateSession(): boolean {
    if (!this.currentSession) return false;
    
    if (this.isSessionExpired()) {
      this.logout();
      return false;
    }
    
    return true;
  }
}