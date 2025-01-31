  // backend/src/app.js
  import 'dotenv/config';
  import express from 'express';
  import cookieParser from 'cookie-parser';
  import cors from 'cors';
  import  authRouter  from './routes/auth.routes.js';
  import projectRouter from './routes/project.routes.js';
  import { connectDB } from './config/db.js';
  import { seedSkills } from './models/Skill.model.js';  
  import skillrouter from './routes/skill.routes.js';


  const app = express();

  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRouter);
  app.use('/api/projects', projectRouter);
  app.use('/api/skills', skillrouter);

  // Connect DB and start server
  connectDB().then(async () => {
    await seedSkills(); 
    app.listen(5000, () => console.log('Server running on port 5000'));
  }); 