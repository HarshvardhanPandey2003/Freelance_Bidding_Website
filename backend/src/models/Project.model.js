// backend/src/models/Project.model.js
import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  status: { type: String, default: 'OPEN' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },// Making a forien key
  skills: [{ type: String }], // Ensure it's an array
}, { timestamps: true });

export const Project = mongoose.model('Project', ProjectSchema);