// src/routes/vouRoutes.js
import express from 'express';
import { getOrdersWithVouchers } from '../controllers/vouController.js';

const router = express.Router();

router.get('/', getOrdersWithVouchers);

export default router;