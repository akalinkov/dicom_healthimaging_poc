import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { decodeHTJ2K } from '../utils/htj2k-decoder.js';

/**
 * Minimal HTJ2K Viewer for AWS HealthImaging
 * 
 * This component demonstrates the complete pipeline:
 * 1. Fetch HTJ2K blob from AWS HealthImaging endpoint
 * 2. Decode using WebAssembly HTJ2K decoder
 * 3. Render decoded pixel data to canvas
 */
const HTJ2KViewer = ({ imageSetId, onClose, isOpen }) => {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [logs, setLogs] = useState([]);
  const [imageInfo, setImageInfo] = useState(null);
  const [error, setError] = useState(null);

  // Debug logging helper
  const addLog = (message, data = null) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry, data || '');
    setLogs(prev => [...prev.slice(-9), logEntry]); // Keep last 10 logs
  };

  useEffect(() => {
    if (!isOpen || !imageSetId) return;

    loadHTJ2KImage();
  }, [isOpen, imageSetId]);

  // Helper function to wait for canvas element
  const waitForCanvas = () => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait
      
      const checkCanvas = () => {
        if (canvasRef.current) {
          addLog('🎨 Canvas element is now available');
          resolve(canvasRef.current);
          return;
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error('Canvas ref timeout - element not found after 5 seconds'));
          return;
        }
        
        setTimeout(checkCanvas, 100);
      };
      
      checkCanvas();
    });
  };

  /**
   * Main pipeline: Fetch → Decode → Render
   */
  const loadHTJ2KImage = async () => {
    try {
      setStatus('loading');
      setError(null);
      setLogs([]);
      addLog('🚀 Starting HTJ2K image loading pipeline');

      // Step 1: Fetch image metadata to get frame IDs
      const metadata = await fetchImageMetadata();
      
      // Step 2: Fetch HTJ2K blob for first frame
      const htj2kBlob = await fetchHTJ2KFrame(metadata.frameIds[0]);
      
      // Step 3: Decode HTJ2K data to pixel array
      const decodedImage = await decodeHTJ2KData(htj2kBlob);
      
      // Step 4: Render to canvas
      await renderToCanvas(decodedImage);
      
      setStatus('success');
      addLog('✅ HTJ2K image loaded successfully');

    } catch (err) {
      setError(err.message);
      setStatus('error');
      addLog('❌ Pipeline failed: ' + err.message, err);
    }
  };

  /**
   * Step 1: Fetch image metadata
   */
  const fetchImageMetadata = async () => {
    addLog('📋 Fetching image metadata...');
    
    const response = await fetch(`/view/${imageSetId}`);
    
    if (!response.ok) {
      throw new Error(`Metadata fetch failed: ${response.status} ${response.statusText}`);
    }

    const metadata = await response.json();
    
    addLog(`📋 Metadata received: ${metadata.frameCount} frames`, {
      frameCount: metadata.frameCount,
      frameIds: metadata.frameIds?.slice(0, 3) // Show first 3 frame IDs
    });

    if (!metadata.frameIds || metadata.frameIds.length === 0) {
      throw new Error('No frame IDs found in metadata');
    }

    return metadata;
  };

  /**
   * Step 2: Fetch HTJ2K binary blob
   */
  const fetchHTJ2KFrame = async (frameId) => {
    addLog(`🔽 Fetching HTJ2K frame: ${frameId}`);
    
    const frameUrl = `/view/${imageSetId}/frame/${frameId}/jpeg2000`;
    const response = await fetch(frameUrl);

    if (!response.ok) {
      throw new Error(`Frame fetch failed: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    addLog(`🔽 Frame response: ${contentType}, ${contentLength} bytes`, {
      contentType,
      contentLength,
      url: frameUrl
    });

    // Verify we got HTJ2K data
    if (!contentType?.includes('jph') && !contentType?.includes('dicom')) {
      addLog('⚠️ Warning: Unexpected content type, proceeding anyway');
    }

    const blob = await response.arrayBuffer();
    
    addLog(`🔽 HTJ2K blob received: ${blob.byteLength} bytes`);
    
    return new Uint8Array(blob);
  };

  /**
   * Step 3: Decode HTJ2K data using the decoder utility
   */
  const decodeHTJ2KData = async (htj2kData) => {
    addLog('🔧 Decoding HTJ2K data...');
    
    try {
      const decoded = await decodeHTJ2K(htj2kData);
      
      addLog(`🔧 HTJ2K decoded: ${decoded.width}x${decoded.height}, ${decoded.channels} channels`, {
        width: decoded.width,
        height: decoded.height,
        channels: decoded.channels,
        bitsPerSample: decoded.bitsPerSample,
        pixelDataLength: decoded.pixelData.length
      });

      return decoded;
      
    } catch (decodeError) {
      addLog('❌ HTJ2K decode failed', decodeError);
      throw new Error(`HTJ2K decode failed: ${decodeError.message}`);
    }
  };


  /**
   * Step 4: Render decoded image to canvas
   */
  const renderToCanvas = async (decodedImage) => {
    addLog('🎨 Rendering to canvas...');
    
    // Wait for canvas element to be available
    const canvas = await waitForCanvas();
    if (!canvas) {
      throw new Error('Canvas element not available after waiting');
    }

    const ctx = canvas.getContext('2d');
    const { width, height, pixelData, bitsPerSample, channels } = decodedImage;
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Create ImageData for canvas rendering
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    // Convert pixel data to RGBA for canvas
    if (channels === 1 && bitsPerSample === 16) {
      // 16-bit grayscale to 8-bit RGBA
      for (let i = 0; i < pixelData.length; i++) {
        const gray = Math.floor((pixelData[i] / 65535) * 255);
        const idx = i * 4;
        data[idx] = gray;     // R
        data[idx + 1] = gray; // G
        data[idx + 2] = gray; // B
        data[idx + 3] = 255;  // A
      }
    } else {
      // Handle other formats as needed
      addLog('⚠️ Unsupported pixel format, rendering as-is');
    }
    
    // Render to canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Update UI info
    setImageInfo({
      width,
      height,
      channels,
      bitsPerSample,
      pixelCount: pixelData.length
    });
    
    addLog(`🎨 Canvas rendered: ${width}x${height}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl max-h-[90vh] w-full mx-4 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">HTJ2K Viewer</h2>
            <p className="text-sm text-gray-500">Image Set: {imageSetId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="text-sm">
            Status: <span className={`font-medium ${
              status === 'success' ? 'text-green-600' :
              status === 'error' ? 'text-red-600' :
              status === 'loading' ? 'text-blue-600' : 'text-gray-600'
            }`}>{status}</span>
          </div>
          {imageInfo && (
            <div className="text-sm text-gray-600">
              {imageInfo.width}×{imageInfo.height} • {imageInfo.channels}ch • {imageInfo.bitsPerSample}bit
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          
          {/* Canvas Area */}
          <div className="flex-1 bg-black flex items-center justify-center p-4 relative">
            {/* Always render canvas for ref availability */}
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full border border-gray-600"
              style={{ 
                imageRendering: 'pixelated',
                visibility: status === 'success' ? 'visible' : 'hidden'
              }}
            />
            
            {/* Loading overlay */}
            {status === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Loading HTJ2K image...</p>
                </div>
              </div>
            )}
            
            {/* Error overlay */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-red-400 text-center">
                  <p className="text-lg font-medium mb-2">Error Loading Image</p>
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={loadHTJ2KImage}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Debug Panel */}
          <div className="w-80 bg-gray-100 border-l border-gray-200 p-4 overflow-y-auto">
            <h3 className="font-medium text-gray-900 mb-3">Debug Log</h3>
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-xs font-mono text-gray-600 break-all">
                  {log}
                </div>
              ))}
            </div>
            
            {status === 'idle' && (
              <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
                Click an image to start the HTJ2K loading pipeline
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HTJ2KViewer;