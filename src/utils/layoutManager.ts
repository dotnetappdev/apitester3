// Layout Manager for handling dockable panels and layout persistence
export interface PanelConfig {
  id: string;
  title: string;
  component: string;
  visible: boolean;
  size?: number;
  minSize?: number;
  maxSize?: number;
}

export interface LayoutConfig {
  version: string;
  panels: {
    sidebar: PanelConfig;
    testRunner: PanelConfig;
    requestPanel: PanelConfig;
    responsePanel: PanelConfig;
  };
  splitterSizes: {
    main: number;
    content: number;
    testRunner: number;
  };
  responsive: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
}

export class LayoutManager {
  private static instance: LayoutManager;
  private readonly STORAGE_KEY = 'apitester3_layout_config';
  
  private defaultConfig: LayoutConfig = {
    version: '1.0.0',
    panels: {
      sidebar: {
        id: 'sidebar',
        title: 'Collections',
        component: 'EnhancedSidebar',
        visible: true,
        size: 300,
        minSize: 200,
        maxSize: 500
      },
      testRunner: {
        id: 'testRunner',
        title: 'Test Explorer',
        component: 'TestExplorer',
        visible: true,
        size: 350,
        minSize: 250,
        maxSize: 600
      },
      requestPanel: {
        id: 'requestPanel',
        title: 'Request',
        component: 'EnhancedRequestPanel',
        visible: true,
        size: 50, // percentage
        minSize: 30,
        maxSize: 70
      },
      responsePanel: {
        id: 'responsePanel',
        title: 'Response',
        component: 'ResponsePanel',
        visible: true,
        size: 50, // percentage
        minSize: 30,
        maxSize: 70
      }
    },
    splitterSizes: {
      main: 300, // sidebar width
      content: 50, // request/response split
      testRunner: 350 // test runner width
    },
    responsive: {
      mobile: false,
      tablet: false,
      desktop: true
    }
  };

  public static getInstance(): LayoutManager {
    if (!LayoutManager.instance) {
      LayoutManager.instance = new LayoutManager();
    }
    return LayoutManager.instance;
  }

  public loadLayout(): LayoutConfig {
    try {
      const savedLayout = localStorage.getItem(this.STORAGE_KEY);
      if (savedLayout) {
        const parsed = JSON.parse(savedLayout);
        // Merge with defaults to ensure all properties exist
        return this.mergeWithDefaults(parsed);
      }
    } catch (error) {
      console.warn('Failed to load layout config, using defaults:', error);
    }
    return this.defaultConfig;
  }

  public saveLayout(config: LayoutConfig): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save layout config:', error);
    }
  }

  public resetLayout(): LayoutConfig {
    localStorage.removeItem(this.STORAGE_KEY);
    return this.defaultConfig;
  }

  public updatePanelVisibility(panelId: string, visible: boolean): LayoutConfig {
    const config = this.loadLayout();
    if (config.panels[panelId as keyof typeof config.panels]) {
      config.panels[panelId as keyof typeof config.panels].visible = visible;
      this.saveLayout(config);
    }
    return config;
  }

  public updateSplitterSize(splitter: keyof LayoutConfig['splitterSizes'], size: number): LayoutConfig {
    const config = this.loadLayout();
    config.splitterSizes[splitter] = size;
    this.saveLayout(config);
    return config;
  }

  public getResponsiveConfig(): { mobile: boolean; tablet: boolean; desktop: boolean } {
    const width = window.innerWidth;
    return {
      mobile: width < 768,
      tablet: width >= 768 && width < 1024,
      desktop: width >= 1024
    };
  }

  public updateResponsiveState(): LayoutConfig {
    const config = this.loadLayout();
    config.responsive = this.getResponsiveConfig();
    
    // Adjust panel visibility based on screen size
    if (config.responsive.mobile) {
      // On mobile, hide test runner by default to save space
      config.panels.testRunner.visible = false;
      config.splitterSizes.main = 250; // Smaller sidebar
    } else if (config.responsive.tablet) {
      // On tablet, show test runner but make it smaller
      config.panels.testRunner.visible = true;
      config.panels.testRunner.size = 280;
      config.splitterSizes.main = 280;
    } else {
      // Desktop - use saved preferences or defaults
      config.panels.testRunner.visible = config.panels.testRunner.visible ?? true;
    }
    
    this.saveLayout(config);
    return config;
  }

  private mergeWithDefaults(config: Partial<LayoutConfig>): LayoutConfig {
    return {
      version: config.version || this.defaultConfig.version,
      panels: {
        ...this.defaultConfig.panels,
        ...config.panels
      },
      splitterSizes: {
        ...this.defaultConfig.splitterSizes,
        ...config.splitterSizes
      },
      responsive: {
        ...this.defaultConfig.responsive,
        ...config.responsive
      }
    };
  }

  public exportLayout(): string {
    const config = this.loadLayout();
    return JSON.stringify(config, null, 2);
  }

  public importLayout(layoutData: string): boolean {
    try {
      const config = JSON.parse(layoutData);
      const mergedConfig = this.mergeWithDefaults(config);
      this.saveLayout(mergedConfig);
      return true;
    } catch (error) {
      console.error('Failed to import layout:', error);
      return false;
    }
  }
}