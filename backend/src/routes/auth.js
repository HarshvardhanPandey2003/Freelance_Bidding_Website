import express from 'express';
import { register, login, logout } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const authRouter = express.Router();

authRouter.post('/register', asyncHandler(register));
authRouter.post('/login', asyncHandler(login));
authRouter.post('/logout', protect, asyncHandler(logout));

export default authRouter;