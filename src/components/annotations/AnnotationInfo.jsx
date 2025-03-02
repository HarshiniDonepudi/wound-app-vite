import React from 'react';
import { useAnnotations } from '../../hooks/useAnnotations';


export default function AnnotationInfo() {
  const { selectedAnnotation, categoryColors } = useAnnotations();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  if (!selectedAnnotation) {
    return (
      <div className="info-card">
        <div className="info-card__header">
          <h2>Annotation Details</h2>
        </div>
        <div className="info-card__body no-selection">
          <p>No annotation selected. Click on an annotation to view details.</p>
        </div>
      </div>
    );
  }

  const color = categoryColors[selectedAnnotation.category] || '#0ea5e9';
  const colorStyle = { 
    backgroundColor: `${color}15`, 
    color: color,
    border: `1px solid ${color}30`
  };

  return (
    <div className="info-card">
      <div className="info-card__header">
        <h2>Annotation Details</h2>
      </div>
      <div className="info-card__body">
        <div className="anno-category-badge" style={colorStyle}>
          {selectedAnnotation.category}
        </div>

        <div className="details-grid">
          <div className="details-cell">
            <div className="cell-label">Body Location</div>
            <div className="cell-value">{selectedAnnotation.location || 'N/A'}</div>
          </div>

          {selectedAnnotation.body_map_id && (
            <div className="details-cell">
              <div className="cell-label">Body Map ID</div>
              <div className="cell-value">{selectedAnnotation.body_map_id}</div>
            </div>
          )}

          <div className="details-cell">
            <div className="cell-label">Position (x, y)</div>
            <div className="cell-value">
              ({Math.round(selectedAnnotation.x)}, {Math.round(selectedAnnotation.y)})
            </div>
          </div>

          <div className="details-cell">
            <div className="cell-label">Size (w × h)</div>
            <div className="cell-value">
              {Math.round(selectedAnnotation.width)} × {Math.round(selectedAnnotation.height)}
            </div>
          </div>

          <div className="details-cell">
            <div className="cell-label">Created by</div>
            <div className="cell-value">
              {selectedAnnotation.created_by || 'Unknown'} 
              <span className="timestamp">{formatDate(selectedAnnotation.created_at)}</span>
            </div>
          </div>

          {selectedAnnotation.last_modified_by && (
            <div className="details-cell">
              <div className="cell-label">Last modified by</div>
              <div className="cell-value">
                {selectedAnnotation.last_modified_by}
                <span className="timestamp">{formatDate(selectedAnnotation.last_modified_at)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="info-card__footer">
        <span className="hint">Click on the image to select another annotation</span>
      </div>
    </div>
  );
}
