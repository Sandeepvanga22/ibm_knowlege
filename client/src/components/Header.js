import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            IBM Knowledge Ecosystem
          </Link>
          
          <nav className="nav">
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Home
            </Link>
            <Link to="/questions" className={isActive('/questions') ? 'active' : ''}>
              Questions
            </Link>
            <Link to="/ask" className={isActive('/ask') ? 'active' : ''}>
              Ask Question
            </Link>
            <Link to="/analytics" className={isActive('/analytics') ? 'active' : ''}>
              Analytics
            </Link>
            <Link to="/agents" className={isActive('/agents') ? 'active' : ''}>
              Agents
            </Link>
          </nav>

          <div className="user-info">
            {isAuthenticated ? (
              <>
                <div className="user-avatar">
                  {user?.firstName?.charAt(0) || user?.ibmId?.charAt(0) || 'U'}
                </div>
                <div>
                  <div>{user?.firstName} {user?.lastName}</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    {user?.department} • {user?.team}
                  </div>
                </div>
                <button onClick={logout} className="btn btn-secondary" style={{ marginLeft: '1rem' }}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 