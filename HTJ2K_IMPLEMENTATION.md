# HTJ2K Viewer Implementation for AWS HealthImaging

This document explains the complete implementation of a browser-based HTJ2K viewer for AWS HealthImaging data.

## Architecture Overview

```
AWS HealthImaging → Backend API → Frontend → HTJ2K Decoder → Canvas/Cornerstone3D
     (HTJ2K)         (image/jph)    (React)      (WASM)        (Rendering)
```

## Components

### 1. Backend (Node.js/Express)

**File**: `server/controllers/viewController.js`

- Serves HTJ2K data from AWS HealthImaging with correct `Content-Type: image/jph`
- Handles frame ID mapping from sequential numbers to AWS UUIDs
- Provides metadata endpoint with frame counts and DICOM metadata

### 2. Frontend Components

**File**: `frontend/src/components/HTJ2KViewer.jsx`

Complete HTJ2K viewing pipeline with:
- ✅ **Fetch Pipeline**: Gets HTJ2K data from backend
- ✅ **Debug Logging**: Comprehensive logging for each step
- ✅ **Error Handling**: Detailed error reporting and retry logic
- ✅ **Canvas Rendering**: Direct pixel data rendering
- ✅ **Mock Decoder**: Development/testing decoder

### 3. HTJ2K Decoder

**File**: `frontend/src/utils/htj2k-decoder.js`

- **Mock Decoder**: Working implementation for development
- **Production Guide**: Documentation for integrating OpenJPH WASM
- **Data Analysis**: HTJ2K format verification and debugging

### 4. Cornerstone3D Integration

**File**: `frontend/src/utils/cornerstone-integration.js`

- Custom image loader for HTJ2K data
- Cornerstone3D viewport integration
- Medical imaging features (windowing, measurements, etc.)

## Usage

### Basic HTJ2K Viewing

```javascript
import HTJ2KViewer from './components/HTJ2KViewer.jsx';

// Use in your React app
<HTJ2KViewer 
  imageSetId="your-aws-imageset-id"
  isOpen={true}
  onClose={() => setViewerOpen(false)}
/>
```

### With Cornerstone3D (Advanced)

```javascript
import { loadHTJ2KInCornerstone } from './utils/cornerstone-integration.js';

const viewerRef = useRef(null);

useEffect(() => {
  if (viewerRef.current) {
    loadHTJ2KInCornerstone(viewerRef.current, imageSetId, frameId);
  }
}, [imageSetId, frameId]);
```

## Production Setup

### 1. Install HTJ2K Decoder

For production, install a real HTJ2K decoder:

```bash
npm install @cornerstonejs/codec-openjph
```

### 2. Update Vite Configuration

```javascript
// vite.config.js
export default defineConfig({
  optimizeDeps: {
    exclude: ['@cornerstonejs/codec-openjph']
  },
  worker: {
    format: 'es'
  }
});
```

### 3. Replace Mock Decoder

In `frontend/src/utils/htj2k-decoder.js`:

```javascript
import { OpenJPHDecoder } from '@cornerstonejs/codec-openjph';

export const decodeHTJ2K = async (htj2kData) => {
  const decoder = new OpenJPHDecoder();
  await decoder.initialize();
  return await decoder.decode(htj2kData);
};
```

## Debugging Features

The HTJ2K viewer includes comprehensive debugging:

### Debug Panel
- Real-time logging of each pipeline step
- Network request details (content-type, size)
- HTJ2K data analysis (magic bytes, format detection)
- Decode results (dimensions, bit depth, pixel data size)
- Rendering information

### Error Handling
- Network failure detection
- HTJ2K decode failure reporting
- Canvas rendering error handling
- Automatic retry functionality

### Data Verification
- Content-Type verification (`image/jph`)
- HTJ2K format validation
- Pixel data integrity checks
- Performance timing

## Testing the Pipeline

### 1. Start the Application

```bash
# Backend
cd server && npm run dev:aws

# Frontend  
cd frontend && npm run dev
```

### 2. Open Browser DevTools

Watch the debug logs to verify each step:

```
[timestamp] 🚀 Starting HTJ2K image loading pipeline
[timestamp] 📋 Fetching image metadata...
[timestamp] 📋 Metadata received: 1 frames
[timestamp] 🔽 Fetching HTJ2K frame: abc123...
[timestamp] 🔽 Frame response: image/jph, 125678 bytes
[timestamp] 🔧 Decoding HTJ2K data...
[timestamp] 🔧 HTJ2K decoded: 512x512, 1 channels
[timestamp] 🎨 Rendering to canvas...
[timestamp] ✅ HTJ2K image loaded successfully
```

### 3. Verify Each Step

- **Fetch**: Check Network tab for `/view/imageSetId/frame/frameId` request
- **Content-Type**: Should be `image/jph` or `application/dicom`
- **Data Size**: Should match the actual HTJ2K file size
- **Rendering**: Image should appear in canvas (currently shows test pattern)

## Known Limitations (Mock Decoder)

The current mock decoder:
- ✅ **Demonstrates pipeline**: Shows complete fetch → decode → render flow
- ✅ **Handles real data**: Processes actual HTJ2K bytes from AWS
- ✅ **Debug analysis**: Analyzes HTJ2K format and structure
- ❌ **No real decoding**: Creates synthetic image instead of decoding
- ❌ **Fixed dimensions**: Always returns 512x512 regardless of actual size

## Next Steps

1. **Install OpenJPH WASM**: Get real HTJ2K decoding capability
2. **Test with Real Data**: Verify with actual AWS HealthImaging datasets
3. **Performance Optimization**: Add web workers for large images
4. **Multi-frame Support**: Handle image series and volumes
5. **Medical Features**: Integrate windowing, measurements, annotations

## File Structure

```
frontend/src/
├── components/
│   ├── HTJ2KViewer.jsx          # Main viewer component
│   └── DicomViewer.jsx          # Wrapper (delegates to HTJ2K)
└── utils/
    ├── htj2k-decoder.js         # HTJ2K decoding utilities
    └── cornerstone-integration.js # Cornerstone3D integration

server/controllers/
└── viewController.js            # HTJ2K data serving
```

## Troubleshooting

### Image Not Loading
1. Check Network tab for failed requests
2. Verify `Content-Type: image/jph` header
3. Check debug panel for specific error messages

### Blank Canvas
1. Verify decoder returns valid pixel data
2. Check canvas dimensions match decoded image
3. Look for JavaScript errors in console

### Performance Issues
1. Monitor HTJ2K data size (should be compressed)
2. Consider web workers for large images
3. Implement progressive loading for volumes

This implementation provides a solid foundation for HTJ2K viewing with AWS HealthImaging, with clear paths for production deployment and advanced features.