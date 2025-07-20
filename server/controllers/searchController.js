// server/controllers/searchController.js

import healthImagingService from '../services/aws.js';

/**
 * Search for DICOM image sets
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const searchImageSets = async (req, res) => {
  try {
    const { patientName, modality, studyDate, patientId } = req.body;

    // Search using HealthImaging service (handles mock vs real data automatically)
    const searchCriteria = {
      patientName,
      modality,
      studyDate,
      patientId,
    };

    const results = await healthImagingService.searchImageSets(searchCriteria);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching image sets',
      error: error.message,
    });
  }
};

export {
  searchImageSets,
};
