// src/controllers/locController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
