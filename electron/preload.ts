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
      removeAllListeners: (channel: string) => void;
      platform: string;
      version: string;
    };
  }
}