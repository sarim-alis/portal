// src/routes/vouRoutes.js
import express from 'express';
import { getOrdersWithVouchers, getCustomerVouchers, redeemByCode, redeemByCodes } from '../controllers/vouController.js';

const router = express.Router();

router.get('/', getOrdersWithVouchers);
router.get('/cust', getCustomerVouchers)
router.patch("/redeem", redeemByCode);
router.patch("/redeems", redeemByCodes);

export default router;