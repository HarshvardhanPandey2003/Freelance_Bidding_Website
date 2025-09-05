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
      // Don't pass an explicit origin URL — let socket.io default to current origin.
      // Explicitly set the socket path so it goes through Vite proxy in dev or Ingress in prod.
      console.log(`Socket connecting to origin: ${typeof window !== 'undefined' ? window.location.origin : 'unknown' } (Production: ${import.meta.env.PROD})`);

      const socketInstance = io(undefined, {
        path: '/socket.io',
        withCredentials: true,
        auth: { userId: user._id },  // user auth payload
        reconnection: true, // AUTO-RECONNECT if connection drops
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
        transports: ['websocket'],
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
        console.error('Socket connection error:', err?.message ?? err);
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
