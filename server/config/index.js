// server/config/index.js

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment-specific .env file
const profile = process.argv.find(arg => arg.startsWith('--profile='))?.split('=')[1] || 'mock';
const envFile = path.join(__dirname, '..', `.env.${profile}`);

// Load the environment file
const result = dotenv.config({ path: envFile });

if (result.error) {
  console.error(`Failed to load environment file: ${envFile}`);
  console.error('Available profiles: mock, aws');
  process.exit(1);
}

console.log(`Loaded configuration profile: ${profile} from ${envFile}`);

const environment = process.env.NODE_ENV || 'development';
const configProfile = process.env.CONFIG_PROFILE || 'mock';

async function loadConfig() {
  let config;

  switch (configProfile) {
    case 'aws': {
      const awsConfig = await import('./aws.config.js');
      config = awsConfig.default;
      // Validate AWS configuration
      try {
        config.validate();
        console.log('AWS configuration validated successfully');
      } catch (error) {
        console.error('AWS configuration validation failed:', error.message);
        process.exit(1);
      }
      break;
    }
    case 'mock':
    default: {
      const mockConfig = await import('./mock.config.js');
      config = mockConfig.default;
      console.log('Using mock data configuration');
      break;
    }
  }

  return {
    ...config,
    environment,
    configProfile,
    profile,
  };
}

export default await loadConfig();