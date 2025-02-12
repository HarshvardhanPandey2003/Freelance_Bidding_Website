// src/controllers/bid.controller.js
import asyncHandler from '../utils/asyncHandler.js';
import { Bid } from '../models/Bid.model.js';
import { Project } from '../models/Project.model.js';
import ApiError from '../utils/ApiError.js';
import { io } from '../app.js';

// ==================================
// CREATE BID
// ==================================
export const createBid = asyncHandler(async (req, res) => {
  const { projectId, bidAmount, message } = req.body;

  // Validate project existence and status
  const project = await Project.findById(projectId).select('status client').lean();
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.status !== 'OPEN') throw new ApiError(400, 'Project not accepting bids');

  // Validate user authorization
  if (project.client.toString() === req.user._id.toString()) {
    throw new ApiError(403, 'Project owners cannot bid on their own projects');
  }

  // Check for existing bids
  const existingBid = await Bid.exists({
    project: projectId,
    freelancer: req.user._id
  });
  if (existingBid) throw new ApiError(409, 'You already have an active bid for this project');

  // Create and populate bid
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

  // Structured response with normalized IDs
  const responseBid = {
    ...populatedBid,
    _id: populatedBid._id.toString(),
    project: {
      _id: projectId.toString(),
      client: project.client.toString() // Critical for client validation
    },
    freelancer: {
      _id: populatedBid.freelancer._id.toString(),
      username: populatedBid.freelancer.username
    },
    createdAt: populatedBid.createdAt.toISOString(),
    updatedAt: populatedBid.updatedAt.toISOString()
  };

  // Real-time update
  io.emit('newBid', responseBid);
  res.status(201).json(responseBid);
});
// ==================================
// GET PROJECT BIDS
// ==================================
export const getProjectBids = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // Validate project existence
  const project = await Project.findById(projectId).select('client status').lean();
  if (!project) throw new ApiError(404, 'Project not found');

  // Determine if the user is authorized:
  // - Either they are the client
  // - Or they are a freelancer who has bid on the project
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
      client: project.client.toString() // Essential for frontend checks
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
// GET SPECIFIC BID
// ==================================
export const getBidById = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.bidId)
    .populate('freelancer', 'username _id role')
    .populate('project', 'title status client')
    .lean();

  if (!bid) throw new ApiError(404, 'Bid not found');
  res.json(bid);
});

// ==================================
// UPDATE BID
// ==================================
export const updateBid = asyncHandler(async (req, res) => {
  const { bidId } = req.params;
  const { bidAmount, message } = req.body;

  const bid = await Bid.findById(bidId);

  if (!bid) throw new ApiError(404, 'Bid not found');
  if (bid.freelancer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized to update this bid');
  }
  if (bid.status !== 'PENDING') {
    throw new ApiError(400, 'Cannot update a non-pending bid');
  }

  bid.bidAmount = bidAmount;
  bid.message = message;
  await bid.save();

  // // Emit update to all clients
  // io.emit('bidUpdate', bid);

  const populatedBid = await Bid.findById(bid._id)
  .populate('freelancer', 'username _id')
  .exec();

  io.emit('bidUpdate', populatedBid.toObject());

  res.json(populatedBid);
});

// ==================================
// DELETE BID
// ==================================
export const deleteBid = asyncHandler(async (req, res) => {
  const { bidId } = req.params;

  const bid = await Bid.findById(bidId);
  if (!bid) throw new ApiError(404, 'Bid not found');
  if (bid.freelancer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized to delete this bid');
  }
  if (bid.status !== 'PENDING') {
    throw new ApiError(400, 'Cannot delete a non-pending bid');
  }

  await bid.deleteOne();

  // Notify clients of deletion
  io.emit('bidDelete', { projectId: bid.project.toString(), bidId });

  res.status(204).send();
});