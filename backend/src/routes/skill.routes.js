//skill.routes.js
import express from 'express';
import { Skill } from '../models/Skill.model.js';

const router = express.Router();
// When the frontend makes a request to this endpoint, the backend:
// Queries the database for all skills using Skill.find().
// Sends the skills back to the frontend as a JSON response.
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching skills' });
  }
});

export default router;