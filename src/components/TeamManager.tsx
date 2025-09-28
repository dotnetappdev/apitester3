import React, { useState, useCallback } from 'react';
import { Team, TeamMember, User, Collection } from '../database/DatabaseManager';

interface TeamManagerProps {
  teams: Team[];
  users: User[];
  collections: Collection[];
  currentUser: User;
  onCreateTeam: (name: string, description: string) => Promise<void>;
  onUpdateTeam: (teamId: number, updates: Partial<Team>) => Promise<void>;
  onDeleteTeam: (teamId: number) => Promise<void>;
  onAddMember: (teamId: number, userId: number, role: 'admin' | 'member' | 'viewer') => Promise<void>;
  onRemoveMember: (teamId: number, userId: number) => Promise<void>;
  onUpdateMemberRole: (teamId: number, userId: number, role: 'admin' | 'member' | 'viewer') => Promise<void>;
  onAssignCollection: (collectionId: number, teamId: number) => Promise<void>;
  onRemoveCollection: (collectionId: number) => Promise<void>;
  onClose: () => void;
}

export const TeamManager: React.FC<TeamManagerProps> = ({
  teams,
  users,
  collections,
  currentUser,
  onCreateTeam,
  onUpdateTeam,
  onDeleteTeam,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
  onAssignCollection,
  onRemoveCollection,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'members' | 'collections'>('teams');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(teams[0] || null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');

  const handleCreateTeam = useCallback(async () => {
    if (!newTeamName.trim()) return;
    
    await onCreateTeam(newTeamName, newTeamDescription);
    setNewTeamName('');
    setNewTeamDescription('');
    setShowCreateTeam(false);
  }, [newTeamName, newTeamDescription, onCreateTeam]);

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'Unknown User';
  };

  const canManageTeam = (team: Team) => {
    return team.ownerId === currentUser.id || 
           team.members.some(m => m.userId === currentUser.id && m.role === 'admin') ||
           currentUser.role === 'admin';
  };

  const teamCollections = selectedTeam 
    ? collections.filter(c => c.teamId === selectedTeam.id)
    : [];

  const unassignedCollections = collections.filter(c => !c.teamId && c.ownerId === currentUser.id);

  return (
    <div className="team-manager-overlay">
      <div className="team-manager-dialog">
        <div className="team-manager-header">
          <h2>Team Management</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="team-manager-content">
          <div className="team-manager-sidebar">
            <div className="teams-list">
              <div className="teams-header">
                <h3>Teams ({teams.length})</h3>
                <button 
                  className="btn btn-small create-team-btn"
                  onClick={() => setShowCreateTeam(true)}
                >
                  + New Team
                </button>
              </div>
              
              {teams.map(team => (
                <div 
                  key={team.id}
                  className={`team-item ${selectedTeam?.id === team.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTeam(team)}
                >
                  <div className="team-info">
                    <div className="team-name">{team.name}</div>
                    <div className="team-stats">
                      {team.members.length} members • {teamCollections.length} collections
                    </div>
                  </div>
                  {team.ownerId === currentUser.id && (
                    <div className="team-owner-badge">👑</div>
                  )}
                </div>
              ))}
              
              {teams.length === 0 && (
                <div className="no-teams">
                  <p>No teams yet</p>
                  <p>Create your first team to start collaborating</p>
                </div>
              )}
            </div>
          </div>

          <div className="team-manager-main">
            {selectedTeam ? (
              <>
                <div className="team-tabs">
                  <button 
                    className={`tab ${activeTab === 'teams' ? 'active' : ''}`}
                    onClick={() => setActiveTab('teams')}
                  >
                    Details
                  </button>
                  <button 
                    className={`tab ${activeTab === 'members' ? 'active' : ''}`}
                    onClick={() => setActiveTab('members')}
                  >
                    Members ({selectedTeam.members.length})
                  </button>
                  <button 
                    className={`tab ${activeTab === 'collections' ? 'active' : ''}`}
                    onClick={() => setActiveTab('collections')}
                  >
                    Collections ({teamCollections.length})
                  </button>
                </div>

                <div className="tab-content">
                  {activeTab === 'teams' && (
                    <div className="team-details">
                      <div className="form-group">
                        <label>Team Name</label>
                        <input
                          type="text"
                          value={selectedTeam.name}
                          onChange={(e) => {
                            if (canManageTeam(selectedTeam)) {
                              onUpdateTeam(selectedTeam.id, { name: e.target.value });
                            }
                          }}
                          disabled={!canManageTeam(selectedTeam)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={selectedTeam.description || ''}
                          onChange={(e) => {
                            if (canManageTeam(selectedTeam)) {
                              onUpdateTeam(selectedTeam.id, { description: e.target.value });
                            }
                          }}
                          disabled={!canManageTeam(selectedTeam)} 
                          className="form-textarea"
                          rows={3}
                          placeholder="Describe your team's purpose..."
                        />
                      </div>
                      <div className="team-meta">
                        <div>Owner: {getUserName(selectedTeam.ownerId)}</div>
                        <div>Created: {new Date(selectedTeam.createdAt).toLocaleDateString()}</div>
                        <div>Updated: {new Date(selectedTeam.updatedAt).toLocaleDateString()}</div>
                      </div>
                      {canManageTeam(selectedTeam) && (
                        <div className="danger-zone">
                          <button 
                            className="btn btn-danger"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete team "${selectedTeam.name}"?`)) {
                                onDeleteTeam(selectedTeam.id);
                              }
                            }}
                          >
                            Delete Team
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'members' && (
                    <div className="team-members">
                      <div className="members-list">
                        {selectedTeam.members.map(member => (
                          <div key={member.id} className="member-item">
                            <div className="member-info">
                              <div className="member-name">{getUserName(member.userId)}</div>
                              <div className="member-role">{member.role}</div>
                              <div className="member-joined">Joined {new Date(member.joinedAt).toLocaleDateString()}</div>
                            </div>
                            {canManageTeam(selectedTeam) && member.userId !== selectedTeam.ownerId && (
                              <div className="member-actions">
                                <select
                                  value={member.role}
                                  onChange={(e) => onUpdateMemberRole(selectedTeam.id, member.userId, e.target.value as any)}
                                  className="role-select"
                                >
                                  <option value="viewer">Viewer</option>
                                  <option value="member">Member</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <button
                                  className="btn btn-small btn-danger"
                                  onClick={() => onRemoveMember(selectedTeam.id, member.userId)}
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {canManageTeam(selectedTeam) && (
                        <div className="add-member">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                onAddMember(selectedTeam.id, parseInt(e.target.value), 'member');
                                e.target.value = '';
                              }
                            }}
                            className="member-select"
                          >
                            <option value="">Add a member...</option>
                            {users
                              .filter(u => !selectedTeam.members.some(m => m.userId === u.id))
                              .map(user => (
                                <option key={user.id} value={user.id}>{user.username}</option>
                              ))
                            }
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'collections' && (
                    <div className="team-collections">
                      <div className="collections-list">
                        {teamCollections.map(collection => (
                          <div key={collection.id} className="collection-item">
                            <div className="collection-info">
                              <div className="collection-name">{collection.name}</div>
                              <div className="collection-stats">
                                {collection.requests?.length || 0} requests • 
                                Owner: {getUserName(collection.ownerId)}
                              </div>
                            </div>
                            {canManageTeam(selectedTeam) && (
                              <button
                                className="btn btn-small"
                                onClick={() => onRemoveCollection(collection.id)}
                              >
                                Remove from Team
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {canManageTeam(selectedTeam) && unassignedCollections.length > 0 && (
                        <div className="assign-collection">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                onAssignCollection(parseInt(e.target.value), selectedTeam.id);
                                e.target.value = '';
                              }
                            }}
                            className="collection-select"
                          >
                            <option value="">Assign a collection...</option>
                            {unassignedCollections.map(collection => (
                              <option key={collection.id} value={collection.id}>
                                {collection.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-team-selected">
                <p>Select a team to manage its details, members, and collections</p>
              </div>
            )}
          </div>
        </div>

        {showCreateTeam && (
          <div className="create-team-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Create New Team</h3>
                <button onClick={() => setShowCreateTeam(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Team Name *</label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="form-input"
                    placeholder="Enter team name..."
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    className="form-textarea"
                    placeholder="Describe your team's purpose..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCreateTeam(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleCreateTeam}
                  disabled={!newTeamName.trim()}
                >
                  Create Team
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .team-manager-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .team-manager-dialog {
          background: var(--bg-primary);
          border-radius: 8px;
          width: 90vw;
          max-width: 1200px;
          height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .team-manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .team-manager-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 20px;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
        }

        .close-button:hover {
          color: var(--text-primary);
        }

        .team-manager-content {
          flex: 1;
          display: flex;
          min-height: 0;
        }

        .team-manager-sidebar {
          width: 300px;
          border-right: 1px solid var(--border-color);
          background: var(--bg-secondary);
          display: flex;
          flex-direction: column;
        }

        .teams-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .teams-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .create-team-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }

        .teams-list {
          flex: 1;
          overflow-y: auto;
        }

        .team-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid var(--border-subtle);
        }

        .team-item:hover {
          background: var(--bg-hover);
        }

        .team-item.selected {
          background: var(--bg-selected);
          border-left: 3px solid var(--accent-color);
        }

        .team-info {
          flex: 1;
        }

        .team-name {
          font-weight: 500;
          font-size: 13px;
          margin-bottom: 2px;
        }

        .team-stats {
          font-size: 11px;
          color: var(--text-muted);
        }

        .team-owner-badge {
          font-size: 14px;
        }

        .no-teams {
          padding: 20px;
          text-align: center;
          color: var(--text-muted);
        }

        .team-manager-main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .team-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color);
        }

        .tab {
          padding: 12px 20px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          font-size: 13px;
          border-bottom: 2px solid transparent;
        }

        .tab:hover {
          color: var(--text-primary);
        }

        .tab.active {
          color: var(--accent-color);
          border-bottom-color: var(--accent-color);
        }

        .tab-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .form-input, .form-textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--input-bg);
          color: var(--text-primary);
          font-size: 13px;
        }

        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: var(--accent-color);
        }

        .team-meta {
          background: var(--bg-secondary);
          padding: 12px;
          border-radius: 4px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .team-meta > div {
          margin-bottom: 4px;
        }

        .danger-zone {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
        }

        .btn-danger {
          background: var(--error-color);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .member-item, .collection-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          margin-bottom: 8px;
        }

        .member-info, .collection-info {
          flex: 1;
        }

        .member-name, .collection-name {
          font-weight: 500;
          margin-bottom: 2px;
        }

        .member-role, .member-joined, .collection-stats {
          font-size: 11px;
          color: var(--text-muted);
        }

        .member-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .role-select, .member-select, .collection-select {
          padding: 4px 8px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--input-bg);
          color: var(--text-primary);
          font-size: 12px;
        }

        .add-member, .assign-collection {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }

        .no-team-selected {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
        }

        .create-team-modal {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          background: var(--bg-primary);
          border-radius: 8px;
          width: 400px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-header h3 {
          margin: 0;
          font-size: 16px;
        }

        .modal-body {
          padding: 16px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 16px;
          border-top: 1px solid var(--border-color);
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }

        .btn-primary {
          background: var(--accent-color);
          color: white;
        }

        .btn-secondary {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .btn-small {
          padding: 4px 8px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default TeamManager;