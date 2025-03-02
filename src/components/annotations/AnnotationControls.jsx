import React, { useState } from 'react';
import { useAnnotations } from '../../hooks/useAnnotations';

export default function AnnotationControls() {
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
  const [searchTerm, setSearchTerm] = useState('');

  // Event Handlers
  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setCurrentCategory(newCat);
    if (selectedAnnotation) {
      updateAnnotation({ ...selectedAnnotation, category: newCat });
    }
  };

  const handleLocationChange = (e) => {
    const newLoc = e.target.value;
    setCurrentLocation(newLoc);
    if (selectedAnnotation) {
      updateAnnotation({ ...selectedAnnotation, location: newLoc });
    }
  };

  const handleBodyMapIdChange = (e) => {
    const value = e.target.value;
    setBodyMapId(value);
    if (selectedAnnotation) {
      updateAnnotation({ ...selectedAnnotation, body_map_id: value });
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

  // Filter dropdown options based on search term
  const filteredCategories = etiologyOptions.filter((cat) =>
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredLocations = bodyLocations.filter((loc) =>
    loc.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-bar">
        <label htmlFor="searchTerm">Search (optional):</label>
        <div className="search-bar__input-wrapper">
          <input
            id="searchTerm"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to filter dropdowns..."
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Wound Category Dropdown */}
      <div className="form-field">
        <label htmlFor="categorySelect">Wound Category:</label>
        <select
          id="categorySelect"
          value={currentCategory || ''}
          onChange={handleCategoryChange}
        >
          <option value="">-- Select Category --</option>
          {filteredCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Body Location Dropdown */}
      <div className="form-field">
        <label htmlFor="locationSelect">Body Location:</label>
        <select
          id="locationSelect"
          value={currentLocation || ''}
          onChange={handleLocationChange}
        >
          <option value="">-- Select Location --</option>
          {filteredLocations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Body Map ID */}
      <div className="form-field">
        <label htmlFor="bodyMapId">Body Map ID (Optional):</label>
        <input
          type="text"
          id="bodyMapId"
          value={bodyMapId}
          onChange={handleBodyMapIdChange}
          placeholder="Enter body map identifier"
        />
      </div>

      {/* Save Button */}
      <div className="save-annotations">
        <button onClick={handleSaveAnnotations} disabled={loading}>
          {loading ? 'Saving...' : 'Save Annotations'}
        </button>
      </div>

      {/* Instructions */}
      <div className="instructions">
        <p>• Click &amp; drag on the image to create new annotations.</p>
        <p>• Click on existing annotations to select.</p>
        <p>• Drag them to reposition.</p>
      </div>
    </div>
  );
}
