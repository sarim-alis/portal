// src/routes/vouRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getOrdersWithVouchers, getCustomerVouchers, redeemByCode, redeemByCodes } from '../controllers/vouController.js';

const router = express.Router();

router.get('/', authenticateToken, getOrdersWithVouchers );
router.get('/cust',authenticateToken, getCustomerVouchers)
router.patch("/redeem",authenticateToken, redeemByCode);
router.patch("/redeems",authenticateToken, redeemByCodes);

export default router;