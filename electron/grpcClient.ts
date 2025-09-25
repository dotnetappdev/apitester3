import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface GrpcRequest {
  url: string;
  method: string;
  body: string;
  auth?: {
    type: string;
    token?: string;
    username?: string;
    password?: string;
  };
  grpc?: {
    protoFile?: string;
    service?: string;
    method?: string;
    metadata?: Record<string, string>;
    streaming?: string;
  };
}

interface GrpcClientCache {
  [key: string]: any;
}

export class ElectronGrpcClient {
  private static clientCache: GrpcClientCache = {};
  private static protoCache: { [key: string]: any } = {};

  static async makeRequest(request: GrpcRequest): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Parse gRPC configuration from request body
      let grpcConfig: any = {};
      try {
        grpcConfig = JSON.parse(request.body || '{}');
      } catch {
        return {
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          data: { error: 'Invalid gRPC configuration JSON' },
          responseTime: Date.now() - startTime,
          size: 0
        };
      }

      const service = grpcConfig.service || request.grpc?.service;
      const method = grpcConfig.method || request.grpc?.method;
      const protoFile = grpcConfig.protoFile || request.grpc?.protoFile;

      if (!service || !method || !protoFile) {
        return {
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          data: { error: 'gRPC request requires service, method, and protoFile' },
          responseTime: Date.now() - startTime,
          size: 0
        };
      }

      // Load proto definition
      const packageDefinition = await this.loadProtoDefinition(protoFile);
      const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
      
      // Get service constructor
      const serviceConstructor = this.getServiceConstructor(protoDescriptor, service);
      
      // Create or get cached client
      const client = this.getOrCreateClient(serviceConstructor, request.url, request);
      
      // Parse request data (exclude gRPC config properties)
      const requestData = this.parseRequestData(grpcConfig);
      
      // Create metadata
      const metadata = this.createMetadata(request, grpcConfig);
      
      // Make gRPC call
      const response = await this.makeGrpcCall(
        client,
        method,
        requestData,
        metadata,
        grpcConfig.streaming || request.grpc?.streaming
      );

      const endTime = Date.now();

