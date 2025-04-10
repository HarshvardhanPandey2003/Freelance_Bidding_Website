//frontend/src/pages/ClientsProject.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/SocketContext';

const ClientProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [project, setProject] = useState(null);
  const [localBids, setLocalBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch project and bids
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, bidsRes] = await Promise.all([
          api.get(`/api/projects/${id}`),
          api.get(`/api/bids/project/${id}`)//This API gives all the bids in a speciic project 
        ]);

        // Normalize bids data
        const normalizedBids = bidsRes.data.map(bid => ({
          ...bid,
          _id: bid._id?.toString(),
          project: {
            _id: bid.project?._id?.toString(),
            client: bid.project?.client?.toString() // Preserve client as a string inside an object.
          },
          bidAmount: bid.bidAmount || 0,
          freelancer: {
            ...bid.freelancer,
            _id: bid.freelancer?._id?.toString(),
            username: bid.freelancer?.username || 'Unknown'
          }
        }));

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
              project: {
                _id: payload.project?._id?.toString(),
                client: payload.project?.client?.toString() // preserve as object
              },
              bidAmount: payload.bidAmount || 0,
              freelancer: {
                ...payload.freelancer,
                _id: payload.freelancer?._id?.toString(),
                username: payload.freelancer?.username || 'Unknown'
              }
            }];
          case 'update':
            return prev.map(bid =>
              bid._id === payload._id?.toString() ? {
                ...payload,
                _id: payload._id?.toString(),
                project: {
                  _id: payload.project?._id?.toString(),
                  client: payload.project?.client?.toString()
                },
                bidAmount: payload.bidAmount || 0,
                freelancer: {
                  ...payload.freelancer,
                  _id: payload.freelancer?._id?.toString(),
                  username: payload.freelancer?.username || 'Unknown'
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!project) return null;
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
          <h2 className="text-2xl font-bold mb-4">Bids</h2>
          {localBids.length === 0 ? (
            <p className="text-gray-400">No bids added by freelancers yet.</p>
          ) : (
            <div className="space-y-4">
              {localBids.map((bid) => (
                <div 
                    key={bid._id} 
                    className="bg-gray-700/50 p-4 rounded-lg cursor-pointer"
                    onClick={() => navigate(`/confirmbid/${project._id}/${bid.freelancer._id}/${bid._id}`)}
                  >
                    {/* bid content */}
                    <p className="text-indigo-400 font-medium">
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