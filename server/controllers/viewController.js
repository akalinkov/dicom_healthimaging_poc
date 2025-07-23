// server/controllers/viewController.js

import healthImagingService from '../services/aws.js';

/**
 * Get image set metadata for viewing
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getImageSetMetadata = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Image set ID is required',
      });
    }

    // Get metadata using HealthImaging service (handles mock vs real data automatically)
    const metadata = await healthImagingService.getImageSetMetadata(id);

    // Parse metadata to extract frame count and other info for the frontend
    let frameCount = 1;
    let frameIds = [];
    let dicomMetadata = {};
    
    if (metadata.imageSetMetadataBlob) {
      try {
        let metadataString;
        
        // Handle gzipped content
        if (metadata.contentEncoding === 'gzip') {
          const zlib = await import('zlib');
          const decompressed = zlib.gunzipSync(metadata.imageSetMetadataBlob);
          metadataString = decompressed.toString('utf-8');
        } else {
          metadataString = metadata.imageSetMetadataBlob.toString('utf-8');
        }
        
        // Parse metadata
        const parsedMetadata = JSON.parse(metadataString);
        
        // Count frames in the metadata structure
        function findFrameIds(obj) {
          if (typeof obj !== 'object' || obj === null) return;
          for (const [key, value] of Object.entries(obj)) {
            if (key === 'ID' && typeof value === 'string' && value.length === 32) {
              frameIds.push(value);
            } else if (typeof value === 'object') {
              findFrameIds(value);
            }
          }
        }
        findFrameIds(parsedMetadata);
        
        frameCount = frameIds.length || 1;
        dicomMetadata = parsedMetadata;
        
      } catch (parseError) {
        console.error('Failed to parse metadata blob:', parseError.message);
      }
    }

    res.json({
      success: true,
      data: metadata,
      frameCount,
      frameIds,
      dicomMetadata,
    });
  } catch (error) {
    console.error('View error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving image set metadata',
      error: error.message,
    });
  }
};

/**
 * Get image frame for viewing (returns JSON metadata)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getImageFrame = async (req, res) => {
  try {
    const { id, frameId } = req.params;

    if (!id || !frameId) {
      return res.status(400).json({
        success: false,
        message: 'Image set ID and frame ID are required',
      });
    }

    // Get frame data using HealthImaging service (handles mock vs real data automatically)
    const frameParams = {
      imageFrameId: frameId,
    };

    const frameData = await healthImagingService.getImageFrame(id, frameParams);

    // Extract only serializable data from AWS response
    const serializedFrameData = {
      imageFrameBlob: frameData.imageFrameBlob ? 'Binary data available' : null,
      contentType: frameData.contentType,
      contentEncoding: frameData.contentEncoding,
      blobSize: frameData.imageFrameBlob ? frameData.imageFrameBlob.length : 0,
    };

    res.json({
      success: true,
      data: serializedFrameData,
    });
  } catch (error) {
    console.error('Frame retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving image frame',
      error: error.message,
    });
  }
};

/**
 * Serve DICOM-like binary data for Cornerstone viewer
 * Returns JPEG 2000 data directly for Cornerstone DICOM loader
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const serveDicomFile = async (req, res) => {
  try {
    const { id, frameId } = req.params;

    if (!id || !frameId) {
      return res.status(400).json({
        success: false,
        message: 'Image set ID and frame ID are required',
      });
    }

    console.log(`Serving DICOM-compatible data for image set: ${id}, frame: ${frameId}`);

    // Get metadata to find actual frame IDs
    const metadata = await healthImagingService.getImageSetMetadata(id);
    
    let frameIds = [];
    if (metadata.imageSetMetadataBlob) {
      try {
        let metadataString;
        
        // Handle gzipped content
        if (metadata.contentEncoding === 'gzip') {
          const zlib = await import('zlib');
          const decompressed = zlib.gunzipSync(metadata.imageSetMetadataBlob);
          metadataString = decompressed.toString('utf-8');
        } else {
          metadataString = metadata.imageSetMetadataBlob.toString('utf-8');
        }
        
        const parsedMetadata = JSON.parse(metadataString);
        
        // Extract frame IDs
        function findFrameIds(obj) {
          if (typeof obj !== 'object' || obj === null) return;
          for (const [key, value] of Object.entries(obj)) {
            if (key === 'ID' && typeof value === 'string' && value.length === 32) {
              frameIds.push(value);
            } else if (typeof value === 'object') {
              findFrameIds(value);
            }
          }
        }
        findFrameIds(parsedMetadata);
        
      } catch (parseError) {
        console.error('Failed to parse metadata blob:', parseError.message);
      }
    }

    if (frameIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No frame IDs found in image set',
      });
    }

    // The frameId parameter is now the actual AWS frame ID (32-char hex string)
    // No need to map since frontend sends real frame IDs
    console.log(`Using frame ID: ${frameId} (received from frontend)`);

    // Get the actual image frame data from AWS HealthImaging
    const frameParams = {
      imageFrameId: frameId,
    };

    const frameData = await healthImagingService.getDicomBinaryData(
      healthImagingService.config.aws.datastoreId, 
      id, 
      frameParams
    );

    // Set appropriate headers for HTJ2K data from AWS HealthImaging
    res.setHeader('Content-Type', 'image/jph'); // HTJ2K MIME type
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'range, content-type');
    res.setHeader('Access-Control-Expose-Headers', 'content-length, content-type');
    
    if (frameData.imageFrameBlob && frameData.imageFrameBlob.length) {
      res.setHeader('Content-Length', frameData.imageFrameBlob.length);
      console.log('Sending image data, size:', frameData.imageFrameBlob.length, 'bytes');
      res.send(frameData.imageFrameBlob);
    } else {
      throw new Error('No image data received from AWS HealthImaging');
    }

  } catch (error) {
    console.error('DICOM file serving error:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving DICOM file',
      error: error.message,
    });
  }
};

/**
 * Serve JPEG 2000 file binary data for direct image display
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const serveJpeg2000File = async (req, res) => {
  try {
    const { id, frameId } = req.params;

    if (!id || !frameId) {
      return res.status(400).json({
        success: false,
        message: 'Image set ID and frame ID are required',
      });
    }

    console.log(`Serving HTJ2K data for image set: ${id}, frame: ${frameId}`);

    // The frameId parameter is already the actual AWS frame ID (32-char hex)
    console.log(`Using frame ID: ${frameId} for HTJ2K data`);

    const frameParams = {
      imageFrameId: frameId,
    };

    // Use datastore ID from backend config
    const frameData = await healthImagingService.getDicomBinaryData(
      healthImagingService.config.aws.datastoreId, 
      id, 
      frameParams
    );

    // Set headers for HTJ2K data
    res.setHeader('Content-Type', 'image/jph'); // HTJ2K MIME type
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'range, content-type');
    res.setHeader('Access-Control-Expose-Headers', 'content-length, content-type');
    
    if (frameData.imageFrameBlob && frameData.imageFrameBlob.length) {
      res.setHeader('Content-Length', frameData.imageFrameBlob.length);
      console.log('Sending HTJ2K data, size:', frameData.imageFrameBlob.length, 'bytes');
      res.send(frameData.imageFrameBlob);
    } else {
      throw new Error('No HTJ2K data received from AWS HealthImaging');
    }

  } catch (error) {
    console.error('HTJ2K serving error:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving HTJ2K file',
      error: error.message,
    });
  }
};

export {
  getImageSetMetadata,
  getImageFrame,
  serveDicomFile,
  serveJpeg2000File,
};
