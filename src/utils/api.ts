import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiRequest, ApiResponse, Environment } from '../types';
import { EnvironmentVariableManager } from './environmentVariables';

// Remove the imports since we'll call the main process instead
// import { SoapClient } from './soapClient';
// import { GrpcClient } from './grpcClient';

declare global {
  interface Window {
    electronAPI: {
      makeApiRequest: (requestData: any) => Promise<any>;
      makeSoapRequest: (requestData: any) => Promise<any>;
      makeGrpcRequest: (requestData: any) => Promise<any>;
    };
  }
}

export class ApiClient {
  static async makeRequest(request: ApiRequest, environment?: Environment | null): Promise<ApiResponse> {
    // Process environment variables first
    const processedRequest = environment 
      ? EnvironmentVariableManager.processRequest(request, environment)
      : request;

    // Route to appropriate client based on method type
    switch (processedRequest.method) {
      case 'SOAP':
        return this.makeSoapRequest(processedRequest);
      case 'GRPC':
        return this.makeGrpcRequest(processedRequest);
      default:
        return this.makeHttpRequest(processedRequest);
    }
  }

  private static async makeSoapRequest(request: ApiRequest): Promise<ApiResponse> {
    try {
      return await window.electronAPI.makeSoapRequest(request);
    } catch (error) {
      console.error('SOAP request failed:', error);
      throw new Error(`SOAP Request Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async makeGrpcRequest(request: ApiRequest): Promise<ApiResponse> {
    try {
      return await window.electronAPI.makeGrpcRequest(request);
    } catch (error) {
      console.error('gRPC request failed:', error);
      throw new Error(`gRPC Request Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async makeHttpRequest(request: ApiRequest): Promise<ApiResponse> {
    const startTime = Date.now();
    
    try {
      const config: AxiosRequestConfig = {
        method: request.method,
        url: this.buildUrl(request.url, request.params),
        headers: {
          ...request.headers,
          ...this.buildAuthHeader(request.auth)
        },
        timeout: 30000, // 30 seconds timeout
        validateStatus: () => true // Don't throw on HTTP error status codes
      };

      // Add body for POST, PUT, PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.body) {
        config.data = this.parseRequestBody(request.body, request.headers);
      }

      const response: AxiosResponse = await axios(config);
      const endTime = Date.now();

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        data: response.data,
        responseTime: endTime - startTime,
        size: this.calculateResponseSize(response)
      };
    } catch (error: any) {
      const endTime = Date.now();
      
      if (error.response) {
        // Server responded with error status
        return {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers || {},
          data: error.response.data,
          responseTime: endTime - startTime,
          size: this.calculateResponseSize(error.response)
        };
      } else if (error.request) {
        // Request was made but no response received
        throw new Error(`Network Error: ${error.message}`);
      } else {
        // Something else happened
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  private static buildUrl(baseUrl: string, params: Record<string, string>): string {
    const url = new URL(baseUrl);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value.trim()) {
        url.searchParams.append(key, value);
      }
    });
    
    return url.toString();
  }

  private static buildAuthHeader(auth?: ApiRequest['auth']): Record<string, string> {
    if (!auth || auth.type === 'none' || auth.type === 'ws-security') {
      return {};
    }

    switch (auth.type) {
      case 'bearer':
        return auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
      
      case 'basic':
        if (auth.username && auth.password) {
          const credentials = btoa(`${auth.username}:${auth.password}`);
          return { Authorization: `Basic ${credentials}` };
        }
        return {};
      
      case 'api-key':
        return auth.key && auth.value ? { [auth.key]: auth.value } : {};
      
      default:
        return {};
    }
  }

  private static parseRequestBody(body: string, headers: Record<string, string>): any {
    const contentType = headers['Content-Type'] || headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    }
    
    return body;
  }

  private static calculateResponseSize(response: AxiosResponse): number {
    const contentLength = response.headers['content-length'];
    if (contentLength) {
      return parseInt(contentLength, 10);
    }
    
    // Fallback: estimate size from data
    try {
      return JSON.stringify(response.data).length;
    } catch {
      return 0;
    }
  }
}

export const formatResponseTime = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return 'status-success';
  if (status >= 400 && status < 500) return 'status-error';
  if (status >= 500) return 'status-error';
  return 'status-warning';
};