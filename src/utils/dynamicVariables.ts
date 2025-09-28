/**
 * Dynamic Variables System for API Tester 3
 * Provides built-in dynamic variables similar to Postman
 * Supports variables like {{$timestamp}}, {{$randomInt}}, {{$guid}}, etc.
 */

export interface DynamicVariable {
  name: string;
  description: string;
  example: string;
  generate: () => string;
}

export class DynamicVariableManager {
  private static readonly BUILTIN_VARIABLES: DynamicVariable[] = [
    {
      name: '$timestamp',
      description: 'Current Unix timestamp in seconds',
      example: '1699123456',
      generate: () => Math.floor(Date.now() / 1000).toString()
    },
    {
      name: '$timestampMs', 
      description: 'Current Unix timestamp in milliseconds',
      example: '1699123456789',
      generate: () => Date.now().toString()
    },
    {
      name: '$dateISO',
      description: 'Current date in ISO 8601 format',
      example: '2024-01-15T10:30:45.123Z',
      generate: () => new Date().toISOString()
    },
    {
      name: '$dateFormat',
      description: 'Current date in YYYY-MM-DD format',
      example: '2024-01-15',
      generate: () => new Date().toISOString().split('T')[0]
    },
    {
      name: '$timeISO',
      description: 'Current time in ISO 8601 format',
      example: '10:30:45.123Z',
      generate: () => new Date().toISOString().split('T')[1]
    },
    {
      name: '$guid',
      description: 'Random UUID/GUID v4',
      example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      generate: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
    },
    {
      name: '$randomInt',
      description: 'Random integer between 0 and 1000',
      example: '456',
      generate: () => Math.floor(Math.random() * 1001).toString()
    },
    {
      name: '$randomFloat',
      description: 'Random float between 0 and 1',
      example: '0.7834561',
      generate: () => Math.random().toString()
    },
    {
      name: '$randomAlphaNumeric',
      description: 'Random 6-character alphanumeric string',
      example: 'a1B2c3',
      generate: () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      }
    },
    {
      name: '$randomString',
      description: 'Random 8-character alphabetic string',
      example: 'aBcDeFgH',
      generate: () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < 8; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      }
    },
    {
      name: '$randomBoolean',
      description: 'Random boolean value',
      example: 'true',
      generate: () => Math.random() > 0.5 ? 'true' : 'false'
    },
    {
      name: '$randomEmail',
      description: 'Random email address',
      example: 'user123@example.com',
      generate: () => {
        const users = ['user', 'test', 'admin', 'demo', 'sample'];
        const domains = ['example.com', 'test.com', 'demo.org', 'sample.net'];
        const user = users[Math.floor(Math.random() * users.length)];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        const num = Math.floor(Math.random() * 1000);
        return `${user}${num}@${domain}`;
      }
    },
    {
      name: '$randomFirstName',
      description: 'Random first name',
      example: 'John',
      generate: () => {
        const names = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
        return names[Math.floor(Math.random() * names.length)];
      }
    },
    {
      name: '$randomLastName',
      description: 'Random last name',
      example: 'Smith',
      generate: () => {
        const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        return names[Math.floor(Math.random() * names.length)];
      }
    },
    {
      name: '$randomColor',
      description: 'Random hex color code',
      example: '#a1b2c3',
      generate: () => {
        const hex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        return `#${hex}`;
      }
    },
    {
      name: '$randomUrl',
      description: 'Random URL',
      example: 'https://example.com/path',
      generate: () => {
        const protocols = ['https', 'http'];
        const domains = ['example.com', 'test.com', 'demo.org', 'sample.net', 'api.example.com'];
        const paths = ['path', 'api', 'data', 'users', 'products', 'orders'];
        
        const protocol = protocols[Math.floor(Math.random() * protocols.length)];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        const path = paths[Math.floor(Math.random() * paths.length)];
        
        return `${protocol}://${domain}/${path}`;
      }
    }
  ];

  /**
   * Get all available dynamic variables
   */
  static getAvailableVariables(): DynamicVariable[] {
    return [...this.BUILTIN_VARIABLES];
  }

  /**
   * Check if a variable name is a built-in dynamic variable
   */
  static isDynamicVariable(variableName: string): boolean {
    return this.BUILTIN_VARIABLES.some(v => v.name === variableName);
  }

  /**
   * Generate value for a dynamic variable
   */
  static generateValue(variableName: string): string | null {
    const variable = this.BUILTIN_VARIABLES.find(v => v.name === variableName);
    return variable ? variable.generate() : null;
  }

  /**
   * Replace dynamic variables in text
   * This extends the environment variable replacement to handle built-in dynamic variables
   */
  static replaceDynamicVariables(text: string): string {
    if (!text) return text;

    // Replace dynamic variables in format {{$variableName}}
    return text.replace(/\{\{(\$[^}]+)\}\}/g, (match, variableName) => {
      const value = this.generateValue(variableName);
      return value !== null ? value : match; // Keep original if variable not found
    });
  }

  /**
   * Extract dynamic variable references from text
   */
  static extractDynamicVariables(text: string): string[] {
    const variables: string[] = [];
    const regex = /\{\{(\$[^}]+)\}\}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const variableName = match[1].trim();
      if (this.isDynamicVariable(variableName) && !variables.includes(variableName)) {
        variables.push(variableName);
      }
    }

    return variables;
  }

  /**
   * Get dynamic variable by name
   */
  static getVariable(name: string): DynamicVariable | null {
    return this.BUILTIN_VARIABLES.find(v => v.name === name) || null;
  }

  /**
   * Preview all dynamic variables with generated values
   */
  static previewAllVariables(): Array<{ variable: DynamicVariable; value: string }> {
    return this.BUILTIN_VARIABLES.map(variable => ({
      variable,
      value: variable.generate()
    }));
  }
}