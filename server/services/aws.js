// server/services/aws.js

import {
  MedicalImagingClient,
  SearchImageSetsCommand,
  GetImageSetMetadataCommand,
  GetImageFrameCommand,
} from '@aws-sdk/client-medical-imaging';

import config from '../config/index.js';

class HealthImagingService {
  constructor() {
    this.config = config;
    this.client = new MedicalImagingClient({region: config.aws.region});
  }

  /**
   * Search for image sets based on criteria
   * @param {object} searchCriteria - Search criteria (patientName, modality, etc.)
   * @returns {Promise<object>} Search results
   */
  async searchImageSets(searchCriteria) {
    if (this.config.useMockData) {
      return this.getMockSearchResults(searchCriteria);
    }

    try {
      // Debug the datastore ID
      console.log('Using datastore ID:', JSON.stringify(this.config.aws.datastoreId));
      console.log('Datastore ID length:', this.config.aws.datastoreId?.length);
      console.log('Datastore ID type:', typeof this.config.aws.datastoreId);
      
      // First, try a simple search without any filters to test connectivity
      console.log('Attempting simple search without filters...');
      
      const command = new SearchImageSetsCommand({
        datastoreId: this.config.aws.datastoreId,
      });

      const response = await this.client.send(command);
      console.log('Simple search successful. Response:', JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      console.error('Error searching image sets:', error);
      throw error;
    }
  }

  /**
   * Get metadata for a specific image set
   * @param {string} imageSetId - The image set ID
   * @returns {Promise<object>} Image set metadata
   */
  async getImageSetMetadata(imageSetId) {
    if (this.config.useMockData) {
      return this.getMockMetadata(imageSetId);
    }

    try {
      const command = new GetImageSetMetadataCommand({
        datastoreId: this.config.aws.datastoreId,
        imageSetId,
      });

      const response = await this.client.send(command);
      
      // Handle the metadata blob stream properly
      if (response.imageSetMetadataBlob) {
        // Convert stream to buffer
        const chunks = [];
        for await (const chunk of response.imageSetMetadataBlob) {
          chunks.push(chunk);
        }
        response.imageSetMetadataBlob = Buffer.concat(chunks);
      }
      
      return response;
    } catch (error) {
      console.error('Error getting image set metadata:', error);
      throw error;
    }
  }

  /**
   * Get a specific image frame
   * @param {string} imageSetId - The image set ID
   * @param {object} frameParams - Frame parameters
   * @returns {Promise<object>} Image frame data
   */
  async getImageFrame(imageSetId, frameParams) {
    if (this.config.useMockData) {
      return this.getMockFrameData(imageSetId, frameParams);
    }

    try {
      const command = new GetImageFrameCommand({
        datastoreId: this.config.aws.datastoreId,
        imageSetId,
        imageFrameInformation: frameParams,
      });

      const response = await this.client.send(command);
      return response;
    } catch (error) {
      console.error('Error getting image frame:', error);
      throw error;
    }
  }

  /**
   * Get DICOM binary data for a specific image frame
   * @param {string} datastoreId - The datastore ID
   * @param {string} imageSetId - The image set ID
   * @param {object} frameParams - Frame parameters
   * @returns {Promise<object>} DICOM binary data
   */
  async getDicomBinaryData(datastoreId, imageSetId, frameParams) {
    try {
      console.log('Getting DICOM binary data:', { datastoreId, imageSetId, frameParams });

      const command = new GetImageFrameCommand({
        datastoreId,
        imageSetId,
        imageFrameInformation: frameParams,
      });

      const response = await this.client.send(command);
      
      // Handle the image frame blob stream properly
      console.log('AWS response info:', {
        hasImageFrameBlob: !!response.imageFrameBlob,
        contentType: response.contentType,
        contentLength: response.contentLength
      });
      
      if (response.imageFrameBlob) {
        console.log('Converting imageFrameBlob stream to buffer...');
        // Convert stream to buffer
        const chunks = [];
        for await (const chunk of response.imageFrameBlob) {
          chunks.push(chunk);
          console.log('Received chunk of size:', chunk.length);
        }
        const buffer = Buffer.concat(chunks);
        console.log('Total buffer size:', buffer.length);
        response.imageFrameBlob = buffer;
      } else {
        console.log('No imageFrameBlob in response');
      }
      
      // AWS HealthImaging returns the binary image data in the response body
      return {
        imageFrameBlob: response.imageFrameBlob,
        contentType: response.contentType || 'application/dicom',
        contentLength: response.contentLength || (response.imageFrameBlob ? response.imageFrameBlob.length : undefined),
        body: response.body, // Readable stream (if any)
      };
    } catch (error) {
      console.error('Error getting DICOM binary data:', error);
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

    if (searchCriteria.patientName && searchCriteria.patientName?.trim()) {
      filters.push({
        values: [{ DICOMPatientName: searchCriteria.patientName.trim() }],
        operator: 'EQUAL',
      });
    }

    if (searchCriteria.modality && searchCriteria.modality?.trim()) {
      filters.push({
        values: [{ DICOMSeriesModality: searchCriteria.modality.trim() }],
        operator: 'EQUAL',
      });
    }

    console.log('Built filters:', JSON.stringify(filters, null, 2));
    return filters;
  }

  /**
   * Get mock search results
   * @param {object} searchCriteria - Search criteria
   * @returns {object} Mock search results
   */
  getMockSearchResults(searchCriteria) {
    let results = [...this.config.mockData.imageSets];

    // Filter based on search criteria
    if (searchCriteria.patientName) {
      results = results.filter(item => 
        item.DICOMTags.DICOMPatientName.toLowerCase().includes(searchCriteria.patientName.toLowerCase())
      );
    }

    if (searchCriteria.modality) {
      results = results.filter(item => 
        item.DICOMTags.DICOMModality.toLowerCase() === searchCriteria.modality.toLowerCase()
      );
    }

    return {
      imageSetsMetadataSummaries: results,
    };
  }

  /**
   * Get mock metadata for an image set
   * @param {string} imageSetId - Image set ID
   * @returns {object} Mock metadata
   */
  getMockMetadata(imageSetId) {
    const imageSet = this.config.mockData.imageSets.find(set => set.imageSetId === imageSetId);
    
    return {
      imageSetId,
      version: 1,
      datastore: this.config.aws.datastoreId,
      metadata: {
        ...this.config.mockData.metadata,
        patient: {
          ...this.config.mockData.metadata.patient,
          name: imageSet?.DICOMTags?.DICOMPatientName || this.config.mockData.metadata.patient.name,
          id: imageSet?.DICOMTags?.DICOMPatientId || this.config.mockData.metadata.patient.id,
        },
        study: {
          ...this.config.mockData.metadata.study,
          description: imageSet?.DICOMTags?.DICOMStudyDescription || this.config.mockData.metadata.study.description,
          instanceUID: imageSet?.DICOMTags?.DICOMStudyInstanceUID || this.config.mockData.metadata.study.instanceUID,
        },
      },
    };
  }

  /**
   * Get mock frame data
   * @param {string} imageSetId - Image set ID
   * @param {object} frameParams - Frame parameters
   * @returns {object} Mock frame data
   */
  getMockFrameData(imageSetId, frameParams) {
    return {
      imageSetId,
      frameId: frameParams.imageFrameId,
      contentType: 'application/dicom',
      frameUrl: `https://placeholder-dicom-viewer.com/frame/${imageSetId}/${frameParams.imageFrameId}`,
      metadata: {
        imageSetId,
        frameId: frameParams.imageFrameId,
        datastoreId: this.config.aws.datastoreId,
      },
    };
  }
}

export default new HealthImagingService();
