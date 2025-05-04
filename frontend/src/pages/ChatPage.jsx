import React, { useState } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { useAuth } from '../hooks/useAuth';

const ChatPage = () => {
  const { user } = useAuth();
  const [selectedPartner, setSelectedPartner] = useState(null);

  return (
    <div className="flex h-screen">
      <ChatList onSelectChat={(partner) => setSelectedPartner(partner)} />
      {selectedPartner ? (
        <ChatWindow currentUser={user} partner={selectedPartner} />
      ) : (
        <div className="flex-1 p-4 text-white">
          Please select a chat from the list.
        </div>
      )}
    </div>
  );
};

export default ChatPage;
