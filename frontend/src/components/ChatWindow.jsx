import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '../hooks/SocketContext';
import ChatMessage from './ChatMessage';

const ChatWindow = ({ currentUser, partner }) => {
  const { socket } = useSocket();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom on new messages.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize the chat session when partner and socket are available.
  useEffect(() => {
    if (!socket || !partner) return;

    setIsConnecting(true);
    setError(null);

    socket.emit('startChat', { partnerId: partner.partnerId }, (res) => {
      setIsConnecting(false);
      if (res.error) {
        console.error('Chat initialization error:', res.error);
        setError(res.error);
      } else {
        setRoom(res.room);
        setMessages(Array.isArray(res.messages) ? res.messages : []);
      }
    });

    const handleReceiveMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [partner, socket]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !room || !socket) return;

    const payload = {
      room,
      partnerId: partner.partnerId,
      message: newMessage.trim()
    };

    socket.emit('sendMessage', payload, (res) => {
      if (res?.error) {
        console.error('Failed to send message:', res.error);
        setError('Failed to send message. Please try again.');
      }
    });

    // Optimistically update the UI.
    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now().toString(),
        sender: currentUser._id,
        receiver: partner.partnerId,
        message: newMessage.trim(),
        timestamp: new Date()
      }
    ]);

    setNewMessage('');
  };

  return (
    <div className="flex flex-col flex-1 border-l border-gray-700 p-4 h-screen">
      <div className="mb-4 text-white">
        {isConnecting ? (
          'Connecting to chat...'
        ) : (
          <>
            Chat with{' '}
            <span className="font-semibold">
              {partner?.partnerName || 'Unknown'}
            </span>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-900 text-white p-3 mb-4 rounded">
          Error: {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto mb-4 pr-2">
        {messages.length === 0 ? (
          <div className="text-gray-400 italic text-center mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatMessage
              key={msg._id || idx}
              message={msg}
              currentUserId={currentUser._id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-l-md 
                     bg-gray-800 text-white focus:outline-none"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={!room || isConnecting}
        />
        <button
          type="submit"
          className={`${
            !room || isConnecting
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-violet-500 hover:bg-violet-600 cursor-pointer'
          } text-white font-medium py-2 px-4 rounded-r-md transition-colors`}
          disabled={!room || isConnecting}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
