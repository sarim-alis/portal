// backend/index.js
// Imports.
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/conn.js';
import authRoutes from './src/routes/authRoutes.js';
import locRoutes from './src/routes/locRoutes.js';
import vouRoutes from './src/routes/vouRoutes.js';
import path from 'path'; 


// Config.
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware.
app.use(cors());
app.use(express.json());

// Route.
app.use('/api/auth', authRoutes);
app.use('/api/loc', locRoutes);  
app.use('/api/vou', vouRoutes);          
app.get('/', (req, res) => {
  res.send('API is running');
});


const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Root route - serve React app instead of "API is running"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));  // ✅ CHANGED: Serve React app
});

// ✅ ADDED: Catch-all route for React Router
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
// });

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Db.
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
