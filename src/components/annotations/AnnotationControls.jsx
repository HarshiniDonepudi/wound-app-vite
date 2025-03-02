import React, { useState, useEffect } from 'react';
import { useAnnotations } from '../../hooks/useAnnotations';
import SimpleBodyMapDialog from './SimpleBodyMapDialog';

export default function AnnotationControls() {
  const {
    selectedAnnotation,
    etiologyOptions,
    bodyLocations,
    currentCategory,
    currentLocation,
    bodyMapId,
    doctorNotes,
    severity, 
    setCurrentCategory,
    setCurrentLocation,
    setBodyMapId,
    setDoctorNotes,
    setSeverity,
    updateAnnotation,
    deleteAnnotation,
    saveAnnotations,
    loading
  } = useAnnotations();

  const [saveStatus, setSaveStatus] = useState({ message: '', type: '' });
  const [showBodyMapDialog, setShowBodyMapDialog] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [availableSeverities, setAvailableSeverities] = useState([]);

  // Update available severities based on wound category
  useEffect(() => {
    // This will be populated based on the wound category
    // Using the flow chart logic from the provided images
    if (currentCategory) {
      const severityOptions = getSeverityOptionsForCategory(currentCategory);
      setAvailableSeverities(severityOptions);
      
      // Reset selected severity if it's not valid for the new category
      if (severityOptions.length > 0 && !severityOptions.find(opt => opt.value === selectedSeverity)) {
        setSelectedSeverity('');
      }
    } else {
      setAvailableSeverities([]);
      setSelectedSeverity('');
    }
  }, [currentCategory]);
  
  // Sync selected severity with severity from context
  useEffect(() => {
    setSelectedSeverity(severity || '');
  }, [severity]);

  // Helper function to get severity options based on category
  const getSeverityOptionsForCategory = (category) => {
    const categoryLower = category.toLowerCase();
    
    // Handle diabetic skin ulcer (foot)
    if (categoryLower.includes('diabetic') && categoryLower.includes('foot')) {
      return [
        { value: 'grade_1', label: 'Grade 1' },
        { value: 'grade_2', label: 'Grade 2' },
        { value: 'grade_3', label: 'Grade 3' },
        { value: 'grade_4', label: 'Grade 4' },
        { value: 'grade_5', label: 'Grade 5' },
        { value: 'partial_thickness', label: 'Partial Thickness' },
        { value: 'full_thickness', label: 'Full Thickness' },
      ];
    }
    
    // Handle pressure/device related pressure
    if (categoryLower.includes('pressure')) {
      return [
        { value: 'stage_1', label: 'Stage 1' },
        { value: 'stage_2', label: 'Stage 2' },
        { value: 'stage_3', label: 'Stage 3' },
        { value: 'stage_4', label: 'Stage 4' },
      ];
    }
    
    // Handle burn wounds
    if (categoryLower === 'burn') {
      return [
        { value: '1st_degree', label: '1st Degree' },
        { value: '2nd_degree', label: '2nd Degree' },
        { value: '3rd_degree', label: '3rd Degree' },
        { value: '4th_degree', label: '4th Degree' },
      ];
    }
    
    // Handle generic bite, surgical, autoimmune, trauma, etc.
    if (categoryLower.includes('bite') || 
        categoryLower === 'surgical' || 
        categoryLower === 'autoimmune' || 
        categoryLower === 'trauma' || 
        categoryLower === 'infectious abcess' || 
        categoryLower === 'cyst lesion' || 
        categoryLower === 'vasculitus' || 
        categoryLower === 'malignant' || 
        categoryLower === 'masd' || 
        categoryLower === 'chronic skin ulcer') {
      return [
        { value: 'partial_thickness', label: 'Partial Thickness' },
        { value: 'full_thickness', label: 'Full Thickness' },
      ];
    }
    
    // Handle categories with no specific severity
    if (categoryLower === 'stoma' || 
        categoryLower === 'fistula/sinus tract' || 
        categoryLower === 'dermatololical' || 
        categoryLower === 'calciphylaxis' || 
        categoryLower === 'edema related') {
      return [
        { value: 'no_severity', label: 'No Severity (This etiology does not require severity)' },
      ];
    }
    
    // Default empty if no matching category
    return [];
  };

  // Event Handlers
  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setCurrentCategory(newCat);
    
    if (selectedAnnotation) {
      console.log("Updating category for annotation:", selectedAnnotation.id);
      updateAnnotation({ 
        ...selectedAnnotation, 
        category: newCat 
      });
    }
  };

  const handleLocationChange = (e) => {
    const newLoc = e.target.value;
    setCurrentLocation(newLoc);
    
    if (selectedAnnotation) {
      console.log("Updating location for annotation:", selectedAnnotation.id);
      updateAnnotation({ 
        ...selectedAnnotation, 
        location: newLoc 
      });
    }
  };

  const handleBodyMapIdChange = (e) => {
    const value = e.target.value;
    setBodyMapId(value);
    
    if (selectedAnnotation) {
      console.log("Updating body map ID for annotation:", selectedAnnotation.id);
      updateAnnotation({ 
        ...selectedAnnotation, 
        body_map_id: value 
      });
    }
  };

  const handleSeverityChange = (e) => {
    const value = e.target.value;
    setSelectedSeverity(value);
    setSeverity(value);
    
    if (selectedAnnotation) {
      console.log("Updating severity for annotation:", selectedAnnotation.id, "value:", value);
      updateAnnotation({ 
        ...selectedAnnotation, 
        severity: value 
      });
    }
  };

  const handleDoctorNotesChange = (e) => {
    const value = e.target.value;
    setDoctorNotes(value);
    
    if (selectedAnnotation) {
      console.log("Updating doctor notes for annotation:", selectedAnnotation.id, "value:", value);
      updateAnnotation({ 
        ...selectedAnnotation, 
        doctor_notes: value 
      });
    }
  };

  const handleDeleteAnnotation = () => {
    if (selectedAnnotation && window.confirm('Delete this annotation?')) {
      deleteAnnotation(selectedAnnotation.id);
    }
  };

  const handleSaveAnnotations = async () => {
    try {
      setSaveStatus({ message: 'Saving annotations...', type: 'info' });
      const success = await saveAnnotations();
      
      if (success) {
        setSaveStatus({ message: 'Annotations saved successfully!', type: 'success' });
        setTimeout(() => setSaveStatus({ message: '', type: '' }), 3000);
      } else {
        setSaveStatus({ message: 'Failed to save.', type: 'error' });
      }
    } catch (err) {
      setSaveStatus({ message: `Error: ${err.message}`, type: 'error' });
    }
  };

  return (
    <div className="controls-card">
      {/* Header */}
      <div className="controls-card__header">
        <h2>Annotation Controls</h2>
      </div>

      {/* Currently selected Category/Location badges */}
      <div className="selection-preview">
        {currentCategory && (
          <span className="preview-badge preview-badge--cat">
            {currentCategory}
          </span>
        )}
        {currentLocation && (
          <span className="preview-badge preview-badge--loc">
            {currentLocation}
          </span>
        )}
        {bodyMapId && (
          <span className="preview-badge preview-badge--id">
            ID: {bodyMapId}
          </span>
        )}
        {selectedSeverity && (
          <span className="preview-badge preview-badge--severity">
            Severity: {availableSeverities.find(s => s.value === selectedSeverity)?.label || selectedSeverity}
          </span>
        )}
      </div>

      {/* Save Status Message */}
      {saveStatus.message && (
        <div className={`save-status save-status--${saveStatus.type}`}>
          {saveStatus.message}
        </div>
      )}

      {/* Selected Annotation Info */}
      {selectedAnnotation && (
        <div className="selected-anno-block">
          <div className="selected-anno-block__title">
            <span>Selected Annotation</span>
            <button onClick={handleDeleteAnnotation} className="btn-delete">
              Delete
            </button>
          </div>
          <div className="selected-anno-details">
            <div>
              Position: ({selectedAnnotation.x.toFixed(0)}, {selectedAnnotation.y.toFixed(0)})
            </div>
            <div>
              Size: {selectedAnnotation.width.toFixed(0)} × {selectedAnnotation.height.toFixed(0)}
            </div>
            {selectedAnnotation.body_map_id && (
              <div>
                Body Map ID: {selectedAnnotation.body_map_id}
              </div>
            )}
            {selectedAnnotation.severity && (
              <div>
                Severity: {availableSeverities.find(s => s.value === selectedAnnotation.severity)?.label || selectedAnnotation.severity}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wound Category Dropdown */}
      <div className="form-field">
        <label htmlFor="categorySelect">Wound Category:</label>
        <select
          id="categorySelect"
          value={currentCategory || ''}
          onChange={handleCategoryChange}
          className="form-select"
        >
          <option value="">-- Select Category --</option>
          {etiologyOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Severity Dropdown - Only shown when category is selected */}
      {currentCategory && availableSeverities.length > 0 && (
        <div className="form-field">
          <label htmlFor="severitySelect">Wound Severity:</label>
          <select
            id="severitySelect"
            value={selectedSeverity || ''}
            onChange={handleSeverityChange}
            className="form-select"
          >
            <option value="">-- Select Severity --</option>
            {availableSeverities.map((severityOption) => (
              <option key={severityOption.value} value={severityOption.value}>
                {severityOption.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Body Location Dropdown */}
      <div className="form-field">
        <label htmlFor="locationSelect">Body Location:</label>
        <select
          id="locationSelect"
          value={currentLocation || ''}
          onChange={handleLocationChange}
          className="form-select"
        >
          <option value="">-- Select Location --</option>
          {bodyLocations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Body Map ID with reference dialog */}
      <div className="form-field">
        <label htmlFor="bodyMapId">
          Body Map ID:
          <button 
            onClick={() => setShowBodyMapDialog(true)} 
            className="body-map-button"
            style={{
              marginLeft: '8px',
              padding: '2px 8px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
            type="button"
          >
            View Reference
          </button>
        </label>
        <input
          type="text"
          id="bodyMapId"
          value={bodyMapId || ''}
          onChange={handleBodyMapIdChange}
          placeholder="Enter body map ID"
          className="form-input"
        />
      </div>

      {/* Doctor Notes Textarea */}
      <div className="form-field">
        <label htmlFor="doctorNotes">Doctor Notes:</label>
        <textarea
          id="doctorNotes"
          value={doctorNotes || ''}
          onChange={handleDoctorNotesChange}
          placeholder="Enter notes about this annotation..."
          className="form-textarea"
          rows={4}
        />
      </div>

      {/* Simple Body Map Dialog */}
      <SimpleBodyMapDialog 
        isOpen={showBodyMapDialog}
        onClose={() => setShowBodyMapDialog(false)}
      />

      {/* Save Button */}
      <div className="save-annotations">
        <button onClick={handleSaveAnnotations} disabled={loading} className="save-button">
          {loading ? 'Saving...' : 'Save Annotations'}
        </button>
      </div>

      {/* Instructions */}
      <div className="instructions">
        <p>• Click &amp; drag on the image to create new annotations.</p>
        <p>• Click on existing annotations to select.</p>
        <p>• Drag them to reposition.</p>
        <p>• Select wound category and appropriate severity.</p>
        <p>• Add doctor notes for additional context.</p>
        <p>• Click "View Reference" to see the body map ID reference.</p>
      </div>
    </div>
  );
}