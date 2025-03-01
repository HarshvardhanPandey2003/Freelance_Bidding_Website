// frontend/src/components/Bids.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import  { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Bids = ({ bids, onDelete }) => {
  const { user, loading: authLoading } = useAuth(); // Use AuthProvider
  // const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
//  console.log(`Bids component: user: ${user.data}, authLoading: ${authLoading}`);
  if (authLoading) return <div>Loading...</div>;

  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Current Bids</h2>
      
      {bids.length === 0 ? (
        <p className="text-gray-400">No bids placed yet</p>
      ) : (
        <div className="space-y-4">
          {bids.map(bid => (
            // Make the container relative so that the absolute button is positioned within it
            <div key={bid._id} className="bg-gray-700/50 p-4 rounded-lg relative">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-indigo-400 font-medium">
                    ${bid.bidAmount.toFixed(2)}
                  </p>
                  {bid.message && (
                    <p className="text-gray-300 mt-1">{bid.message}</p>
                  )}
                  <p className="text-sm text-gray-400 mt-2">
                    By {bid.freelancer.username}
                  </p>
                  <Link
                    to={`/freelancer-message/${bid.freelancer._id}`}
                    className="text-indigo-400 hover:text-indigo-300 text-sm"
                  >
                    View Profile
                  </Link>
                </div>
                {/* Only show Delete button for the bid owner (freelancer) */}
                {user?._id?.toString() === bid.freelancer?._id?.toString() && (
                  <>
                {console.log(`Rendering delete button for bid ${bid._id}`)}
                  <button
                    onClick={() => onDelete(bid._id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                  </>
                )}
              </div>
              {console.log(`Rendering Select button for bid ${bid.project.client}`)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
