// File: backend/src/routes/payment.routes.js
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { initiatePayment, confirmPayment , getPaymentHistory} from '../controllers/payment.controller.js';

const router = express.Router();

// Payment initiation requires authentication
router.post('/initiate', protect, initiatePayment);
router.post('/confirm',protect,express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  }),
  confirmPayment
);
router.get('/history', protect, getPaymentHistory);  // Add this route

export default router;
