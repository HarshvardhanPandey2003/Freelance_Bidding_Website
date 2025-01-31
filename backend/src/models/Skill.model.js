// backend/src/models/Skill.model.js
//Skills are stored independently and can be reused across multiple projects.
// We create a schema here first and and then use that in Project using
import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['Frontend', 'Backend', 'Database', 'DevOps', 'AI/ML'],
    required: true
  }
});
//We added a seedSkills function to populate the database with initial skill data 
// if the skills collection is empty. This ensures:
// The database always has some skills available for projects.
// The frontend has data to display in the skills dropdown.

export const Skill = mongoose.model('Skill', skillSchema);

export const initialSkills = [
  { name: 'React', category: 'Frontend' },
  { name: 'Vue.js', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Python', category: 'Backend' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'AWS', category: 'DevOps' },
  { name: 'TensorFlow', category: 'AI/ML' }
];

export const seedSkills = async () => {
  try {
    const count = await Skill.countDocuments();
    if (count === 0) {
      await Skill.insertMany(initialSkills);
      console.log('Skills seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding skills:', error);
  }
};