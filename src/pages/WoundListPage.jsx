import React, { useState, useEffect } from 'react';
import WoundList from '../components/wounds/WoundList';
import { getAllWounds } from '../services/woundService';

const WoundListPage = () => {
  const [wounds, setWounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadWounds = async () => {
      try {
        setLoading(true);
        const data = await getAllWounds();
        setWounds(data);
      } catch (err) {
        console.error('Error loading wounds:', err);
        setError('Failed to load wound list. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadWounds();
  }, []);

  // Filter wounds based on search term
  const filteredWounds = wounds.filter(wound => 
    wound.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wound.id.toString().includes(searchTerm)
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Wound Images</h1>
      
      <div className="mb-4">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
          Search Wounds
        </label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by ID or path..."
          className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wound images...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <WoundList wounds={filteredWounds} searchTerm={searchTerm} />
      )}
    </div>
  );
};

export default WoundListPage;
