import React, { useState } from 'react';
import { Project, Collection, Request, User } from '../database/DatabaseManager';
import { UITestSuite, UITestExecutionResult } from '../testing/UITestRunner';
import { ModernButton, AddIcon } from './ModernButton';

interface ProjectExplorerProps {
  user: User;
  projects: Project[];
  uiTestSuites: Map<string, UITestSuite>;
  uiTestExecutionResults: Map<string, UITestExecutionResult[]>;
  onProjectSelect?: (project: Project) => void;
  onCollectionSelect?: (collection: Collection) => void;
  onRequestSelect: (request: Request) => void;
  onNewProject: () => void;
  onNewCollection: (projectId: number) => void;
  onNewRequest: (collectionId: number) => void;
  onNewUITestSuite: (projectId: number) => void;
  onEditProject?: (project: Project) => void;
  onEditCollection?: (collection: Collection) => void;
  onEditRequest: (request: Request) => void;
  onEditUITestSuite?: (testSuite: UITestSuite) => void;
  onDeleteProject?: (project: Project) => void;
  onDeleteCollection?: (collection: Collection) => void;
  onDeleteRequest: (request: Request) => void;
  onDeleteUITestSuite?: (testSuite: UITestSuite) => void;
  activeRequest: Request | null;
}

export const ProjectExplorer: React.FC<ProjectExplorerProps> = ({
  user,
  projects,
  uiTestSuites,
  uiTestExecutionResults,
  onRequestSelect,
  onNewProject,
  onNewCollection,
  onNewRequest,
  onNewUITestSuite,
  onEditRequest,
  onDeleteRequest,
  activeRequest
}) => {
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [expandedCollections, setExpandedCollections] = useState<Set<number>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    type: 'project' | 'collection' | 'request' | 'uiTestSuite',
    id: number | string,
    x: number,
    y: number
  } | null>(null);

  const toggleProject = (projectId: number) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const toggleCollection = (collectionId: number) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  const getUITestSuitesForProject = (projectId: number): UITestSuite[] => {
    return Array.from(uiTestSuites.values()).filter(suite => suite.projectId === projectId);
  };

  const getUITestStatus = (testSuiteId: string): 'pass' | 'fail' | 'none' => {
    const results = uiTestExecutionResults.get(testSuiteId);
    if (!results || results.length === 0) return 'none';
    const hasFailures = results.some(r => r.status === 'fail' || r.status === 'error');
    return hasFailures ? 'fail' : 'pass';
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'none') => {
    switch (status) {
      case 'pass': return '✓';
      case 'fail': return '✗';
      case 'none': 
      default: return '○';
    }
  };

  const getStatusColor = (status: 'pass' | 'fail' | 'none') => {
    switch (status) {
      case 'pass': return 'var(--success-color)';
      case 'fail': return 'var(--error-color)';
      case 'none':
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="project-explorer">
      <div className="explorer-header">
        <div className="user-info">
          <div className="user-avatar">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={user.username} />
            ) : (
              <div className="avatar-placeholder">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-details">
            <div className="user-name">{user.username}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>
        <ModernButton onClick={onNewProject} variant="primary" size="small" icon={<AddIcon />}>
          New Project
        </ModernButton>
      </div>

      <div className="projects-list">
        {projects.length === 0 ? (
          <div className="no-projects">
            <p>No projects yet</p>
            <button className="create-first-project-btn" onClick={onNewProject}>
              Create Your First Project
            </button>
          </div>
        ) : (
          projects.map(project => {
            const isProjectExpanded = expandedProjects.has(project.id);
            const projectUITestSuites = getUITestSuitesForProject(project.id);
            
            return (
              <div key={project.id} className="project-item">
                <div 
                  className="project-header"
                  onClick={() => toggleProject(project.id)}
                >
                  <span className="expand-icon">
                    {isProjectExpanded ? '▼' : '▶'}
                  </span>
                  <span className="project-icon">📁</span>
                  <div className="project-info">
                    <div className="project-name">{project.name}</div>
                    <div className="project-details">
                      {project.collections?.length || 0} collection(s), {projectUITestSuites.length} UI test(s)
                    </div>
                  </div>
                  <button
                    className="new-collection-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNewCollection(project.id);
                    }}
                    title="New Collection"
                  >
                    📁+
                  </button>
                  <button
                    className="new-ui-test-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNewUITestSuite(project.id);
                    }}
                    title="New UI Test Suite"
                  >
                    🎭+
                  </button>
                </div>

                {isProjectExpanded && (
                  <div className="project-content">
                    {/* Collections */}
                    {project.collections && project.collections.length > 0 && (
                      <div className="collections-section">
                        <div className="section-header">Collections</div>
                        {project.collections.map(collection => {
                          const isCollectionExpanded = expandedCollections.has(collection.id);
                          
                          return (
                            <div key={collection.id} className="collection-item">
                              <div 
                                className="collection-header"
                                onClick={() => toggleCollection(collection.id)}
                              >
                                <span className="expand-icon">
                                  {isCollectionExpanded ? '▼' : '▶'}
                                </span>
                                <span className="collection-icon">📂</span>
                                <div className="collection-info">
                                  <div className="collection-name">{collection.name}</div>
                                  <div className="collection-details">
                                    {collection.requests?.length || 0} request(s)
                                  </div>
                                </div>
                                <button
                                  className="new-request-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onNewRequest(collection.id);
                                  }}
                                  title="New Request"
                                >
                                  +
                                </button>
                              </div>

                              {isCollectionExpanded && collection.requests && (
                                <div className="requests-list">
                                  {collection.requests.map(request => (
                                    <div 
                                      key={request.id}
                                      className={`request-item ${activeRequest?.id === request.id ? 'active' : ''}`}
                                      onClick={() => onRequestSelect(request)}
                                    >
                                      <span className={`method-badge ${request.method.toLowerCase()}`}>
                                        {request.method}
                                      </span>
                                      <div className="request-info">
                                        <div className="request-name">{request.name}</div>
                                        <div className="request-url">{request.url}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* UI Test Suites */}
                    {projectUITestSuites.length > 0 && (
                      <div className="ui-tests-section">
                        <div className="section-header">UI Tests</div>
                        {projectUITestSuites.map(testSuite => {
                          const status = getUITestStatus(testSuite.id);
                          
                          return (
                            <div key={testSuite.id} className="ui-test-suite-item">
                              <span 
                                className="test-status-icon"
                                style={{ color: getStatusColor(status) }}
                              >
                                {getStatusIcon(status)}
                              </span>
                              <span className="ui-test-icon">🎭</span>
                              <div className="ui-test-info">
                                <div className="ui-test-name">{testSuite.name}</div>
                                <div className="ui-test-details">
                                  {testSuite.testCases.length} test case(s)
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .project-explorer {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
        }

        .explorer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-primary);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: var(--accent-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .user-role {
          font-size: 11px;
          color: var(--text-muted);
        }

        .projects-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .no-projects {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-muted);
        }

        .create-first-project-btn {
          margin-top: 12px;
          padding: 8px 16px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .project-item {
          margin-bottom: 8px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-primary);
          overflow: hidden;
        }

        .project-header {
          display: flex;
          align-items: center;
          padding: 12px;
          cursor: pointer;
          gap: 8px;
          transition: background-color 0.1s;
        }

        .project-header:hover {
          background: var(--bg-hover);
        }

        .expand-icon {
          color: var(--text-muted);
          font-size: 12px;
          transition: transform 0.15s ease;
        }

        .project-icon, .collection-icon, .ui-test-icon {
          font-size: 16px;
        }

        .project-info, .collection-info, .ui-test-info {
          flex: 1;
          min-width: 0;
        }

        .project-name, .collection-name, .ui-test-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .project-details, .collection-details, .ui-test-details {
          font-size: 11px;
          color: var(--text-muted);
        }

        .new-collection-btn, .new-ui-test-btn, .new-request-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 3px;
          font-size: 12px;
          transition: all 0.1s;
        }

        .new-collection-btn:hover, .new-ui-test-btn:hover, .new-request-btn:hover {
          background: var(--accent-color);
          color: white;
        }

        .project-content {
          background: var(--bg-secondary);
          padding: 8px 0;
        }

        .section-header {
          padding: 8px 16px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-primary);
          background: var(--bg-primary);
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
        }

        .collection-item {
          margin: 4px 8px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--bg-primary);
        }

        .collection-header {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          cursor: pointer;
          gap: 6px;
          transition: background-color 0.1s;
        }

        .collection-header:hover {
          background: var(--bg-hover);
        }

        .requests-list {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
        }

        .request-item {
          display: flex;
          align-items: center;
          padding: 8px 12px 8px 24px;
          cursor: pointer;
          gap: 8px;
          transition: background-color 0.1s;
        }

        .request-item:hover {
          background: var(--bg-hover);
        }

        .request-item.active {
          background: var(--accent-color);
          color: white;
        }

        .method-badge {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .method-badge.get { background: #28a745; color: white; }
        .method-badge.post { background: #007bff; color: white; }
        .method-badge.put { background: #ffc107; color: black; }
        .method-badge.delete { background: #dc3545; color: white; }
        .method-badge.patch { background: #6f42c1; color: white; }

        .request-info {
          flex: 1;
          min-width: 0;
        }

        .request-name {
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .request-url {
          font-size: 10px;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ui-test-suite-item {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          gap: 8px;
          transition: background-color 0.1s;
          cursor: pointer;
        }

        .ui-test-suite-item:hover {
          background: var(--bg-hover);
        }

        .test-status-icon {
          font-size: 12px;
          width: 14px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default ProjectExplorer;