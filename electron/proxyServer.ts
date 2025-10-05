import { createServer, IncomingMessage, ServerResponse } from 'http';
import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { BrowserWindow } from 'electron';

export interface ProxyServerConfig {
  port: number;
  targetEndpoints: string[];
  interceptEnabled: boolean;
  autoRespond: boolean;
}

export class ProxyServer {
  private server: any;
  private config: ProxyServerConfig;
  private mainWindow: BrowserWindow | null;
  private interceptedTraffic: Map<string, any> = new Map();

  constructor(config: ProxyServerConfig, mainWindow: BrowserWindow | null) {
    this.config = config;
    this.mainWindow = mainWindow;
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = createServer((req: IncomingMessage, res: ServerResponse) => {
          this.handleRequest(req, res);
        });

        this.server.listen(this.config.port, () => {
          console.log(`Proxy server listening on port ${this.config.port}`);
          resolve();
        });

        this.server.on('error', (err: Error) => {
          console.error('Proxy server error:', err);
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Proxy server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse) {
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    // Collect request body
    const bodyChunks: Buffer[] = [];
    req.on('data', (chunk) => {
      bodyChunks.push(chunk);
    });

    req.on('end', async () => {
      const body = Buffer.concat(bodyChunks).toString('utf8');
      
      // Parse URL and query params
      const url = req.url || '/';
      const [path, queryString] = url.split('?');
      const queryParams: Record<string, string> = {};
      if (queryString) {
        queryString.split('&').forEach(param => {
          const [key, value] = param.split('=');
          queryParams[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
      }

      // Create intercepted request object
      const interceptedRequest = {
        id: requestId,
        timestamp: new Date().toISOString(),
        method: req.method || 'GET',
        url: url,
        headers: req.headers as Record<string, string>,
        body: body || undefined,
        queryParams,
        clientAddress: req.socket.remoteAddress,
        protocol: 'http'
      };

      // Send to renderer process
      if (this.mainWindow && this.config.interceptEnabled) {
        this.mainWindow.webContents.send('proxy-request-intercepted', interceptedRequest);
      }

      // If not auto-responding, wait for user action
      if (this.config.interceptEnabled && !this.config.autoRespond) {
        // Store the original response object for later
        this.interceptedTraffic.set(requestId, { req, res, interceptedRequest });
        return;
      }

      // Auto-forward to target
      this.forwardRequest(req, res, interceptedRequest, body, startTime);
    });
  }

  private forwardRequest(
    originalReq: IncomingMessage,
    originalRes: ServerResponse,
    interceptedRequest: any,
    body: string,
    startTime: number
  ) {
    // Determine target endpoint
    let targetUrl = this.config.targetEndpoints[0] || 'http://localhost:3000';
    
    // Parse target URL
    const targetUrlObj = new URL(targetUrl);
    const isHttps = targetUrlObj.protocol === 'https:';
    const requestFn = isHttps ? httpsRequest : httpRequest;

    const options = {
      hostname: targetUrlObj.hostname,
      port: targetUrlObj.port || (isHttps ? 443 : 80),
      path: interceptedRequest.url,
      method: interceptedRequest.method,
      headers: { ...interceptedRequest.headers }
    };

    // Remove host header to avoid conflicts
    delete options.headers.host;

    const proxyReq = requestFn(options, (proxyRes) => {
      const responseChunks: Buffer[] = [];
      
      proxyRes.on('data', (chunk) => {
        responseChunks.push(chunk);
      });

      proxyRes.on('end', () => {
        const responseBody = Buffer.concat(responseChunks).toString('utf8');
        const endTime = Date.now();

        // Create intercepted response object
        const interceptedResponse = {
          id: `${interceptedRequest.id}-response`,
          requestId: interceptedRequest.id,
          timestamp: new Date().toISOString(),
          statusCode: proxyRes.statusCode || 500,
          statusText: proxyRes.statusMessage || 'Unknown',
          headers: proxyRes.headers as Record<string, string>,
          body: responseBody,
          responseTime: endTime - startTime,
          size: Buffer.byteLength(responseBody)
        };

        // Send to renderer process
        if (this.mainWindow && this.config.interceptEnabled) {
          this.mainWindow.webContents.send('proxy-response-intercepted', {
            request: interceptedRequest,
            response: interceptedResponse
          });
        }

        // Forward response to original client
        originalRes.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        originalRes.end(responseBody);
      });
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy request error:', err);
      originalRes.writeHead(502, { 'Content-Type': 'text/plain' });
      originalRes.end('Bad Gateway: Unable to reach target server');
    });

    // Send request body if present
    if (body) {
      proxyReq.write(body);
    }
    proxyReq.end();
  }

  public respondToInterceptedRequest(requestId: string, modifiedResponse: any) {
    const traffic = this.interceptedTraffic.get(requestId);
    if (!traffic) {
      console.error('No intercepted traffic found for request:', requestId);
      return;
    }

    const { res } = traffic;
    
    // Send modified response
    res.writeHead(modifiedResponse.statusCode || 200, modifiedResponse.headers || {});
    res.end(modifiedResponse.body || '');

    // Clean up
    this.interceptedTraffic.delete(requestId);
  }

  public updateConfig(config: Partial<ProxyServerConfig>) {
    this.config = { ...this.config, ...config };
  }
}
