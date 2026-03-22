// src/hooks/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Use a ref to hold the instance. This prevents Strict Mode 
  // from thrashing and dropping the WebSocket connection.
  const socketRef = useRef(null);

  useEffect(() => {
    // Only initialize if we have a user AND we haven't already created a socket
    if (user && !socketRef.current) {
      // Explicitly target the window origin so it routes perfectly through your Ingress
      const targetUrl = window.location.origin;
      console.log(`Socket connecting to: ${targetUrl}`);

      const socketInstance = io(targetUrl, {
        path: '/socket.io',
        withCredentials: true,
        auth: { userId: user._id },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
        // Strictly enforcing WebSocket only, zero polling fallback
        transports: ['websocket'], 
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected successfully with ID:', socketInstance.id);
        setIsConnected(true);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected. Reason:', reason);
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Socket connection error:', err?.message ?? err);
        setIsConnected(false);
      });

      // Save to ref for stability, save to state for React reactivity
      socketRef.current = socketInstance;
      setSocket(socketInstance);
    }

    // Cleanup function
    return () => {
      // If the user logs out (user becomes null), we destroy the socket.
      if (!user && socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);