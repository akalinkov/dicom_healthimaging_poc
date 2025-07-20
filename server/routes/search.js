// server/routes/search.js

import express from 'express';
import { searchImageSets } from '../controllers/searchController.js';

const router = express.Router();

// POST /search - Search for DICOM image sets
router.post('/', searchImageSets);

export default router;