      return {
        status: 200,
        statusText: 'OK',
        headers: this.extractMetadata(response.metadata),
        data: response.data,
        responseTime: endTime - startTime,
        size: this.calculateResponseSize(response.data)
      };

    } catch (error: any) {
      const endTime = Date.now();
      const grpcError = this.handleGrpcError(error);
      
      return {
        status: grpcError.code,
        statusText: grpcError.message,
        headers: {},
        data: {
          error: true,
          code: grpcError.code,
          message: grpcError.message,
          details: grpcError.details
        },
        responseTime: endTime - startTime,
        size: 0
      };
    }
  }

  private static async loadProtoDefinition(protoContent: string): Promise<any> {
    const protoHash = this.hashString(protoContent);
    
    if (this.protoCache[protoHash]) {
      return this.protoCache[protoHash];
    }

    try {
      // Create a temporary file for the proto content
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `temp_${protoHash}.proto`);
      
      await fs.promises.writeFile(tempFilePath, protoContent);

      const packageDefinition = protoLoader.loadSync(tempFilePath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      });

      // Clean up temp file
      try {
        await fs.promises.unlink(tempFilePath);
      } catch {
        // Ignore cleanup errors
      }

      this.protoCache[protoHash] = packageDefinition;
      return packageDefinition;
    } catch (error) {
      throw new Error(`Failed to load proto definition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static getServiceConstructor(protoDescriptor: any, serviceName: string): any {
    const parts = serviceName.split('.');
    let current = protoDescriptor;
    
    for (const part of parts) {
      if (current[part]) {
        current = current[part];
      } else {
        throw new Error(`Service ${serviceName} not found in proto definition`);
      }
    }
    
    return current;
  }

  private static getOrCreateClient(serviceConstructor: any, url: string, request: GrpcRequest): any {
    const clientKey = `${url}_${request.grpc?.service}`;
    
    if (this.clientCache[clientKey]) {
      return this.clientCache[clientKey];
    }

    // Create credentials
    const credentials = this.createCredentials(request);
    
    // Create client
    const client = new serviceConstructor(url, credentials);
    this.clientCache[clientKey] = client;
    
    return client;
  }

  private static createCredentials(request: GrpcRequest): grpc.ChannelCredentials {
    if (request.url.startsWith('https://') || request.url.includes(':443')) {
      return grpc.credentials.createSsl();
    }
    return grpc.credentials.createInsecure();
  }

  private static createMetadata(request: GrpcRequest, grpcConfig: any): grpc.Metadata {
    const metadata = new grpc.Metadata();
    
    // Add custom metadata from gRPC config
    if (grpcConfig.metadata) {
      Object.entries(grpcConfig.metadata).forEach(([key, value]) => {
        metadata.add(key, String(value));
      });
    }
    
    // Add metadata from request.grpc
    if (request.grpc?.metadata) {
      Object.entries(request.grpc.metadata).forEach(([key, value]) => {
        metadata.add(key, value);
      });
    }
    
    // Add auth metadata
    if (request.auth?.type === 'bearer' && request.auth.token) {
      metadata.add('authorization', `Bearer ${request.auth.token}`);
    }
    
    return metadata;
  }

  private static parseRequestData(grpcConfig: any): any {
    // Extract request data, excluding gRPC configuration properties
    const configKeys = ['service', 'method', 'protoFile', 'streaming', 'metadata'];
    const requestData: any = {};
    
    Object.keys(grpcConfig).forEach(key => {
      if (!configKeys.includes(key)) {
        requestData[key] = grpcConfig[key];
      }
    });
    
    return Object.keys(requestData).length > 0 ? requestData : {};
  }

  private static async makeGrpcCall(
    client: any,
    method: string,
    requestData: any,
    metadata: grpc.Metadata,
    streamingType?: string
  ): Promise<{ data: any; metadata: grpc.Metadata }> {
    return new Promise((resolve, reject) => {
      const methodFn = client[method];
      if (!methodFn) {
        reject(new Error(`Method ${method} not found on service`));
        return;
      }

      switch (streamingType) {
        case 'client':
          // Client streaming
          const clientStream = methodFn(metadata, (error: any, response: any) => {
            if (error) {
              reject(error);
            } else {
              resolve({ data: response, metadata: new grpc.Metadata() });
            }
          });
          
          clientStream.write(requestData);
          clientStream.end();
          break;
          
        case 'server':
          // Server streaming
          const serverStream = methodFn(requestData, metadata);
          const responses: any[] = [];
          
          serverStream.on('data', (response: any) => {
            responses.push(response);
          });
          
          serverStream.on('end', () => {
            resolve({ data: responses, metadata: new grpc.Metadata() });
          });
          
          serverStream.on('error', (error: any) => {
            reject(error);
          });
          break;
          
        case 'bidirectional':
          // Bidirectional streaming
          const biStream = methodFn(metadata);
          const biResponses: any[] = [];
          
          biStream.on('data', (response: any) => {
            biResponses.push(response);
          });
          
          biStream.on('end', () => {
            resolve({ data: biResponses, metadata: new grpc.Metadata() });
          });
          
          biStream.on('error', (error: any) => {
            reject(error);
          });
          
          biStream.write(requestData);
          biStream.end();
          break;
          
        default:
          // Unary call
          methodFn(requestData, metadata, (error: any, response: any) => {
            if (error) {
              reject(error);
            } else {
              resolve({ data: response, metadata: new grpc.Metadata() });
            }
          });
      }
    });
  }

  private static extractMetadata(metadata: grpc.Metadata): Record<string, string> {
    const headers: Record<string, string> = {};
    
    const metadataMap = metadata.getMap();
    Object.entries(metadataMap).forEach(([key, value]) => {
      headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
    });
    
    return headers;
  }

  private static handleGrpcError(error: any): { code: number; message: string; details?: any } {
    if (error.code !== undefined) {
      // gRPC error codes to HTTP status codes mapping
      const statusCodes: { [key: number]: number } = {
        [grpc.status.OK]: 200,
        [grpc.status.CANCELLED]: 499,
        [grpc.status.UNKNOWN]: 500,
        [grpc.status.INVALID_ARGUMENT]: 400,
        [grpc.status.DEADLINE_EXCEEDED]: 504,
        [grpc.status.NOT_FOUND]: 404,
        [grpc.status.ALREADY_EXISTS]: 409,
        [grpc.status.PERMISSION_DENIED]: 403,
        [grpc.status.RESOURCE_EXHAUSTED]: 429,
        [grpc.status.FAILED_PRECONDITION]: 400,
        [grpc.status.ABORTED]: 409,
        [grpc.status.OUT_OF_RANGE]: 400,
        [grpc.status.UNIMPLEMENTED]: 501,
        [grpc.status.INTERNAL]: 500,
        [grpc.status.UNAVAILABLE]: 503,
        [grpc.status.DATA_LOSS]: 500,
        [grpc.status.UNAUTHENTICATED]: 401
      };
      
      return {
        code: statusCodes[error.code] || 500,
        message: error.message || 'gRPC Error',
        details: error.details
      };
    }
    
    return {
      code: 500,
      message: error.message || 'Unknown gRPC Error',
      details: error
    };
  }

  private static calculateResponseSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString();
  }
}