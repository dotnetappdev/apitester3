import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // API request methods
  makeApiRequest: (requestData: any) => ipcRenderer.invoke('make-api-request', requestData),
  makeSoapRequest: (requestData: any) => ipcRenderer.invoke('make-soap-request', requestData),
  makeGrpcRequest: (requestData: any) => ipcRenderer.invoke('make-grpc-request', requestData),
  
  // File operations
  saveCollection: (collectionData: any) => ipcRenderer.invoke('save-collection', collectionData),
  loadCollection: (filePath: string) => ipcRenderer.invoke('load-collection', filePath),
  
  // Import/Export operations
  exportCollection: (data: { collections: any[], testSuites: any[], exportedBy: string }) => 
    ipcRenderer.invoke('export-collection', data),
  importCollection: (options?: any) => ipcRenderer.invoke('import-collection', options),
  previewImport: () => ipcRenderer.invoke('preview-import'),
  
  // Menu event listeners
  onMenuNewRequest: (callback: () => void) => 
    ipcRenderer.on('menu-new-request', callback),
  onMenuNewCollection: (callback: () => void) =>
    ipcRenderer.on('menu-new-collection', callback),
  onMenuOpenCollection: (callback: () => void) => 
    ipcRenderer.on('menu-open-collection', callback),
  onMenuImportCollection: (callback: () => void) =>
    ipcRenderer.on('menu-import-collection', callback),
  onMenuExportCollection: (callback: () => void) =>
    ipcRenderer.on('menu-export-collection', callback),
  onMenuAbout: (callback: () => void) => 
    ipcRenderer.on('menu-about', callback),
  onMenuShowOverview: (callback: () => void) => 
    ipcRenderer.on('menu-show-overview', callback),
  onMenuShowUnitTesting: (callback: () => void) => 
    ipcRenderer.on('menu-show-unit-testing', callback),
  onMenuCodeGeneration: (callback: () => void) => 
    ipcRenderer.on('menu-code-generation', callback),
  
  // Code generation operations
  readTemplate: (templatePath: string) => ipcRenderer.invoke('read-template', templatePath),
  downloadGeneratedCode: (data: { files: any[], language: string }) => 
    ipcRenderer.invoke('download-generated-code', data),
  saveGeneratedCodeToDirectory: (data: { files: any[], language: string }) => 
    ipcRenderer.invoke('save-generated-code-to-directory', data),
  
  // Database operations
  // User operations
  dbGetAllUsers: () => ipcRenderer.invoke('db-get-all-users'),
  dbGetUserByUsername: (username: string) => ipcRenderer.invoke('db-get-user-by-username', username),
  dbCreateUser: (username: string, password: string, role: string) => 
    ipcRenderer.invoke('db-create-user', username, password, role),
  dbVerifyPassword: (username: string, password: string) => 
    ipcRenderer.invoke('db-verify-password', username, password),
  dbResetPassword: (username: string, newPassword: string) => 
    ipcRenderer.invoke('db-reset-password', username, newPassword),

  // Collection operations
  dbGetUserCollections: (userId: number) => ipcRenderer.invoke('db-get-user-collections', userId),
  dbCreateCollection: (name: string, description: string, ownerId: number) => 
    ipcRenderer.invoke('db-create-collection', name, description, ownerId),
  dbUpdateCollection: (id: number, updates: any) => 
    ipcRenderer.invoke('db-update-collection', id, updates),
  dbDeleteCollection: (id: number) => ipcRenderer.invoke('db-delete-collection', id),

  // Request operations
  dbGetCollectionRequests: (collectionId: number) => 
    ipcRenderer.invoke('db-get-collection-requests', collectionId),
  dbCreateRequest: (request: any) => ipcRenderer.invoke('db-create-request', request),
  dbUpdateRequest: (id: number, request: any) => 
    ipcRenderer.invoke('db-update-request', id, request),
  dbDeleteRequest: (id: number) => ipcRenderer.invoke('db-delete-request', id),

  // Test result operations
  dbSaveTestResult: (result: any) => ipcRenderer.invoke('db-save-test-result', result),
  dbGetTestResults: (requestId: number, limit?: number) => 
    ipcRenderer.invoke('db-get-test-results', requestId, limit),

  // Test suite operations
  dbSaveTestSuite: (testSuite: any) => ipcRenderer.invoke('db-save-test-suite', testSuite),
  dbGetTestSuites: (requestId: number) => ipcRenderer.invoke('db-get-test-suites', requestId),
  dbUpdateTestSuite: (id: number, updates: any) => 
    ipcRenderer.invoke('db-update-test-suite', id, updates),
  dbDeleteTestSuite: (id: number) => ipcRenderer.invoke('db-delete-test-suite', id),
  sendEmail: (data: { apiKey?: string; from: string; to: string | string[]; subject: string; text?: string; html?: string }) =>
    ipcRenderer.invoke('send-email', data),
  exportReportExcel: (data: { results: any[]; defaultName?: string }) => ipcRenderer.invoke('export-report-excel', data),
  exportReportPdf: (data: { htmlContent: string; defaultName?: string }) => ipcRenderer.invoke('export-report-pdf', data),
  
  // Remove listeners
  removeAllListeners: (channel: string) => 
    ipcRenderer.removeAllListeners(channel),
  
  // Platform info
  platform: process.platform,
  version: process.versions.electron
});

