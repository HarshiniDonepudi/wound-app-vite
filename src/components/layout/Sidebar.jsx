import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: (
        <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M3 12l2-2m0 0l7-7 7 7
               M5 10v10a1 1 0 001 1h3m10-11l2 2
               m-2-2v10a1 1 0 01-1 1h-3
               m-6 0a1 1 0 001-1v-4a1 1 0
               011-1h2a1 1 0 011 1v4a1 1 0
               001 1m-6 0h6" 
          />
        </svg>
      )
    },
    {
      name: 'Wound Images',
      path: '/wounds',
      icon: (
        <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M4 16l4.586-4.586a2 2 0
               012.828 0L16 16m-2-2l1.586-1.586a2
               2 0 012.828 0L20 14m-6-6h.01M6 
               20h12a2 2 0 002-2V6a2 2 0 
               00-2-2H6a2 2 0 00-2 2v12a2 
               2 0 002 2z" 
          />
        </svg>
      )
    },
    {
      name: 'Annotations',
      path: '/annotations',
      icon: (
        <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036
               a2.5 2.5 0 113.536 3.536L6.5 
               21.036H3v-3.572L16.732 3.732z" 
          />
        </svg>
      )
    }
  ];

  const adminItems = [
    {
      name: 'Manage Users',
      path: '/admin/users',
      icon: (
        <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M12 4.354a4 4 0 
               110 5.292M15 21H3v-1a6 6 0 
               0112 0v1zm0 0h6v-1a6 6 0 
               00-9-5.197M13 7a4 4 0 
               11-8 0 4 4 0 018 0z" 
          />
        </svg>
      )
    },
    {
      name: 'Statistics',
      path: '/admin/stats',
      icon: (
        <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M9 19v-6a2 2 0 
               00-2-2H5a2 2 0 00-2 2v6a2 2 
               0 002 2h2a2 2 0 002-2zm0 0V9a2
               2 0 012-2h2a2 2 0 
               012 2v10m-6 0a2 2 0 002 2h2a2 2 
               0 002-2m0 0V5a2 2 0 012-2h2
               a2 2 0 012 2v14a2 2 0 
               01-2 2h-2a2 2 0 01-2-2z" 
          />
        </svg>
      )
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: (
        <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M10.325 4.317c.426-1.756 2.924-1.756
               3.35 0a1.724 1.724 0 002.573 
               1.066c1.543-.94 3.31.826 2.37
               2.37a1.724 1.724 0 001.065
               2.572c1.756.426 1.756 2.924 
               0 3.35a1.724 1.724 0 00-1.066
               2.573c.94 1.543-.826 3.31-2.37
               2.37a1.724 1.724 0 00-2.572
               1.065c-.426 1.756-2.924 1.756
               -3.35 0a1.724 1.724 0 
               00-2.573-1.066c-1.543.94
               -3.31-.826-2.37-2.37a1.724
               1.724 0 00-1.065-2.572
               c-1.756-.426-1.756-2.924
               0-3.35a1.724 1.724 0 
               001.066-2.573c-.94-1.543
               .826-3.31 2.37-2.37.996.608
               2.296.07 2.572-1.065z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M15 12a3 3 0 11-6 
               0 3 3 0 016 0z" 
          />
        </svg>
      )
    }
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
      }
      onClick={onClose}
    >
      <span className="sidebar-link__icon">{item.icon}</span>
      <span className="sidebar-link__text">{item.name}</span>
    </NavLink>
  );

  return (
    <div className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__content">
        {/* User profile section */}
        <div className="sidebar__profile">
          <div className="sidebar__profile-icon">
            {currentUser.full_name?.charAt(0) || currentUser.username?.charAt(0) || 'U'}
          </div>
          <div className="sidebar__profile-info">
            <p className="sidebar__profile-name">
              {currentUser.full_name || currentUser.username}
            </p>
            <p className="sidebar__profile-role">
              <span className="sidebar__role-badge">
                {currentUser.role}
              </span>
            </p>
          </div>
        </div>
        
        {/* Navigation items */}
        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}

          {/* Admin section */}
          {currentUser.role === 'admin' && (
            <div className="sidebar__admin">
              <h3 className="sidebar__admin-title">Admin</h3>
              <div className="sidebar__admin-links">
                {adminItems.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>
      
      {/* Help and support */}
      <div className="sidebar__footer">
        <a href="#" className="sidebar-link">
          <span className="sidebar-link__icon">
            <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2"
                d="M8.228 9c.549-1.165 2.03-2
                   3.772-2 2.21 0 4 1.343 4 3 
                   0 1.4-1.278 2.575-3.006 
                   2.907-.542.104-.994.54
                   -.994 1.093m0 3h.01M21 12a9 
                   9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </span>
          <span className="sidebar-link__text">Help & Support</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
