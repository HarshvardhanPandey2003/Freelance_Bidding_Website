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
  const { socket, isConnected } = useSocket();
  const [project, setProject] = useState(null);
  const [localBids, setLocalBids] = useState([]);
  const [error, setError] = useState('');
  const [userBid, setUserBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  // Normalize bid data helper
  const normalizeBid = (bid) => ({
    ...bid,
    _id: bid._id?.toString(),
    project: bid.project?.toString() || id,
    freelancer: {
      ...bid.freelancer,
      _id: bid.freelancer?._id?.toString()
    }
  });

  // Fetch project and bids
  useEffect(() => {
    const fetchData = async () => {
      if (!user || authLoading) return;

      try {
        const [projectRes, bidsRes] = await Promise.all([
          api.get(`/api/projects/${id}`),
          api.get(`/api/bids/project/${id}`)
        ]);

        const normalizedBids = bidsRes.data.map(normalizeBid);

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

  // Socket connection and event handling
  useEffect(() => {
    if (!socket || !id || !user) return;

    let cleanup = [];
    let eventListenersSetup = false;

    const setupEventListeners = () => {
      if (eventListenersSetup) return;
      
      console.log('Setting up bid event listeners for freelancer');
      
      const handleNewBid = (bidData) => {
        console.log('Freelancer received newBid:', bidData);
        
        const bidProjectId = bidData.project?._id?.toString() || bidData.project?.toString();
        if (bidProjectId !== id) return;

        setLocalBids(prev => {
          const existingIndex = prev.findIndex(bid => bid._id === bidData._id?.toString());
          if (existingIndex >= 0) return prev;
          
          const normalizedBid = normalizeBid(bidData);
          
          // Update userBid if this is the current user's bid
          if (bidData.freelancer?._id?.toString() === user._id?.toString()) {
            setUserBid(normalizedBid);
          }

          return [...prev, normalizedBid];
        });
      };

      const handleBidUpdate = (bidData) => {
        console.log('Freelancer received bidUpdate:', bidData);
        
        const bidProjectId = bidData.project?._id?.toString() || bidData.project?.toString();
        if (bidProjectId !== id) return;

        setLocalBids(prev => prev.map(bid => {
          if (bid._id === bidData._id?.toString()) {
            const updatedBid = normalizeBid(bidData);
            
            // Update userBid if this is the current user's bid
            if (bidData.freelancer?._id?.toString() === user._id?.toString()) {
              setUserBid(updatedBid);
            }
            
            return updatedBid;
          }
          return bid;
        }));
      };

      const handleBidDelete = ({ projectId, bidId }) => {
        console.log('Freelancer received bidDelete:', { projectId, bidId });
        
        if (projectId !== id) return;

        setLocalBids(prev => {
          const deletedBid = prev.find(bid => bid._id === bidId?.toString());
          
          // Clear userBid if this was the current user's bid
          if (deletedBid && deletedBid.freelancer?._id === user._id?.toString()) {
            setUserBid(null);
          }

          return prev.filter(bid => bid._id !== bidId?.toString());
        });
      };

      socket.on('newBid', handleNewBid);
      socket.on('bidUpdate', handleBidUpdate);
      socket.on('bidDelete', handleBidDelete);
      
      eventListenersSetup = true;

      cleanup.push(() => {
        socket.off('newBid', handleNewBid);
        socket.off('bidUpdate', handleBidUpdate);
        socket.off('bidDelete', handleBidDelete);
        eventListenersSetup = false;
      });
    };

    const joinProjectRoom = () => {
      console.log(`Freelancer joining project room: ${id}`);
      socket.emit('joinProject', id);

      const handleJoinedProject = ({ projectId }) => {
        if (projectId === id) {
          console.log('Freelancer successfully joined project room');
          setSocketConnected(true);
          setupEventListeners();
        }
      };

      const handleError = ({ message }) => {
        console.error('Socket error:', message);
        setSocketConnected(false);
      };

      socket.on('joinedProject', handleJoinedProject);
      socket.on('error', handleError);

      cleanup.push(() => {
        socket.emit('leaveProject', id);
        socket.off('joinedProject', handleJoinedProject);
        socket.off('error', handleError);
        setSocketConnected(false);
      });
    };

    if (socket.connected) {
      joinProjectRoom();
    } else {
      const handleConnect = () => {
        console.log('Socket connected, joining project room');
        joinProjectRoom();
      };
      
      socket.on('connect', handleConnect);
      cleanup.push(() => socket.off('connect', handleConnect));
    }

    return () => {
      console.log('Cleaning up freelancer socket listeners');
      cleanup.forEach(fn => fn());
    };
  }, [socket, id, user, isConnected]);

  // Handle bid deletion
  const handleDeleteBid = async (bidId) => {
    try {
      await api.delete(`/api/bids/${bidId}`);
      console.log('Bid deletion request sent');
    } catch (err) {
      console.error('Error deleting bid:', err);
      setError('Failed to delete bid');
    }
  };

  // Rest of your component rendering logic remains the same...
  if (authLoading || loading) {
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

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex justify-center items-center">
        <div className="text-white">No project found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-400 hover:text-indigo-300 mb-6"
        >
          ← Back to Projects
        </button>

        {/* Socket Connection Status */}
        <div className="mb-4 text-sm">
          <span className={`px-2 py-1 rounded ${socketConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            Real-time: {socketConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
          <p className="text-gray-300 mb-4">{project.description}</p>

          <div className="flex gap-4 text-sm text-gray-400 mb-4">
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

          {project.skills && project.skills.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill) => (
                  <span 
                    key={skill} 
                    className="bg-indigo-500/20 text-indigo-300 text-sm font-medium px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {project.status === 'OPEN' && (
            <div className="mt-6">
              {userBid ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate(`/edit-bid/${userBid._id}`)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Edit Your Bid
                  </button>
                  <button
                    onClick={() => handleDeleteBid(userBid._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Delete Bid
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/create-bid/${id}`)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Place Bid
                </button>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            All Bids ({localBids.length})
            {socketConnected && (
              <span className="text-sm text-green-400 ml-2">• Live Updates</span>
            )}
          </h2>
          <Bids bids={localBids} userBid={userBid} onDelete={handleDeleteBid} />
        </div>
      </div>
    </div>
  );
};
