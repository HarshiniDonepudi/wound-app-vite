import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image, Rect } from 'react-konva';
import { useAnnotations } from '../../hooks/useAnnotations';

export default function AnnotationCanvas() {
  const {
    imageUrl,
    annotations,
    selectedAnnotation,
    addAnnotation,
    updateAnnotation,
    selectAnnotation,
    currentCategory,
    currentLocation,
    categoryColors
  } = useAnnotations();

  const stageRef = useRef(null);
  const imageRef = useRef(null);

  // Image state
  const [image, setImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState(null);

  // Load image
  useEffect(() => {
    if (!imageUrl) return;

    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      const maxWidth = Math.min(800, window.innerWidth - 40);
      const maxHeight = 600;
      const scaleX = maxWidth / img.width;
      const scaleY = maxHeight / img.height;
      const newScale = Math.min(scaleX, scaleY);

      setScale(newScale);
      setImageSize({
        width: img.width * newScale,
        height: img.height * newScale
      });
      setImage(img);
    };
  }, [imageUrl]);

  // Mouse handlers
  const handleMouseDown = (e) => {
    // Only draw if clicked on the Stage itself
    if (e.target !== e.target.getStage()) return;

    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();

    setIsDrawing(true);
    setNewAnnotation({
      x: pointerPos.x / scale,
      y: pointerPos.y / scale,
      width: 0,
      height: 0,
      category: currentCategory,
      location: currentLocation
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !newAnnotation) return;

    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();

    setNewAnnotation((prev) => ({
      ...prev,
      width: pointerPos.x / scale - prev.x,
      height: pointerPos.y / scale - prev.y
    }));
  };

  const handleMouseUp = () => {
    if (!isDrawing || !newAnnotation) return;

    // Normalize box
    let { x, y, width, height } = newAnnotation;
    if (width < 0) {
      x += width;
      width = Math.abs(width);
    }
    if (height < 0) {
      y += height;
      height = Math.abs(height);
    }

    // Only add if big enough
    if (width > 5 && height > 5) {
      addAnnotation({
        x,
        y,
        width,
        height,
        category: currentCategory,
        location: currentLocation
      });
    }

    setIsDrawing(false);
    setNewAnnotation(null);
  };

  // Annotation select
  const handleAnnotationSelect = (anno) => {
    selectAnnotation(anno);
  };

  // Drag fix: convert from stage coords => unscaled
  const handleAnnotationDragEnd = (e, anno) => {
    const stageX = e.target.x();
    const stageY = e.target.y();

    updateAnnotation({
      ...anno,
      x: stageX / scale,
      y: stageY / scale
    });
  };

  return (
    <Stage
      ref={stageRef}
      width={imageSize.width}
      height={imageSize.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
    >
      <Layer>
        {/* Background Image */}
        {image && (
          <Image
            image={image}
            width={imageSize.width}
            height={imageSize.height}
            listening={false} // Let clicks pass through
            ref={imageRef}
          />
        )}

        {/* Existing annotations */}
        {annotations.map((anno, i) => {
          const isSelected = selectedAnnotation && selectedAnnotation.id === anno.id;
          const color = categoryColors[anno.category] || '#FF0000';
          
          return (
            <Rect
              key={anno.id || i}
              x={anno.x * scale}
              y={anno.y * scale}
              width={anno.width * scale}
              height={anno.height * scale}
              stroke={isSelected ? 'yellow' : color}
              strokeWidth={2}
              fill={`${color}20`}
              draggable
              onClick={() => handleAnnotationSelect(anno)}
              onDragEnd={(e) => handleAnnotationDragEnd(e, anno)}
            />
          );
        })}

        {/* New annotation in progress */}
        {newAnnotation && (
          <Rect
            x={newAnnotation.x * scale}
            y={newAnnotation.y * scale}
            width={newAnnotation.width * scale}
            height={newAnnotation.height * scale}
            stroke={categoryColors[currentCategory] || '#FF0000'}
            strokeWidth={2}
            dash={[5, 5]}
            fill="rgba(0,0,0,0.1)"
          />
        )}
      </Layer>
    </Stage>
  );
}
