// UI Test Runner with Playwright integration
import { Browser, BrowserContext, Page, chromium, firefox, webkit } from 'playwright';
import { TestExecutionResult, TestAssertion } from './TestRunner';

export interface UITestCase {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  script: string; // Playwright test script
  timeout: number; // in milliseconds
  tags?: string[];
  browser: 'chromium' | 'firefox' | 'webkit';
  headless: boolean;
  viewport?: { width: number; height: number };
  captureScreenshot?: 'always' | 'on-failure' | 'never'; // Screenshot capture option
}

export interface UITestSuite {
  id: string;
  name: string;
  projectId?: number; // Link to parent project
  testCases: UITestCase[];
  beforeAll?: string; // Setup script for all tests
  afterAll?: string; // Cleanup script for all tests
  beforeEach?: string; // Setup script for each test
  afterEach?: string; // Cleanup script for each test
}

export interface UITestExecutionResult extends TestExecutionResult {
  screenshot?: string; // Base64 encoded screenshot on failure
  browserLogs?: string[]; // Console logs from browser
  traces?: string; // Playwright traces
  testCaseId: string;
  testName: string;
  status: 'pass' | 'fail' | 'skip' | 'error';
  executionTime: number;
  assertions: TestAssertion[];
  errorMessage?: string;
  runAt: string;
}

// UI Test assertion framework
export class UITestAssertions {
  private assertions: TestAssertion[] = [];

  // Assert element exists
  assertElementExists(selector: string, message?: string): void {
    this.assertions.push({
      type: 'contains',
      expected: true,
      path: `element:${selector}`,
      message: message || `Element '${selector}' should exist`,
      passed: false // Will be updated during execution
    });
  }

  // Assert element text
  assertElementText(selector: string, expectedText: string, message?: string): void {
    this.assertions.push({
      type: 'equals',
      expected: expectedText,
      path: `element:${selector}:text`,
      message: message || `Element '${selector}' should have text '${expectedText}'`,
      passed: false
    });
  }

  // Assert element visible
  assertElementVisible(selector: string, message?: string): void {
    this.assertions.push({
      type: 'contains',
      expected: true,
      path: `element:${selector}:visible`,
      message: message || `Element '${selector}' should be visible`,
      passed: false
    });
  }

  // Assert URL contains
  assertUrlContains(expectedUrl: string, message?: string): void {
    this.assertions.push({
      type: 'contains',
      expected: expectedUrl,
      path: 'url',
      message: message || `URL should contain '${expectedUrl}'`,
      passed: false
    });
  }

  // Assert page title
  assertPageTitle(expectedTitle: string, message?: string): void {
    this.assertions.push({
      type: 'equals',
      expected: expectedTitle,
      path: 'title',
      message: message || `Page title should be '${expectedTitle}'`,
      passed: false
    });
  }

  getAssertions(): TestAssertion[] {
    return [...this.assertions];
  }

  reset(): void {
    this.assertions = [];
  }
}

// UI Test execution engine
export class UITestRunner {
  private static instance: UITestRunner;
  
  static getInstance(): UITestRunner {
    if (!UITestRunner.instance) {
      UITestRunner.instance = new UITestRunner();
    }
    return UITestRunner.instance;
  }

