import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    s.on('connect', () => {
      setConnected(true);
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const joinHospital = (hospitalId) => {
    if (socket && hospitalId) {
      socket.emit('join:hospital', hospitalId);
    }
  };

  const leaveHospital = (hospitalId) => {
    if (socket && hospitalId) {
      socket.emit('leave:hospital', hospitalId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, joinHospital, leaveHospital }}>
      {children}
    </SocketContext.Provider>
  );
};
