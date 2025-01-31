// backend/src/models/Project.model.js
import mongoose from 'mongoose';
import { Skill } from './Skill.model.js';

const projectSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Project title is required'] 
  },
  description: { 
    type: String, 
    required: [true, 'Project description is required'] 
  },
  budget: { 
    type: Number, 
    required: true,
    min: [0.01, 'Budget must be at least 0.01']
  },
  deadline: { 
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > Date.now();
      },
      message: 'Deadline must be in the future'
    }
  },
  status: { 
    type: String, 
    enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED'],
    default: 'OPEN'
  },
  client: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  //  Defines the structure of projects, including a reference to the Skill schema via ObjectId.
  skills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  }]
}, { timestamps: true });

export const Project = mongoose.model('Project', projectSchema);