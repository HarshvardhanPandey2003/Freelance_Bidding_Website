// src/hooks/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  // socketRef holds the live socket instance.
  // We intentionally do NOT put the socket in useState — doing so causes a
  // null-flash race condition: when setSocket(null) fires during cleanup,
  // React batches it and child components briefly see socket=null while
  // the WebSocket is still alive. Any socket.on() call in that window crashes.
  const socketRef = useRef(null);

  // socketReady is purely a render-trigger so components re-render
  // when the socket is first created. We never set it back to false.
  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    // Create socket only when user is present and no socket exists yet.
    if (user && !socketRef.current) {
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
        transports: ['websocket'],
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected successfully with ID:', socketInstance.id);
        setIsConnected(true);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected. Reason:', reason);
        setIsConnected(false);
        // NOTE: We do NOT set socketRef.current = null here.
        // Socket.io handles reconnection internally. If we null the ref,
        // child useEffects would crash when they try socket.on() on reconnect.
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Socket connection error:', err?.message ?? err);
        setIsConnected(false);
      });

      socketRef.current = socketInstance;
      // Trigger exactly one re-render so children pick up the new socket ref.
      setSocketReady(true);
    }

    return () => {
      // Only truly destroy the socket when the user logs out (user → null).
      // Do NOT destroy on Strict Mode double-invoke or hot-reload re-runs —
      // those are not real unmounts and nulling the socket here causes the crash.
      if (!user && socketRef.current) {
        console.log('User logged out — destroying socket.');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setSocketReady(false);
      }
    };
  }, [user]);

  return (
    // Expose socketRef.current directly — this is always the live instance.
    // It never becomes null while the user is logged in.
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);