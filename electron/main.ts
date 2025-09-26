import { app, BrowserWindow, Menu, shell, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { promises as fs } from 'fs';
import { isDev } from './utils';
import { ElectronSoapClient } from './soapClient';
import { ElectronGrpcClient } from './grpcClient';

class AppManager {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    // Handle app events
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupMenu();
      this.setupIpcHandlers();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1000,
      minHeight: 600,
      show: false,
      icon: join(__dirname, '../../assets/icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js'),
        webSecurity: true
      },
      titleBarStyle: 'default',
      frame: true
    });

    // Load the app
    if (isDev()) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(join(__dirname, '../react/index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      
      if (isDev()) {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  private setupMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Request',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow?.webContents.send('menu-new-request');
            }
          },
          {
            label: 'New Collection',
            accelerator: 'CmdOrCtrl+Shift+N',
            click: () => {
              this.mainWindow?.webContents.send('menu-new-collection');
            }
          },
          { type: 'separator' },
          {
            label: 'Import Collection',
            accelerator: 'CmdOrCtrl+I',
            click: () => {
              this.mainWindow?.webContents.send('menu-import-collection');
            }
          },
          {
            label: 'Export Collection',
            accelerator: 'CmdOrCtrl+E',
            click: () => {
              this.mainWindow?.webContents.send('menu-export-collection');
            }
          },
          { type: 'separator' },
          {
            label: 'Code Generation',
            accelerator: 'CmdOrCtrl+G',
            click: () => {
              this.mainWindow?.webContents.send('menu-code-generation');
            }
          },
          { type: 'separator' },
          {
            label: 'Open Collection',
            accelerator: 'CmdOrCtrl+O',
            click: () => {
              this.mainWindow?.webContents.send('menu-open-collection');
            }
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Application Overview',
            click: () => {
              this.mainWindow?.webContents.send('menu-show-overview');
            }
          },
          {
            label: 'Unit Testing Documentation',
            click: () => {
              this.mainWindow?.webContents.send('menu-show-unit-testing');
            }
          },
          { type: 'separator' },
          {
            label: 'About API Tester 3',
            click: () => {
              this.mainWindow?.webContents.send('menu-about');
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupIpcHandlers(): void {
    // Handle API requests from renderer
    ipcMain.handle('make-api-request', async (event, requestData) => {
      // This will be implemented to handle API requests securely
      return { success: true, data: requestData };
    });

    // Handle SOAP requests
    ipcMain.handle('make-soap-request', async (event, requestData) => {
      try {
        return await ElectronSoapClient.makeRequest(requestData);
      } catch (error) {
        console.error('SOAP request failed:', error);
        return {
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          data: {
            error: true,
            message: error instanceof Error ? error.message : 'Unknown SOAP error'
          },
          responseTime: 0,
          size: 0
        };
      }
    });

    // Handle gRPC requests
    ipcMain.handle('make-grpc-request', async (event, requestData) => {
      try {
        return await ElectronGrpcClient.makeRequest(requestData);
      } catch (error) {
        console.error('gRPC request failed:', error);
        return {
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          data: {
            error: true,
            message: error instanceof Error ? error.message : 'Unknown gRPC error'
          },
          responseTime: 0,
          size: 0
        };
      }
    });

    // Handle file operations
    ipcMain.handle('save-collection', async (event, collectionData) => {
      // This will be implemented to save collections
      return { success: true };
    });

    ipcMain.handle('load-collection', async (event, filePath) => {
      // This will be implemented to load collections
      return { success: true };
    });

    // Handle export collection
    ipcMain.handle('export-collection', async (event, { collections, testSuites, exportedBy }) => {
      try {
        const result = await dialog.showSaveDialog(this.mainWindow!, {
          title: 'Export Collections',
          defaultPath: `api-collections-${new Date().toISOString().split('T')[0]}.apit`,
          filters: [
            { name: 'API Tester Collection', extensions: ['apit'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });

        if (result.canceled || !result.filePath) {
          return { success: false, canceled: true };
        }

        // Import the ImportExportManager functionality here
        // For now, we'll create a simple binary format
        const exportData = {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          collections,
          testSuites,
          exportedBy,
          metadata: {
            totalCollections: collections.length,
            totalRequests: collections.reduce((sum: number, col: any) => sum + (col.requests?.length || 0), 0),
            totalTestSuites: testSuites.length,
            exportedBy
          }
        };

        // Simple binary format: magic header + JSON data
        const jsonData = JSON.stringify(exportData);
        const header = Buffer.from('APITEXPORT', 'utf8');
        const data = Buffer.from(jsonData, 'utf8');
        const binary = Buffer.concat([header, Buffer.from([data.length >> 24, data.length >> 16, data.length >> 8, data.length]), data]);

        await fs.writeFile(result.filePath, binary);

        return { 
          success: true, 
          filePath: result.filePath,
          stats: exportData.metadata
        };
      } catch (error) {
        console.error('Export failed:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });

    // Handle import collection
    ipcMain.handle('import-collection', async (event, options = {}) => {
      try {
        const result = await dialog.showOpenDialog(this.mainWindow!, {
          title: 'Import Collections',
          filters: [
            { name: 'API Tester Collection', extensions: ['apit'] },
            { name: 'All Files', extensions: ['*'] }
          ],
          properties: ['openFile']
        });

        if (result.canceled || !result.filePaths.length) {
          return { success: false, canceled: true };
        }

        const filePath = result.filePaths[0];
        const binaryData = await fs.readFile(filePath);

        // Validate magic header
        const header = binaryData.slice(0, 10).toString('utf8');
        if (header !== 'APITEXPORT') {
          return { 
            success: false, 
            error: 'Invalid file format: Not an API Tester collection file' 
          };
        }

        // Read data length and content
        const dataLength = (binaryData[10] << 24) | (binaryData[11] << 16) | (binaryData[12] << 8) | binaryData[13];
        const jsonData = binaryData.slice(14, 14 + dataLength).toString('utf8');
        const exportData = JSON.parse(jsonData);

        // Process import data based on options
        const processedData = this.processImportData(exportData, options);

        return { 
          success: true, 
          data: processedData,
          stats: {
            collectionsImported: processedData.collections.length,
            requestsImported: processedData.collections.reduce((sum: number, col: any) => sum + (col.requests?.length || 0), 0),
            testSuitesImported: processedData.testSuites.length
          }
        };
      } catch (error) {
        console.error('Import failed:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });

    // Get import preview
    ipcMain.handle('preview-import', async (event) => {
      try {
        const result = await dialog.showOpenDialog(this.mainWindow!, {
          title: 'Preview Collection Import',
          filters: [
            { name: 'API Tester Collection', extensions: ['apit'] },
            { name: 'All Files', extensions: ['*'] }
          ],
          properties: ['openFile']
        });

        if (result.canceled || !result.filePaths.length) {
          return { success: false, canceled: true };
        }

        const filePath = result.filePaths[0];
        const binaryData = await fs.readFile(filePath);

        // Validate and extract metadata
        const header = binaryData.slice(0, 10).toString('utf8');
        if (header !== 'APITEXPORT') {
          return { 
            success: false, 
            error: 'Invalid file format' 
          };
        }

        const dataLength = (binaryData[10] << 24) | (binaryData[11] << 16) | (binaryData[12] << 8) | binaryData[13];
        const jsonData = binaryData.slice(14, 14 + dataLength).toString('utf8');
        const exportData = JSON.parse(jsonData);

        return { 
          success: true, 
          metadata: exportData.metadata,
          collections: exportData.collections.map((col: any) => ({ 
            id: col.id, 
            name: col.name, 
            description: col.description,
            ownerId: col.ownerId,
            requestCount: col.requests?.length || 0
          })),
          filePath
        };
      } catch (error) {
        console.error('Preview failed:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });

    // Handle code generation template reading
    ipcMain.handle('read-template', async (event, templatePath) => {
      try {
        const fullPath = join(__dirname, '..', 'src', 'templates', templatePath);
        const templateContent = await fs.readFile(fullPath, 'utf8');
        return templateContent;
      } catch (error) {
        console.error('Failed to read template:', error);
        throw new Error(`Failed to read template: ${templatePath}`);
      }
    });

    // Handle downloading generated code as ZIP
    ipcMain.handle('download-generated-code', async (event, { files, language }) => {
      try {
        const result = await dialog.showSaveDialog(this.mainWindow!, {
          title: 'Save Generated Code',
          defaultPath: `generated-${language}-code-${new Date().toISOString().split('T')[0]}.zip`,
          filters: [
            { name: 'ZIP Files', extensions: ['zip'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });

        if (result.canceled || !result.filePath) {
          return { success: false, canceled: true };
        }

        // Create a simple ZIP-like structure (for demonstration)
        // In a real implementation, you'd use a proper ZIP library
        const zipData = {
          files,
          language,
          generatedAt: new Date().toISOString()
        };

        await fs.writeFile(result.filePath, JSON.stringify(zipData, null, 2));

        return { success: true, filePath: result.filePath };
      } catch (error) {
        console.error('Failed to save generated code:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    // Handle saving generated code to directory
    ipcMain.handle('save-generated-code-to-directory', async (event, { files, language }) => {
      try {
        const result = await dialog.showOpenDialog(this.mainWindow!, {
          title: 'Select Directory for Generated Code',
          properties: ['openDirectory']
        });

        if (result.canceled || !result.filePaths.length) {
          return { success: false, canceled: true };
        }

        const targetDir = result.filePaths[0];
        const outputDir = join(targetDir, `generated-${language}-code`);

        // Create the output directory
        await fs.mkdir(outputDir, { recursive: true });

        // Write each file
        for (const file of files) {
          const filePath = join(outputDir, file.name);
          await fs.writeFile(filePath, file.content, 'utf8');
        }

        return { success: true, path: outputDir };
      } catch (error) {
        console.error('Failed to save generated code to directory:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
  }

  private processImportData(exportData: any, options: any) {
    const processedData = { ...exportData };
    
    // Generate new IDs to avoid conflicts
    processedData.collections = exportData.collections.map((collection: any) => {
      const newCollection = { ...collection };
      
      // Remap user ID if specified
      if (options.targetUserId !== undefined) {
        newCollection.ownerId = options.targetUserId;
      }
      
      // Generate new IDs
      newCollection.id = Date.now() + Math.floor(Math.random() * 1000);
      newCollection.createdAt = new Date().toISOString();
      newCollection.updatedAt = new Date().toISOString();
      
      // Process requests
      if (newCollection.requests) {
        newCollection.requests = newCollection.requests.map((request: any) => ({
          ...request,
          id: Date.now() + Math.floor(Math.random() * 1000),
          collectionId: newCollection.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
      }
      
      return newCollection;
    });
    
    // Update test suites
    const requestIdMap = new Map();
    exportData.collections.forEach((originalCol: any, colIndex: number) => {
      const newCol = processedData.collections[colIndex];
      originalCol.requests?.forEach((originalReq: any, reqIndex: number) => {
        const newReq = newCol.requests?.[reqIndex];
        if (newReq) {
          requestIdMap.set(originalReq.id, newReq.id);
        }
      });
    });
    
    processedData.testSuites = exportData.testSuites.map((testSuite: any) => ({
      ...testSuite,
      id: `suite_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      requestId: requestIdMap.get(testSuite.requestId) || testSuite.requestId
    }));
    
    return processedData;
  }
}

// Initialize the application
new AppManager();