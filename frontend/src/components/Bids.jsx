// frontend/src/components/Bids.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export const Bids = ({ bids, onDelete }) => {
  const { user, loading: authLoading } = useAuth();
  
  if (authLoading) return <div>Loading...</div>;

  // Add a safety check: ensure 'bids' is actually an array before mapping
  if (!Array.isArray(bids)) return <p>Error loading bids.</p>;

  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Current Bids</h2>

      {bids.length === 0 ? (
        <p className="text-gray-400">No bids placed yet</p>
      ) : (
        <div className="space-y-4">
          {bids
            // 1. SAFEGUARD: Filter out any completely null/undefined bids
            .filter(bid => bid !== null && bid !== undefined)
            .map(bid => (
            <div key={bid._id} className="bg-gray-700/50 p-4 rounded-lg relative">
              <div className="flex justify-between items-start">
                <div>
                  {/* 2. SAFEGUARD: Ensure bidAmount exists before calling toFixed */}
                  <p className="text-indigo-400 font-medium">
                    ${Number(bid.bidAmount || 0).toFixed(2)}
                  </p>
                  
                  {bid.message && (
                    <p className="text-gray-300 mt-1">{bid.message}</p>
                  )}
                  
                  {/* 3. SAFEGUARD: Optional chaining for freelancer data */}
                  <p className="text-sm text-gray-400 mt-2">
                    By {bid.freelancer?.username || 'Unknown User'}
                  </p>
                  
                  {/* Only render profile link if freelancer ID exists */}
                  {bid.freelancer?._id && (
                    <Link
                      to={`/freelancer-message/${bid.freelancer._id}`}
                      className="text-indigo-400 hover:text-indigo-300 text-sm"
                    >
                      View Profile
                    </Link>
                  )}
                </div>

                {/* 4. SAFEGUARD: Optional chaining on IDs for the delete button */}
                {user?._id?.toString() === bid.freelancer?._id?.toString() && (
                  <>
                    <button
                      onClick={() => onDelete(bid._id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};