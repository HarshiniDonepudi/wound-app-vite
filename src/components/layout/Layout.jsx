import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

const Layout = ({ children }) => {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen width changes
  useEffect(() => {
    const checkMobile = () => {
      const mobileView = window.innerWidth < 1024;
      setIsMobile(mobileView);
      // Auto-close sidebar for mobile
      setSidebarOpen(!mobileView);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // If no user logged in, just render children directly (no layout)
  if (!currentUser) {
    return <>{children}</>;
  }

  return (
    <div className="layout-container">
      <Header toggleSidebar={toggleSidebar} />

      <div className="layout-body">
        {/* Dark overlay for mobile */}
        {isMobile && sidebarOpen && (
          <div
            className="layout-overlay"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar container */}
        <div
          className={`layout-sidebar-container ${
            sidebarOpen ? 'layout-sidebar-container--open' : ''
          } ${isMobile ? 'layout-sidebar-container--mobile' : ''}`}
        >
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        </div>

        {/* Main content */}
        <div className="layout-main">
          <main className="layout-main-inner">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
