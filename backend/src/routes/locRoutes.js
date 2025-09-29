// src/routes/locRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getLocations } from '../controllers/locController.js';

const router = express.Router();

router.get('/', authenticateToken, getLocations);

export default router;
