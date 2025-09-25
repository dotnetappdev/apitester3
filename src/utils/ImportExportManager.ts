// Import/Export Manager for Collections and Tests
// Creates a portable binary format for sharing between teams
import CryptoJS from 'crypto-js';
import { Collection, Request, User } from '../database/DatabaseManager';
import { TestSuite, TestCase } from '../testing/TestRunner';

export interface ExportData {
  version: string;
  exportedAt: string;
  collections: Collection[];
  testSuites: TestSuite[];
  metadata: {
    totalCollections: number;
    totalRequests: number;
    totalTestSuites: number;
    exportedBy: string; // username, not ID
  };
}

export interface ImportOptions {
  targetUserId?: number; // If specified, remap all collections to this user
  importForAllUsers: boolean; // If true, preserve original owner structure (for team leads)
  userMappings?: Map<number, number>; // Old user ID -> New user ID mappings
}

export interface ImportResult {
  success: boolean;
  collectionsImported: number;
  requestsImported: number;
  testSuitesImported: number;
  errors: string[];
  warnings: string[];
}

export class ImportExportManager {
  private static readonly MAGIC_HEADER = 'APITEXPORT'; // API Tester Export
  private static readonly VERSION = '1.0.0';
  private static readonly ENCRYPTION_KEY = 'apitester3-export-key-2024';

  /**
   * Export collections and tests to a binary format
   */
  static async exportCollections(
    collections: Collection[],
    testSuites: TestSuite[],
    exportedByUsername: string
  ): Promise<Uint8Array> {
    const exportData: ExportData = {
      version: this.VERSION,
      exportedAt: new Date().toISOString(),
      collections: collections.map(col => ({
        ...col,
        requests: col.requests || []
      })),
      testSuites,
      metadata: {
        totalCollections: collections.length,
        totalRequests: collections.reduce((sum, col) => sum + (col.requests?.length || 0), 0),
        totalTestSuites: testSuites.length,
        exportedBy: exportedByUsername
      }
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 0);
    
    // Encrypt the data
    const encrypted = CryptoJS.AES.encrypt(jsonString, this.ENCRYPTION_KEY).toString();
    
    // Create binary format: MAGIC_HEADER + version + encrypted_data
    const header = new TextEncoder().encode(this.MAGIC_HEADER);
    const version = new TextEncoder().encode(this.VERSION);
    const data = new TextEncoder().encode(encrypted);
    
    // Create final binary with structure: header(10) + version_length(1) + version + data_length(4) + data
    const versionLength = version.length;
    const dataLength = data.length;
    
    const binary = new Uint8Array(10 + 1 + versionLength + 4 + dataLength);
    let offset = 0;
    
    // Magic header (10 bytes)
    binary.set(header, offset);
    offset += 10;
    
    // Version length (1 byte)
    binary[offset] = versionLength;
    offset += 1;
    
    // Version string
    binary.set(version, offset);
    offset += versionLength;
    
    // Data length (4 bytes, big endian)
    const dataLengthBytes = new Uint8Array(4);
    new DataView(dataLengthBytes.buffer).setUint32(0, dataLength, false);
    binary.set(dataLengthBytes, offset);
    offset += 4;
    
    // Encrypted data
    binary.set(data, offset);
    
    return binary;
  }

