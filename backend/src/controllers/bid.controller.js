// src/controllers/bid.controller.js - Fixed with consistent data structure
import asyncHandler from '../utils/asyncHandler.js';
import { Bid } from '../models/Bid.model.js';
import { Project } from '../models/Project.model.js';
import ApiError from '../utils/ApiError.js';
import { getIO } from '../app.js';
import mongoose from 'mongoose';

// Safe socket emission helper
const safeSocketEmit = (eventName, roomId, data) => {
  const io = getIO();
  if (io) {
    console.log(`Emitting ${eventName} to room ${roomId}:`, data);
    io.to(roomId).emit(eventName, data);
  } else {
    console.warn(`Socket.io not available for emitting ${eventName}`);
  }
};

// Helper function to normalize bid response
const normalizeBidResponse = (bid, projectData = null) => {
  return {
    ...bid,
    _id: bid._id.toString(),
    project: projectData ? {
      _id: projectData._id.toString(),
      client: projectData.client.toString()
    } : {
      _id: bid.project._id ? bid.project._id.toString() : bid.project.toString(),
      client: projectData?.client?.toString() || bid.project.client?.toString()
    },
    freelancer: {
      _id: bid.freelancer._id.toString(),
      username: bid.freelancer.username
    },
    createdAt: bid.createdAt.toISOString(),
    updatedAt: bid.updatedAt.toISOString()
  };
};

// ==================================
// CREATE BID
// ==================================
export const createBid = asyncHandler(async (req, res) => {
  const { projectId, bidAmount, message } = req.body;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, 'Invalid project ID format');
  }

  const project = await Project.findById(projectId).select('status client').lean();
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.status !== 'OPEN') throw new ApiError(400, 'Project not accepting bids');

  if (project.client.toString() === req.user._id.toString()) {
    throw new ApiError(403, 'Project owners cannot bid on their own projects');
  }

  try {
    const bid = await Bid.create({
      project: projectId,
      freelancer: req.user._id,
      bidAmount,
      message,
      status: 'PENDING'
    });

    const populatedBid = await Bid.findById(bid._id)
      .populate({
        path: 'freelancer',
        select: 'username _id'
      })
      .lean();

    // Use consistent normalization
    const responseBid = normalizeBidResponse(populatedBid, {
      _id: projectId,
      client: project.client
    });

    // Emit to project room
    safeSocketEmit('newBid', `project:${projectId}`, responseBid);
    
    res.status(201).json(responseBid);

  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'You already have an active bid for this project');
    }
    throw error;
  }
});

// ==================================
// UPDATE BID
// ==================================
export const updateBid = asyncHandler(async (req, res) => {
  const { bidId } = req.params;
  const { bidAmount, message } = req.body;

  if (!mongoose.Types.ObjectId.isValid(bidId)) {
    throw new ApiError(400, 'Invalid bid ID format');
  }

  const bid = await Bid.findById(bidId).populate('project', 'status client _id');
  if (!bid) throw new ApiError(404, 'Bid not found');

  if (bid.freelancer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized to update this bid');
  }

  if (bid.status !== 'PENDING') {
    throw new ApiError(400, 'Cannot update a non-pending bid');
  }

  if (bid.project.status !== 'OPEN') {
    throw new ApiError(400, 'Cannot update bid for closed project');
  }

  bid.bidAmount = bidAmount;
  bid.message = message;
  await bid.save();

  const populatedBid = await Bid.findById(bid._id)
    .populate('freelancer', 'username _id')
    .lean();

  // Use consistent normalization
  const responseBid = normalizeBidResponse(populatedBid, bid.project);

  // Emit to project room
  safeSocketEmit('bidUpdate', `project:${bid.project._id}`, responseBid);

  res.json(responseBid);
});

// ==================================
// DELETE BID
// ==================================
export const deleteBid = asyncHandler(async (req, res) => {
  const { bidId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bidId)) {
    throw new ApiError(400, 'Invalid bid ID format');
  }

  const bid = await Bid.findById(bidId).populate('project', 'status _id');
  if (!bid) throw new ApiError(404, 'Bid not found');

  if (bid.freelancer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized to delete this bid');
  }

  if (bid.status !== 'PENDING') {
    throw new ApiError(400, 'Cannot delete a non-pending bid');
  }

  if (bid.project.status !== 'OPEN') {
    throw new ApiError(400, 'Cannot delete bid for closed project');
  }

  const projectId = bid.project._id.toString();
  await bid.deleteOne();

  // Emit to project room
  safeSocketEmit('bidDelete', `project:${projectId}`, { 
    projectId, 
    bidId: bidId.toString()
  });

  res.status(204).send();
});


// ==================================
// GET PROJECT BIDS
// ==================================
export const getProjectBids = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // Validate project existence
  const project = await Project.findById(projectId).select('client status').lean();
  if (!project) throw new ApiError(404, 'Project not found');

  // Determine if the user is authorized
  const userId = req.user._id.toString();
  const isClient = project.client.toString() === userId;
  const isFreelancer = req.user.role === 'freelancer';

  if (!isClient && !isFreelancer) {
    throw new ApiError(403, 'Unauthorized to view project bids');
  }

  // Fetch and process bids
  const bids = await Bid.find({ project: projectId })
    .populate({
      path: 'freelancer',
      select: 'username _id'
    })
    .sort({ createdAt: -1 })
    .lean();

  // Normalize bid structure
  const processedBids = bids.map(bid => ({
    ...bid,
    _id: bid._id.toString(),
    project: {
      _id: projectId.toString(),
      client: project.client.toString()
    },
    freelancer: {
      _id: bid.freelancer._id.toString(),
      username: bid.freelancer.username
    },
    createdAt: bid.createdAt.toISOString(),
    updatedAt: bid.updatedAt.toISOString()
  }));

  res.json(processedBids);
});

// ==================================
// GET BID BY ID
// ==================================
export const getBidById = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.bidId)
    .populate('freelancer', 'username _id role')
    .populate('project', 'title status client')
    .lean();

  if (!bid) throw new ApiError(404, 'Bid not found');

  // Normalize response
  const responseBid = {
    ...bid,
    _id: bid._id.toString(),
    project: {
      _id: bid.project._id.toString(),
      title: bid.project.title,
      status: bid.project.status,
      client: bid.project.client.toString()
    },
    freelancer: {
      _id: bid.freelancer._id.toString(),
      username: bid.freelancer.username,
      role: bid.freelancer.role
    },
    createdAt: bid.createdAt.toISOString(),
    updatedAt: bid.updatedAt.toISOString()
  };

  res.json(responseBid);
});
