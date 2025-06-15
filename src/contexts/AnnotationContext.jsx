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
  
  // Doctor Notes and Severity fields
  const [doctorNotes, setDoctorNotes] = useState('');
  const [severity, setSeverity] = useState('');
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add spatial fields state
  const [spatialFields, setSpatialFields] = useState(null);

  // Split loading states
  const [woundLoading, setWoundLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [annotationsLoading, setAnnotationsLoading] = useState(true);

  // Ensure these properties are initialized from existing annotations
  useEffect(() => {
    if (selectedAnnotation) {
      setDoctorNotes(selectedAnnotation.doctor_notes || '');
      setSeverity(selectedAnnotation.severity || '');
    } else {
      setDoctorNotes('');
      setSeverity('');
    }
  }, [selectedAnnotation]);

  // Load wound data, image, and config options
  useEffect(() => {
    let imageObjectUrl = null;
    const loadWound = async () => {
      setWoundLoading(true);
      try {
        const woundData = await getWoundById(woundId);
        setWound(woundData);
      } catch (err) {
        setError(err.message || 'Failed to load wound');
      } finally {
        setWoundLoading(false);
      }
    };
    const loadImage = async () => {
      setImageLoading(true);
      try {
        const imageBlob = await getWoundImage(woundId);
        imageObjectUrl = URL.createObjectURL(imageBlob);
        setImageUrl(imageObjectUrl);
      } catch (err) {
        setError(err.message || 'Failed to load image');
      } finally {
        setImageLoading(false);
      }
    };
    const loadAnnotations = async () => {
      setAnnotationsLoading(true);
      try {
        const annotationsData = await getAnnotations(woundId);
        const processedAnnotations = annotationsData.boxes.map(box => ({
          ...box,
          id: box.id || uuidv4()
        }));
        setAnnotations(processedAnnotations);
        setSpatialFields(annotationsData.spatial_fields || null);
      } catch (err) {
        setError(err.message || 'Failed to load annotations');
      } finally {
        setAnnotationsLoading(false);
      }
    };
    loadWound();
    loadImage();
    loadAnnotations();
    return () => {
      if (imageObjectUrl) {
        URL.revokeObjectURL(imageObjectUrl);
      }
    };
  }, [woundId]);

  // Add a new annotation
  const addAnnotation = (annotation) => {
    const newAnnotation = {
      ...annotation,
      id: uuidv4(),
      doctor_notes: doctorNotes,
      severity: severity,
      created_by: localStorage.getItem('username') || 'unknown',
      created_at: new Date().toISOString(),
      last_modified_by: localStorage.getItem('username') || 'unknown',
      last_modified_at: new Date().toISOString()
    };
    
    console.log("Adding new annotation:", newAnnotation);
    setAnnotations([...annotations, newAnnotation]);
  };

  // Update an existing annotation
  const updateAnnotation = (updatedAnnotation) => {
    console.log("Updating annotation:", updatedAnnotation);
    
    setAnnotations(annotations.map(ann => 
      ann.id === updatedAnnotation.id 
        ? { 
            ...updatedAnnotation, 
            doctor_notes: updatedAnnotation.doctor_notes || doctorNotes || '',
            severity: updatedAnnotation.severity || severity || '',
            last_modified_by: localStorage.getItem('username') || 'unknown',
            last_modified_at: new Date().toISOString()
          } 
        : ann
    ));
    
    // Update selected annotation if it was the one updated
    if (selectedAnnotation && selectedAnnotation.id === updatedAnnotation.id) {
      setSelectedAnnotation({
        ...updatedAnnotation,
        doctor_notes: updatedAnnotation.doctor_notes || doctorNotes || '',
        severity: updatedAnnotation.severity || severity || '',
        last_modified_by: localStorage.getItem('username') || 'unknown',
        last_modified_at: new Date().toISOString()
      });
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

  // Save annotations to the server
  const saveAllAnnotations = async () => {
    try {
      setLoading(true);
      
      console.log("Preparing annotations for saving...");
      
     
      const formattedAnnotations = annotations.map(({ id, ...rest }) => {
      
        return {
          ...rest,
          doctor_notes: rest.doctor_notes || '',
          severity: rest.severity || ''
        };
      });
      
      console.log("Formatted annotations for API:", formattedAnnotations);
      
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

  // Add a function to select an annotation and update related fields
  const selectAnnotation = (annotation) => {
    setSelectedAnnotation(annotation);
    setCurrentCategory(annotation.category || '');
    setCurrentLocation(annotation.location || '');
    setBodyMapId(annotation.body_map_id || '');
    setDoctorNotes(annotation.doctor_notes || '');
    setSeverity(annotation.severity || '');
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
    doctorNotes,
    severity,
    loading,
    error,
    setCurrentCategory,
    setCurrentLocation,
    setBodyMapId,
    setDoctorNotes,
    setSeverity,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    selectAnnotation,
    saveAnnotations: saveAllAnnotations,
    spatialFields,
    woundLoading,
    imageLoading,
    annotationsLoading
  };

  return (
    <AnnotationContext.Provider value={value}>
      {children}
    </AnnotationContext.Provider>
  );
}