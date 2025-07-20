// server/routes/view.js

import express from 'express';
import { getImageSetMetadata, getImageFrame } from '../controllers/viewController.js';

const router = express.Router();

// GET /view/:id - Get image set metadata for viewing
router.get('/:id', getImageSetMetadata);

// GET /view/:id/frame/:frameId - Get specific image frame
router.get('/:id/frame/:frameId', getImageFrame);

export default router;
