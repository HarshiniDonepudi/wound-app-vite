import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { currentUser } = useAuth();
  
  const isAdmin = currentUser && currentUser.role === 'admin';

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="h-full p-4">
        <nav className="space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            Dashboard
          </NavLink>
          
          <NavLink
            to="/wounds"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            Wound Images
          </NavLink>
          
          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Admin
              </h3>
              <div className="mt-2 space-y-1">
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  Manage Users
                </NavLink>
                
                <NavLink
                  to="/admin/stats"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  Statistics
                </NavLink>
              </div>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;