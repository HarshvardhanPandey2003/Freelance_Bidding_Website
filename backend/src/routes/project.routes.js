// backend/src/routes/project.routes.js
import express from 'express';
import { createProject, getClientProjects } from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

//We use hooks like protect to check the JWT Tokens and requireRole for RBAC  
const router = express.Router();
router.use(protect, requireRole('client'));

// This means that in this url we'll do both get and post 
router.route('/')
  .post(createProject)
  .get(getClientProjects);

export default router;