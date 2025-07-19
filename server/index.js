// server/index.js

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('common'));

// Routes
const searchRouter = require('./routes/search');
const viewRouter = require('./routes/view');
const downloadRouter = require('./routes/download');

app.use('/search', searchRouter);
app.use('/view', viewRouter);
app.use('/download', downloadRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'dicom-healthimaging-poc-backend'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
