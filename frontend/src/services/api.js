import logger from './logger.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    logger.info('ApiService initialized', { baseURL: this.baseURL });
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const requestId = Math.random().toString(36).substr(2, 9);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        ...options.headers,
      },
      ...options,
    };

    logger.debug('Making API request', { 
      requestId, 
      method: config.method || 'GET', 
      url,
      hasBody: !!config.body 
    });

    try {
      const startTime = performance.now();
      const response = await fetch(url, config);
      const duration = Math.round(performance.now() - startTime);
      
      if (!response.ok) {
        logger.error('API request failed', {
          requestId,
          status: response.status,
          statusText: response.statusText,
          url,
          duration
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      logger.info('API request successful', { 
        requestId, 
        status: response.status, 
        url,
        duration 
      });
      
      return data;
    } catch (error) {
      logger.error('API request error', {
        requestId,
        url,
        error: error.message
      });
      throw error;
    }
  }

  // Search for DICOM image sets
  async searchImageSets(searchParams) {
    logger.info('Searching image sets', { searchParams });
    return this.request('/search', {
      method: 'POST',
      body: JSON.stringify(searchParams),
    });
  }

  // Get image set metadata
  async getImageSetMetadata(imageSetId, datastoreId) {
    logger.info('Getting image set metadata', { imageSetId, datastoreId });
    return this.request(`/view/${imageSetId}?datastoreId=${datastoreId}`);
  }

  // Get image frame
  async getImageFrame(imageSetId, frameId, datastoreId) {
    logger.info('Getting image frame', { imageSetId, frameId, datastoreId });
    return this.request(`/view/${imageSetId}/frame/${frameId}?datastoreId=${datastoreId}`);
  }

  // Download image frame
  async downloadImageFrame(imageSetId, frameId) {
    logger.info('Downloading image frame', { imageSetId, frameId });
    return this.request(`/download/${imageSetId}/frame/${frameId}`);
  }
}

export default new ApiService();