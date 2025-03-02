// src/components/annotations/AnnotationControls.jsx
import React, { useState } from 'react';
import { useAnnotations } from '../../hooks/useAnnotations';

const AnnotationControls = () => {
  const {
    selectedAnnotation,
    etiologyOptions,
    bodyLocations,
    currentCategory,
    currentLocation,
    bodyMapId,
    setCurrentCategory,
    setCurrentLocation,
    setBodyMapId,
    updateAnnotation,
    deleteAnnotation,
    saveAnnotations,
    loading
  } = useAnnotations();

  const [saveStatus, setSaveStatus] = useState({ message: '', type: '' });
  const [isCollapsed, setIsCollapsed] = useState({
    categories: false,
    locations: false
  });

  const handleCategoryChange = (category) => {
    setCurrentCategory(category);
    
    // If an annotation is selected, update its category
    if (selectedAnnotation) {
      updateAnnotation({
        ...selectedAnnotation,
        category
      });
    }
  };

  const handleLocationChange = (location) => {
    setCurrentLocation(location);
    
    // If an annotation is selected, update its location
    if (selectedAnnotation) {
      updateAnnotation({
        ...selectedAnnotation,
        location
      });
    }
  };

  const handleBodyMapIdChange = (e) => {
    const value = e.target.value;
    setBodyMapId(value);
    
    // If an annotation is selected, update its body_map_id
    if (selectedAnnotation) {
      updateAnnotation({
        ...selectedAnnotation,
        body_map_id: value
      });
    }
  };

  const handleDeleteAnnotation = () => {
    if (selectedAnnotation && confirm('Are you sure you want to delete this annotation?')) {
      deleteAnnotation(selectedAnnotation.id);
    }
  };

  const handleSaveAnnotations = async () => {
    try {
      setSaveStatus({ message: 'Saving...', type: 'info' });
      const success = await saveAnnotations();
      
      if (success) {
        setSaveStatus({ message: 'Annotations saved successfully!', type: 'success' });
        
        // Clear success message after a few seconds
        setTimeout(() => {
          setSaveStatus({ message: '', type: '' });
        }, 3000);
      } else {
        setSaveStatus({ message: 'Failed to save annotations.', type: 'error' });
      }
    } catch (error) {
      console.error('Error saving annotations:', error);
      setSaveStatus({ message: 'Error: ' + error.message, type: 'error' });
    }
  };

  const toggleSection = (section) => {
    setIsCollapsed({
      ...isCollapsed,
      [section]: !isCollapsed[section]
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Annotation Controls</h2>
      
      {/* Save Status Message */}
      {saveStatus.message && (
        <div className={`mb-4 p-3 rounded text-sm ${
          saveStatus.type === 'success' ? 'bg-green-100 text-green-800' :
          saveStatus.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {saveStatus.message}
        </div>
      )}
      
      {/* Current Selection */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-2">Current Selection</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {currentCategory || 'No category'}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            {currentLocation || 'No location'}
          </span>
        </div>
        
        {selectedAnnotation && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-1">Selected Annotation</h4>
            <div className="text-sm text-gray-600">
              <div>Position: ({selectedAnnotation.x.toFixed(0)}, {selectedAnnotation.y.toFixed(0)})</div>
              <div>Size: {selectedAnnotation.width.toFixed(0)} × {selectedAnnotation.height.toFixed(0)}</div>
              <div className="mt-2">
                <button
                  onClick={handleDeleteAnnotation}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg className="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Selection */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('categories')}
        >
          <h3 className="text-md font-medium text-gray-700">Wound Category</h3>
          <svg 
            className={`h-5 w-5 text-gray-500 transition-transform ${isCollapsed.categories ? 'transform rotate-180' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        
        {!isCollapsed.categories && (
          <div className="mt-2 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-1 gap-2">
              {etiologyOptions.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3 py-2 text-left text-sm rounded-md border transition-colors ${
                    currentCategory === category
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-white hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Location Selection */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('locations')}
        >
          <h3 className="text-md font-medium text-gray-700">Body Location</h3>
          <svg 
            className={`h-5 w-5 text-gray-500 transition-transform ${isCollapsed.locations ? 'transform rotate-180' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        
        {!isCollapsed.locations && (
          <div className="mt-2">
            <div className="grid grid-cols-1 gap-2">
              {bodyLocations.map(location => (
                <button
                  key={location}
                  onClick={() => handleLocationChange(location)}
                  className={`px-3 py-2 text-left text-sm rounded-md border transition-colors ${
                    currentLocation === location
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : 'bg-white hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Body Map ID */}
      <div className="mb-6">
        <label htmlFor="bodyMapId" className="block text-sm font-medium text-gray-700 mb-1">
          Body Map ID (Optional)
        </label>
        <input
          type="text"
          id="bodyMapId"
          value={bodyMapId}
          onChange={handleBodyMapIdChange}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="Enter body map identifier"
        />
      </div>

      {/* Save Button */}
      <div className="mt-8">
        <button
          onClick={handleSaveAnnotations}
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : 'Save Annotations'}
        </button>
      </div>
      
      <div className="mt-4 text-center text-xs text-gray-500">
        <p>Click and drag on the image to create a new annotation</p>
        <p>Click on an existing annotation to select it</p>
      </div>
    </div>
  );
};

export default AnnotationControls;