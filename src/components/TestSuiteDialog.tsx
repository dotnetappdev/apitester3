import React, { useState, useEffect, useRef } from 'react';
import { TestSuite } from '../testing/TestRunner';

interface TestCase {
  id: string;
  name: string;
  script: string;
  enabled: boolean;
}

interface TestSuiteDialogProps {
  isOpen: boolean;
  title: string;
  testSuite?: TestSuite | null; // null for new test suite, TestSuite object for editing
  requestId: number;
  onSave: (testSuiteData: Omit<TestSuite, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: number, testSuiteData: Partial<TestSuite>) => void;
  onCancel: () => void;
}

export const TestSuiteDialog: React.FC<TestSuiteDialogProps> = ({
  isOpen,
  title,
  testSuite,
  requestId,
  onSave,
  onUpdate,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    beforeEach: '',
    afterEach: '',
    testCases: [] as TestCase[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (testSuite) {
        // Editing existing test suite
        const testCases = typeof testSuite.testCases === 'string' 
          ? JSON.parse(testSuite.testCases) 
          : testSuite.testCases;
        
        setFormData({
          name: testSuite.name,
          beforeEach: testSuite.beforeEach || '',
          afterEach: testSuite.afterEach || '',
          testCases: Array.isArray(testCases) ? testCases : []
        });
      } else {
        // New test suite
        setFormData({
          name: 'New Test Suite',
          beforeEach: '',
          afterEach: '',
          testCases: [{
            id: Date.now().toString(),
            name: 'Test case 1',
            script: 'pm.test("Status code is 200", function () {\n    pm.response.to.have.status(200);\n});',
            enabled: true
          }]
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
  }, [isOpen, testSuite]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Test suite name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Test suite name must be less than 100 characters';
    }

    if (formData.testCases.length === 0) {
      newErrors.testCases = 'At least one test case is required';
    }

    // Validate test cases
    formData.testCases.forEach((testCase, index) => {
      if (!testCase.name.trim()) {
        newErrors[`testCase_${index}_name`] = 'Test case name is required';
      }
      if (!testCase.script.trim()) {
        newErrors[`testCase_${index}_script`] = 'Test script is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const testSuiteData = {
      requestId,
      name: formData.name.trim(),
      testCases: JSON.stringify(formData.testCases),
      beforeEach: formData.beforeEach,
      afterEach: formData.afterEach
    };

    if (testSuite) {
      // Update existing test suite
      onUpdate(testSuite.id, testSuiteData);
    } else {
      // Create new test suite
      onSave(testSuiteData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: Date.now().toString(),
      name: `Test case ${formData.testCases.length + 1}`,
      script: 'pm.test("Your test description", function () {\n    // Your test logic here\n});',
      enabled: true
    };
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, newTestCase]
    }));
  };

  const removeTestCase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index)
    }));
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.map((testCase, i) => 
        i === index ? { ...testCase, [field]: value } : testCase
      )
    }));
    
    // Clear error when user updates test case
    const errorKey = `testCase_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
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
    width: '800px',
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

  const addButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#28a745',
    color: '#ffffff',
    marginBottom: '12px'
  };

  const removeButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#dc3545',
    color: '#ffffff',
    minWidth: '60px',
    padding: '4px 8px',
    fontSize: '12px'
  };

  const testCaseStyle: React.CSSProperties = {
    border: '1px solid #404040',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '12px',
    backgroundColor: '#2d2d30'
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
            <label style={labelStyle}>Test Suite Name *</label>
            <input
              ref={nameInputRef}
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              style={{
                ...inputStyle,
                borderColor: errors.name ? '#f44747' : '#6c6c6c'
              }}
              placeholder="Enter test suite name..."
            />
            {errors.name && <div style={errorStyle}>{errors.name}</div>}
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Before Each Test (Setup)</label>
            <textarea
              value={formData.beforeEach}
              onChange={(e) => handleInputChange('beforeEach', e.target.value)}
              style={textareaStyle}
              placeholder="// Code to run before each test case..."
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>After Each Test (Cleanup)</label>
            <textarea
              value={formData.afterEach}
              onChange={(e) => handleInputChange('afterEach', e.target.value)}
              style={textareaStyle}
              placeholder="// Code to run after each test case..."
            />
          </div>

          <div style={formGroupStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={labelStyle}>Test Cases *</label>
              <button
                style={addButtonStyle}
                onClick={addTestCase}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.backgroundColor = '#218838';
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.backgroundColor = '#28a745';
                }}
              >
                + Add Test Case
              </button>
            </div>
            
            {errors.testCases && <div style={errorStyle}>{errors.testCases}</div>}
            
            {formData.testCases.map((testCase, index) => (
              <div key={testCase.id} style={testCaseStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={testCase.enabled}
                      onChange={(e) => updateTestCase(index, 'enabled', e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    <input
                      type="text"
                      value={testCase.name}
                      onChange={(e) => updateTestCase(index, 'name', e.target.value)}
                      style={{
                        ...inputStyle,
                        flex: 1,
                        borderColor: errors[`testCase_${index}_name`] ? '#f44747' : '#6c6c6c'
                      }}
                      placeholder="Test case name..."
                    />
                  </div>
                  {formData.testCases.length > 1 && (
                    <button
                      style={removeButtonStyle}
                      onClick={() => removeTestCase(index)}
                      onMouseEnter={e => {
                        (e.target as HTMLElement).style.backgroundColor = '#c82333';
                      }}
                      onMouseLeave={e => {
                        (e.target as HTMLElement).style.backgroundColor = '#dc3545';
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                {errors[`testCase_${index}_name`] && (
                  <div style={errorStyle}>{errors[`testCase_${index}_name`]}</div>
                )}
                
                <textarea
                  value={testCase.script}
                  onChange={(e) => updateTestCase(index, 'script', e.target.value)}
                  style={{
                    ...textareaStyle,
                    borderColor: errors[`testCase_${index}_script`] ? '#f44747' : '#6c6c6c',
                    minHeight: '120px'
                  }}
                  placeholder="pm.test('Your test description', function () {
    // Your test logic here
    pm.response.to.have.status(200);
});"
                />
                
                {errors[`testCase_${index}_script`] && (
                  <div style={errorStyle}>{errors[`testCase_${index}_script`]}</div>
                )}
              </div>
            ))}
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
            {testSuite ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};