//src/frontend/FreelanceProject.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/SocketContext';
import { Bids } from '../components/Bids';

export const FreelanceProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  const [project, setProject] = useState(null);
  const [localBids, setLocalBids] = useState([]);
  const [error, setError] = useState('');
  const [userBid, setUserBid] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch project and bids
  useEffect(() => {
    const fetchData = async () => {
      if (!user || authLoading) return;

      try {
        const [projectRes, bidsRes] = await Promise.all([
          api.get(`/api/projects/${id}`),
          api.get(`/api/bids/project/${id}`)
        ]);

        // Normalize bids data
        const normalizedBids = bidsRes.data.map(bid => ({
          ...bid,
          _id: bid._id?.toString(),
          project: bid.project?.toString(),
          freelancer: {
            ...bid.freelancer,
            _id: bid.freelancer?._id?.toString()
          }
        }));

        setProject(projectRes.data);
        setLocalBids(normalizedBids);

        // Find the user's bid
        const existingBid = normalizedBids.find(
          bid => bid.freelancer?._id === user._id?.toString()
        );
        setUserBid(existingBid);
      } catch (err) {
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, authLoading]);

  // WebSocket event handling
  useEffect(() => {
    if (!socket) return;

    const handleBidEvent = (type, payload) => {
      if (!payload?.project || payload.project.toString() !== id) return;

      setLocalBids(prev => {
        switch (type) {
          case 'new':
            return [...prev, {
              ...payload,
              _id: payload._id?.toString(),
              project: payload.project?.toString(),
              freelancer: {
                ...payload.freelancer,
                _id: payload.freelancer?._id?.toString()
              }
            }];
          case 'update':
            return prev.map(bid =>
              bid._id === payload._id?.toString() ? {
                ...payload,
                _id: payload._id?.toString(),
                project: payload.project?.toString(),
                freelancer: {
                  ...payload.freelancer,
                  _id: payload.freelancer?._id?.toString()
                }
              } : bid
            );
          case 'delete':
            return prev.filter(bid => bid._id !== payload.bidId?.toString());
          default:
            return prev;
        }
      });
    };

    socket.on('newBid', (bid) => handleBidEvent('new', bid));
    socket.on('bidUpdate', (bid) => handleBidEvent('update', bid));
    socket.on('bidDelete', ({ bidId }) => handleBidEvent('delete', { bidId }));

    return () => {
      socket.off('newBid');
      socket.off('bidUpdate');
      socket.off('bidDelete');
    };
  }, [socket, id]);

  // Handle bid deletion
  const handleDeleteBid = async (bidId) => {
    try {
      await api.delete(`/api/bids/${bidId}`);
      setUserBid(null);
      setLocalBids(prev => prev.filter(bid => bid._id !== bidId));
    } catch (err) {
      console.error('Error deleting bid:', err);
    }
  };

  if (authLoading) return <div>Loading...</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!project) return <div>No project found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-400 hover:text-indigo-300 mb-6"
        >
          &larr; Back to Projects
        </button>

        <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
          <p className="text-gray-300 mb-4">{project.description}</p>

          <div className="flex gap-4 text-sm text-gray-400">
            <span>Budget: ${project.budget.toFixed(2)}</span>
            <span>Deadline: {format(new Date(project.deadline), 'PP')}</span>
            <span
              className={`px-2 py-1 rounded-full ${
                project.status === 'OPEN' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {project.status}
            </span>
          </div>

          {project.status === 'OPEN' && (
            <>
              {userBid ? (
                <button
                  onClick={() => navigate(`/edit-bid/${userBid._id}`)} // Using the URL of editing bid for navigation
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                >
                  Edit Your Bid
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/create-bid/${id}`)} // Using the URL of creating bid for navigation
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                >
                  Place Bid
                </button>
              )}
            </>
          )}
        </div>

        <Bids bids={localBids} userBid={userBid} onDelete={handleDeleteBid} />
      </div>
    </div>
  );
};