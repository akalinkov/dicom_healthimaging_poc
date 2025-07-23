/**
 * Cornerstone3D Integration for HTJ2K Images
 * 
 * This module shows how to integrate the HTJ2K decoder with Cornerstone3D
 * for advanced medical imaging features like windowing, annotations, measurements, etc.
 * 
 * USAGE:
 * 1. Decode HTJ2K data using htj2k-decoder.js
 * 2. Create custom image loader for Cornerstone3D
 * 3. Register with Cornerstone3D and render
 */

import { 
  RenderingEngine, 
  Enums,
  imageLoader,
  metaData,
  init as csRenderInit 
} from '@cornerstonejs/core';
import { init as csToolsInit } from '@cornerstonejs/tools';
import { decodeHTJ2K } from './htj2k-decoder.js';

/**
 * Custom image loader for HTJ2K images
 * 
 * This creates a Cornerstone3D-compatible image loader that:
 * 1. Fetches HTJ2K data from AWS HealthImaging
 * 2. Decodes using our HTJ2K decoder
 * 3. Returns Cornerstone3D Image object
 */
const htj2kImageLoader = async (imageId) => {
  console.log('🔄 HTJ2K Image Loader:', imageId);
  
  // Parse the imageId to get the URL
  // Expected format: "htj2k:/view/imageSetId/frame/frameId"
  const url = imageId.replace('htj2k:', '');
  
  try {
    // Step 1: Fetch HTJ2K data
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch HTJ2K data: ${response.status}`);
    }
    
    const htj2kData = new Uint8Array(await response.arrayBuffer());
    console.log(`📥 Fetched HTJ2K data: ${htj2kData.length} bytes`);
    
    // Step 2: Decode HTJ2K
    const decoded = await decodeHTJ2K(htj2kData);
    console.log(`🔧 Decoded: ${decoded.width}x${decoded.height}, ${decoded.bitsPerSample}bit`);
    
    // Step 3: Create Cornerstone3D Image object
    const image = {
      imageId,
      minPixelValue: 0,
      maxPixelValue: decoded.bitsPerSample === 16 ? 65535 : 255,
      slope: 1,
      intercept: 0,
      windowCenter: decoded.bitsPerSample === 16 ? 32768 : 128,
      windowWidth: decoded.bitsPerSample === 16 ? 65535 : 256,
      getPixelData: () => decoded.pixelData,
      rows: decoded.height,
      columns: decoded.width,
      height: decoded.height,
      width: decoded.width,
      color: decoded.channels === 3,
      rgba: false,
      numComps: decoded.channels,
      columnPixelSpacing: 1.0,
      rowPixelSpacing: 1.0,
      invert: false,
      sizeInBytes: decoded.pixelData.byteLength,
      // Additional DICOM-like metadata
      modality: 'CT', // or 'MR', 'CR', etc. - would come from AWS metadata
      photometricInterpretation: decoded.channels === 1 ? 'MONOCHROME2' : 'RGB',
      bitsAllocated: decoded.bitsPerSample,
      bitsStored: decoded.bitsPerSample,
      highBit: decoded.bitsPerSample - 1,
      pixelRepresentation: decoded.isSigned ? 1 : 0
    };
    
    console.log('✅ Created Cornerstone3D image object');
    return image;
    
  } catch (error) {
    console.error('❌ HTJ2K image loader failed:', error);
    throw error;
  }
};

/**
 * Initialize Cornerstone3D with HTJ2K support
 */
export const initializeCornerstoneHTJ2K = async () => {
  console.log('🚀 Initializing Cornerstone3D with HTJ2K support...');
  
  try {
    // Initialize Cornerstone3D
    await csRenderInit();
    await csToolsInit();
    
    // Register our custom HTJ2K image loader
    imageLoader.registerImageLoader('htj2k', htj2kImageLoader);
    
    console.log('✅ Cornerstone3D initialized with HTJ2K support');
    
  } catch (error) {
    console.error('❌ Cornerstone3D initialization failed:', error);
    throw error;
  }
};

/**
 * Create Cornerstone3D viewport and load HTJ2K image
 */
export const loadHTJ2KInCornerstone = async (element, imageSetId, frameId) => {
  console.log('🎨 Loading HTJ2K image in Cornerstone3D viewport...');
  
  try {
    // Ensure Cornerstone is initialized
    await initializeCornerstoneHTJ2K();
    
    // Create image ID for our custom loader
    const imageId = `htj2k:/view/${imageSetId}/frame/${frameId}`;
    
    // Create rendering engine
    const renderingEngineId = 'htj2k-engine';
    const renderingEngine = new RenderingEngine(renderingEngineId);
    const viewportId = 'htj2k-viewport';
    
    // Create viewport
    const viewportInput = {
      viewportId,
      type: Enums.ViewportType.STACK,
      element,
      defaultOptions: {
        background: [0, 0, 0]
      }
    };
    
    renderingEngine.enableElement(viewportInput);
    
    // Get viewport and set image stack
    const viewport = renderingEngine.getViewport(viewportId);
    await viewport.setStack([imageId]);
    
    // Render
    viewport.render();
    
    console.log('✅ HTJ2K image loaded in Cornerstone3D');
    
    return {
      renderingEngine,
      viewport,
      imageId
    };
    
  } catch (error) {
    console.error('❌ Failed to load HTJ2K in Cornerstone3D:', error);
    throw error;
  }
};

/**
 * Example: Create a Cornerstone3D viewer component
 * 
 * Usage in React:
 * 
 * import { loadHTJ2KInCornerstone } from './cornerstone-integration.js';
 * 
 * const CornerstoneHTJ2KViewer = ({ imageSetId, frameId }) => {
 *   const elementRef = useRef(null);
 *   
 *   useEffect(() => {
 *     if (elementRef.current) {
 *       loadHTJ2KInCornerstone(elementRef.current, imageSetId, frameId);
 *     }
 *   }, [imageSetId, frameId]);
 *   
 *   return (
 *     <div 
 *       ref={elementRef} 
 *       style={{ width: '512px', height: '512px', backgroundColor: '#000' }}
 *     />
 *   );
 * };
 */

export default {
  initializeCornerstoneHTJ2K,
  loadHTJ2KInCornerstone,
  htj2kImageLoader
};