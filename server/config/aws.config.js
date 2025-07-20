// server/config/aws.config.js

export default {
  useMockData: false,
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    datastoreId: process.env.HEALTHIMAGING_DATASTORE_ID,
  },
  
  server: {
    port: process.env.PORT || 3000,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  },

  // Validation function to ensure required AWS config is present
  validate() {
    const errors = [];
    
    if (!this.aws.datastoreId) {
      errors.push('HEALTHIMAGING_DATASTORE_ID environment variable is required for AWS configuration');
    }
    
    if (!this.aws.region) {
      errors.push('AWS_REGION environment variable is required for AWS configuration');
    }
    
    if (errors.length > 0) {
      throw new Error(`AWS Configuration validation failed:\n${errors.join('\n')}`);
    }
    
    return true;
  },
};