import React, { useState } from 'react';
import { Environment } from '../types';
import { DynamicVariablesDialog } from './DynamicVariablesDialog';

interface EnvironmentManagerProps {
  environments: Environment[];
  activeEnvironment: Environment | null;
  onEnvironmentChange: (environment: Environment | null) => void;
  onEnvironmentCreate: (environment: Environment) => void;
  onEnvironmentUpdate: (environment: Environment) => void;
  onEnvironmentDelete: (environmentId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const EnvironmentManager: React.FC<EnvironmentManagerProps> = ({
  environments,
  activeEnvironment,
  onEnvironmentChange,
  onEnvironmentCreate,
  onEnvironmentUpdate,
  onEnvironmentDelete,
  isOpen,
  onClose
}) => {
  const [editingEnvironment, setEditingEnvironment] = useState<Environment | null>(null);
  const [newVariableKey, setNewVariableKey] = useState('');
  const [newVariableValue, setNewVariableValue] = useState('');
  const [showDynamicVariables, setShowDynamicVariables] = useState(false);

  if (!isOpen) return null;

  const handleCreateEnvironment = () => {
    const newEnvironment: Environment = {
      id: `env_${Date.now()}`,
      name: 'New Environment',
      variables: {}
    };
    setEditingEnvironment(newEnvironment);
  };

  const handleSaveEnvironment = () => {
    if (!editingEnvironment) return;

    if (environments.find(env => env.id === editingEnvironment.id)) {
      onEnvironmentUpdate(editingEnvironment);
    } else {
      onEnvironmentCreate(editingEnvironment);
    }
    setEditingEnvironment(null);
  };

  const handleAddVariable = () => {
    if (!editingEnvironment || !newVariableKey.trim()) return;

    setEditingEnvironment({
      ...editingEnvironment,
      variables: {
        ...editingEnvironment.variables,
        [newVariableKey.trim()]: newVariableValue
      }
    });

    setNewVariableKey('');
    setNewVariableValue('');
  };

  const handleRemoveVariable = (key: string) => {
    if (!editingEnvironment) return;

    const newVariables = { ...editingEnvironment.variables };
    delete newVariables[key];

    setEditingEnvironment({
      ...editingEnvironment,
      variables: newVariables
    });
  };

  const handleVariableChange = (key: string, value: string) => {
    if (!editingEnvironment) return;

    setEditingEnvironment({
      ...editingEnvironment,
      variables: {
        ...editingEnvironment.variables,
        [key]: value
      }
    });
  };

  return (
    <div className="environment-manager-overlay">
      <div className="environment-manager">
        <div className="environment-manager-header">
          <h2>Environment Manager</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="environment-manager-content">
          <div className="environment-list">
            <div className="environment-list-header">
              <h3>Environments</h3>
              <button className="btn btn-primary" onClick={handleCreateEnvironment}>
                New Environment
              </button>
            </div>

            <div className="environment-selector">
              <label>Active Environment:</label>
              <select
                value={activeEnvironment?.id || ''}
                onChange={(e) => {
                  const env = environments.find(env => env.id === e.target.value);
                  onEnvironmentChange(env || null);
                }}
              >
                <option value="">No Environment</option>
                {environments.map(env => (
                  <option key={env.id} value={env.id}>{env.name}</option>
                ))}
              </select>
            </div>

            <div className="environments">
              {environments.map(env => (
                <div key={env.id} className={`environment-item ${activeEnvironment?.id === env.id ? 'active' : ''}`}>
                  <div className="environment-info">
                    <span className="environment-name">{env.name}</span>
                    <span className="environment-vars">{Object.keys(env.variables).length} variables</span>
                  </div>
                  <div className="environment-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setEditingEnvironment({ ...env })}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => onEnvironmentDelete(env.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {editingEnvironment && (
            <div className="environment-editor">
              <div className="environment-editor-header">
                <h3>{environments.find(env => env.id === editingEnvironment.id) ? 'Edit' : 'Create'} Environment</h3>
              </div>

              <div className="form-group">
                <label>Environment Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingEnvironment.name}
                  onChange={(e) => setEditingEnvironment({
                    ...editingEnvironment,
                    name: e.target.value
                  })}
                  placeholder="Environment name"
                />
              </div>

              <div className="variables-section">
                <div className="variables-section-header">
                  <h4>Variables</h4>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => setShowDynamicVariables(true)}
                    title="View available dynamic variables"
                  >
                    🎲 Dynamic Variables
                  </button>
                </div>
                
                <div className="add-variable">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Variable name"
                    value={newVariableKey}
                    onChange={(e) => setNewVariableKey(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Variable value"
                    value={newVariableValue}
                    onChange={(e) => setNewVariableValue(e.target.value)}
                  />
                  <button
                    className="btn btn-secondary"
                    onClick={handleAddVariable}
                    disabled={!newVariableKey.trim()}
                  >
                    Add
                  </button>
                </div>

                <div className="variables-list">
                  {Object.entries(editingEnvironment.variables).map(([key, value]) => (
                    <div key={key} className="variable-item">
                      <input
                        type="text"
                        className="form-input variable-key"
                        value={key}
                        readOnly
                      />
                      <input
                        type="text"
                        className="form-input variable-value"
                        value={value}
                        onChange={(e) => handleVariableChange(key, e.target.value)}
                        placeholder="Variable value"
                      />
                      <button
                        className="btn btn-danger variable-remove"
                        onClick={() => handleRemoveVariable(key)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="environment-editor-actions">
                <button className="btn btn-primary" onClick={handleSaveEnvironment}>
                  Save Environment
                </button>
                <button className="btn btn-secondary" onClick={() => setEditingEnvironment(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <DynamicVariablesDialog
          isOpen={showDynamicVariables}
          onClose={() => setShowDynamicVariables(false)}
        />
      </div>
    </div>
  );
};