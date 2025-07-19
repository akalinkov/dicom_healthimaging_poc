// server/routes/download.js

const express = require('express');
const router = express.Router();
const { downloadImageFrame } = require('../controllers/downloadController');

// GET /download/:id/frame/:frameId - Download specific image frame
router.get('/:id/frame/:frameId', downloadImageFrame);

module.exports = router;
