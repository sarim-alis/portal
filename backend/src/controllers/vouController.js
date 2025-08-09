// src/controllers/vouController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getOrdersWithVouchers = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        vouchers: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders with vouchers:', error);
    res.status(500).json({ error: 'Failed to fetch orders with vouchers' });
  }
};

export const redeemByCode = async (req, res) => {
  try {
    const { code, redeemAmount, locationUsed } = req.body;

    if (!code || !redeemAmount || redeemAmount <= 0 || !locationUsed) {
      return res.status(400).json({ error: "Invalid code or redeemAmount" });
    }

    // Find voucher and related order.
    const voucher = await prisma.voucher.findUnique({where: { code },include: { order: true },});

    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    const order = voucher.order;

    if (!order) {
      return res.status(404).json({ error: "Order not found for this voucher" });
    }

    // Determine current balance (first time = totalPrice).
    const currentBalance = order.remainingBalance ?? order.totalPrice;

    if (redeemAmount > currentBalance) {
      return res.status(400).json({ error: "Redeem amount exceeds remaining balance" });
    }

    // Calculate new balance.
    const newBalance = currentBalance - redeemAmount;

    // Update order with new remaining balance.
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        remainingBalance: newBalance,
        locationUsed: locationUsed,
        redeemedAt: new Date(),
      },
    });

    res.json({message: "Redeemed successfully",code,updatedOrder});

  } catch (error) {
    console.error("Error redeeming voucher:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
