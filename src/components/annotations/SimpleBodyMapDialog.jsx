import React from 'react';
import styled from 'styled-components';

// Styled components for the dialog
const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const DialogContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DialogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
`;

const DialogTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  &:hover {
    color: #000;
  }
`;

const DialogBody = styled.div`
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Instructions = styled.div`
  text-align: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  color: #555;
  border-left: 4px solid #1890ff;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: auto;
  max-height: 70vh;
  margin-bottom: 16px;
  border: 1px solid #ddd;
`;

const MapImage = styled.img`
  display: block;
  max-width: 100%;
  height: auto;
`;

const DialogFooter = styled.div`
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  background-color: #f8f9fa;
`;

const FooterButton = styled.button`
  padding: 8px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: #096dd9;
  }
`;

/**
 * SimpleBodyMapDialog Component
 * 
 * A modal dialog that displays a body map image as a reference for users
 * to manually enter body map IDs.
 */
const SimpleBodyMapDialog = ({ isOpen, onClose }) => {
  // If dialog is not open, don't render anything
  if (!isOpen) return null;

  return (
    <DialogOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Body Map Reference</DialogTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </DialogHeader>
        
        <DialogBody>
          <Instructions>
            Use this reference image to find the body map ID for the area you want to annotate.
            <br />
            After finding the ID, close this dialog and enter it manually in the Body Map ID field.
          </Instructions>
          
          <ImageContainer>
            <MapImage 
              src="/img/Body-map-for-location-selection.png"
              alt="Body Map Reference" 
            />
          </ImageContainer>
        </DialogBody>
        
        <DialogFooter>
          <FooterButton onClick={onClose}>
            Close
          </FooterButton>
        </DialogFooter>
      </DialogContent>
    </DialogOverlay>
  );
};

export default SimpleBodyMapDialog;