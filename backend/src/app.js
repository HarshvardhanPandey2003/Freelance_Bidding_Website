// backend/src/app.js
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import  authRouter  from './routes/auth.js';
import { connectDB } from './config/db.js';
import { register, login, logout } from './controllers/auth.controller.js';
import { protect } from './middleware/auth.middleware.js';

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);

// Test protected route
app.get('/api/test', protect, (req, res) => {
  res.json({ message: `Hello ${req.user.username}` });
});
app.get('/api/auth/ping', (req, res) => {
  res.json({ message: 'API is working!' });
});
// Connect DB and start server
connectDB().then(() => {
  app.listen(5000, () => console.log('Server running on port 5000'));
});