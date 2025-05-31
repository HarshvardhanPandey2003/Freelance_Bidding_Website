  // backend/src/controllers/project.controller.js
  import asyncHandler from '../utils/asyncHandler.js';
  import { Project } from '../models/Project.model.js';
  
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
    { name: 'CI/CD', category: 'DevOps' }, // Moved to DevOps as it's often related
    { name: 'Git', category: 'DevOps' },      // Moved to DevOps as it's often related
    { name: 'Ansible', category: 'DevOps' },   // Moved to DevOps as it's often related


    // AI/ML
    { name: 'PyTorch', category: 'AI/ML' },
    { name: 'Scikit-learn', category: 'AI/ML' },
    { name: 'Keras', category: 'AI/ML' },
    { name: 'Natural Language Processing (NLP)', category: 'AI/ML' },
    { name: 'Computer Vision', category: 'AI/ML' },
    { name: 'Machine Learning', category: 'AI/ML' },
    { name: 'Deep Learning', category: 'AI/ML' },
    { name: 'Data Science', category: 'AI/ML' },
    { name: 'Big Data', category: 'AI/ML' }, // Often related to AI/ML


    // Blockchain
    { name: 'Ethereum', category: 'Blockchain' },
    { name: 'Solidity', category: 'Blockchain' },
    { name: 'Hyperledger Fabric', category: 'Blockchain' },
    { name: 'Blockchain Development', category: 'Blockchain' },
    { name: 'Smart Contracts', category: 'Blockchain' },
    { name: 'Web3', category: 'Blockchain' },
    { name: 'Cryptography', category: 'Blockchain' }, // Often related to Blockchain

];
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

  // Get project by ID use this for looking into more details of a project
  export const getProjectById = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id)
      .select('-__v -updatedAt')
      .lean();
  
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
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
    res.json(project);
  });
  
  // Fixed delete function
  export const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  });


// Now the APIs for the Freelancers 
export const getOpenProjects = asyncHandler(async (req, res) => {
  // Extract query parameters for filtering and pagination
  const { minBudget, maxBudget, deadline, skills, page, limit } = req.query;
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

  res.json(projects);
});