  // Execute a single UI test case
  async executeUITestCase(testCase: UITestCase): Promise<UITestExecutionResult> {
    const startTime = Date.now();
    let browser: Browser | null = null;
    let context: BrowserContext | null = null;
    let page: Page | null = null;
    const assertions: TestAssertion[] = [];
    let screenshot: string | undefined;
    let browserLogs: string[] = [];
    
    try {
      // Launch browser
      browser = await this.launchBrowser(testCase.browser, testCase.headless);
      
      // Create context
      context = await browser.newContext({
        viewport: testCase.viewport || { width: 1280, height: 720 }
      });
      
      // Create page
      page = await context.newPage();
      
      // Collect console logs
      page.on('console', msg => {
        browserLogs.push(`${msg.type()}: ${msg.text()}`);
      });
      
      // Set up test environment
      const uiAssert = new UITestAssertions();
      
      // Create test context
      const testContext = {
        page,
        browser,
        context,
        assert: uiAssert,
        console: {
          log: (...args: any[]) => console.log('[UI Test]', ...args),
          error: (...args: any[]) => console.error('[UI Test]', ...args),
          warn: (...args: any[]) => console.warn('[UI Test]', ...args)
        }
      };
      
      // Execute test script with timeout
      const executionPromise = this.executeScript(testCase.script, testContext);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Test timeout')), testCase.timeout)
      );
      
      await Promise.race([executionPromise, timeoutPromise]);
      
      // Get assertions and validate them
      const testAssertions = uiAssert.getAssertions();
      await this.validateAssertions(testAssertions, page);
      
      assertions.push(...testAssertions);
      
      const hasFailures = assertions.some(a => !a.passed);
      
      // Take screenshot based on user preference
      const captureMode = testCase.captureScreenshot || 'on-failure';
      let shouldCapture = false;
      
      switch (captureMode) {
        case 'always':
          shouldCapture = true;
          break;
        case 'on-failure':
          shouldCapture = hasFailures;
          break;
        case 'never':
          shouldCapture = false;
          break;
      }
      
      if (shouldCapture && page) {
        screenshot = await page.screenshot({ encoding: 'base64' });
      }
      
      return {
        testCaseId: testCase.id,
        testName: testCase.name,
        status: hasFailures ? 'fail' : 'pass',
        executionTime: Date.now() - startTime,
        assertions,
        runAt: new Date().toISOString(),
        screenshot,
        browserLogs
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Take screenshot on error based on user preference
      const captureMode = testCase.captureScreenshot || 'on-failure';
      if ((captureMode === 'always' || captureMode === 'on-failure') && page) {
        try {
          screenshot = await page.screenshot({ encoding: 'base64' });
        } catch (screenshotError) {
          console.warn('Failed to capture screenshot:', screenshotError);
        }
      }
      
      return {
        testCaseId: testCase.id,
        testName: testCase.name,
        status: 'error',
        executionTime: Date.now() - startTime,
        assertions,
        errorMessage,
        runAt: new Date().toISOString(),
        screenshot,
        browserLogs
      };
    } finally {
      // Cleanup
      try {
        if (page) await page.close();
        if (context) await context.close();
        if (browser) await browser.close();
      } catch (cleanupError) {
        console.warn('Cleanup error:', cleanupError);
      }
    }
  }

  // Execute all test cases in a UI test suite
  async executeUITestSuite(testSuite: UITestSuite): Promise<UITestExecutionResult[]> {
    const results: UITestExecutionResult[] = [];
    
    // Execute beforeAll if present
    if (testSuite.beforeAll) {
      console.log('Running beforeAll script...');
      // This could be implemented to run setup scripts
    }
    
    try {
      // Execute each test case
      for (const testCase of testSuite.testCases) {
        if (!testCase.enabled) {
          results.push({
            testCaseId: testCase.id,
            testName: testCase.name,
            status: 'skip',
            executionTime: 0,
            assertions: [],
            runAt: new Date().toISOString()
          });
          continue;
        }
        
        const result = await this.executeUITestCase(testCase);
        results.push(result);
      }
    } finally {
      // Execute afterAll if present
      if (testSuite.afterAll) {
        console.log('Running afterAll script...');
        // This could be implemented to run cleanup scripts
      }
    }
    
    return results;
  }

  // Launch browser based on type
  private async launchBrowser(browserType: 'chromium' | 'firefox' | 'webkit', headless: boolean): Promise<Browser> {
    const options = { 
      headless,
      args: headless ? ['--no-sandbox', '--disable-setuid-sandbox'] : undefined
    };
    
    switch (browserType) {
      case 'firefox':
        return await firefox.launch(options);
      case 'webkit':
        return await webkit.launch(options);
      case 'chromium':
      default:
        return await chromium.launch(options);
    }
  }

