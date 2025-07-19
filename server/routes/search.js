// server/routes/search.js

const express = require('express');
const router = express.Router();
const { searchImageSets } = require('../controllers/searchController');

// POST /search - Search for DICOM image sets
router.post('/', searchImageSets);

module.exports = router;
