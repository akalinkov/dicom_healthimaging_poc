// server/controllers/searchController.js

const healthImagingService = require('../services/aws');

/**
 * Search for DICOM image sets
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const searchImageSets = async (req, res) => {
  try {
    const { patientName, modality, studyDate, patientId, datastoreId } = req.body;

    // Validate required fields
    if (!datastoreId) {
      return res.status(400).json({
        success: false,
        message: 'datastoreId is required',
      });
    }

    // For now, return mock data until AWS HealthImaging datastore is set up
    if (process.env.NODE_ENV === 'development') {
      const mockResults = {
        success: true,
        data: {
          imageSetsMetadataSummaries: [
            {
              imageSetId: 'mock-image-set-1',
              version: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              DICOMTags: {
                DICOMPatientName: patientName || 'John Doe',
                DICOMPatientId: patientId || '12345',
                DICOMStudyDate: studyDate || '20240101',
                DICOMModality: modality || 'CT',
                DICOMStudyDescription: 'Sample CT Study',
              },
            },
            {
              imageSetId: 'mock-image-set-2',
              version: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              DICOMTags: {
                DICOMPatientName: patientName || 'Jane Smith',
                DICOMPatientId: patientId || '67890',
                DICOMStudyDate: studyDate || '20240102',
                DICOMModality: modality || 'MRI',
                DICOMStudyDescription: 'Sample MRI Study',
              },
            },
          ],
        },
      };

      return res.json(mockResults);
    }

    // Real AWS HealthImaging search
    const searchCriteria = {
      patientName,
      modality,
      studyDate,
      patientId,
    };

    const results = await healthImagingService.searchImageSets(datastoreId, searchCriteria);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching image sets',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = {
  searchImageSets,
};
