// src/controllers/authController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  try {
    const employee = await prisma.employee.findUnique({
      where: { email },
    });

    if (!employee || employee.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful', employee });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
