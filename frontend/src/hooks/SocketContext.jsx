// src/hooks/SocketContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

const SocketContext = createContext({ socket: null, isConnected: false });

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Guard: only create a socket when user exists and no socket yet
    if (!user) return;
    if (socketRef.current) return;

    const targetUrl = window.location.origin;
    console.log(`Socket connecting to: ${targetUrl}`);

    const instance = io(targetUrl, {
      path: '/socket.io',
      withCredentials: true,
      auth: { userId: user._id },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      transports: ['websocket'],
    });

    instance.on('connect', () => {
      console.log('Socket connected with ID:', instance.id);
      setIsConnected(true);
    });

    instance.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
      setIsConnected(false);
      // ⚠️ Do NOT null socketRef.current here.
      // socket.io manages reconnect internally — if we null the ref,
      // child useEffects crash on their next socket.on() call.
    });

    instance.on('connect_error', (err) => {
      console.error('Socket connection error:', err?.message ?? err);
      setIsConnected(false);
    });

    socketRef.current = instance;

    // Cleanup: runs when user changes (logs out) or component unmounts.
    // We capture 'instance' in the closure so the cleanup always refers
    // to the exact socket this effect created — no stale-ref bugs.
    return () => {
      instance.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      console.log('Socket destroyed.');
    };
  }, [user?._id]); // depend on user._id (a stable string) not the user object

  return (
    <SocketContext.Provider value={{ socketRef, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

// Components always get { socket, isConnected }.
// socket is read from the ref at call-time → always the live instance, never stale.
// isConnected is proper React state → triggers re-renders on connect/disconnect.
export const useSocket = () => {
  const { socketRef, isConnected } = useContext(SocketContext);
  return { socket: socketRef?.current ?? null, isConnected };
};