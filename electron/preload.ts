import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // API request methods
  makeApiRequest: (requestData: any) => ipcRenderer.invoke('make-api-request', requestData),
  
  // File operations
  saveCollection: (collectionData: any) => ipcRenderer.invoke('save-collection', collectionData),
  loadCollection: (filePath: string) => ipcRenderer.invoke('load-collection', filePath),
  
  // Menu event listeners
  onMenuNewRequest: (callback: () => void) => 
    ipcRenderer.on('menu-new-request', callback),
  onMenuOpenCollection: (callback: () => void) => 
    ipcRenderer.on('menu-open-collection', callback),
  onMenuAbout: (callback: () => void) => 
    ipcRenderer.on('menu-about', callback),
  
  // Remove listeners
  removeAllListeners: (channel: string) => 
    ipcRenderer.removeAllListeners(channel),
  
  // Platform info
  platform: process.platform,
  version: process.versions.electron
});

// Define TypeScript interfaces for the exposed API
declare global {
  interface Window {
    electronAPI: {
      makeApiRequest: (requestData: any) => Promise<any>;
      saveCollection: (collectionData: any) => Promise<any>;
      loadCollection: (filePath: string) => Promise<any>;
      onMenuNewRequest: (callback: () => void) => void;
      onMenuOpenCollection: (callback: () => void) => void;
      onMenuAbout: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
      platform: string;
      version: string;
    };
  }
}