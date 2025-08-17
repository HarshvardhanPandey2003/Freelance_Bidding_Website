// src/hooks/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      // Automatically choose URL based on environment
      // const socketUrl = import.meta.env.PROD 
      //   ? window.location.origin 
      //   : import.meta.env.VITE_API_URL;
      const socketUrl = window.location.origin 

      console.log(`Socket connecting to: ${socketUrl} (Production: ${import.meta.env.PROD})`);

      const socketInstance = io(socketUrl, {
        withCredentials: true,
        auth: { userId: user._id },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected successfully');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        setIsConnected(false);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
        setIsConnected(false);
      };
    } else {
      setSocket(null);
      setIsConnected(false);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
