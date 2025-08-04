// src/routes/locRoutes.js
import express from 'express';
import { getLocations } from '../controllers/locController.js';

const router = express.Router();

router.get('/', getLocations);

export default router;
