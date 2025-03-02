import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ toggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      setIsProfileOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-menu')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  if (!currentUser) return null;

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header-inner">
        <div className="header-left">
          {/* Mobile menu button */}
          <button
            type="button"
            className="header-burger"
            onClick={toggleSidebar}
          >
            <svg className="icon icon--menu" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>

          {/* Logo */}
          <Link to="/" className="header-logo">
            <div className="logo-icon">
              <svg 
                className="icon icon--logo" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21
                     a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828
                     c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <span className="logo-text">Wound Annotation</span>
          </Link>
        </div>

        <nav className="header-nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'nav-link--active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/wounds" 
            className={`nav-link ${location.pathname === '/wounds' ? 'nav-link--active' : ''}`}
          >
            Wounds
          </Link>
          <Link 
            to="/annotations" 
            className={`nav-link ${
              location.pathname.includes('/annotate') || location.pathname === '/annotations'
                ? 'nav-link--active' 
                : ''
            }`}
          >
            Annotations
          </Link>
          {currentUser.role === 'admin' && (
            <Link 
              to="/admin" 
              className={`nav-link ${location.pathname.includes('/admin') ? 'nav-link--active' : ''}`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="header-right">
          <div className="profile-menu">
            <button
              type="button"
              className="profile-menu-btn"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="profile-initial">
                {currentUser.full_name?.charAt(0) || currentUser.username?.charAt(0) || 'U'}
              </div>
              <span className="profile-name">
                {currentUser.full_name || currentUser.username}
              </span>
              <svg 
                className={`icon icon--chevron ${isProfileOpen ? 'rotated' : ''}`}
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293
                     a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4
                     a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>

            {isProfileOpen && (
              <div className="profile-dropdown" role="menu">
                <div className="profile-dropdown__header">
                  <p className="profile-dropdown__label">Signed in as</p>
                  <p className="profile-dropdown__value">{currentUser.username}</p>
                </div>
                
                <Link
                  to="/profile"
                  className="profile-dropdown__item"
                  role="menuitem"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Your Profile
                </Link>
                
                <Link
                  to="/settings"
                  className="profile-dropdown__item"
                  role="menuitem"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Settings
                </Link>
                
                <button
                  className="profile-dropdown__item profile-dropdown__item--danger"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
