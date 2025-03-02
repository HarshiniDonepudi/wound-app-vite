import { useContext } from 'react';
import { AnnotationContext } from '../contexts/AnnotationContext';

export const useAnnotations = () => {
  return useContext(AnnotationContext);
};
