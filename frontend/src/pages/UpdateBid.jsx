// frontend/src/pages/UpdateBid.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const UpdateBid = () => {
  const { bidId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bidAmount: '',
    message: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState('');

  // Fetch the current bid details
  useEffect(() => {
    const fetchBid = async () => {
      try {
        const res = await api.get(`/api/bids/${bidId}`);
        const bidData = res.data;
        setFormData({
          bidAmount: bidData.bidAmount,
          message: bidData.message
        });
        // Capture the project ID from the bid data so you can redirect properly
        setProjectId(bidData.project._id); // Ensure this is a string
      } catch (err) {
        setError('Failed to fetch bid details');
      } finally {
        setLoading(false);
      }
    };
    fetchBid();
  }, [bidId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await api.put(`/api/bids/${bidId}`, {
        bidAmount: parseFloat(formData.bidAmount),
        message: formData.message
      });
      // After updating, redirect back to the project page
      navigate(`/freelance-project/${projectId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading bid details...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-indigo-400 hover:text-indigo-300"
        >
          &larr; Back
        </button>

        <div className="bg-gray-800/50 rounded-xl p-6 shadow-xl">
          <h1 className="text-3xl font-bold mb-6">Update Bid Proposal</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Bid Amount ($)
              </label>
              <input
                type="number"
                name="bidAmount"
                step="0.01"
                min="1"
                value={formData.bidAmount}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 border-none"
                placeholder="Enter your proposed amount"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Proposal Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 border-none"
                rows="5"
                placeholder="Update your proposal..."
                maxLength="500"
              />
              <p className="text-right text-sm text-gray-400 mt-1">
                {formData.message.length}/500
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                isSubmitting
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isSubmitting ? 'Updating...' : 'Update Proposal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};