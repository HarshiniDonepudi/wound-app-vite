import React, { createContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { 
  getAnnotations, 
  saveAnnotations, 
  getWoundById,
  getWoundImage,
  getConfigOptions
} from '../services/woundService';

export const AnnotationContext = createContext();

export const AnnotationProvider = ({ children }) => {
  const { woundId } = useParams();
  
  // Wound data
  const [wound, setWound] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  
  // Annotation data
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  
  // Configuration options
  const [etiologyOptions, setEtiologyOptions] = useState([]);
  const [bodyLocations, setBodyLocations] = useState([]);
  const [categoryColors, setCategoryColors] = useState({});
  
  // Current selections for new annotations
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [bodyMapId, setBodyMapId] = useState('');
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load wound data, image, and config options
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load configuration options
        const config = await getConfigOptions();
        setEtiologyOptions(config.etiologyOptions);
        setBodyLocations(config.bodyLocations);
        setCategoryColors(config.categoryColors);
        
        // Set default values for new annotations
        if (config.etiologyOptions.length > 0) {
          setCurrentCategory(config.etiologyOptions[0]);
        }
        if (config.bodyLocations.length > 0) {
          setCurrentLocation(config.bodyLocations[0]);
        }
        
        // Load wound data
        const woundData = await getWoundById(woundId);
        setWound(woundData);
        
        // Load wound image
        const imageBlob = await getWoundImage(woundId);
        const url = URL.createObjectURL(imageBlob);
        setImageUrl(url);
        
        // Load annotations
        const annotationsData = await getAnnotations(woundId);
        setAnnotations(annotationsData.boxes.map(box => ({
          ...box,
          id: uuidv4() // Add unique ID for each annotation
        })));
        
      } catch (err) {
        setError(err.message || 'Failed to load data');
        console.error('Error loading annotation data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (woundId) {
      loadData();
    }
    
    // Cleanup function to revoke object URL
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [woundId]);

  // Add a new annotation
  const addAnnotation = (annotation) => {
    const newAnnotation = {
      ...annotation,
      id: uuidv4(),
      last_modified_by: localStorage.getItem('username') || 'unknown',
      last_modified_at: new Date().toISOString()
    };
    
    setAnnotations([...annotations, newAnnotation]);
  };

  // Update an existing annotation
  const updateAnnotation = (updatedAnnotation) => {
    setAnnotations(annotations.map(ann => 
      ann.id === updatedAnnotation.id 
        ? { 
            ...updatedAnnotation, 
            last_modified_by: localStorage.getItem('username') || 'unknown',
            last_modified_at: new Date().toISOString()
          } 
        : ann
    ));
    
    // Update selected annotation if it was the one that was updated
    if (selectedAnnotation && selectedAnnotation.id === updatedAnnotation.id) {
      setSelectedAnnotation(updatedAnnotation);
    }
  };

  // Delete an annotation
  const deleteAnnotation = (id) => {
    setAnnotations(annotations.filter(ann => ann.id !== id));
    
    // Clear selected annotation if it was the one that was deleted
    if (selectedAnnotation && selectedAnnotation.id === id) {
      setSelectedAnnotation(null);
    }
  };

  // Select an annotation
  const selectAnnotation = (annotation) => {
    setSelectedAnnotation(annotation);
    
    // Update current fields to match selected annotation
    setCurrentCategory(annotation.category);
    setCurrentLocation(annotation.location);
    setBodyMapId(annotation.body_map_id || '');
  };

  // Save annotations to the server
  const saveAllAnnotations = async () => {
    try {
      setLoading(true);
      
      // Format annotations for API (remove id field which is only used client-side)
      const formattedAnnotations = annotations.map(({ id, ...rest }) => rest);
      
      await saveAnnotations(woundId, formattedAnnotations);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to save annotations');
      console.error('Error saving annotations:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    wound,
    imageUrl,
    annotations,
    selectedAnnotation,
    etiologyOptions,
    bodyLocations,
    categoryColors,
    currentCategory,
    currentLocation,
    bodyMapId,
    loading,
    error,
    setCurrentCategory,
    setCurrentLocation,
    setBodyMapId,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    selectAnnotation,
    saveAnnotations: saveAllAnnotations
  };

  return (
    <AnnotationContext.Provider value={value}>
      {children}
    </AnnotationContext.Provider>
  );
}