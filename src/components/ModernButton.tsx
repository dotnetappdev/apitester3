import React from 'react';

interface ModernButtonProps {
  children?: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  icon,
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  title
}) => {
  const classNames = ['modern-button', size, variant, className].filter(Boolean).join(' ');

  // Styling is driven by CSS classes (see src/styles/index.css)

  const LoadingSpinner = () => (
    <div className="modern-button-spinner" />
  );
  return (
    <button
      onClick={disabled || loading ? undefined : ((e?: React.MouseEvent<HTMLButtonElement>) => onClick ? onClick(e) : undefined)}
      disabled={disabled || loading}
      className={classNames}
      title={title}
      aria-label={title}
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {icon && <span className="modern-button-icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

// Icon components for common use cases
export const CollectionIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M1.75 2.5a.25.25 0 0 0-.25.25v2.5c0 .138.112.25.25.25h2.5A.25.25 0 0 0 4.5 5V2.75a.25.25 0 0 0-.25-.25h-2.5zM6 2.75A.75.75 0 0 1 6.75 2h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6 2.75zM6.75 5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5zM6 8.25a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6 8.25zM1.75 8a.25.25 0 0 0-.25.25v2.5c0 .138.112.25.25.25h2.5A.25.25 0 0 0 4.5 10.5v-2.25a.25.25 0 0 0-.25-.25h-2.5zM1.75 13.5a.25.25 0 0 0-.25.25v2.5c0 .138.112.25.25.25h2.5a.25.25 0 0 0 .25-.25v-2.5a.25.25 0 0 0-.25-.25h-2.5zM6 14.25a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75z"/>
  </svg>
);

export const TestIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8.75 1.75V5h2.5a.75.75 0 0 1 0 1.5h-2.5v3.25l2.22 2.22a.75.75 0 1 1-1.06 1.06L8 11.06l-1.91 1.97a.75.75 0 1 1-1.06-1.06L7.25 9.75V6.5h-2.5a.75.75 0 0 1 0-1.5h2.5V1.75a.75.75 0 0 1 1.5 0z"/>
  </svg>
);

export const AddIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2z"/>
  </svg>
);

export const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M19.14 12.94a7.07 7.07 0 000-1.88l2.03-1.58a.5.5 0 00.12-.63l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a6.9 6.9 0 00-1.61-.94l-.36-2.54a.5.5 0 00-.49-.42h-3.84a.5.5 0 00-.49.42l-.36 2.54c-.56.22-1.09.5-1.61.94l-2.39-.96a.5.5 0 00-.6.22L2.71 8.85a.5.5 0 00.12.63l2.03 1.58c-.06.29-.1.59-.1.88s.04.59.1.88L2.83 14.4a.5.5 0 00-.12.63l1.92 3.32c.14.24.42.34.66.26l2.39-.96c.52.44 1.05.82 1.61.94l.36 2.54c.05.28.28.49.56.49h3.84c.28 0 .51-.21.56-.49l.36-2.54c.56-.12 1.09-.5 1.61-.94l2.39.96c.24.08.52-.02.66-.26l1.92-3.32a.5.5 0 00-.12-.63l-2.03-1.58zM12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z"/>
  </svg>
);

export const TeamIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05C16.9 13.5 18.66 14 20 14v2.5h-6.03c.15-.48.03-1.08-.28-1.5-.48-.67-1.37-1.05-2.69-1.05z"/>
  </svg>
);

export const MonitorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M21 3H3c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h6v2H7v2h10v-2h-2v-2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM21 16H3V5h18v11z"/>
  </svg>
);

export const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M1.75 2.5A1.75 1.75 0 0 0 0 4.25v7.5C0 13.216.784 14 1.75 14h12.5A1.75 1.75 0 0 0 16 12.25v-6.5A1.75 1.75 0 0 0 14.25 4H8.061L6.22 2.159A1.75 1.75 0 0 0 4.982 1.5H1.75z"/>
  </svg>
);