// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAllWounds, getConfigOptions } from '../services/woundService';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalWounds: 0,
    categories: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load all wounds
        const wounds = await getAllWounds();
        
        // Load categories
        const { etiologyOptions } = await getConfigOptions();
        
        // Generate some demo recent activity (in a real app, this would come from the API)
        const recentActivity = [
          {
            id: 1,
            action: 'Created annotation',
            wound_id: wounds.length > 0 ? wounds[0].id : '12345',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            user: currentUser.username
          },
          {
            id: 2,
            action: 'Viewed wound image',
            wound_id: wounds.length > 1 ? wounds[1].id : '67890',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
            user: currentUser.username
          },
          {
            id: 3,
            action: 'Updated annotation',
            wound_id: wounds.length > 0 ? wounds[0].id : '12345',
            timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
            user: currentUser.username
          }
        ];
        
        setStats({
          totalWounds: wounds.length,
          categories: etiologyOptions || [],
          recentActivity
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser.username]);

  // Format relative time
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {currentUser.full_name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Use the Wound Annotation Tool to view and annotate wound images.
          </p>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Total wounds card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Wounds
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {stats.totalWounds}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/wounds" className="font-medium text-primary-600 hover:text-primary-900">
                  View all wounds
                </Link>
              </div>
            </div>
          </div>
          
          {/* User role card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Your Role
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 capitalize">
                        {currentUser.role}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/profile" className="font-medium text-green-600 hover:text-green-900">
                  View your profile
                </Link>
              </div>
            </div>
          </div>
          
          {/* Categories card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Wound Categories
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {stats.categories.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-purple-600">
                  Available for annotations
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick actions and recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick actions */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2">
                <Link
                  to="/wounds"
                  className="group relative rounded-lg p-6 bg-gray-50 hover:bg-primary-50 transition-colors duration-300 flex flex-col items-center text-center"
                >
                  <div className="flex justify-center items-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4 group-hover:bg-primary-200 transition-colors duration-300">
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-gray-900 group-hover:text-primary-900">Browse Images</h3>
                  <p className="mt-2 text-sm text-gray-500 group-hover:text-primary-700">View and select wound images for annotation</p>
                </Link>
                
                <Link
                  to="/annotations"
                  className="group relative rounded-lg p-6 bg-gray-50 hover:bg-green-50 transition-colors duration-300 flex flex-col items-center text-center"
                >
                  <div className="flex justify-center items-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4 group-hover:bg-green-200 transition-colors duration-300">
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-gray-900 group-hover:text-green-900">My Annotations</h3>
                  <p className="mt-2 text-sm text-gray-500 group-hover:text-green-700">View your recent annotations</p>
                </Link>
                
                {currentUser.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/users"
                      className="group relative rounded-lg p-6 bg-gray-50 hover:bg-purple-50 transition-colors duration-300 flex flex-col items-center text-center"
                    >
                      <div className="flex justify-center items-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-4 group-hover:bg-purple-200 transition-colors duration-300">
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-medium text-gray-900 group-hover:text-purple-900">Manage Users</h3>
                      <p className="mt-2 text-sm text-gray-500 group-hover:text-purple-700">Add, edit, or deactivate users</p>
                    </Link>
                    
                    <Link
                      to="/admin/stats"
                      className="group relative rounded-lg p-6 bg-gray-50 hover:bg-blue-50 transition-colors duration-300 flex flex-col items-center text-center"
                    >
                      <div className="flex justify-center items-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-medium text-gray-900 group-hover:text-blue-900">View Statistics</h3>
                      <p className="mt-2 text-sm text-gray-500 group-hover:text-blue-700">Access annotation statistics</p>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Recent activity */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              
              <div className="mt-6 flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {stats.recentActivity.map((activity) => (
                    <li key={activity.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                            {activity.action.includes('Created') && (
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                            )}
                            {activity.action.includes('Updated') && (
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            )}
                            {activity.action.includes('Viewed') && (
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.action}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            <Link to={`/annotate/${activity.wound_id}`} className="hover:underline">
                              Wound ID: {activity.wound_id}
                            </Link>
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatRelativeTime(activity.timestamp)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6">
                <Link
                  to="/activity"
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View all activity
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;