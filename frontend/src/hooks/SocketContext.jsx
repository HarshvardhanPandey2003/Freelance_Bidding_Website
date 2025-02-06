// frontend/src/context/SocketContext.js
//This function keeps the app updated with live bid changes using web sockets and shares the latest bid data across the app. 🚀
import React, { createContext, useContext } from 'react';
import socket from '../services/socket';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);