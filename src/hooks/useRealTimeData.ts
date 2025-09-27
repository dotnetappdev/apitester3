import { useEffect, useCallback, useRef } from 'react';
import { Collection, Request, TestResult } from '../database/DatabaseManager';
import { TestSuite, TestExecutionResult } from '../testing/TestRunner';

// Real-time data synchronization hook for keeping all panels in sync
export interface DataUpdateEvent {
  type: 'collection_updated' | 'request_updated' | 'test_result_updated' | 'test_suite_updated' | 'request_deleted' | 'collection_deleted';
  data: any;
  timestamp: number;
}

export interface RealTimeDataManager {
  subscribeToUpdates: (callback: (event: DataUpdateEvent) => void) => () => void;
  broadcastUpdate: (event: Omit<DataUpdateEvent, 'timestamp'>) => void;
  getLatestData: () => {
    collections: Collection[];
    testResults: Map<number, TestResult[]>;
    testExecutionResults: Map<number, TestExecutionResult[]>;
  };
}

class RealTimeDataManagerImpl implements RealTimeDataManager {
  private subscribers: Set<(event: DataUpdateEvent) => void> = new Set();
  private dataCache = {
    collections: [] as Collection[],
    testResults: new Map<number, TestResult[]>(),
    testExecutionResults: new Map<number, TestExecutionResult[]>()
  };

  subscribeToUpdates(callback: (event: DataUpdateEvent) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  broadcastUpdate(event: Omit<DataUpdateEvent, 'timestamp'>): void {
    const fullEvent: DataUpdateEvent = {
      ...event,
      timestamp: Date.now()
    };

    // Update cache based on event type
    this.updateCache(fullEvent);

    // Notify all subscribers
    this.subscribers.forEach(callback => {
      try {
        callback(fullEvent);
      } catch (error) {
        console.error('Error in real-time data subscriber:', error);
      }
    });
  }

  private updateCache(event: DataUpdateEvent): void {
    switch (event.type) {
      case 'collection_updated':
        const collection = event.data as Collection;
        const collectionIndex = this.dataCache.collections.findIndex(c => c.id === collection.id);
        if (collectionIndex >= 0) {
          this.dataCache.collections[collectionIndex] = collection;
        } else {
          this.dataCache.collections.push(collection);
        }
        break;

      case 'request_updated':
        const request = event.data as Request;
        this.dataCache.collections.forEach(collection => {
          if (collection.requests) {
            const requestIndex = collection.requests.findIndex(r => r.id === request.id);
            if (requestIndex >= 0) {
              collection.requests[requestIndex] = request;
            }
          }
        });
        break;

      case 'test_result_updated':
        const { requestId, results } = event.data as { requestId: number; results: TestResult[] };
        this.dataCache.testResults.set(requestId, results);
        break;

      case 'collection_deleted':
        const deletedCollectionId = event.data as number;
        this.dataCache.collections = this.dataCache.collections.filter(c => c.id !== deletedCollectionId);
        break;

      case 'request_deleted':
        const deletedRequestId = event.data as number;
        this.dataCache.collections.forEach(collection => {
          if (collection.requests) {
            collection.requests = collection.requests.filter(r => r.id !== deletedRequestId);
          }
        });
        this.dataCache.testResults.delete(deletedRequestId);
        this.dataCache.testExecutionResults.delete(deletedRequestId);
        break;
    }
  }

  getLatestData() {
    return {
      collections: [...this.dataCache.collections],
      testResults: new Map(this.dataCache.testResults),
      testExecutionResults: new Map(this.dataCache.testExecutionResults)
    };
  }

  updateDataCache(collections: Collection[], testResults: Map<number, TestResult[]>, testExecutionResults: Map<number, TestExecutionResult[]>): void {
    this.dataCache.collections = collections;
    this.dataCache.testResults = testResults;
    this.dataCache.testExecutionResults = testExecutionResults;
  }
}

// Singleton instance
const realTimeDataManager = new RealTimeDataManagerImpl();

export const useRealTimeData = () => {
  const subscriberRef = useRef<(() => void) | null>(null);

  const subscribeToUpdates = useCallback((callback: (event: DataUpdateEvent) => void) => {
    // Clean up previous subscription
    if (subscriberRef.current) {
      subscriberRef.current();
    }

    // Subscribe to new updates
    subscriberRef.current = realTimeDataManager.subscribeToUpdates(callback);

    return subscriberRef.current;
  }, []);

  const broadcastUpdate = useCallback((event: Omit<DataUpdateEvent, 'timestamp'>) => {
    realTimeDataManager.broadcastUpdate(event);
  }, []);

  const getLatestData = useCallback(() => {
    return realTimeDataManager.getLatestData();
  }, []);

  const updateDataCache = useCallback((collections: Collection[], testResults: Map<number, TestResult[]>, testExecutionResults: Map<number, TestExecutionResult[]>) => {
    realTimeDataManager.updateDataCache(collections, testResults, testExecutionResults);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriberRef.current) {
        subscriberRef.current();
      }
    };
  }, []);

  return {
    subscribeToUpdates,
    broadcastUpdate,
    getLatestData,
    updateDataCache
  };
};

// Export the manager for direct access if needed
export { realTimeDataManager };