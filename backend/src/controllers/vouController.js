// src/controllers/vouController.js

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { sendVoucherRedeemEmail, sendGiftCardRedeemEmail } from "../utils/sendEmail.js";

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
    const currentBalance = voucher.remainingBalance ?? voucher.totalPrice;
    if (redeemAmount > currentBalance) { return res.status(400).json({ error: "Redeem amount exceeds remaining balance" })}

    // Calculate new balance.
    const newBalance = currentBalance - redeemAmount;

    // Update voucher only, not the whole order
    const updatedVoucher = await prisma.voucher.update({
      where: { code },
      data: {
        remainingBalance: newBalance,
        cashHistory: { push: redeemAmount },
        locationUsed: { push: locationUsed },
        redeemedAt: { push: new Date() },
        username: { push: username },
        used: true,
        statusUse: true
      }
    });

    // Email logic
    try {
      const customerEmail = voucher.customerEmail || order.customerEmail;
      if (customerEmail) {
        if (voucher.type === "gift") {
          await sendGiftCardRedeemEmail({
            to: customerEmail,
            giftCardCode: voucher.code,
            amountUsed: redeemAmount,
            remainingBalance: updatedVoucher.remainingBalance,
            location: Array.isArray(updatedVoucher.locationUsed) ? updatedVoucher.locationUsed.slice(-1)[0] : locationUsed
          });
        } else {
          await sendVoucherRedeemEmail({
            to: customerEmail,
            code: voucher.code,
            location: Array.isArray(updatedVoucher.locationUsed) ? updatedVoucher.locationUsed.slice(-1)[0] : locationUsed,
            productTitle: voucher.productTitle || "Voucher Product"
          });
        }
      }
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
    }

    res.json({message: "Redeemed successfully", code, updatedVoucher});

  } catch (error) {console.error("Error redeeming voucher:", error); res.status(500).json({ error: "Internal server error" })}
};

export const redeemByCodes = async (req, res) => {
  try {
    const { code, locationUsed, username } = req.body;

    if (!code || !locationUsed || !username) {
      return res.status(400).json({ error: "Code, location and username are required" });
    }

    // Find voucher and related order.
    const voucher = await prisma.voucher.findUnique({where: { code },include: { order: true },});

    if (!voucher) { return res.status(404).json({ error: "Voucher not found" })}

    const order = voucher.order;
    if (!order) { return res.status(404).json({ error: "Order not found for this voucher" })}

    // Check if already used.
    if (order.statusUse) { return res.status(400).json({ error: "Voucher already used" })}



    // Update voucher only, not the whole order
    const updatedVoucher = await prisma.voucher.update({
      where: { code },
      data: {
        used: true,
        statusUse: true,
        locationUsed: { push: locationUsed },
        redeemedAt: { push: new Date() },
        username: { push: username }
      }
    });

    // Email logic
    try {
      const customerEmail = voucher.customerEmail || order.customerEmail;
      if (customerEmail) {
        if (voucher.type === "gift") {
          await sendGiftCardRedeemEmail({
            to: customerEmail,
            giftCardCode: voucher.code,
            amountUsed: redeemAmount,
            remainingBalance: updatedVoucher.remainingBalance,
            location: Array.isArray(updatedVoucher.locationUsed) ? updatedVoucher.locationUsed.slice(-1)[0] : locationUsed
          });
        } else {
          await sendVoucherRedeemEmail({
            to: customerEmail,
            code: voucher.code,
            location: Array.isArray(updatedVoucher.locationUsed) ? updatedVoucher.locationUsed.slice(-1)[0] : locationUsed,
            productTitle: voucher.productTitle || "Voucher Product"
          });
        }
      }
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
    }

    res.json({message: "Voucher marked as used successfully",code,updatedVoucher});

  } catch (error) {console.error("Error marking voucher as used:", error); res.status(500).json({ error: "Internal server error" })}
};
