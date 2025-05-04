import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const ChatList = ({ onSelectChat }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await api.get('/api/chats/connections');
        setConnections(response.data.data); // Expected data structure: { data: [...] }
      } catch (error) {
        console.error('Failed to fetch chat connections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  if (loading) {
    return (
      <div className="text-white p-4">Loading chat connections...</div>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <div className="text-white p-4">No chat connections found.</div>
    );
  }

  return (
    <div className="p-4 w-1/3">
      <h2 className="text-xl font-semibold mb-4 text-white">Chats</h2>
      <ul>
        {connections.map((conn) => (
          <li
            key={conn.partnerId}
            className="cursor-pointer p-2 bg-gray-700 rounded-md 
                       hover:bg-gray-600 mb-2 transition-colors"
            onClick={() => onSelectChat(conn)}
          >
            {conn.partnerName || 'Unnamed Partner'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
