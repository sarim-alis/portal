// src/controllers/authController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Check employee first.
    let user = await prisma.employee.findUnique({ where: { email } });

    if (user && user.password === password) {
    // Employee login (no role).
      return res.status(200).json({
        message: 'Login successful',
        user: { id: user.id, email: user.email, name: user.name}})
    }

    // 2️⃣ If not employee, check customer.
    user = await prisma.customer.findUnique({ where: { email } });
    if (user && user.password === password) {
      // Customer login (role included).
      return res.status(200).json({
        message: 'Login successful',
        user: { id: user.id, email: user.email, name: user.name, role: 'customer'}})
    }

    return res.status(401).json({ message: 'Invalid email or password' });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
