// frontend/src/pages/CreateBid.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import {socket}  from '../services/socket';

export const CreateBid = () => {
  const params = useParams();
  const projectId = params.projectId || params.id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    bidAmount: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Listen for new bid events
    socket.on('newBid', (newBid) => {
      // Handle the new bid event if needed
      console.log('New bid received:', newBid);
    });

    // Clean up event listeners on component unmount
    return () => {
      socket.off('newBid');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/api/bids', {
        projectId,
        bidAmount: parseFloat(formData.bidAmount),
        message: formData.message
      });

      // Emit the new bid event to the server
      socket.emit('newBid', {
        projectId,
        bidAmount: parseFloat(formData.bidAmount),
        message: formData.message,
        freelancer: user._id
      });

      navigate(`/freelance-project/${projectId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-indigo-400 hover:text-indigo-300"
        >
          &larr; Back to Project
        </button>

        <div className="bg-gray-800/50 rounded-xl p-6 shadow-xl">
          <h1 className="text-3xl font-bold mb-6">Submit Bid Proposal</h1>
          
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
                placeholder="Explain why you're the best fit for this project..."
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
              {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};