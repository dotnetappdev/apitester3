import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { RequestPanel } from './components/RequestPanel';
import { ResponsePanel } from './components/ResponsePanel';
import { ApiRequest, ApiResponse, Collection, AppState } from './types';
import { ApiClient } from './utils/api';
import './styles/index.css';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    activeRequest: null,
    collections: [],
    response: null,
    isLoading: false,
    sidebarWidth: 300
  });

  // Initialize with a default collection and sample request
  useEffect(() => {
    const defaultRequest: ApiRequest = {
      id: 'sample-1',
      name: 'Sample GET Request',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      headers: {
        'Content-Type': 'application/json'
      },
      params: {},
      auth: { type: 'none' }
    };

    const defaultCollection: Collection = {
      id: 'default',
      name: 'My Collection',
      requests: [defaultRequest],
      folders: []
    };

    setState(prev => ({
      ...prev,
      collections: [defaultCollection],
      activeRequest: defaultRequest
    }));
  }, []);

  const handleRequestSelect = (request: ApiRequest) => {
    setState(prev => ({
      ...prev,
      activeRequest: request,
      response: null
    }));
  };

  const handleRequestChange = (updatedRequest: ApiRequest) => {
    setState(prev => {
      // Update the request in collections
      const updatedCollections = prev.collections.map(collection => ({
        ...collection,
        requests: collection.requests.map(req =>
          req.id === updatedRequest.id ? updatedRequest : req
        )
      }));

      return {
        ...prev,
        activeRequest: updatedRequest,
        collections: updatedCollections
      };
    });
  };

  const handleSendRequest = async () => {
    if (!state.activeRequest) return;

    setState(prev => ({ ...prev, isLoading: true, response: null }));

    try {
      const response = await ApiClient.makeRequest(state.activeRequest);
      setState(prev => ({ ...prev, response, isLoading: false }));
    } catch (error) {
      console.error('Request failed:', error);
      
      // Create error response
      const errorResponse: ApiResponse = {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: {
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        },
        responseTime: 0,
        size: 0
      };

      setState(prev => ({ ...prev, response: errorResponse, isLoading: false }));
    }
  };

  const handleNewRequest = () => {
    const newRequest: ApiRequest = {
      id: `request-${Date.now()}`,
      name: 'New Request',
      method: 'GET',
      url: '',
      headers: {},
      params: {},
      auth: { type: 'none' }
    };

    setState(prev => {
      // Add to the first collection, or create a new one if none exist
      let updatedCollections = [...prev.collections];
      
      if (updatedCollections.length === 0) {
        updatedCollections = [{
          id: 'default',
          name: 'My Collection',
          requests: [newRequest],
          folders: []
        }];
      } else {
        updatedCollections[0] = {
          ...updatedCollections[0],
          requests: [...updatedCollections[0].requests, newRequest]
        };
      }

      return {
        ...prev,
        collections: updatedCollections,
        activeRequest: newRequest,
        response: null
      };
    });
  };

  // Listen for electron menu events
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onMenuNewRequest(() => {
        handleNewRequest();
      });

      window.electronAPI.onMenuOpenCollection(() => {
        // TODO: Implement collection opening
        console.log('Open collection requested');
      });

      window.electronAPI.onMenuAbout(() => {
        // TODO: Implement about dialog
        console.log('About dialog requested');
      });
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('menu-new-request');
        window.electronAPI.removeAllListeners('menu-open-collection');
        window.electronAPI.removeAllListeners('menu-about');
      }
    };
  }, []);

  return (
    <div className="app-container">
      <Sidebar
        collections={state.collections}
        onRequestSelect={handleRequestSelect}
        onNewRequest={handleNewRequest}
        activeRequest={state.activeRequest}
      />
      
      <div className="main-content">
        {state.activeRequest ? (
          <>
            <RequestPanel
              request={state.activeRequest}
              onRequestChange={handleRequestChange}
              onSendRequest={handleSendRequest}
              isLoading={state.isLoading}
            />
            <ResponsePanel
              response={state.response}
              isLoading={state.isLoading}
            />
          </>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h2 style={{ color: 'var(--text-primary)' }}>Welcome to API Tester 3</h2>
            <p className="text-muted">Select a request from the sidebar or create a new one to get started.</p>
            <button className="btn btn-primary" onClick={handleNewRequest}>
              Create New Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;