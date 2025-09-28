import { Environment, ApiRequest } from '../types';
import { DynamicVariableManager } from './dynamicVariables';

export class EnvironmentVariableManager {
  /**
   * Replace variables in a string with environment values
   * Supports {{variableName}} syntax and built-in dynamic variables like {{$timestamp}}
   */
  static replaceVariables(text: string, environment: Environment | null): string {
    if (!text) {
      return text;
    }

    // First, replace dynamic variables ({{$variableName}})
    let processedText = DynamicVariableManager.replaceDynamicVariables(text);

    // Then replace environment variables if environment is provided
    if (environment) {
      processedText = processedText.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
        const trimmedName = variableName.trim();
        
        // Skip dynamic variables (already processed)
        if (trimmedName.startsWith('$')) {
          return match;
        }
        
        const value = environment.variables[trimmedName];
        return value !== undefined ? value : match; // Keep original if variable not found
      });
    }

    return processedText;
  }

  /**
   * Process an API request to replace all environment variables
   */
  static processRequest(request: ApiRequest, environment: Environment | null): ApiRequest {
    if (!environment) {
      return request;
    }

    const processedRequest: ApiRequest = { ...request };

    // Process URL
    processedRequest.url = this.replaceVariables(request.url, environment);

    // Process headers
    processedRequest.headers = {};
    Object.entries(request.headers).forEach(([key, value]) => {
      const processedKey = this.replaceVariables(key, environment);
      const processedValue = this.replaceVariables(value, environment);
      processedRequest.headers[processedKey] = processedValue;
    });

    // Process params
    processedRequest.params = {};
    Object.entries(request.params).forEach(([key, value]) => {
      const processedKey = this.replaceVariables(key, environment);
      const processedValue = this.replaceVariables(value, environment);
      processedRequest.params[processedKey] = processedValue;
    });

    // Process body
    if (request.body) {
      processedRequest.body = this.replaceVariables(request.body, environment);
    }

    // Process auth
    if (request.auth) {
      processedRequest.auth = { ...request.auth };
      
      if (request.auth.token) {
        processedRequest.auth.token = this.replaceVariables(request.auth.token, environment);
      }
      if (request.auth.username) {
        processedRequest.auth.username = this.replaceVariables(request.auth.username, environment);
      }
      if (request.auth.password) {
        processedRequest.auth.password = this.replaceVariables(request.auth.password, environment);
      }
      if (request.auth.key) {
        processedRequest.auth.key = this.replaceVariables(request.auth.key, environment);
      }
      if (request.auth.value) {
        processedRequest.auth.value = this.replaceVariables(request.auth.value, environment);
      }
      if (request.auth.wssUsername) {
        processedRequest.auth.wssUsername = this.replaceVariables(request.auth.wssUsername, environment);
      }
      if (request.auth.wssPassword) {
        processedRequest.auth.wssPassword = this.replaceVariables(request.auth.wssPassword, environment);
      }
    }

    // Process SOAP fields
    if (request.soap) {
      processedRequest.soap = { ...request.soap };
      
      if (request.soap.action) {
        processedRequest.soap.action = this.replaceVariables(request.soap.action, environment);
      }
      if (request.soap.wsdlUrl) {
        processedRequest.soap.wsdlUrl = this.replaceVariables(request.soap.wsdlUrl, environment);
      }
      if (request.soap.envelope) {
        processedRequest.soap.envelope = this.replaceVariables(request.soap.envelope, environment);
      }
      if (request.soap.operation) {
        processedRequest.soap.operation = this.replaceVariables(request.soap.operation, environment);
      }
      if (request.soap.namespace) {
        processedRequest.soap.namespace = this.replaceVariables(request.soap.namespace, environment);
      }
    }

    // Process gRPC fields
    if (request.grpc) {
      processedRequest.grpc = { ...request.grpc };
      
      if (request.grpc.service) {
        processedRequest.grpc.service = this.replaceVariables(request.grpc.service, environment);
      }
      if (request.grpc.method) {
        processedRequest.grpc.method = this.replaceVariables(request.grpc.method, environment);
      }
      if (request.grpc.protoFile) {
        processedRequest.grpc.protoFile = this.replaceVariables(request.grpc.protoFile, environment);
      }
      if (request.grpc.metadata) {
        processedRequest.grpc.metadata = {};
        Object.entries(request.grpc.metadata).forEach(([key, value]) => {
          const processedKey = this.replaceVariables(key, environment);
          const processedValue = this.replaceVariables(value, environment);
          processedRequest.grpc!.metadata![processedKey] = processedValue;
        });
      }
    }

    return processedRequest;
  }

  /**
   * Extract variable references from a string
   * Includes both environment variables and dynamic variables
   */
  static extractVariables(text: string): string[] {
    const variables: string[] = [];
    const regex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const variableName = match[1].trim();
      if (!variables.includes(variableName)) {
        variables.push(variableName);
      }
    }

    return variables;
  }

  /**
   * Extract all variables used in a request
   */
  static extractRequestVariables(request: ApiRequest): string[] {
    const variables = new Set<string>();

    // Extract from URL
    this.extractVariables(request.url).forEach(v => variables.add(v));

    // Extract from headers
    Object.entries(request.headers).forEach(([key, value]) => {
      this.extractVariables(key).forEach(v => variables.add(v));
      this.extractVariables(value).forEach(v => variables.add(v));
    });

    // Extract from params
    Object.entries(request.params).forEach(([key, value]) => {
      this.extractVariables(key).forEach(v => variables.add(v));
      this.extractVariables(value).forEach(v => variables.add(v));
    });

    // Extract from body
    if (request.body) {
      this.extractVariables(request.body).forEach(v => variables.add(v));
    }

    // Extract from auth
    if (request.auth) {
      ['token', 'username', 'password', 'key', 'value', 'wssUsername', 'wssPassword'].forEach(field => {
        const value = (request.auth as any)?.[field];
        if (value) {
          this.extractVariables(value).forEach(v => variables.add(v));
        }
      });
    }

    // Extract from SOAP fields
    if (request.soap) {
      ['action', 'wsdlUrl', 'envelope', 'operation', 'namespace'].forEach(field => {
        const value = (request.soap as any)?.[field];
        if (value) {
          this.extractVariables(value).forEach(v => variables.add(v));
        }
      });
    }

    // Extract from gRPC fields
    if (request.grpc) {
      ['service', 'method', 'protoFile'].forEach(field => {
        const value = (request.grpc as any)?.[field];
        if (value) {
          this.extractVariables(value).forEach(v => variables.add(v));
        }
      });

      if (request.grpc.metadata) {
        Object.entries(request.grpc.metadata).forEach(([key, value]) => {
          this.extractVariables(key).forEach(v => variables.add(v));
          this.extractVariables(value).forEach(v => variables.add(v));
        });
      }
    }

    return Array.from(variables);
  }

  /**
   * Validate that all variables in request have values in environment
   * Dynamic variables are always considered valid since they generate values automatically
   */
  static validateRequest(request: ApiRequest, environment: Environment | null): { isValid: boolean; missingVariables: string[] } {
    const usedVariables = this.extractRequestVariables(request);
    const missingVariables: string[] = [];

    if (!environment) {
      // Filter out dynamic variables as they don't need environment
      const nonDynamicVars = usedVariables.filter(v => !DynamicVariableManager.isDynamicVariable(v));
      return {
        isValid: nonDynamicVars.length === 0,
        missingVariables: nonDynamicVars
      };
    }

    usedVariables.forEach(variable => {
      // Skip dynamic variables as they are always valid
      if (DynamicVariableManager.isDynamicVariable(variable)) {
        return;
      }
      
      if (environment.variables[variable] === undefined) {
        missingVariables.push(variable);
      }
    });

    return {
      isValid: missingVariables.length === 0,
      missingVariables
    };
  }

  /**
   * Create a default environment
   */
  static createDefaultEnvironment(name: string = 'Default'): Environment {
    return {
      id: `env_${Date.now()}`,
      name,
      variables: {
        'baseUrl': 'https://api.example.com',
        'apiKey': 'your-api-key-here',
        'version': 'v1'
      }
    };
  }

  /**
   * Merge multiple environments (later environments override earlier ones)
   */
  static mergeEnvironments(...environments: Environment[]): Environment {
    const merged: Environment = {
      id: 'merged',
      name: 'Merged Environment',
      variables: {}
    };

    environments.forEach(env => {
      Object.assign(merged.variables, env.variables);
    });

    return merged;
  }
}