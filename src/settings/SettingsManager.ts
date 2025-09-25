// Mock settings manager for renderer process
// Real implementation will be in the main Electron process

export interface AppSettings {
  theme: 'dark' | 'light';
  databasePath: string;
  autoSave: boolean;
  requestTimeout: number;
  maxResponseSize: number;
  enableSyntaxHighlighting: boolean;
  enableTestExplorer: boolean;
  splitterPosition: number;
  sidebarWidth: number;
  windowState: {
    width: number;
    height: number;
    x?: number;
    y?: number;
    isMaximized: boolean;
  };
  recentCollections: string[];
  defaultHeaders: Record<string, string>;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  databasePath: '',
  autoSave: true,
  requestTimeout: 30000,
  maxResponseSize: 10 * 1024 * 1024, // 10MB
  enableSyntaxHighlighting: true,
  enableTestExplorer: true,
  splitterPosition: 50,
  sidebarWidth: 300,
  windowState: {
    width: 1400,
    height: 900,
    isMaximized: false
  },
  recentCollections: [],
  defaultHeaders: {
    'User-Agent': 'API Tester 3'
  }
};

export class SettingsManager {
  private static instance: SettingsManager;
  private settings: AppSettings;
  private listeners: ((settings: AppSettings) => void)[] = [];

  private constructor() {
    this.settings = this.loadSettings();
  }

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  private loadSettings(): AppSettings {
    try {
      // Try to load from localStorage in browser environment
      const stored = localStorage.getItem('apitester-settings');
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    
    return { ...DEFAULT_SETTINGS };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('apitester-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  getSettings(): AppSettings {
    return { ...this.settings };
  }

  updateSettings(updates: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
    this.notifyListeners();
  }

  updateWindowState(windowState: Partial<AppSettings['windowState']>): void {
    this.settings.windowState = { ...this.settings.windowState, ...windowState };
    this.saveSettings();
  }

  setTheme(theme: 'dark' | 'light'): void {
    this.updateSettings({ theme });
  }

  getTheme(): 'dark' | 'light' {
    return this.settings.theme;
  }

  setDatabasePath(path: string): void {
    this.updateSettings({ databasePath: path });
  }

  getDatabasePath(): string {
    return this.settings.databasePath || 'default-path';
  }

  addRecentCollection(collectionName: string): void {
    const recent = this.settings.recentCollections.filter(name => name !== collectionName);
    recent.unshift(collectionName);
    this.updateSettings({ recentCollections: recent.slice(0, 10) }); // Keep only 10 recent
  }

  getRecentCollections(): string[] {
    return [...this.settings.recentCollections];
  }

  resetToDefaults(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
    this.notifyListeners();
  }

  onSettingsChange(callback: (settings: AppSettings) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      callback(this.settings);
    });
  }

  // Validation helpers
  validateSettings(settings: Partial<AppSettings>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (settings.requestTimeout !== undefined) {
      if (settings.requestTimeout < 1000 || settings.requestTimeout > 300000) {
        errors.push('Request timeout must be between 1 and 300 seconds');
      }
    }

    if (settings.maxResponseSize !== undefined) {
      if (settings.maxResponseSize < 1024 || settings.maxResponseSize > 100 * 1024 * 1024) {
        errors.push('Max response size must be between 1KB and 100MB');
      }
    }

    if (settings.splitterPosition !== undefined) {
      if (settings.splitterPosition < 10 || settings.splitterPosition > 90) {
        errors.push('Splitter position must be between 10% and 90%');
      }
    }

    if (settings.sidebarWidth !== undefined) {
      if (settings.sidebarWidth < 200 || settings.sidebarWidth > 800) {
        errors.push('Sidebar width must be between 200px and 800px');
      }
    }

    return { valid: errors.length === 0, errors };
  }
}