// backend/src/app.js
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { register, login, logout } from './controllers/auth.controller.js';
import { protect } from './middleware/auth.middleware.js';

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/logout', protect, logout);

// Test protected route
app.get('/api/test', protect, (req, res) => {
  res.json({ message: `Hello ${req.user.username}` });
});

// Connect DB and start server
connectDB().then(() => {
  app.listen(5000, () => console.log('Server running on port 5000'));
});