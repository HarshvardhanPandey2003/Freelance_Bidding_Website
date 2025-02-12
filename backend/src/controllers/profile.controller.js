// backend/src/controllers/profile.controller.js
import asyncHandler from '../utils/asyncHandler.js';
import { FreelancerProfile } from '../models/Profile.model.js';
import { ClientProfile } from '../models/Profile.model.js';
import ApiError from '../utils/ApiError.js';

// --------------------- FREELANCER PROFILE ---------------------

// Get freelancer profile
export const getFreelancerProfileById = asyncHandler(async (req, res) => {
  // Use req.params.id to find the profile by the 'user' field
  const profile = await FreelancerProfile.findOne({ user: req.params.id }).lean();
  if (!profile) {
    throw new ApiError(404, 'Freelancer profile not found');
  }
  res.json(profile);
});
// Create or update freelancer profile
export const createOrUpdateFreelancerProfile = asyncHandler(async (req, res) => {
  const { image, name, description, links, resume } = req.body;

  let profile = await FreelancerProfile.findOne({ user: req.user._id });

  if (profile) {
    profile.image = image;
    profile.name = name;
    profile.description = description;
    profile.links = links;
    profile.resume = resume;
  } else {
    profile = new FreelancerProfile({
      user: req.user._id,
      image,
      name,
      description,
      links,
      resume
    });
  }

  await profile.save();
  res.status(200).json(profile);
});

// --------------------- CLIENT PROFILE ---------------------

export const getClientProfile = asyncHandler(async (req, res) => {
  const profile = await ClientProfile.findOne({ user: req.user._id }).lean();
  if (!profile) {
    throw new ApiError(404, 'Client profile not found');
  }
  res.json(profile);
});

export const getFreelancerProfileByUserId = asyncHandler(async (req, res) => {
  // Instead of using req.user._id, we use the provided freelancer id from the URL
  const profile = await FreelancerProfile.findOne({ user: req.params.id }).lean();
  if (!profile) {
    throw new ApiError(404, 'Freelancer profile not found');
  }
  res.json(profile);
});


export const getFreelancerProfile = asyncHandler(async (req, res) => {
  const profile = await FreelancerProfile.findOne({ user: req.user._id }).lean();
  if (!profile) {
    throw new ApiError(404, 'Freelancer profile not found');
  }
  res.json(profile);
});

// Create or update client profile
export const createOrUpdateClientProfile = asyncHandler(async (req, res) => {
  const { image, name, company, description, links } = req.body;

  let profile = await ClientProfile.findOne({ user: req.user._id });

  if (profile) {
    profile.image = image;
    profile.name = name;
    profile.company = company;
    profile.description = description;
    profile.links = links;
  } else {
    profile = new ClientProfile({
      user: req.user._id,
      image,
      name,
      company,
      description,
      links
    });
  }

  await profile.save();
  res.status(200).json(profile);
});