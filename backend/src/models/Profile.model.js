// backend/src/models/FreelancerProfile.model.js
import mongoose from 'mongoose';

const freelancerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  links: {
    github: String,
    linkedin: String
  },
  resume: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});


const clientProfileSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    image: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    links: {
      website: String
    }
  }, {
    timestamps: true
  });
  
export const ClientProfile = mongoose.model('ClientProfile', clientProfileSchema);
export const FreelancerProfile = mongoose.model('FreelancerProfile', freelancerProfileSchema);
