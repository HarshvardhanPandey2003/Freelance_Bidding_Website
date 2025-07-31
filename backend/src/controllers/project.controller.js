// backend/src/controllers/project.controller.js
import asyncHandler from '../utils/asyncHandler.js';
import { Project } from '../models/Project.model.js';
import redisClient from '../config/redis.js';

export const staticSkills = [
  { name: 'JavaScript', category: 'Frontend' },
  { name: 'Python', category: 'Backend' },
  { name: 'React', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'TensorFlow', category: 'AI/ML' },

  // Web Dev
  { name: 'HTML', category: 'Frontend' },
  { name: 'CSS', category: 'Frontend' },
  { name: 'Angular', category: 'Frontend' },
  { name: 'Vue.js', category: 'Frontend' },
  { name: 'TypeScript', category: 'Frontend' },
  { name: 'Java', category: 'Backend' },
  { name: 'Spring Boot', category: 'Backend' },
  { name: 'PHP', category: 'Backend' },
  { name: 'Ruby on Rails', category: 'Backend' },
  { name: 'SQL', category: 'Database' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MySQL', category: 'Database' },
  { name: 'Redis', category: 'Database' },

  // Mobile Dev
  { name: 'Flutter', category: 'App' },
  { name: 'Swift', category: 'App' },
  { name: 'Kotlin', category: 'App' },
  { name : 'React Native', category: 'App' },
  
  // Cloud
  { name: 'AWS', category: 'Cloud' },
  { name: 'Azure', category: 'Cloud' },
  { name: 'Google Cloud Platform (GCP)', category: 'Cloud' },
  { name: 'Kubernetes', category: 'Cloud' },
  { name: 'Serverless', category: 'Cloud' },
  { name: 'Terraform', category: 'Cloud' },
  { name: 'CI/CD', category: 'DevOps' },
  { name: 'Git', category: 'DevOps' },
  { name: 'Ansible', category: 'DevOps' },

  // AI/ML
  { name: 'PyTorch', category: 'AI/ML' },
  { name: 'Scikit-learn', category: 'AI/ML' },
  { name: 'Keras', category: 'AI/ML' },
  { name: 'Natural Language Processing (NLP)', category: 'AI/ML' },
  { name: 'Computer Vision', category: 'AI/ML' },
  { name: 'Machine Learning', category: 'AI/ML' },
  { name: 'Deep Learning', category: 'AI/ML' },
  { name: 'Data Science', category: 'AI/ML' },
  { name: 'Big Data', category: 'AI/ML' },

  // Blockchain
  { name: 'Ethereum', category: 'Blockchain' },
  { name: 'Solidity', category: 'Blockchain' },
  { name: 'Hyperledger Fabric', category: 'Blockchain' },
  { name: 'Blockchain Development', category: 'Blockchain' },
  { name: 'Smart Contracts', category: 'Blockchain' },
  { name: 'Web3', category: 'Blockchain' },
  { name: 'Cryptography', category: 'Blockchain' },
];

// Redis Cache Utility Functions
const getCacheKey = (type, identifier) => `project:${type}:${identifier}`;
const getVisitKey = (projectId) => getCacheKey('visits', projectId);
const getProjectCacheKey = (projectId) => getCacheKey('cache', projectId);
const getOpenProjectsCacheKey = (filters) => getCacheKey('open', JSON.stringify(filters));

// Check if Redis is working
const isRedisWorking = () => {
  try {
    return !!redisClient?.isOpen;
  } catch (error) {
    return false;
  }
};

// Track project visits and determine if caching should occur
const trackProjectVisit = async (projectId) => {
  if (!isRedisWorking()) return false;
  
  try {
    // when user clicks on a project, we create a unique key for that project in a datastructure like
    const visitKey = getVisitKey(projectId);
    const visits = await redisClient.incr(visitKey);
    
    // Set expiry for visit counter (24 hours)
    if (visits === 1) {
      await redisClient.expire(visitKey, 86400);
    }
    
    return visits >= 3; // Return true if project should be cached
  } catch (error) {
    console.error('Redis visit tracking error:', error);
    return false;
  }
};

// Cache project data means storing it in Redis
const cacheProject = async (projectId, projectData, ttl = 300) => {
  if (!isRedisWorking()) return;
  
  try {
    const cacheKey = getProjectCacheKey(projectId);
    await redisClient.setEx(cacheKey, ttl, JSON.stringify(projectData));
  } catch (error) {
    console.error('Redis cache set error:', error);
  }
};

// Get cached project data means retrieving it from Redis
const getCachedProject = async (projectId) => {
  if (!isRedisWorking()) return null;
  
  try {
    const cacheKey = getProjectCacheKey(projectId);
    const cached = await redisClient.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Redis cache get error:', error);
    return null;
  }
};

// Cache open projects list 
const cacheOpenProjects = async (filters, projectsData, ttl = 300) => {
  if (!isRedisWorking()) return;
  
  try {
    const cacheKey = getOpenProjectsCacheKey(filters);
    await redisClient.setEx(cacheKey, ttl, JSON.stringify(projectsData));
  } catch (error) {
    console.error('Redis cache open projects error:', error);
  }
};

// Get cached open projects
const getCachedOpenProjects = async (filters) => {
  if (!isRedisWorking()) return null;
  
  try {
    const cacheKey = getOpenProjectsCacheKey(filters);
    const cached = await redisClient.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Redis cache get open projects error:', error);
    return null;
  }
};

// Clear project-related caches when a project is updated or deleted
const clearProjectCaches = async (projectId) => {
  if (!isRedisWorking()) return;
  
  try {
    const pattern = 'project:*';
    const keys = await redisClient.keys(pattern);
    
    if (keys.length > 0) {
      // Clear specific project cache
      const projectCacheKey = getProjectCacheKey(projectId);
      await redisClient.del(projectCacheKey);
      
      // Clear open projects caches (since they might contain this project)
      const openProjectKeys = keys.filter(key => key.includes('project:open:'));
      if (openProjectKeys.length > 0) {
        await redisClient.del(openProjectKeys);
      }
    }
  } catch (error) {
    console.error('Redis cache clear error:', error);
  }
};

// Get all available skills
export const getSkills = (req, res) => {
  res.json(staticSkills);
};

// Create a new project
export const createProject = asyncHandler(async (req, res) => {
  const { title, description, budget, deadline, skills } = req.body;

  // Enhanced validation
  if (typeof budget !== 'number' || budget <= 0) {
    return res.status(400).json({ error: 'Invalid budget value' });
  }

  const parsedDeadline = new Date(deadline);
  if (isNaN(parsedDeadline.getTime())) {
    return res.status(400).json({ error: 'Invalid deadline format' });
  }
  if (parsedDeadline < new Date()) {
    return res.status(400).json({ error: 'Deadline must be in the future' });
  }

  // Validate skills format
  if (!Array.isArray(skills)) {
    return res.status(400).json({ error: 'Skills must be an array' });
  }

  // Get valid skill names
  const validSkills = staticSkills.map(skill => skill.name);
  const invalidSkills = skills.filter(skill => !validSkills.includes(skill));
  
  if (invalidSkills.length > 0) {
    return res.status(400).json({
      error: `Invalid skills: ${invalidSkills.join(', ')}`,
      validSkills: validSkills
    });
  }

  try {
    //".create" is a mongoose method to create a new document in the database 
    const project = await Project.create({
      title,
      description,
      budget,
      deadline: parsedDeadline,
      client: req.user._id,
      skills
    });

    // Clear open projects cache since new project added
    if (isRedisWorking()) {
      try {
        const pattern = 'project:open:*';
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } catch (error) {
        console.error('Cache clear error:', error);
      }
    }

    // Simplified response (skills already validated)
    res.status(201).json(project);
    
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ 
      error: 'Server Error',
      details: error.message
    });
  }
});

