import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAllWounds, getConfigOptions } from '../services/woundService';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalWounds: 0,
    categories: [],
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
        
        setStats({
          totalWounds: wounds.length,
          categories: etiologyOptions || [],
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Welcome, {currentUser.full_name}!</h1>
        <p className="text-gray-600 mb-4">
          This is the Wound Annotation Tool dashboard. Here you can access and annotate wound images.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800">Total Wounds</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalWounds}</p>
            <Link to="/wounds" className="text-blue-700 hover:underline text-sm block mt-2">
              View All Wounds
            </Link>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="font-medium text-green-800">Your Role</h3>
            <p className="text-2xl font-bold text-green-600 capitalize">{currentUser.role}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h3 className="font-medium text-purple-800">Categories Available</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.categories.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/wounds"
            className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 flex flex-col items-center text-center"
          >
            <span className="text-lg font-medium mb-2">Browse Wound Images</span>
            <span className="text-gray-600 text-sm">View and select images for annotation</span>
          </Link>
          
          {currentUser.role === 'admin' && (
            <Link
              to="/admin/users"
              className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 flex flex-col items-center text-center"
            >
              <span className="text-lg font-medium mb-2">Manage Users</span>
              <span className="text-gray-600 text-sm">Add, edit, or deactivate user accounts</span>
            </Link>
          )}
          
          {currentUser.role === 'admin' && (
            <Link
              to="/admin/stats"
              className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 flex flex-col items-center text-center"
            >
              <span className="text-lg font-medium mb-2">View Statistics</span>
              <span className="text-gray-600 text-sm">Access annotation statistics and reports</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;