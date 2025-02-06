// backend/src/routes/bid.routes.js
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  createBid,
  getProjectBids,
  getBidById,
  updateBid,
  deleteBid
} from '../controllers/bid.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Routes
router.post('/', requireRole('freelancer'), createBid);
router.get('/project/:projectId', getProjectBids);
router.get('/:bidId', getBidById);
router.put('/:bidId', requireRole('freelancer'), updateBid);
router.delete('/:bidId', requireRole('freelancer'), deleteBid);

export default router;