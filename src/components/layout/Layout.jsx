// src/components/layout/Layout.jsx
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

const Layout = ({ children }) => {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // If no user is logged in, don't show the layout
  if (!currentUser) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex h-screen pt-16 overflow-hidden bg-gray-100">
        {/* Sidebar */}
        <div className={`fixed inset-0 flex z-40 lg:inset-y-auto lg:static lg:h-auto ${sidebarOpen ? '' : 'lg:-ml-64'} transition-all duration-300`}>
          <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true">
          </div>
          
          <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transition-all duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            <div className="absolute top-0 right-0 -mr-12 pt-2 lg:hidden">
              <button
                className={`ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <Sidebar />
          </div>
          
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;