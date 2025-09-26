import axios, { AxiosResponse } from 'axios';

interface SoapRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  auth?: {
    type: string;
    wssUsername?: string;
    wssPassword?: string;
    wssPasswordType?: string;
    token?: string;
    username?: string;
    password?: string;
    key?: string;
    value?: string;
  };
  soap?: {
    action?: string;
    wsdlUrl?: string;
    envelope?: string;
    operation?: string;
    namespace?: string;
  };
}

export class ElectronSoapClient {
  static async makeRequest(request: SoapRequest): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Build SOAP envelope
      const soapEnvelope = this.buildSoapEnvelope(request);
      
      // Prepare headers
      const headers = {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': this.getSoapAction(request),
        ...request.headers,
        ...this.buildAuthHeader(request.auth)
      };

      // Make HTTP POST request (SOAP always uses POST)
      const response: AxiosResponse = await axios({
        method: 'POST',
        url: request.url,
        data: soapEnvelope,
        headers,
        timeout: 30000,
        validateStatus: () => true
      });

      const endTime = Date.now();

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: this.parseSoapResponse(response.data),
        responseTime: endTime - startTime,
        size: this.calculateResponseSize(response)
      };
    } catch (error: any) {
      const endTime = Date.now();
      
      if (error.response) {
        return {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers || {},
          data: this.parseSoapResponse(error.response.data),
          responseTime: endTime - startTime,
          size: this.calculateResponseSize(error.response)
        };
      } else if (error.request) {
        throw new Error(`SOAP Network Error: ${error.message}`);
      } else {
        throw new Error(`SOAP Request Error: ${error.message}`);
      }
    }
  }

  private static getSoapAction(request: SoapRequest): string {
    try {
      const soapConfig = JSON.parse(request.body || '{}');
      return soapConfig.soapAction || request.soap?.action || '';
    } catch {
      return request.soap?.action || '';
    }
  }

  private static buildSoapEnvelope(request: SoapRequest): string {
    // Try to parse SOAP configuration from body
    let soapConfig: any = {};
    try {
      soapConfig = JSON.parse(request.body || '{}');
    } catch {
      // If body is not JSON, treat it as XML envelope
      if (request.body && request.body.includes('<soap:Envelope')) {
        return request.body;
      }
    }

    // If envelope is provided in config, use it
    if (soapConfig.envelope) {
      return soapConfig.envelope;
    }

    // Build basic SOAP envelope
    const namespace = soapConfig.namespace || request.soap?.namespace || 'http://tempuri.org/';
    const operation = soapConfig.operation || request.soap?.operation || 'Operation';
    
    let envelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="${namespace}">`;

    // Add SOAP header with WS-Security if needed
    if (request.auth?.type === 'ws-security' && request.auth.wssUsername) {
      envelope += `
  <soap:Header>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <wsse:UsernameToken>
        <wsse:Username>${request.auth.wssUsername}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#${request.auth.wssPasswordType || 'PasswordText'}">${request.auth.wssPassword || ''}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soap:Header>`;
    } else {
      envelope += `
  <soap:Header>
  </soap:Header>`;
    }

    envelope += `
  <soap:Body>
    <tns:${operation}>`;

    // Add body content if available and not already in envelope format
    if (request.body && !request.body.includes('<soap:Envelope')) {
      try {
        const bodyData = JSON.parse(request.body);
        // Skip SOAP config properties and add actual request data
        Object.keys(bodyData).forEach(key => {
          if (!['soapAction', 'wsdlUrl', 'namespace', 'operation', 'envelope'].includes(key)) {
            envelope += `
      <tns:${key}>${bodyData[key]}</tns:${key}>`;
          }
        });
      } catch {
        // If not JSON, add as text content
        if (!soapConfig.soapAction) { // Only add if it's not our config
          envelope += `
      ${request.body}`;
        }
      }
    }

    envelope += `
    </tns:${operation}>
  </soap:Body>
</soap:Envelope>`;

    return envelope;
  }

  private static parseSoapResponse(responseData: string): any {
    if (!responseData || typeof responseData !== 'string') {
      return responseData;
    }

    try {
      // Simple XML to JSON conversion for SOAP responses
      // In a production environment, you'd want to use a proper XML parser
      
      // Check for SOAP fault
      if (responseData.includes('soap:Fault') || responseData.includes('<Fault')) {
        const faultMatch = responseData.match(/<faultstring[^>]*>(.*?)<\/faultstring>/i) ||
                          responseData.match(/<Reason[^>]*>(.*?)<\/Reason>/i);
        const faultCodeMatch = responseData.match(/<faultcode[^>]*>(.*?)<\/faultcode>/i) ||
                              responseData.match(/<Code[^>]*>(.*?)<\/Code>/i);
        
        return {
          soapFault: true,
          faultCode: faultCodeMatch ? faultCodeMatch[1] : 'Unknown',
          faultString: faultMatch ? faultMatch[1] : 'SOAP Fault occurred',
          rawResponse: responseData
        };
      }

      // Extract SOAP body content
      const bodyMatch = responseData.match(/<soap:Body[^>]*>(.*?)<\/soap:Body>/is) ||
                       responseData.match(/<Body[^>]*>(.*?)<\/Body>/is);
      
      if (bodyMatch) {
        const bodyContent = bodyMatch[1];
        
        // Try to convert simple XML elements to key-value pairs
        const result: any = {};
        const elementRegex = /<([^>\s]+)[^>]*>([^<]+)<\/\1>/g;
        let match;
        
        while ((match = elementRegex.exec(bodyContent)) !== null) {
          const key = match[1].replace(/^[^:]*:/, ''); // Remove namespace prefix
          const value = match[2];
          result[key] = value;
        }
        
        return Object.keys(result).length > 0 ? result : { bodyContent, rawResponse: responseData };
      }
      
      return { rawResponse: responseData };
    } catch (error) {
      return {
        parseError: true,
        error: error instanceof Error ? error.message : 'XML parsing failed',
        rawResponse: responseData
      };
    }
  }

  private static buildAuthHeader(auth?: SoapRequest['auth']): Record<string, string> {
    if (!auth || auth.type === 'none' || auth.type === 'ws-security') {
      return {};
    }

    switch (auth.type) {
      case 'bearer':
        return auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
      
      case 'basic':
        if (auth.username && auth.password) {
          const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
          return { Authorization: `Basic ${credentials}` };
        }
        return {};
      
      case 'api-key':
        return auth.key && auth.value ? { [auth.key]: auth.value } : {};
      
      default:
        return {};
    }
  }

  private static calculateResponseSize(response: AxiosResponse): number {
    const contentLength = response.headers['content-length'];
    if (contentLength) {
      return parseInt(contentLength, 10);
    }
    
    try {
      return typeof response.data === 'string' 
        ? response.data.length 
        : JSON.stringify(response.data).length;
    } catch {
      return 0;
    }
  }
}