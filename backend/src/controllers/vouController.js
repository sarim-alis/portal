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

export const getCustomerVouchers = async (req, res) => {
  try {
    const { email } = req.query; // Pass customer email as query param

    if (!email) {
      return res.status(400).json({ error: "Customer email is required" });
    }

    // Fetch vouchers for this customer
    const vouchers = await prisma.voucher.findMany({
      where: { customerEmail: email },
      include: {
        order: true, // include the related order info
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(vouchers);
  } catch (error) {
    console.error('Error fetching customer vouchers:', error);
    res.status(500).json({ error: 'Failed to fetch customer vouchers' });
  }
};


export const redeemByCode = async (req, res) => {
  try {
    const { code, redeemAmount, locationUsed, username } = req.body;

    if (!code || !redeemAmount || redeemAmount <= 0 || !locationUsed || !username) {
      return res.status(400).json({ error: "Invalid code or redeemAmount or username" });
    }

    // Find voucher and related order.
    const voucher = await prisma.voucher.findUnique({where: { code },include: { order: true },});

    if (!voucher) { return res.status(404).json({ error: "Voucher not found" })}

    const order = voucher.order;
    if (!order) { return res.status(404).json({ error: "Order not found for this voucher" })}

    // Determine current balance (first time = totalPrice).
    const currentBalance = order.remainingBalance ?? order.totalPrice;
    if (redeemAmount > currentBalance) { return res.status(400).json({ error: "Redeem amount exceeds remaining balance" })}

    // Calculate new balance.
    const newBalance = currentBalance - redeemAmount;

    // Update order with new remaining balance.
    const updatedOrder = await prisma.order.update({where: { id: order.id }, data: {remainingBalance: newBalance, cashHistory: { push: redeemAmount }, locationUsed: { push: locationUsed }, redeemedAt: { push: new Date() }, username: { push: username }}});
    res.json({message: "Redeemed successfully", code, updatedOrder});

  } catch (error) {console.error("Error redeeming voucher:", error); res.status(500).json({ error: "Internal server error" })}
};

// Gift.🎁
export const redeemByCodes = async (req, res) => {
  try {
    const { code, usedLocation, username } = req.body;

    if (!code || !usedLocation || !username) { return res.status(400).json({ error: "Code, location and username are required" });}

    // Find voucher and related order.
    const voucher = await prisma.voucher.findUnique({where: { code }, include: { order: { include: { vouchers: true }}}});

    if (!voucher) { return res.status(404).json({ error: "Voucher not found" })}
    if (!voucher.order) { return res.status(404).json({ error: "Order not found for this voucher" });}

    const order = voucher.order;
    if (!order) { return res.status(404).json({ error: "Order not found for this voucher" })}

    // Check if already used.
    if (voucher.usedLocation) { return res.status(400).json({ error: "Voucher already used" });}

    // Updated voucher with status used.
    const updatedVoucher = await prisma.voucher.update({where: { id: voucher.id }, data: { used: true, usedLocation: usedLocation, username: { push: username } }});
    res.json({message: "Voucher marked as used successfully", code, updatedVoucher});

  } catch (error) {console.error("Error marking voucher as used:", error); res.status(500).json({ error: "Internal server error" })}
};
