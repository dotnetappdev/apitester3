export interface ApiRequest {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'SOAP' | 'GRPC';
  url: string;
  headers: Record<string, string>;
  body?: string;
  params: Record<string, string>;
  auth?: {
    type: 'none' | 'bearer' | 'basic' | 'api-key' | 'ws-security';
    token?: string;
    username?: string;
    password?: string;
    key?: string;
    value?: string;
    // WS-Security fields for SOAP
    wssUsername?: string;
    wssPassword?: string;
    wssPasswordType?: 'PasswordText' | 'PasswordDigest';
  };
  // SOAP-specific fields
  soap?: {
    action?: string;
    wsdlUrl?: string;
    envelope?: string;
    operation?: string;
    namespace?: string;
  };
  // gRPC-specific fields
  grpc?: {
    protoFile?: string;
    service?: string;
    method?: string;
    metadata?: Record<string, string>;
    streaming?: 'none' | 'client' | 'server' | 'bidirectional';
  };
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  responseTime: number;
  size: number;
}

export interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
  isActive?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  requests: ApiRequest[];
  folders: Folder[];
  environment?: Environment;
}

export interface Folder {
  id: string;
  name: string;
  requests: ApiRequest[];
  folders: Folder[];
}

export interface RequestHistory {
  id: string;
  request: ApiRequest;
  response: ApiResponse;
  timestamp: string;
  isFavorite?: boolean;
}

export interface AppState {
  activeRequest: ApiRequest | null;
  collections: Collection[];
  environments: Environment[];
  activeEnvironment: Environment | null;
  response: ApiResponse | null;
  isLoading: boolean;
  sidebarWidth: number;
  requestHistory: RequestHistory[];
}