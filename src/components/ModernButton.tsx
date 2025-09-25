import React from 'react';

interface ModernButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
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
  style = {}
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: icon ? '8px' : '0',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    position: 'relative',
    overflow: 'hidden',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    ...style
  };

  const sizeStyles = {
    small: {
      padding: '6px 12px',
      fontSize: '12px',
      minHeight: '28px'
    },
    medium: {
      padding: '10px 16px',
      fontSize: '14px',
      minHeight: '36px'
    },
    large: {
      padding: '12px 20px',
      fontSize: '16px',
      minHeight: '44px'
    }
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(45deg, #007acc, #0066aa)',
      color: '#ffffff',
      boxShadow: '0 2px 8px rgba(0, 122, 204, 0.3)'
    },
    secondary: {
      background: 'linear-gradient(45deg, #3c3c3c, #2d2d30)',
      color: '#cccccc',
      border: '1px solid #6c6c6c',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
    },
    success: {
      background: 'linear-gradient(45deg, #28a745, #218838)',
      color: '#ffffff',
      boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)'
    },
    danger: {
      background: 'linear-gradient(45deg, #f44747, #d73a49)',
      color: '#ffffff',
      boxShadow: '0 2px 8px rgba(244, 71, 71, 0.3)'
    }
  };

  const hoverStyles = {
    primary: {
      background: 'linear-gradient(45deg, #106ebe, #007acc)',
      boxShadow: '0 4px 12px rgba(0, 122, 204, 0.4)',
      transform: 'translateY(-1px)'
    },
    secondary: {
      background: 'linear-gradient(45deg, #4a4a4a, #3c3c3c)',
      borderColor: '#7c7c7c',
      transform: 'translateY(-1px)'
    },
    success: {
      background: 'linear-gradient(45deg, #34ce57, #28a745)',
      boxShadow: '0 4px 12px rgba(40, 167, 69, 0.4)',
      transform: 'translateY(-1px)'
    },
    danger: {
      background: 'linear-gradient(45deg, #ff6b6b, #f44747)',
      boxShadow: '0 4px 12px rgba(244, 71, 71, 0.4)',
      transform: 'translateY(-1px)'
    }
  };

  const buttonStyle = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant]
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    const button = e.target as HTMLButtonElement;
    const hoverStyle = hoverStyles[variant];
    Object.assign(button.style, hoverStyle);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    const button = e.target as HTMLButtonElement;
    Object.assign(button.style, variantStyles[variant]);
    button.style.transform = 'translateY(0)';
  };

  const LoadingSpinner = () => (
    <div
      style={{
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTop: '2px solid #ffffff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    />
  );

  return (
    <button
      style={buttonStyle}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
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

export const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M1.75 2.5A1.75 1.75 0 0 0 0 4.25v7.5C0 13.216.784 14 1.75 14h12.5A1.75 1.75 0 0 0 16 12.25v-6.5A1.75 1.75 0 0 0 14.25 4H8.061L6.22 2.159A1.75 1.75 0 0 0 4.982 1.5H1.75z"/>
  </svg>
);