  /**
   * Import collections and tests from binary format
   */
  static async importCollections(
    binaryData: Uint8Array,
    options: ImportOptions
  ): Promise<{ data: ExportData; result: ImportResult }> {
    const result: ImportResult = {
      success: false,
      collectionsImported: 0,
      requestsImported: 0,
      testSuitesImported: 0,
      errors: [],
      warnings: []
    };

    try {
      // Validate magic header
      const header = new TextDecoder().decode(binaryData.slice(0, 10));
      if (header !== this.MAGIC_HEADER) {
        result.errors.push('Invalid file format: Magic header mismatch');
        return { data: {} as ExportData, result };
      }

      let offset = 10;
      
      // Read version
      const versionLength = binaryData[offset];
      offset += 1;
      
      const version = new TextDecoder().decode(binaryData.slice(offset, offset + versionLength));
      offset += versionLength;
      
      if (version !== this.VERSION) {
        result.warnings.push(`Version mismatch: Expected ${this.VERSION}, got ${version}`);
      }
      
      // Read data length
      const dataLength = new DataView(binaryData.buffer).getUint32(offset, false);
      offset += 4;
      
      // Read and decrypt data
      const encryptedData = new TextDecoder().decode(binaryData.slice(offset, offset + dataLength));
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!jsonString) {
        result.errors.push('Failed to decrypt data: Invalid encryption key or corrupted file');
        return { data: {} as ExportData, result };
      }
      
      const exportData: ExportData = JSON.parse(jsonString);
      
      // Validate export data structure
      if (!exportData.collections || !exportData.testSuites || !exportData.metadata) {
        result.errors.push('Invalid export data structure');
        return { data: exportData, result };
      }

      // Process import based on options
      const processedData = this.processImportData(exportData, options, result);
      
      result.success = result.errors.length === 0;
      result.collectionsImported = processedData.collections.length;
      result.requestsImported = processedData.collections.reduce((sum, col) => sum + (col.requests?.length || 0), 0);
      result.testSuitesImported = processedData.testSuites.length;
      
      return { data: processedData, result };
      
    } catch (error) {
      result.errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { data: {} as ExportData, result };
    }
  }

  /**
   * Process import data based on user mapping options
   */
  private static processImportData(
    exportData: ExportData,
    options: ImportOptions,
    result: ImportResult
  ): ExportData {
    const processedData = { ...exportData };
    
    // Handle user ID remapping for collections
    processedData.collections = exportData.collections.map(collection => {
      const newCollection = { ...collection };
      
      if (options.targetUserId !== undefined) {
        // Remap to specific user
        const oldOwnerId = newCollection.ownerId;
        newCollection.ownerId = options.targetUserId;
        result.warnings.push(`Collection "${collection.name}" owner remapped from user ${oldOwnerId} to ${options.targetUserId}`);
      } else if (options.userMappings && options.userMappings.has(collection.ownerId)) {
        // Use provided mapping
        const oldOwnerId = newCollection.ownerId;
        newCollection.ownerId = options.userMappings.get(collection.ownerId)!;
        result.warnings.push(`Collection "${collection.name}" owner remapped from user ${oldOwnerId} to ${newCollection.ownerId}`);
      } else if (!options.importForAllUsers) {
        // Default: warn about unmapped users
        result.warnings.push(`Collection "${collection.name}" owner ID ${collection.ownerId} not mapped - using original ID`);
      }
      
      // Generate new IDs to avoid conflicts
      newCollection.id = Date.now() + Math.floor(Math.random() * 1000);
      newCollection.createdAt = new Date().toISOString();
      newCollection.updatedAt = new Date().toISOString();
      
      // Process requests within the collection
      if (newCollection.requests) {
        newCollection.requests = newCollection.requests.map(request => ({
          ...request,
          id: Date.now() + Math.floor(Math.random() * 1000),
          collectionId: newCollection.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
      }
      
      return newCollection;
    });
    
    // Process test suites - update request IDs to match new collection request IDs
    const requestIdMap = new Map<number, number>();
    exportData.collections.forEach((originalCol, colIndex) => {
      const newCol = processedData.collections[colIndex];
      originalCol.requests?.forEach((originalReq, reqIndex) => {
        const newReq = newCol.requests?.[reqIndex];
        if (newReq) {
          requestIdMap.set(originalReq.id, newReq.id);
        }
      });
    });
    
    processedData.testSuites = exportData.testSuites.map(testSuite => ({
      ...testSuite,
      id: `suite_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      requestId: requestIdMap.get(testSuite.requestId) || testSuite.requestId,
      testCases: testSuite.testCases.map(testCase => ({
        ...testCase,
        id: `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      }))
    }));
    
    return processedData;
  }

  /**
   * Get metadata from binary file without full import
   */
  static async getExportMetadata(binaryData: Uint8Array): Promise<ExportData['metadata'] | null> {
    try {
      const { data } = await this.importCollections(binaryData, { importForAllUsers: true });
      return data.metadata || null;
    } catch {
      return null;
    }
  }

  /**
   * Validate binary file format
   */
  static validateExportFile(binaryData: Uint8Array): { valid: boolean; error?: string } {
    if (binaryData.length < 10) {
      return { valid: false, error: 'File too small' };
    }
    
    const header = new TextDecoder().decode(binaryData.slice(0, 10));
    if (header !== this.MAGIC_HEADER) {
      return { valid: false, error: 'Invalid file format' };
    }
    
    return { valid: true };
  }
}