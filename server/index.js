// server/index.js

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

// Load configuration (this handles environment loading)
import config from './config/index.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('common'));

// Routes
import searchRouter from './routes/search.js';
import viewRouter from './routes/view.js';
import downloadRouter from './routes/download.js';

app.use('/search', searchRouter);
app.use('/view', viewRouter);
app.use('/download', downloadRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'dicom-healthimaging-poc-backend',
  });
});

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${config.environment}`);
  console.log(`Configuration profile: ${config.configProfile}`);
  console.log(`Using mock data: ${config.aws.useMockData ? 'Yes' : 'No'}`);
});
