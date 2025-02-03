// frontend/src/pages/FreelanceProject.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const FreelanceProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // States for bid submission
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await api.get(`/api/projects/${id}`);
        setProject(data);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!bidAmount || isNaN(bidAmount) || parseFloat(bidAmount) <= 0) {
      setBidError('Please enter a valid bid amount.');
      return;
    }
    try {
      const payload = {
        freelancerId: user._id,
        amount: parseFloat(bidAmount),
        message: bidMessage,
      };
      // Assume the bid endpoint is structured as shown
      await api.post(`/api/projects/${id}/bids`, payload);
      setBidSuccess('Bid submitted successfully.');
      setBidError('');
      setBidAmount('');
      setBidMessage('');
    } catch (err) {
      console.error('Error submitting bid:', err);
      setBidError('Failed to submit bid.');
      setBidSuccess('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex justify-center items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => navigate(-1)} 
          className="text-indigo-500 hover:underline mb-4"
        >
          &larr; Back
        </button>

        <div className="bg-gray-800/50 rounded-2xl p-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <span
              className={`text-xs font-medium rounded-full px-2 py-1 uppercase 
                ${project.status === 'OPEN' 
                  ? 'bg-green-500/90 text-white' 
                  : project.status === 'IN_PROGRESS' 
                  ? 'bg-yellow-500/90 text-gray-800' 
                  : 'bg-gray-500/90 text-white'}`}
            >
              {project.status}
            </span>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-400">{project.description}</p>
          </div>

          {project.skills && project.skills.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Required Skills</h2>
              <ul className="flex flex-wrap gap-2">
                {project.skills.map((skill) => (
                  <li 
                    key={skill} 
                    className="bg-indigo-500/20 text-indigo-300 text-sm font-medium px-2 py-1 rounded"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
            <span>Budget: ${project.budget?.toFixed(2)}</span>
            <span>Deadline: {format(new Date(project.deadline), 'MMM dd, yyyy')}</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-lg mt-6">
          <h2 className="text-2xl font-bold mb-4">Place Your Bid</h2>
          {bidSuccess && <div className="mb-4 text-green-500">{bidSuccess}</div>}
          {bidError && <div className="mb-4 text-red-500">{bidError}</div>}
          <form onSubmit={handleBidSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bid Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border rounded-lg text-white"
                placeholder="Enter your bid amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border rounded-lg text-white"
                placeholder="Enter a message (optional)"
                rows="4"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/30 active:scale-95"
            >
              Submit Bid
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FreelanceProject;
