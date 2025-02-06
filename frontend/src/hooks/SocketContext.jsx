// frontend/src/context/SocketContext.js
//This function keeps the app updated with live bid changes using web sockets and shares the latest bid data across the app. 🚀
import React, { createContext, useEffect, useContext, useState } from 'react';
import socket from '../services/socket';
import { useAuth } from '../hooks/useAuth';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [bids, setBids] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Handle incoming 'newBid' event
    socket.on('newBid', (newBid) => {
      setBids((prevBids) => [...prevBids, newBid]);
    });

    // Handle incoming 'bidUpdate' event
    socket.on('bidUpdate', (updatedBid) => {
      setBids((prevBids) =>
        prevBids.map((bid) => (bid._id === updatedBid._id ? updatedBid : bid))
      );
    });

    // Clean up event listeners on component unmount
    return () => {
      socket.off('newBid');
      socket.off('bidUpdate');
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ bids }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);