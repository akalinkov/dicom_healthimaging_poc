import HTJ2KViewer from './HTJ2KViewer.jsx';

// Simplified DicomViewer that delegates to HTJ2K viewer
const DicomViewer = ({ imageSetId, onClose, isOpen }) => {
  return (
    <HTJ2KViewer 
      imageSetId={imageSetId} 
      onClose={onClose} 
      isOpen={isOpen} 
    />
  );
};

export default DicomViewer;