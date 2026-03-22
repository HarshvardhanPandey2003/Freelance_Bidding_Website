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
    // Don't create a second socket if one already exists
    if (!user || socketRef.current) return;

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
      console.log('Socket connected successfully with ID:', instance.id);
      setIsConnected(true);
    });

    instance.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
      setIsConnected(false);
      // Do NOT null socketRef here — socket.io reconnects automatically.
      // Nulling it would make child components crash on the next socket.on() call.
    });

    instance.on('connect_error', (err) => {
      console.error('Socket connection error:', err?.message ?? err);
      setIsConnected(false);
    });

    socketRef.current = instance;

    return () => {
      // ONLY fully destroy the socket when the user logs out.
      // Do NOT destroy on React Strict Mode double-invokes or hot-reloads —
      // those are not real unmounts and would set socket to null while children
      // are still trying to call socket.on(), causing the TypeError crash.
      if (!user) {
        console.log('User logged out — destroying socket.');
        instance.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // We pass socketRef itself (the ref object, not .current) so child components
  // always read the live value via ref.current. isConnected is a proper state
  // value that triggers re-renders when the connection status changes.
  return (
    <SocketContext.Provider value={{ socketRef, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

// useSocket returns the live socket and connection status.
// Components should guard all socket.on() calls with: if (!socket || !isConnected) return;
export const useSocket = () => {
  const { socketRef, isConnected } = useContext(SocketContext);
  return { socket: socketRef?.current ?? null, isConnected };
};