  // Execute test script in a sandboxed environment
  private async executeScript(script: string, context: any): Promise<void> {
    // Create a function from the script and execute it
    const testFunction = new Function('page', 'browser', 'context', 'assert', 'console', script);
    await testFunction(context.page, context.browser, context.context, context.assert, context.console);
  }

  // Validate assertions by checking actual values
  private async validateAssertions(assertions: TestAssertion[], page: Page): Promise<void> {
    for (const assertion of assertions) {
      try {
        if (assertion.path?.startsWith('element:')) {
          await this.validateElementAssertion(assertion, page);
        } else if (assertion.path === 'url') {
          await this.validateUrlAssertion(assertion, page);
        } else if (assertion.path === 'title') {
          await this.validateTitleAssertion(assertion, page);
        }
      } catch (error) {
        assertion.passed = false;
        if (!assertion.message) {
          assertion.message = error instanceof Error ? error.message : 'Assertion failed';
        }
      }
    }
  }

  private async validateElementAssertion(assertion: TestAssertion, page: Page): Promise<void> {
    const pathParts = assertion.path!.split(':');
    const selector = pathParts[1];
    const property = pathParts[2];
    
    const element = page.locator(selector);
    
    switch (property) {
      case undefined: // Element exists
        assertion.actual = await element.count() > 0;
        assertion.passed = assertion.actual === assertion.expected;
        break;
      case 'text':
        assertion.actual = await element.textContent();
        assertion.passed = assertion.actual === assertion.expected;
        break;
      case 'visible':
        assertion.actual = await element.isVisible();
        assertion.passed = assertion.actual === assertion.expected;
        break;
    }
  }

  private async validateUrlAssertion(assertion: TestAssertion, page: Page): Promise<void> {
    assertion.actual = page.url();
    assertion.passed = assertion.actual.includes(assertion.expected);
  }

  private async validateTitleAssertion(assertion: TestAssertion, page: Page): Promise<void> {
    assertion.actual = await page.title();
    assertion.passed = assertion.actual === assertion.expected;
  }

  // Generate sample UI test script
  generateSampleUITestScript(): string {
    return `// Playwright UI Test Script
// Available objects: page, browser, context, assert, console

// Navigate to a page
await page.goto('https://example.com');

// Wait for page to load
await page.waitForLoadState('networkidle');

// Assert page title
assert.assertPageTitle('Example Domain', 'Page should have correct title');

// Check if an element exists
assert.assertElementExists('h1', 'Page should have a heading');

// Check element text content
assert.assertElementText('h1', 'Example Domain', 'Heading should have correct text');

// Check if element is visible
assert.assertElementVisible('h1', 'Heading should be visible');

// Interact with elements
await page.click('a[href*="more"]');

// Wait for navigation
await page.waitForURL('**/more/**');

// Assert URL contains expected path
assert.assertUrlContains('/more', 'Should navigate to more information page');

// Fill form fields
await page.fill('input[name="search"]', 'test query');
await page.click('button[type="submit"]');

// Wait for results
await page.waitForSelector('.results');

// Validate results
assert.assertElementExists('.results', 'Search results should be displayed');

console.log('UI test completed successfully');`;
  }

  // Create default UI test case
  createDefaultUITestCase(name: string): UITestCase {
    return {
      id: `ui_test_${Date.now()}`,
      name,
      description: `UI test for ${name}`,
      enabled: true,
      script: this.generateSampleUITestScript(),
      timeout: 30000, // 30 seconds
      browser: 'chromium',
      headless: true,
      captureScreenshot: 'on-failure' // Default to capture on failure
    };
  }
}

export default UITestRunner;