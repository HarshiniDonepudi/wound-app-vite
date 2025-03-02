// src/components/annotations/AnnotationInfo.jsx
import React from 'react';
import { useAnnotations } from '../../hooks/useAnnotations';

const AnnotationInfo = () => {
  const { selectedAnnotation, categoryColors } = useAnnotations();

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (!selectedAnnotation) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Annotation Details</h2>
        <p className="text-gray-500 italic">No annotation selected. Click on an annotation to view details.</p>
      </div>
    );
  }

  // Get color for the selected annotation category
  const color = categoryColors[selectedAnnotation.category] || '#3B82F6';

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Annotation Details</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Category</h3>
          <div 
            className="mt-1 px-3 py-1 inline-block rounded-full text-sm font-medium"
            style={{ backgroundColor: `${color}20`, color: color }}
          >
            {selectedAnnotation.category}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Body Location</h3>
          <p className="mt-1 text-sm text-gray-900">{selectedAnnotation.location}</p>
        </div>
        
        {selectedAnnotation.body_map_id && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Body Map ID</h3>
            <p className="mt-1 text-sm text-gray-900">{selectedAnnotation.body_map_id}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Position (x, y)</h3>
            <p className="mt-1 text-sm text-gray-900">
              ({Math.round(selectedAnnotation.x)}, {Math.round(selectedAnnotation.y)})
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Size (w × h)</h3>
            <p className="mt-1 text-sm text-gray-900">
              {Math.round(selectedAnnotation.width)} × {Math.round(selectedAnnotation.height)}
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Created By</h3>
          <p className="mt-1 text-sm text-gray-900">{selectedAnnotation.created_by}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Created At</h3>
          <p className="mt-1 text-sm text-gray-900">{formatDate(selectedAnnotation.created_at)}</p>
        </div>
        
        {selectedAnnotation.last_modified_by && (
          <>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Modified By</h3>
              <p className="mt-1 text-sm text-gray-900">{selectedAnnotation.last_modified_by}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Modified At</h3>
              <p className="mt-1 text-sm text-gray-900">{formatDate(selectedAnnotation.last_modified_at)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnnotationInfo;