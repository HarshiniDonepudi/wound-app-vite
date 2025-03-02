import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image, Rect, Group, Text } from 'react-konva';
import { useAnnotations } from '../../hooks/useAnnotations';

const AnnotationCanvas = () => {
  const {
    imageUrl,
    annotations,
    selectedAnnotation,
    addAnnotation,
    updateAnnotation,
    selectAnnotation,
    currentCategory,
    currentLocation,
    bodyMapId,
    categoryColors
  } = useAnnotations();

  const stageRef = useRef(null);
  const [image, setImage] = useState(null);
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [newBox, setNewBox] = useState(null);
  const [scale, setScale] = useState(1);
  
  // Load image when URL changes
  useEffect(() => {
    if (!imageUrl) return;
    
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      
      // Calculate scale to fit the image in the container
      const maxWidth = Math.min(800, window.innerWidth - 40);
      const maxHeight = 600;
      
      const scaleX = maxWidth / img.width;
      const scaleY = maxHeight / img.height;
      const newScale = Math.min(scaleX, scaleY);
      
      setScale(newScale);
      setStageDimensions({
        width: img.width * newScale,
        height: img.height * newScale
      });
    };
  }, [imageUrl]);

  // Handle drawing new annotation
  const handleMouseDown = (e) => {
    // Prevent drawing if already interacting with an annotation
    if (e.target !== e.target.getStage()) {
      return;
    }
    
    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    
    setIsDrawing(true);
    setNewBox({
      x: pointerPos.x / scale,
      y: pointerPos.y / scale,
      width: 0,
      height: 0
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !newBox) return;
    
    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    
    setNewBox({
      ...newBox,
      width: (pointerPos.x / scale) - newBox.x,
      height: (pointerPos.y / scale) - newBox.y
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !newBox) return;
    
    // Only add if box has some size
    if (Math.abs(newBox.width) > 5 && Math.abs(newBox.height) > 5) {
      // Normalize negative width/height
      const x = newBox.width < 0 ? newBox.x + newBox.width : newBox.x;
      const y = newBox.height < 0 ? newBox.y + newBox.height : newBox.y;
      const width = Math.abs(newBox.width);
      const height = Math.abs(newBox.height);
      
      addAnnotation({
        x,
        y,
        width,
        height,
        category: currentCategory,
        location: currentLocation,
        body_map_id: bodyMapId,
        created_by: JSON.parse(localStorage.getItem('user')).username,
        created_at: new Date().toISOString()
      });
    }
    
    setIsDrawing(false);
    setNewBox(null);
  };

  // Handle drag and drop to move annotations
  const handleDragEnd = (e, id) => {
    const annotation = annotations.find(ann => ann.id === id);
    if (annotation) {
      updateAnnotation({
        ...annotation,
        x: e.target.x(),
        y: e.target.y()
      });
    }
  };

  if (!imageUrl) {
    return <div className="flex justify-center items-center h-64 bg-gray-100">Loading image...</div>;
  }

  return (
    <div className="w-full overflow-hidden border border-gray-300 rounded bg-gray-50">
      <Stage
        ref={stageRef}
        width={stageDimensions.width}
        height={stageDimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        scale={{ x: scale, y: scale }}
      >
        <Layer>
          {/* Background image */}
          {image && (
            <Image 
              image={image}
              width={image.width}
              height={image.height}
            />
          )}
          
          {/* Existing annotations */}
          {annotations.map((annotation) => {
            const isSelected = selectedAnnotation && selectedAnnotation.id === annotation.id;
            const color = categoryColors[annotation.category] || '#FF0000';
            
            return (
              <Group key={annotation.id} draggable>
                <Rect
                  x={annotation.x}
                  y={annotation.y}
                  width={annotation.width}
                  height={annotation.height}
                  stroke={isSelected ? '#FFFF00' : color}
                  strokeWidth={2 / scale}
                  onClick={() => selectAnnotation(annotation)}
                  onTap={() => selectAnnotation(annotation)}
                  onDragEnd={(e) => handleDragEnd(e, annotation.id)}
                />
                
                {/* Annotation label */}
                <Group>
                  <Rect
                    x={annotation.x}
                    y={annotation.y - 20 / scale}
                    width={150 / scale}
                    height={20 / scale}
                    fill={'rgba(0, 0, 0, 0.7)'}
                  />
                  <Text
                    x={annotation.x + 5 / scale}
                    y={annotation.y - 15 / scale}
                    text={`${annotation.category} - ${annotation.location}`}
                    fontSize={12 / scale}
                    fill={'white'}
                  />
                </Group>
              </Group>
            );
          })}
          
          {/* Currently drawing annotation */}
          {isDrawing && newBox && (
            <Rect
              x={newBox.x}
              y={newBox.y}
              width={newBox.width}
              height={newBox.height}
              stroke={categoryColors[currentCategory] || '#FF0000'}
              strokeWidth={2 / scale}
              dash={[5 / scale, 5 / scale]}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default AnnotationCanvas;
