// backend/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/conn.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Test DB connection (optional)
pool.connect()
  .then(() => {
    console.log('🟢 Connected to PostgreSQL');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('🔴 DB connection error:', err);
  });
