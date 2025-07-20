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

    res.json({
      success: true,
      data: metadata,
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
 * Get image frame for viewing
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

    res.json({
      success: true,
      data: frameData,
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

export {
  getImageSetMetadata,
  getImageFrame,
};
