// server/services/aws.js

const { 
  MedicalImagingClient, 
  SearchImageSetsCommand,
  GetImageSetMetadataCommand,
  GetImageFrameCommand
} = require('@aws-sdk/client-medical-imaging');

class HealthImagingService {
  constructor() {
    this.client = new MedicalImagingClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  /**
   * Search for image sets based on criteria
   * @param {string} datastoreId - The datastore ID
   * @param {object} searchCriteria - Search criteria (patientName, modality, etc.)
   * @returns {Promise<object>} Search results
   */
  async searchImageSets(datastoreId, searchCriteria) {
    try {
      const command = new SearchImageSetsCommand({
        datastoreId,
        searchCriteria: {
          filters: this.buildSearchFilters(searchCriteria)
        }
      });

      const response = await this.client.send(command);
      return response;
    } catch (error) {
      console.error('Error searching image sets:', error);
      throw error;
    }
  }

  /**
   * Get metadata for a specific image set
   * @param {string} datastoreId - The datastore ID
   * @param {string} imageSetId - The image set ID
   * @returns {Promise<object>} Image set metadata
   */
  async getImageSetMetadata(datastoreId, imageSetId) {
    try {
      const command = new GetImageSetMetadataCommand({
        datastoreId,
        imageSetId
      });

      const response = await this.client.send(command);
      return response;
    } catch (error) {
      console.error('Error getting image set metadata:', error);
      throw error;
    }
  }

  /**
   * Get a specific image frame
   * @param {string} datastoreId - The datastore ID
   * @param {string} imageSetId - The image set ID
   * @param {object} frameParams - Frame parameters
   * @returns {Promise<object>} Image frame data
   */
  async getImageFrame(datastoreId, imageSetId, frameParams) {
    try {
      const command = new GetImageFrameCommand({
        datastoreId,
        imageSetId,
        imageFrameInformation: frameParams
      });

      const response = await this.client.send(command);
      return response;
    } catch (error) {
      console.error('Error getting image frame:', error);
      throw error;
    }
  }

  /**
   * Build search filters from search criteria
   * @param {object} searchCriteria - Search criteria object
   * @returns {Array} Array of search filters
   */
  buildSearchFilters(searchCriteria) {
    const filters = [];

    if (searchCriteria.patientName) {
      filters.push({
        values: [{ DICOMPatientName: searchCriteria.patientName }],
        operator: 'EQUAL'
      });
    }

    if (searchCriteria.modality) {
      filters.push({
        values: [{ DICOMModality: searchCriteria.modality }],
        operator: 'EQUAL'
      });
    }

    if (searchCriteria.studyDate) {
      filters.push({
        values: [{ DICOMStudyDate: searchCriteria.studyDate }],
        operator: 'EQUAL'
      });
    }

    if (searchCriteria.patientId) {
      filters.push({
        values: [{ DICOMPatientId: searchCriteria.patientId }],
        operator: 'EQUAL'
      });
    }

    return filters;
  }
}

module.exports = new HealthImagingService();
