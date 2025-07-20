// server/routes/download.js

import express from 'express';
import { downloadImageFrame } from '../controllers/downloadController.js';

const router = express.Router();

// GET /download/:id/frame/:frameId - Download specific image frame
router.get('/:id/frame/:frameId', downloadImageFrame);

export default router;
