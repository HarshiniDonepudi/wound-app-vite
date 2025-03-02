import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnnotations } from '../hooks/useAnnotations';
import AnnotationCanvas from '../components/annotations/AnnotationCanvas';


const AnnotationPage = () => {
  const { woundId } = useParams();
  const { wound, loading, error } = useAnnotations();

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wound data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <div className="mt-4">
          <Link to="/wounds" className="text-blue-500 hover:underline">
            &larr; Back to wound list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Annotate Wound: {woundId}
        </h1>
        <Link to="/wounds" className="text-blue-500 hover:underline">
          &larr; Back to wound list
        </Link>
      </div>

      {wound && (
        <div className="bg-white shadow rounded p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Wound Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-gray-700 font-medium">Wound Type:</span> 
              <span className="ml-2">{wound.wound_type}</span>
            </div>
            <div>
              <span className="text-gray-700 font-medium">Body Location:</span> 
              <span className="ml-2">{wound.body_location}</span>
            </div>
            <div>
              <span className="text-gray-700 font-medium">Patient ID:</span> 
              <span className="ml-2">{wound.patient_id || 'Not available'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <AnnotationCanvas />
        </div>
        <div>
          <AnnotationControls />
        </div>
      </div>
    </div>
  );
};

export default AnnotationPage;