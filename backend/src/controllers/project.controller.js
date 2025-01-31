// backend/src/controllers/project.controller.js
import asyncHandler from '../utils/asyncHandler.js';
import { Project } from '../models/Project.model.js';

export const createProject = asyncHandler(async (req, res) => {
  const { title, description, budget, deadline } = req.body;
  
  if (budget <= 0) {
    return res.status(400).json({ error: 'Budget must be greater than 0' });
  }

  const parsedDeadline = new Date(deadline);
  if (parsedDeadline < new Date()) {
    return res.status(400).json({ error: 'Deadline must be in the future' });
  }

  const project = await Project.create({
    title,
    description,
    budget,
    deadline: parsedDeadline,
    client: req.user._id
    //"._id" is the MongoDB ObjectID of the authenticated user
  });

  res.status(201).json(project);
});

export const getClientProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ client: req.user._id })
    .sort({ createdAt: -1 })
    // Orders results by newest first (descending order)
    .lean();
    //Converts Mongoose documents to plain JavaScript objects (better performance)
  res.json(projects);
});