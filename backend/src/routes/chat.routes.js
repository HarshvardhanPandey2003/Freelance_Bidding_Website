// backend/src/routes/chat.routes.js
import express from 'express';
import { getChatConnections, getChatHistory } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/chats/connections
// Returns the list of chat connections for the authenticated user.
router.get('/connections', protect, getChatConnections);

// GET /api/chats/history/:partnerId
// Returns the chat history between the authenticated user and the given partner.
router.get('/history/:partnerId', protect, getChatHistory);

export default router;