// Type definitions for the renderer process
declare global {
  interface Window {
    electronAPI: {
      makeApiRequest: (requestData: any) => Promise<any>;
      makeSoapRequest: (requestData: any) => Promise<any>;
      makeGrpcRequest: (requestData: any) => Promise<any>;
      saveCollection: (collectionData: any) => Promise<any>;
      loadCollection: (filePath: string) => Promise<any>;
      exportCollection: (data: { collections: any[], testSuites: any[], exportedBy: string }) => Promise<any>;
      importCollection: (options?: any) => Promise<any>;
      previewImport: () => Promise<any>;
      onMenuNewRequest: (callback: () => void) => void;
      onMenuNewCollection: (callback: () => void) => void;
      onMenuOpenCollection: (callback: () => void) => void;
      onMenuImportCollection: (callback: () => void) => void;
      onMenuExportCollection: (callback: () => void) => void;
      onMenuAbout: (callback: () => void) => void;
      onMenuShowOverview: (callback: () => void) => void;
      onMenuShowUnitTesting: (callback: () => void) => void;
      onMenuCodeGeneration: (callback: () => void) => void;
      readTemplate: (templatePath: string) => Promise<string>;
      downloadGeneratedCode: (data: { files: any[], language: string }) => Promise<any>;
      saveGeneratedCodeToDirectory: (data: { files: any[], language: string }) => Promise<any>;
      
      // Database operations
      dbGetAllUsers: () => Promise<any[]>;
      dbGetUserByUsername: (username: string) => Promise<any>;
      dbCreateUser: (username: string, password: string, role: string) => Promise<number>;
      dbVerifyPassword: (username: string, password: string) => Promise<any>;
      dbResetPassword: (username: string, newPassword: string) => Promise<boolean>;
      dbGetUserCollections: (userId: number) => Promise<any[]>;
      dbCreateCollection: (name: string, description: string, ownerId: number) => Promise<number>;
      dbUpdateCollection: (id: number, updates: any) => Promise<void>;
      dbDeleteCollection: (id: number) => Promise<void>;
      dbGetCollectionRequests: (collectionId: number) => Promise<any[]>;
      dbCreateRequest: (request: any) => Promise<number>;
      dbUpdateRequest: (id: number, request: any) => Promise<void>;
      dbDeleteRequest: (id: number) => Promise<void>;
      dbSaveTestResult: (result: any) => Promise<number>;
      dbGetTestResults: (requestId: number, limit?: number) => Promise<any[]>;
      dbSaveTestSuite: (testSuite: any) => Promise<number>;
      dbGetTestSuites: (requestId: number) => Promise<any[]>;
      dbUpdateTestSuite: (id: number, updates: any) => Promise<void>;
      dbDeleteTestSuite: (id: number) => Promise<void>;
  sendEmail: (data: { apiKey?: string; from: string; to: string | string[]; subject: string; text?: string; html?: string }) => Promise<any>;
      
      removeAllListeners: (channel: string) => void;
      platform: string;
      version: string;
    };
  }
}