// Get projects for the current client
export const getClientProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ client: req.user._id })
    .sort({ createdAt: -1 })
    .select('-__v -updatedAt -client')
    .lean();

  res.json(projects);
});

// Get project by ID with Redis caching
export const getProjectById = asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  
  //1.Track visit (increment counter)
  const shouldCache = await trackProjectVisit(projectId);
  
  // Try to get from cache first if it should be cached
  if (shouldCache) {
    const cachedProject = await getCachedProject(projectId);
    if (cachedProject) {
      return res.json(cachedProject);
    }
  }
  
  // If not in cache, fetch from database
  const project = await Project.findById(projectId)
    .select('-__v -updatedAt')
    .lean();

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Cache the project if it should be cached
  if (shouldCache) {
    await cacheProject(projectId, project);
  }

  res.json(project); // Skills are just names now
});

// Update project
export const updateProject = asyncHandler(async (req, res) => {
  const { deadline, skills, ...updateData } = req.body;
  
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  // Deadline validation
  if (deadline) {
    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime()) || parsedDeadline < new Date()) {
      return res.status(400).json({ error: 'Invalid deadline' });
    }
    project.deadline = parsedDeadline;
  }

  // Skills validation
  if (skills) {
    const validSkills = staticSkills.map(s => s.name);
    const invalid = skills.filter(s => !validSkills.includes(s));
    if (invalid.length) {
      return res.status(400).json({ 
        error: `Invalid skills: ${invalid.join(', ')}`,
        validSkills
      });
    }
    project.skills = skills;
  }

  // Update other fields
  Object.entries(updateData).forEach(([key, value]) => {
    project[key] = value;
  });

  await project.save();
  
  // Clear caches for this project
  await clearProjectCaches(req.params.id);
  
  res.json(project);
});

// Fixed delete function
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  // Clear caches for this project
  await clearProjectCaches(req.params.id);
  
  res.json({ message: 'Project deleted successfully' });
});

// Get open projects with Redis caching
export const getOpenProjects = asyncHandler(async (req, res) => {
  // Extract query parameters for filtering and pagination
  const { minBudget, maxBudget, deadline, skills, page, limit } = req.query;
  
  // Create filters object for caching key
  const filters = { minBudget, maxBudget, deadline, skills, page, limit };
  
  // Try to get from cache first
  const cachedProjects = await getCachedOpenProjects(filters);
  if (cachedProjects) {
    return res.json(cachedProjects);
  }
  
  // Main Conditions: show projects that are OPEN and not deleted
  const filter = { 
    status: 'OPEN',
    isDeleted: { $ne: true }  // Add this line to exclude deleted projects
  };
  
  // Add budget filtering if provided
  if (minBudget || maxBudget) {
    filter.budget = {};
    if (minBudget) filter.budget.$gte = Number(minBudget);
    if (maxBudget) filter.budget.$lte = Number(maxBudget);
  }
  
  // Deadline filtering: projects with deadlines on or before the provided date
  if (deadline) {
    const parsedDeadline = new Date(deadline);
    if (!isNaN(parsedDeadline.getTime())) {
      filter.deadline = { $lte: parsedDeadline };
    }
  }
  
  // Skills filtering: projects that include at least one of the specified skills
  if (skills) {
    // Convert skills to an array (if a comma-separated string is provided)
    const skillsArr = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    filter.skills = { $in: skillsArr };
  }
  
  // Pagination: default page 1 and limit 10 if not provided
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  // Query the database with the filter, pagination, and sorting (newest first)
  const projects = await Project.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .select('-__v -updatedAt')
    .lean();

  // Cache the results
  await cacheOpenProjects(filters, projects);

  res.json(projects);
});
