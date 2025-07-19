// server/routes/view.js

const express = require('express');
const router = express.Router();
const { getImageSetMetadata, getImageFrame } = require('../controllers/viewController');

// GET /view/:id - Get image set metadata for viewing
router.get('/:id', getImageSetMetadata);

// GET /view/:id/frame/:frameId - Get specific image frame
router.get('/:id/frame/:frameId', getImageFrame);

module.exports = router;
