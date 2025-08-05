import React, { useState, useEffect } from 'react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userEmail: string;
}

interface UserInfo {
  employeeId: number;
  name: string;
  email: string;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, onLogout, userEmail }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Fetch user information when component mounts
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/register-info`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userEmail }),
        });
        const data = await response.json();
        if (data.user) {
          setUserInfo({
            employeeId: data.user.employeeId,
            name: data.user.name,
            email: userEmail
          });
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };

    if (userEmail) {
      fetchUserInfo();
    }
  }, [userEmail]);

  const menuItems = [
    { id: 'evaluation-dashboard', label: 'Evaluation Dashboard', icon: '📊' },
    { id: 'priority-matching', label: 'My Priority Matches', icon: '🎯' },
    { id: 'service-orders', label: 'My Service Orders', icon: '📋' },
    { id: 'manage-service-orders', label: 'Manage Service Orders', icon: '⚙️' }
  ];

  return (
    <nav style={navStyles}>
      <div style={navHeaderStyles}>
        <h2 style={logoStyles}>AI Talent Flow</h2>
        <div style={userInfoStyles}>
          {userInfo && (
            <div style={userDetailsStyles}>
                <span>
              <span style={userNameStyles}>{userInfo.name} </span><span style={userIdStyles}>ID: {userInfo.employeeId} </span>
              <span style={userEmailStyles}> {userInfo.email}</span>
              </span>
            </div>
          )}
          <LogoutButton onClick={onLogout} />
        </div>
      </div>
      
      <div style={menuContainerStyles}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              ...menuItemStyles,
              ...(currentPage === item.id ? activeMenuItemStyles : {})
            }}
          >
            <span style={iconStyles}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

// Styles
const navStyles: React.CSSProperties = {
  backgroundColor: '#1e293b',
  color: 'white',
  padding: '0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  position: 'sticky' as const,
  top: 0,
  zIndex: 1000
};

const navHeaderStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 2rem',
  borderBottom: '1px solid #334155'
};

const logoStyles: React.CSSProperties = {
  margin: 0,
  color: '#60a5fa',
  fontSize: '1.5rem',
  fontWeight: 'bold'
};

const userInfoStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem'
};

const userDetailsStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '0.25rem'
};

const userNameStyles: React.CSSProperties = {
  color: '#f1f5f9',
  fontSize: '1rem',
  fontWeight: '600'
};

const userIdStyles: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '0.8rem',
  fontWeight: '500'
};

const userEmailStyles: React.CSSProperties = {
  color: '#cbd5e1',
  fontSize: '0.85rem'
};

const logoutButtonStyles: React.CSSProperties = {
  backgroundColor: '#dc2626',
  color: 'white',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'background-color 0.2s'
};

// Add hover styles using onMouseEnter/onMouseLeave
const LogoutButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...logoutButtonStyles,
        backgroundColor: isHovered ? '#b91c1c' : '#dc2626'
      }}
    >
      Logout
    </button>
  );
};

const menuContainerStyles: React.CSSProperties = {
  display: 'flex',
  padding: '0 2rem'
};

const menuItemStyles: React.CSSProperties = {
  backgroundColor: 'transparent',
  color: '#cbd5e1',
  border: 'none',
  padding: '1rem 1.5rem',
  cursor: 'pointer',
  fontSize: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'all 0.2s',
  borderBottom: '3px solid transparent'
};

const activeMenuItemStyles: React.CSSProperties = {
  color: '#60a5fa',
  borderBottomColor: '#60a5fa',
  backgroundColor: '#334155'
};

const iconStyles: React.CSSProperties = {
  fontSize: '1.2rem'
};

export default Navigation;
