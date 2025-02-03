// backend/src/middleware/validation.middleware.js
import { staticSkills } from '../controllers/project.controller.js'; 

export const validateSkills = (req, res, next) => {
  const validSkillNames = staticSkills.map(skill => skill.name);
  if (req.body.skills && !req.body.skills.every(skill => validSkillNames.includes(skill))) {
    return res.status(400).json({
      error: 'Invalid skills provided',
      validSkills: validSkillNames
    });
  }
  next();
};