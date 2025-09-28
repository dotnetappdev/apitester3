// Visual Studio-style test runner with assertion framework
import { ApiResponse } from '../types';

export interface TestAssertion {
  type: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'statusCode' | 'responseTime' | 'jsonPath' | 'schema';
  expected: any;
  actual?: any;
  path?: string; // For JSON path assertions
  message?: string;
  passed: boolean;
}

export interface TestCase {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  script: string; // JavaScript test script
  expectedResponse?: any; // Expected JSON response
  assertions: TestAssertion[];
  timeout: number; // in milliseconds
  tags?: string[];
}

export interface TestExecutionResult {
  testCaseId: string;
  testName: string;
  status: 'pass' | 'fail' | 'skip' | 'error';
  executionTime: number;
  assertions: TestAssertion[];
  errorMessage?: string;
  actualResponse?: any;
  runAt: string;
}

export interface TestSuite {
  id: string;
  name: string;
  requestId: number;
  testCases: TestCase[];
  beforeEach?: string; // Setup script
  afterEach?: string; // Cleanup script
}

// Test assertion framework - similar to Visual Studio/MSTest
export class TestAssertions {
  private assertions: TestAssertion[] = [];

  // Assert equals with type checking
  assertEquals(expected: any, actual: any, message?: string): void {
    const passed = this.deepEquals(expected, actual);
    this.assertions.push({
      type: 'equals',
      expected,
      actual,
      message: message || `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`,
      passed
    });
    
    if (!passed) {
      throw new Error(message || `Assertion failed: Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
    }
  }

  // Assert not equals
  assertNotEquals(expected: any, actual: any, message?: string): void {
    const passed = !this.deepEquals(expected, actual);
    this.assertions.push({
      type: 'notEquals',
      expected,
      actual,
      message: message || `Expected not to equal ${JSON.stringify(expected)}`,
      passed
    });
    
    if (!passed) {
      throw new Error(message || `Assertion failed: Expected not to equal ${JSON.stringify(expected)}`);
    }
  }

  // Assert contains (for strings, arrays, objects)
  assertContains(container: any, item: any, message?: string): void {
    let passed = false;
    
    if (typeof container === 'string' && typeof item === 'string') {
      passed = container.includes(item);
    } else if (Array.isArray(container)) {
      passed = container.some(element => this.deepEquals(element, item));
    } else if (typeof container === 'object' && container !== null) {
      passed = this.objectContains(container, item);
    }
    
    this.assertions.push({
      type: 'contains',
      expected: item,
      actual: container,
      message: message || `Expected container to contain ${JSON.stringify(item)}`,
      passed
    });
    
    if (!passed) {
      throw new Error(message || `Assertion failed: Container does not contain ${JSON.stringify(item)}`);
    }
  }

  // Assert HTTP status code
  assertStatusCode(expectedStatus: number, actualStatus: number, message?: string): void {
    const passed = expectedStatus === actualStatus;
    this.assertions.push({
      type: 'statusCode',
      expected: expectedStatus,
      actual: actualStatus,
      message: message || `Expected status code ${expectedStatus}, but got ${actualStatus}`,
      passed
    });
    
    if (!passed) {
      throw new Error(message || `Assertion failed: Expected status code ${expectedStatus}, but got ${actualStatus}`);
    }
  }

  // Assert response time is within acceptable range
  assertResponseTime(maxTime: number, actualTime: number, message?: string): void {
    const passed = actualTime <= maxTime;
    this.assertions.push({
      type: 'responseTime', 
      expected: maxTime,
      actual: actualTime,
      message: message || `Expected response time <= ${maxTime}ms, but got ${actualTime}ms`,
      passed
    });
    
    if (!passed) {
      throw new Error(message || `Assertion failed: Response time ${actualTime}ms exceeds maximum ${maxTime}ms`);
    }
  }

  // Assert JSON path value
  assertJsonPath(jsonData: any, path: string, expectedValue: any, message?: string): void {
    const actualValue = this.getJsonPathValue(jsonData, path);
    const passed = this.deepEquals(expectedValue, actualValue);
    
    this.assertions.push({
      type: 'jsonPath',
      expected: expectedValue,
      actual: actualValue,
      path,
      message: message || `Expected JSON path '${path}' to equal ${JSON.stringify(expectedValue)}, but got ${JSON.stringify(actualValue)}`,
      passed
    });
    
    if (!passed) {
      throw new Error(message || `Assertion failed: JSON path '${path}' expected ${JSON.stringify(expectedValue)}, but got ${JSON.stringify(actualValue)}`);
    }
  }

  // Get all assertions from this test run
  getAssertions(): TestAssertion[] {
    return [...this.assertions];
  }

  // Clear assertions for new test
  clearAssertions(): void {
    this.assertions = [];
  }

  // Deep equality comparison
  private deepEquals(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      
      if (Array.isArray(a)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
          if (!this.deepEquals(a[i], b[i])) return false;
        }
        return true;
      } else {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        
        for (const key of keysA) {
          if (!keysB.includes(key)) return false;
          if (!this.deepEquals(a[key], b[key])) return false;
        }
        return true;
      }
    }
    
    return false;
  }

  // Check if object contains another object/value
  private objectContains(container: any, item: any): boolean {
    if (typeof item === 'object' && item !== null) {
      for (const key in item) {
        if (!(key in container) || !this.deepEquals(container[key], item[key])) {
          return false;
        }
      }
      return true;
    }
    return Object.values(container).some(value => this.deepEquals(value, item));
  }

  // Get value from JSON using simple path notation (e.g., "data.user.id")
  private getJsonPathValue(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current == null || typeof current !== 'object') {
        return undefined;
      }
      
      // Handle array indices like "users[0]"
      const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, arrayName, index] = arrayMatch;
        current = current[arrayName];
        if (!Array.isArray(current)) return undefined;
        current = current[parseInt(index, 10)];
      } else {
        current = current[part];
      }
    }
    
    return current;
  }
}

// Test execution engine
export class TestRunner {
  private static instance: TestRunner;
  
  static getInstance(): TestRunner {
    if (!TestRunner.instance) {
      TestRunner.instance = new TestRunner();
    }
    return TestRunner.instance;
  }

  // Execute a single test case
  async executeTestCase(
    testCase: TestCase, 
    response: ApiResponse, 
    request: any
  ): Promise<TestExecutionResult> {
    const startTime = Date.now();
    const result: TestExecutionResult = {
      testCaseId: testCase.id,
      testName: testCase.name,
      status: 'pass',
      executionTime: 0,
      assertions: [],
      actualResponse: response.data,
      runAt: new Date().toISOString()
    };

    if (!testCase.enabled) {
      result.status = 'skip';
      result.executionTime = Date.now() - startTime;
      return result;
    }

    try {
      // Create test context
      const assert = new TestAssertions();
      
      // Create test execution context
      const testContext = {
        response,
        request,
        assert,
        console: {
          log: (...args: any[]) => console.log('[TEST]', ...args),
          error: (...args: any[]) => console.error('[TEST]', ...args)
        }
      };

      // Execute the test script
      const testFunction = new Function(
        'response', 'request', 'assert', 'console',
        testCase.script
      );
      
      await testFunction(
        testContext.response,
        testContext.request,
        testContext.assert,
        testContext.console
      );

      // Get assertions from the test
      result.assertions = assert.getAssertions();
      result.status = result.assertions.every(a => a.passed) ? 'pass' : 'fail';
      
    } catch (error) {
      result.status = 'error';
      result.errorMessage = error instanceof Error ? error.message : String(error);
    }

    result.executionTime = Date.now() - startTime;
    return result;
  }

  // Execute all test cases in a test suite
  async executeTestSuite(
    testSuite: TestSuite,
    response: ApiResponse,
    request: any,
    options?: { retryCount?: number; parallel?: boolean }
  ): Promise<TestExecutionResult[]> {
    const results: TestExecutionResult[] = [];
    const retryCount = options?.retryCount ?? 0;
    const parallel = !!options?.parallel;

    const runOne = async (testCase: TestCase) => {
      let attempt = 0;
      let lastResult: TestExecutionResult | null = null;

      while (attempt <= retryCount) {
        lastResult = await this.executeTestCase(testCase, response, request);
        if (lastResult.status === 'pass') break;
        attempt++;
      }

      return lastResult as TestExecutionResult;
    };

    if (parallel) {
      const promises = testSuite.testCases.map(tc => runOne(tc));
      const settled = await Promise.all(promises);
      results.push(...settled);
    } else {
      for (const testCase of testSuite.testCases) {
        const res = await runOne(testCase);
        results.push(res);
      }
    }

    return results;
  }

  // Generate sample test script
  generateSampleTestScript(): string {
    return `// Visual Studio-style test assertions
// Test response status
assert.assertStatusCode(200, response.status, 'Should return OK status');

// Test response time
assert.assertResponseTime(1000, response.responseTime, 'Should respond within 1 second');

// Test JSON response content
assert.assertJsonPath(response.data, 'status', 'success', 'Status should be success');
assert.assertJsonPath(response.data, 'data.id', 1, 'ID should be 1');

// Test response contains expected data
assert.assertContains(response.data, { status: 'success' }, 'Response should contain success status');

// Test string contains
if (response.data.message) {
  assert.assertContains(response.data.message, 'Hello', 'Message should contain greeting');
}

// Custom validation
if (response.data.users && Array.isArray(response.data.users)) {
  assert.assertEquals(true, response.data.users.length > 0, 'Should have users in response');
}

console.log('Test completed successfully');`;
  }

  // Create default test case for a request
  createDefaultTestCase(requestId: number, requestName: string): TestCase {
    return {
      id: `test_${requestId}_${Date.now()}`,
      name: `Test ${requestName}`,
      description: `Automated test for ${requestName}`,
      enabled: true,
      script: this.generateSampleTestScript(),
      assertions: [],
      timeout: 5000
    };
  }
}

// Export all test-related types and classes
export default TestRunner;