import React, { useState } from 'react';
import { APP_INFO, GITHUB_INFO } from '../constants/appInfo';

interface ReportProblemDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportProblemDialog: React.FC<ReportProblemDialogProps> = ({ isOpen, onClose }) => {
  const [issueType, setIssueType] = useState<'bug' | 'feature' | 'question'>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');

  if (!isOpen) return null;

  const generateIssueBody = (): string => {
    if (issueType === 'bug') {
      return `## Bug Report

**Description:**
${description}

**Steps to Reproduce:**
${stepsToReproduce}

**Expected Behavior:**
${expectedBehavior}

**Actual Behavior:**
${actualBehavior}

**Environment:**
- VerifyApi Version: ${APP_INFO.version}
- OS: ${navigator.platform}
- User Agent: ${navigator.userAgent}

**Additional Context:**
_Add any other context about the problem here._
`;
    } else if (issueType === 'feature') {
      return `## Feature Request

**Description:**
${description}

**Use Case:**
${stepsToReproduce}

**Proposed Solution:**
${expectedBehavior}

**Alternatives Considered:**
${actualBehavior}

**Additional Context:**
_Add any other context or screenshots about the feature request here._
`;
    } else {
      return `## Question

**Question:**
${description}

**Context:**
${stepsToReproduce}

**What I've Tried:**
${expectedBehavior}

**Environment:**
- VerifyApi Version: ${APP_INFO.version}
`;
    }
  };

  const handleSubmit = () => {
    const issueBody = generateIssueBody();
    const issueTitle = encodeURIComponent(title);
    const issueBodyEncoded = encodeURIComponent(issueBody);
    
    const labels = issueType === 'bug' ? 'bug' : issueType === 'feature' ? 'enhancement' : 'question';
    const url = `${GITHUB_INFO.newIssueUrl}?title=${issueTitle}&body=${issueBodyEncoded}&labels=${labels}`;
    
    if (typeof window !== 'undefined' && (window as any).electronAPI?.openExternal) {
      (window as any).electronAPI.openExternal(url).catch((e: any) => console.warn('openExternal failed', e));
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    
    onClose();
  };

  const isFormValid = () => {
    return title.trim() !== '' && description.trim() !== '';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content report-problem-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🐛 Report a Problem</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="issueType">Issue Type</label>
            <select 
              id="issueType"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as 'bug' | 'feature' | 'question')}
              className="form-control"
            >
              <option value="bug">🐛 Bug Report</option>
              <option value="feature">✨ Feature Request</option>
              <option value="question">❓ Question / Help</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                issueType === 'bug' 
                  ? "Brief description of the bug" 
                  : issueType === 'feature'
                  ? "Brief description of the feature"
                  : "Your question in one line"
              }
              className="form-control"
              maxLength={100}
            />
            <small className="form-text">{title.length}/100 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              {issueType === 'bug' ? 'Description' : issueType === 'feature' ? 'Feature Description' : 'Question'} 
              <span className="required">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                issueType === 'bug'
                  ? "Describe the bug in detail"
                  : issueType === 'feature'
                  ? "Describe the feature you'd like to see"
                  : "Ask your question in detail"
              }
              className="form-control"
              rows={4}
            />
          </div>

          {issueType === 'bug' && (
            <>
              <div className="form-group">
                <label htmlFor="stepsToReproduce">Steps to Reproduce</label>
                <textarea
                  id="stepsToReproduce"
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                  placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                  className="form-control"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="expectedBehavior">Expected Behavior</label>
                <textarea
                  id="expectedBehavior"
                  value={expectedBehavior}
                  onChange={(e) => setExpectedBehavior(e.target.value)}
                  placeholder="What you expected to happen"
                  className="form-control"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label htmlFor="actualBehavior">Actual Behavior</label>
                <textarea
                  id="actualBehavior"
                  value={actualBehavior}
                  onChange={(e) => setActualBehavior(e.target.value)}
                  placeholder="What actually happened"
                  className="form-control"
                  rows={2}
                />
              </div>
            </>
          )}

          {issueType === 'feature' && (
            <>
              <div className="form-group">
                <label htmlFor="stepsToReproduce">Use Case</label>
                <textarea
                  id="stepsToReproduce"
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                  placeholder="Describe the use case for this feature"
                  className="form-control"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="expectedBehavior">Proposed Solution</label>
                <textarea
                  id="expectedBehavior"
                  value={expectedBehavior}
                  onChange={(e) => setExpectedBehavior(e.target.value)}
                  placeholder="How you think this feature should work"
                  className="form-control"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label htmlFor="actualBehavior">Alternatives Considered</label>
                <textarea
                  id="actualBehavior"
                  value={actualBehavior}
                  onChange={(e) => setActualBehavior(e.target.value)}
                  placeholder="Other solutions you've thought about"
                  className="form-control"
                  rows={2}
                />
              </div>
            </>
          )}

          {issueType === 'question' && (
            <>
              <div className="form-group">
                <label htmlFor="stepsToReproduce">Context</label>
                <textarea
                  id="stepsToReproduce"
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                  placeholder="Provide context for your question"
                  className="form-control"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label htmlFor="expectedBehavior">What I've Tried</label>
                <textarea
                  id="expectedBehavior"
                  value={expectedBehavior}
                  onChange={(e) => setExpectedBehavior(e.target.value)}
                  placeholder="Things you've already attempted"
                  className="form-control"
                  rows={2}
                />
              </div>
            </>
          )}

          <div className="info-box">
            <p>
              <strong>📝 Note:</strong> Clicking "Open GitHub Issue" will open your browser with a pre-filled issue form on GitHub. 
              You'll need to be logged in to GitHub to submit the issue.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
            Open GitHub Issue
          </button>
        </div>
      </div>

      <style>{`
        .report-problem-dialog {
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: var(--text-primary);
          font-size: 13px;
        }

        .required {
          color: #f44747;
        }

        .form-control {
          width: 100%;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          font-size: 13px;
          font-family: inherit;
          transition: border-color 0.2s ease;
        }

        .form-control:focus {
          outline: none;
          border-color: var(--accent-color);
        }

        .form-control::placeholder {
          color: var(--text-muted);
        }

        textarea.form-control {
          resize: vertical;
          min-height: 80px;
        }

        .form-text {
          display: block;
          margin-top: 4px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .info-box {
          margin-top: 16px;
          padding: 12px;
          background: var(--bg-secondary);
          border-left: 3px solid var(--accent-color);
          border-radius: 4px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .info-box strong {
          color: var(--text-primary);
        }

        @media (max-width: 600px) {
          .report-problem-dialog {
            max-width: 95%;
          }
        }
      `}</style>
    </div>
  );
};
