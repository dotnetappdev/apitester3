import React, { useState, useEffect } from 'react';
import { User } from '../database/DatabaseManager';
import { AuthManager } from '../auth/AuthManager';

interface LoginDialogProps {
  authManager: AuthManager;
  onLogin: (user: User) => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({ authManager, onLogin }) => {
  const [profiles, setProfiles] = useState<User[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'standard'>('standard');
  const [resetUsername, setResetUsername] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const allProfiles = await authManager.getAllProfiles();
      setProfiles(allProfiles);
      if (allProfiles.length > 0) {
        setSelectedProfile(allProfiles[0]);
      }
    } catch (error) {
      setError('Failed to load profiles');
    }
  };

  const handleLogin = async () => {
    if (!selectedProfile || !password) {
      setError('Please select a profile and enter a password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authManager.login(selectedProfile.username, password);
      
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('Login failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!newUsername || !newPassword) {
      setError('Please enter username and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authManager.createProfile(newUsername, newPassword, newRole);
      
      if (result.success) {
        await loadProfiles();
        setShowCreateProfile(false);
        setNewUsername('');
        setNewPassword('');
        setNewRole('standard');
      } else {
        setError(result.error || 'Failed to create profile');
      }
    } catch (error) {
      setError('Failed to create profile: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetUsername || !resetNewPassword || !resetConfirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (resetNewPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authManager.resetPassword(resetUsername, resetNewPassword);
      
      if (result.success) {
        setShowResetPassword(false);
        setResetUsername('');
        setResetNewPassword('');
        setResetConfirmPassword('');
        setError('');
        // Show success message (you could add a success state if needed)
        alert('Password reset successfully! You can now login with your new password.');
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('Failed to reset password: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never logged in';
    return new Date(lastLogin).toLocaleDateString();
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? '#ff6b35' : '#4ec9b0';
  };

  if (showCreateProfile) {
    return (
      <div className="login-overlay">
        <div className="login-container create-profile">
          <div className="login-header">
            <h1>Create New Profile</h1>
            <button 
              className="back-button"
              onClick={() => setShowCreateProfile(false)}
            >
              ← Back
            </button>
          </div>

          <div className="create-profile-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
                className="profile-input"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter password"
                className="profile-input"
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'admin' | 'standard')}
                className="profile-select"
              >
                <option value="standard">Standard User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              className="create-profile-button"
              onClick={handleCreateProfile}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResetPassword) {
    return (
      <div className="login-overlay">
        <div className="login-container create-profile">
          <div className="login-header">
            <h1>Reset Password</h1>
            <button 
              className="back-button"
              onClick={() => setShowResetPassword(false)}
            >
              ← Back
            </button>
          </div>

          <div className="create-profile-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={resetUsername}
                onChange={(e) => setResetUsername(e.target.value)}
                placeholder="Enter username to reset password"
                className="profile-input"
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="profile-input"
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="profile-input"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              className="create-profile-button"
              onClick={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-overlay">
      <div className="login-container">
        <div className="login-header">
          <h1>VeriAPI</h1>
          <p>Who's testing APIs today?</p>
        </div>

        <div className="profiles-grid">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`profile-card ${selectedProfile?.id === profile.id ? 'selected' : ''}`}
              onClick={() => setSelectedProfile(profile)}
            >
              <div className="profile-avatar">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt={profile.username} />
                ) : (
                  <div className="avatar-placeholder">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="profile-info">
                <h3>{profile.username}</h3>
                <div 
                  className="role-badge"
                  style={{ backgroundColor: getRoleColor(profile.role) }}
                >
                  {profile.role}
                </div>
                <p className="last-login">
                  Last: {formatLastLogin(profile.lastLogin)}
                </p>
              </div>
            </div>
          ))}

          <div 
            className="profile-card add-profile"
            onClick={() => setShowCreateProfile(true)}
          >
            <div className="add-profile-icon">+</div>
            <p>Add Profile</p>
          </div>

          <div 
            className="profile-card reset-password"
            onClick={() => setShowResetPassword(true)}
          >
            <div className="reset-password-icon">🔑</div>
            <p>Reset Password</p>
          </div>
        </div>

        {selectedProfile && (
          <div className="login-form">
            <div className="selected-profile">
              <div className="selected-avatar">
                {selectedProfile.profilePicture ? (
                  <img src={selectedProfile.profilePicture} alt={selectedProfile.username} />
                ) : (
                  <div className="avatar-placeholder small">
                    {selectedProfile.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span>{selectedProfile.username}</span>
            </div>

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="password-input"
            />

            {error && <div className="error-message">{error}</div>}

            <button
              className="login-button"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};