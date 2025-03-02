// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const closeMenus = () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center" onClick={closeMenus}>
              <svg className="h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span className="ml-2 text-xl font-bold text-primary-700 hidden sm:block">
                Wound Annotation Tool
              </span>
              <span className="ml-2 text-xl font-bold text-primary-700 sm:hidden">
                WoundAnnot
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            {currentUser && (
              <nav className="hidden ml-6 sm:flex space-x-4">
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/' 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={closeMenus}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/wounds" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/wounds' 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={closeMenus}
                >
                  Wound Images
                </Link>
                {currentUser.role === 'admin' && (
                  <Link 
                    to="/admin/users" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname.includes('/admin') 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={closeMenus}
                  >
                    Admin
                  </Link>
                )}
              </nav>
            )}
          </div>
          
          {/* Mobile menu button and user dropdown */}
          {currentUser && (
            <div className="flex items-center">
              <div className="flex sm:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
              
              <div className="hidden sm:flex sm:items-center sm:ml-6">
                <span className="text-sm text-gray-600 mr-4">
                  <span className="font-medium text-gray-900">{currentUser.full_name}</span>
                  <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                    {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                  </span>
                </span>
              </div>
              
              {/* User dropdown */}
              <div className="ml-3 relative">
                <button
                  type="button"
                  className="bg-white rounded-full flex focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-600 font-semibold text-sm">
                    {currentUser.full_name.charAt(0).toUpperCase()}
                  </div>
                </button>
                
                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{currentUser.username}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && currentUser && (
        <div className="sm:hidden border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={closeMenus}
            >
              Dashboard
            </Link>
            <Link
              to="/wounds"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/wounds' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={closeMenus}
            >
              Wound Images
            </Link>
            {currentUser.role === 'admin' && (
              <Link
                to="/admin/users"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname.includes('/admin') 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={closeMenus}
              >
                Admin
              </Link>
            )}
            <div className="px-3 py-2 text-sm font-medium text-gray-500">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-600 font-semibold text-sm">
                  {currentUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{currentUser.full_name}</p>
                  <p className="text-xs text-gray-500">{currentUser.role}</p>
                </div>
              </div>
            </div>
            <button
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;