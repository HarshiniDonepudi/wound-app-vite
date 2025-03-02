// src/pages/AnnotationPage.jsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnnotations } from '../hooks/useAnnotations';
import AnnotationCanvas from '../components/annotations/AnnotationCanvas';
import AnnotationControls from '../components/annotations/AnnotationControls';
import AnnotationInfo from '../components/annotations/AnnotationInfo';

const AnnotationPage = () => {
  const { woundId } = useParams();
  const { wound, loading, error, selectedAnnotation } = useAnnotations();
  const [showTutorial, setShowTutorial] = useState(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading wound data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm leading-5 font-medium text-red-800">Error Loading Wound Data</h3>
              <p className="mt-1 text-sm leading-5 text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Link to="/wounds" className="text-primary-600 hover:text-primary-800 font-medium flex items-center">
            <svg className="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to wound list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Annotate Wound
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              ID: {woundId}
            </p>
          </div>
          <Link 
            to="/wounds" 
            className="mt-2 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to wound list
          </Link>
        </div>

        {/* Tutorial Banner */}
        {showTutorial && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm leading-5 font-medium text-blue-800">How to use the annotation tool</h3>
                <div className="mt-1 text-sm leading-5 text-blue-700">
                  <ul className="list-disc list-inside">
                    <li>Select a category and body location from the right panel</li>
                    <li>Click and drag on the image to create a new annotation</li>
                    <li>Click on an existing annotation to select and edit it</li>
                    <li>Click Save Annotations when finished</li>
                  </ul>
                </div>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button 
                    onClick={() => setShowTutorial(false)} 
                    className="inline-flex rounded-md p-1.5 text-blue-500 hover:bg-blue-100 focus:outline-none focus:bg-blue-100"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wound Information */}
        {wound && (
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Wound Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Wound Type</h3>
                <p className="mt-1 text-sm font-medium text-gray-900">{wound.wound_type || 'Not specified'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Body Location</h3>
                <p className="mt-1 text-sm font-medium text-gray-900">{wound.body_location || 'Not specified'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</h3>
                <p className="mt-1 text-sm font-medium text-gray-900">{wound.patient_id || 'Not available'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Canvas Container */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Wound Image</h2>
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg overflow-hidden">
                <AnnotationCanvas />
              </div>
              <p className="mt-3 text-xs text-gray-500 text-center">
                Click and drag on the image to create a new annotation. Click on an existing annotation to select it.
              </p>
            </div>
            
            {/* Selected Annotation Info (mobile-only) */}
            <div className="lg:hidden">
              <AnnotationInfo />
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Selected Annotation Info (desktop-only) */}
            <div className="hidden lg:block">
              <AnnotationInfo />
            </div>
            
            {/* Annotation Controls */}
            <AnnotationControls />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationPage;