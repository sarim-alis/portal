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
