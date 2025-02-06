// backend/src/routes/profile.routes.js
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getFreelancerProfile,
  createOrUpdateFreelancerProfile,
  getClientProfile,
  createOrUpdateClientProfile,
  getFreelancerProfileById
} from '../controllers/profile.controller.js';

const router = express.Router();

// Apply auth middleware to all profile routes
router.use(protect);

// Freelancer profile routes
router.get('/freelancer', getFreelancerProfile);
router.post('/freelancer', createOrUpdateFreelancerProfile);
router.get('/freelancer-profile/:id', getFreelancerProfileById); 

// Client profile routes
router.get('/client', getClientProfile);
router.post('/client', createOrUpdateClientProfile);

export default router;
