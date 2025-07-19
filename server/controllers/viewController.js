// server/controllers/viewController.js

const healthImagingService = require('../services/aws');

/**
 * Get image set metadata for viewing
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getImageSetMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const { datastoreId } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Image set ID is required'
      });
    }

    if (!datastoreId) {
      return res.status(400).json({
        success: false,
        message: 'datastoreId query parameter is required'
      });
    }

    // For development/mock mode
    if (process.env.NODE_ENV === 'development' || !process.env.AWS_ACCESS_KEY_ID) {
      const mockMetadata = {
        success: true,
        data: {
          imageSetId: id,
          version: 1,
          datastore: datastoreId,
          metadata: {
            patient: {
              name: 'John Doe',
              id: '12345',
              birthDate: '1980-01-01',
              sex: 'M'
            },
            study: {
              date: '20240101',
              time: '120000',
              description: 'Sample CT Study',
              instanceUID: '1.2.3.4.5.6.7.8.9.0.1'
            },
            series: [
              {
                instanceUID: '1.2.3.4.5.6.7.8.9.0.2',
                modality: 'CT',
                description: 'Axial CT Images',
                imageCount: 100,
                frameUrls: [
                  `/download/${id}/frame/1`,
                  `/download/${id}/frame/2`,
                  `/download/${id}/frame/3`
                ]
              }
            ]
          }
        }
      };

      console.log(`[MOCK] Viewing image set: ${id} from datastore: ${datastoreId}`);
      return res.json(mockMetadata);
    }

    // Real AWS HealthImaging metadata retrieval
    const metadata = await healthImagingService.getImageSetMetadata(datastoreId, id);

    res.json({
      success: true,
      data: metadata
    });

  } catch (error) {
    console.error('View error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving image set metadata',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
    const { datastoreId } = req.query;

    if (!id || !frameId) {
      return res.status(400).json({
        success: false,
        message: 'Image set ID and frame ID are required'
      });
    }

    if (!datastoreId) {
      return res.status(400).json({
        success: false,
        message: 'datastoreId query parameter is required'
      });
    }

    // For development/mock mode
    if (process.env.NODE_ENV === 'development' || !process.env.AWS_ACCESS_KEY_ID) {
      console.log(`[MOCK] Accessing frame ${frameId} for image set: ${id}`);
      
      // Return a placeholder response for now
      return res.json({
        success: true,
        message: `Mock frame ${frameId} for image set ${id}`,
        frameUrl: `https://placeholder-dicom-viewer.com/frame/${id}/${frameId}`,
        metadata: {
          imageSetId: id,
          frameId: frameId,
          datastoreId: datastoreId
        }
      });
    }

    // Real AWS HealthImaging frame retrieval
    const frameParams = {
      imageFrameId: frameId
    };

    const frameData = await healthImagingService.getImageFrame(datastoreId, id, frameParams);

    res.json({
      success: true,
      data: frameData
    });

  } catch (error) {
    console.error('Frame retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving image frame',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getImageSetMetadata,
  getImageFrame
};
