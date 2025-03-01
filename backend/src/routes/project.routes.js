// backend/src/routes/project.routes.js
import express from 'express';
import { 
  createProject,
  getClientProjects,
  getSkills,
  getProjectById,
  updateProject,
  deleteProject,
  getOpenProjects
} 
from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import { validateSkills } from '../middleware/validation.middleware.js';
import { cacheProjects } from '../middleware/cache.middleware.js';

//"protect means apply authentication middleware to all routes"
const router = express.Router();
router.use(protect);

// Skill-related routes
router.get('/skills',requireRole('client'), asyncHandler(getSkills)); 
  router.post('/', requireRole('client'), validateSkills, createProject);
router.get('/', requireRole('client'), getClientProjects);
//Get all open projects only for freelancers 
router.get('/open', requireRole('freelancer'), cacheProjects, asyncHandler(getOpenProjects));
  
// Project CRUD routes
router.route('/:id')
    .get(asyncHandler(getProjectById))
    .put(asyncHandler(updateProject))
    .delete(asyncHandler(deleteProject));

export default router;