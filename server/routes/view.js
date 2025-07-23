// server/routes/view.js

import express from 'express';
import { getImageSetMetadata, getImageFrame, serveDicomFile, serveJpeg2000File } from '../controllers/viewController.js';

const router = express.Router();

// GET /view/:id - Get image set metadata for viewing
router.get('/:id', getImageSetMetadata);

// GET /view/:id/frame/:frameId - Get specific image frame metadata
router.get('/:id/frame/:frameId', getImageFrame);

// GET /view/:id/frame/:frameId/dicom - Serve DICOM binary data for Cornerstone
router.get('/:id/frame/:frameId/dicom', serveDicomFile);

// GET /view/:id/frame/:frameId/jpeg2000 - Serve JPEG 2000 data for display
router.get('/:id/frame/:frameId/jpeg2000', serveJpeg2000File);

export default router;
