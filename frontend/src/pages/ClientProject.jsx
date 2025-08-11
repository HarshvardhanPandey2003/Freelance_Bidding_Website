import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/SocketContext';

const ClientProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [project, setProject] = useState(null);
  const [localBids, setLocalBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);

  // Normalize bid data helper
  const normalizeBid = (bid) => ({
    ...bid,
    _id: bid._id?.toString(),
    project: {
      _id: bid.project?._id?.toString() || bid.project?.toString() || id,
      client: bid.project?.client?.toString()
    },
    bidAmount: Number(bid.bidAmount) || 0,
    freelancer: {
      ...bid.freelancer,
      _id: bid.freelancer?._id?.toString(),
      username: bid.freelancer?.username || 'Unknown'
    }
  });

  // Fetch project and bids
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, bidsRes] = await Promise.all([
          api.get(`/api/projects/${id}`),
          api.get(`/api/bids/project/${id}`)
        ]);

        const normalizedBids = bidsRes.data.map(normalizeBid);

        setProject(projectRes.data);
        setLocalBids(normalizedBids);
      } catch (err) {
        setError('Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Socket connection and event handling
  useEffect(() => {
    if (!socket || !id) return;

    let cleanup = [];
    let eventListenersSetup = false;

    const setupEventListeners = () => {
      if (eventListenersSetup) return;
      
      console.log('Setting up bid event listeners for client');
      
      const handleNewBid = (bidData) => {
        console.log('Client received newBid:', bidData);
        
        // Verify this is for current project
        const bidProjectId = bidData.project?._id?.toString() || bidData.project?.toString();
        if (bidProjectId !== id) {
          console.log('Bid not for current project, ignoring');
          return;
        }

        setLocalBids(prev => {
          const existingIndex = prev.findIndex(bid => bid._id === bidData._id?.toString());
          if (existingIndex >= 0) {
            console.log('Bid already exists, preventing duplicate');
            return prev;
          }
          
          const normalizedBid = normalizeBid(bidData);
          console.log('Adding new bid to client state:', normalizedBid);
          return [...prev, normalizedBid];
        });
      };

      const handleBidUpdate = (bidData) => {
        console.log('Client received bidUpdate:', bidData);
        
        const bidProjectId = bidData.project?._id?.toString() || bidData.project?.toString();
        if (bidProjectId !== id) return;

        setLocalBids(prev => prev.map(bid => 
          bid._id === bidData._id?.toString() ? normalizeBid(bidData) : bid
        ));
      };

      const handleBidDelete = ({ projectId, bidId }) => {
        console.log('Client received bidDelete:', { projectId, bidId });
        
        if (projectId !== id) return;

        setLocalBids(prev => prev.filter(bid => bid._id !== bidId?.toString()));
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
      console.log(`Client joining project room: ${id}`);
      socket.emit('joinProject', id);

      const handleJoinedProject = ({ projectId }) => {
        if (projectId === id) {
          console.log('Client successfully joined project room');
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
      console.log('Cleaning up client socket listeners');
      cleanup.forEach(fn => fn());
    };
  }, [socket, id, isConnected]);

  // Rest of your component remains the same...
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
          ← Back
        </button>

        {/* Socket Connection Status */}
        <div className="mb-4 text-sm">
          <span className={`px-2 py-1 rounded ${socketConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            Real-time: {socketConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

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
          <h2 className="text-2xl font-bold mb-4">
            Bids ({localBids.length})
            {socketConnected && (
              <span className="text-sm text-green-400 ml-2">• Live Updates</span>
            )}
          </h2>
          {localBids.length === 0 ? (
            <p className="text-gray-400">No bids added by freelancers yet.</p>
          ) : (
            <div className="space-y-4">
              {localBids.map((bid) => (
                <div 
                  key={bid._id} 
                  className="bg-gray-700/50 p-4 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-colors"
                  onClick={() => navigate(`/confirmbid/${project._id}/${bid.freelancer._id}/${bid._id}`)}
                >
                  <p className="text-indigo-400 font-medium text-lg">
                    ${bid.bidAmount?.toFixed(2) || '0.00'}
                  </p>
                  {bid.message && (
                    <p className="text-gray-300 mt-1">{bid.message}</p>
                  )}
                  <p className="text-sm text-gray-400 mt-2">
                    By {bid.freelancer.username}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientProject;
