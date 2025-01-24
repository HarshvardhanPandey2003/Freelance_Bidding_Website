// src/routes/auth.js
import express from 'express';
import { register, login, logout } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();
//Create a instance of the main Router function 

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/logout', protect, asyncHandler(logout));

export default router;