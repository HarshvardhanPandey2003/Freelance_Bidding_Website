import express from 'express';
import { skillsController } from '../controllers/skills.controller.js';

const router = express.Router();

router.get('/', skillsController.getAllSkills);
router.post('/init', skillsController.initializeSkills);

export default router;