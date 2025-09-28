import React, { useState, useEffect, useRef } from 'react';
import { Request, Collection } from '../database/DatabaseManager';

interface RequestDialogProps {
  isOpen: boolean;
  title: string;
  request?: Request | null; // null for new request, Request object for editing
  collections: Collection[];
  onSave: (requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: number, requestData: Partial<Request>) => void;
  onCancel: () => void;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export const RequestDialog: React.FC<RequestDialogProps> = ({
  isOpen,
  title,
  request,
  collections,
  onSave,
  onUpdate,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    method: 'GET',
    url: '',
    collectionId: collections.length > 0 ? collections[0].id : 0,
    headers: '{}',
    body: '',
    params: '{}',
    auth: '{"type": "none"}',
    tests: '',
    soap: '',
    grpc: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (request && request.id !== -1) {
        // Editing existing request
        setFormData({
          name: request.name,
          method: request.method,
          url: request.url,
          collectionId: request.collectionId,
          headers: typeof request.headers === 'string' ? request.headers : JSON.stringify(request.headers),
          body: request.body || '',
          params: typeof request.params === 'string' ? request.params : JSON.stringify(request.params),
          auth: typeof request.auth === 'string' ? request.auth : JSON.stringify(request.auth),
          tests: request.tests || '',
          soap: request.soap || '',
          grpc: request.grpc || ''
        });
      } else if (request && request.id === -1) {
        // Duplicating request (special case)
        setFormData({
          name: request.name, // Already has "Copy of" prefix
          method: request.method,
          url: request.url,
          collectionId: request.collectionId,
          headers: typeof request.headers === 'string' ? request.headers : JSON.stringify(request.headers),
          body: request.body || '',
          params: typeof request.params === 'string' ? request.params : JSON.stringify(request.params),
          auth: typeof request.auth === 'string' ? request.auth : JSON.stringify(request.auth),
          tests: request.tests || '',
          soap: request.soap || '',
          grpc: request.grpc || ''
        });
      } else {
        // New request
        setFormData({
          name: 'New Request',
          method: 'GET',
          url: '',
          collectionId: collections.length > 0 ? collections[0].id : 0,
          headers: '{}',
          body: '',
          params: '{}',
          auth: '{"type": "none"}',
          tests: '',
          soap: '',
          grpc: ''
        });
      }
      setErrors({});
      
      // Focus name input after dialog opens
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
          nameInputRef.current.select();
        }
      }, 200);
    }
  }, [isOpen, request, collections]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Request name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Request name must be less than 100 characters';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try {
        new URL(formData.url);
      } catch {
        // Check if it's a relative URL or has protocol
        if (!formData.url.startsWith('/') && !formData.url.includes('://')) {
          newErrors.url = 'Please enter a valid URL (e.g., https://api.example.com or /path)';
        }
      }
    }

    if (formData.collectionId === 0) {
      newErrors.collectionId = 'Please select a collection';
    }

    // Validate JSON fields
    const jsonFields = ['headers', 'params', 'auth'];
    jsonFields.forEach(field => {
      try {
        JSON.parse(formData[field as keyof typeof formData] as string);
      } catch {
        newErrors[field] = `Invalid JSON format in ${field}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const requestData = {
      name: formData.name.trim(),
      method: formData.method,
      url: formData.url.trim(),
      collectionId: formData.collectionId,
      headers: formData.headers,
      body: formData.body,
      params: formData.params,
      auth: formData.auth,
      tests: formData.tests,
      soap: formData.soap,
      grpc: formData.grpc
    };

    if (request && request.id !== -1) {
      // Update existing request
      onUpdate(request.id, requestData);
    } else {
      // Create new request (including duplicates)
      onSave(requestData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(3px)'
  };

  const dialogStyle: React.CSSProperties = {
    backgroundColor: '#252526',
    borderRadius: '8px',
    width: '600px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    border: '1px solid #404040',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    animation: 'fadeIn 0.2s ease-out',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle: React.CSSProperties = {
    padding: '16px 20px',
    borderBottom: '1px solid #404040',
    backgroundColor: '#2d2d30',
    borderRadius: '8px 8px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    color: '#4fc3f7',
    fontSize: '1.1em',
    fontWeight: 600
  };

  const contentStyle: React.CSSProperties = {
    padding: '20px',
    color: '#cccccc',
    flex: 1,
    overflow: 'auto'
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '16px'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#cccccc'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #6c6c6c',
    borderRadius: '4px',
    backgroundColor: '#3c3c3c',
    color: '#cccccc',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer'
  };

  const errorStyle: React.CSSProperties = {
    marginTop: '4px',
    color: '#f44747',
    fontSize: '12px'
  };

  const footerStyle: React.CSSProperties = {
    padding: '16px 20px',
    borderTop: '1px solid #404040',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    backgroundColor: '#2d2d30',
    borderRadius: '0 0 8px 8px'
  };

  const buttonBaseStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '80px'
  };

  const cancelButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#3c3c3c',
    color: '#cccccc',
    border: '1px solid #6c6c6c'
  };

  const saveButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#007acc',
    color: '#ffffff'
  };

  return (
    <div style={overlayStyle} onClick={onCancel} onKeyDown={handleKeyDown}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>{title}</h3>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: '#cccccc',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={contentStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Request Name *</label>
            <input
              ref={nameInputRef}
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              style={{
                ...inputStyle,
                borderColor: errors.name ? '#f44747' : '#6c6c6c'
              }}
              placeholder="Enter request name..."
            />
            {errors.name && <div style={errorStyle}>{errors.name}</div>}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: '0 0 120px' }}>
              <label style={labelStyle}>Method</label>
              <select
                value={formData.method}
                onChange={(e) => handleInputChange('method', e.target.value)}
                style={selectStyle}
              >
                {HTTP_METHODS.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>URL *</label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: errors.url ? '#f44747' : '#6c6c6c'
                }}
                placeholder="https://api.example.com/endpoint"
              />
              {errors.url && <div style={errorStyle}>{errors.url}</div>}
            </div>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Collection *</label>
            <select
              value={formData.collectionId}
              onChange={(e) => handleInputChange('collectionId', parseInt(e.target.value).toString())}
              style={{
                ...selectStyle,
                borderColor: errors.collectionId ? '#f44747' : '#6c6c6c'
              }}
            >
              <option value={0}>Select a collection...</option>
              {collections.map(collection => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
            {errors.collectionId && <div style={errorStyle}>{errors.collectionId}</div>}
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Headers (JSON)</label>
            <textarea
              value={formData.headers}
              onChange={(e) => handleInputChange('headers', e.target.value)}
              style={{
                ...textareaStyle,
                borderColor: errors.headers ? '#f44747' : '#6c6c6c'
              }}
              placeholder='{"Content-Type": "application/json"}'
            />
            {errors.headers && <div style={errorStyle}>{errors.headers}</div>}
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Body</label>
            <textarea
              value={formData.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              style={textareaStyle}
              placeholder="Request body content..."
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Query Parameters (JSON)</label>
            <textarea
              value={formData.params}
              onChange={(e) => handleInputChange('params', e.target.value)}
              style={{
                ...textareaStyle,
                borderColor: errors.params ? '#f44747' : '#6c6c6c'
              }}
              placeholder='{"param1": "value1", "param2": "value2"}'
            />
            {errors.params && <div style={errorStyle}>{errors.params}</div>}
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Authentication (JSON)</label>
            <textarea
              value={formData.auth}
              onChange={(e) => handleInputChange('auth', e.target.value)}
              style={{
                ...textareaStyle,
                borderColor: errors.auth ? '#f44747' : '#6c6c6c'
              }}
              placeholder='{"type": "bearer", "token": "your-token"}'
            />
            {errors.auth && <div style={errorStyle}>{errors.auth}</div>}
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Tests (JavaScript)</label>
            <textarea
              value={formData.tests}
              onChange={(e) => handleInputChange('tests', e.target.value)}
              style={textareaStyle}
              placeholder="// Write your test scripts here..."
            />
          </div>
        </div>

        <div style={footerStyle}>
          <div style={{ fontSize: '12px', color: '#969696', marginRight: 'auto' }}>
            Ctrl+Enter to save, Esc to cancel
          </div>
          <button
            style={cancelButtonStyle}
            onClick={onCancel}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.backgroundColor = '#4a4a4a';
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.backgroundColor = '#3c3c3c';
            }}
          >
            Cancel
          </button>
          <button
            style={saveButtonStyle}
            onClick={handleSubmit}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.backgroundColor = '#106ebe';
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.backgroundColor = '#007acc';
            }}
          >
            {request && request.id !== -1 ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};