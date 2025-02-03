// backend/src/routes/auth.js
import express from 'express';
import { register, login, logout, test } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const authRouter = express.Router();

authRouter.post('/register', asyncHandler(register));
authRouter.post('/login', asyncHandler(login));
authRouter.post('/logout', protect, asyncHandler(logout));
authRouter.get('/me', protect, asyncHandler(test));

export default authRouter;