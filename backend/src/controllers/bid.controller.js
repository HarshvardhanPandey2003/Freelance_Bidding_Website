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

  // Validate project and status
  const project = await Project.findById(projectId);
  if (!project || project.status !== 'OPEN') {
    throw new ApiError(400, 'Project not available for bidding');
  }

  // Prevent project owner from bidding
  if (project.client.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'Cannot bid on your own project');
  }

  // Check for existing bids
  const existingBid = await Bid.findOne({
    project: projectId,
    freelancer: req.user._id
  });

  if (existingBid) {
    throw new ApiError(400, 'You already have an active bid for this project');
  }

  // Create the bid
  const bid = await Bid.create({
    project: projectId,
    freelancer: req.user._id,
    bidAmount,
    message
  });

  // Respond with populated data
  const populatedBid = await Bid.findById(bid._id)
  .populate('freelancer', 'username _id')
  .lean();

// Ensure required fields exist
const serializedBid = {
  ...populatedBid,
  _id: populatedBid._id.toString(),
  project: populatedBid.project.toString(),
  bidAmount: populatedBid.bidAmount, // Ensure this exists
  freelancer: {
    _id: populatedBid.freelancer._id.toString(),
    username: populatedBid.freelancer.username
  }
};

io.emit('newBid', serializedBid);
  res.status(201).json(serializedBid);
});

// ==================================
// GET PROJECT BIDS
// ==================================
export const getProjectBids = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // Check if project exists
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  // Fetch and populate bids
  const bids = await Bid.find({ project: projectId })
    .populate('freelancer', 'username rating')
    .populate('project', 'title status')
    .sort({ createdAt: -1 })
    .lean();

  res.json(bids);
});

// ==================================
// GET SPECIFIC BID
// ==================================
export const getBidById = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.bidId)
    .populate('freelancer', 'username rating')
    .populate('project', 'title status')
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
  .populate('freelancer', 'username rating')
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