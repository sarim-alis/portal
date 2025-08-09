// src/routes/vouRoutes.js
import express from 'express';
import { getOrdersWithVouchers, redeemByCode } from '../controllers/vouController.js';

const router = express.Router();

router.get('/', getOrdersWithVouchers);
router.patch("/redeem", redeemByCode);

export default router;