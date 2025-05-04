import React from 'react';

const ChatMessage = ({ message, currentUserId }) => {
  const isMine = message.sender === currentUserId;
  return (
    <div className={`mb-2 flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs p-2 rounded-md shadow-md text-sm ${
          isMine ? 'bg-violet-500 text-white' : 'bg-gray-700 text-gray-200'
        }`}
      >
        <p>{message.message}</p>
        <span className="text-xs block mt-1 opacity-75">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
