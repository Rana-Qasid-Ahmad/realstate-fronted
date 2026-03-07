// ============================================================
// SocketContext.jsx — Manages the WebSocket (real-time) connection
//
// Socket.io = library for real-time 2-way communication
// WebSocket = a persistent connection between browser and server
// (unlike regular HTTP which only connects when you make a request)
// ============================================================

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../utils/api';

// Create the context
const SocketContext = createContext(null);


// ============================================================
// SocketProvider
// ============================================================
export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // useRef stores the socket without causing re-renders
  const socketRef = useRef(null);

  // -------------------------------------------------------
  // Connect/disconnect the socket when user logs in/out
  // -------------------------------------------------------
  useEffect(() => {
    // If no user is logged in, make sure we're disconnected
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    // Get the saved token for socket authentication
    const token = localStorage.getItem('token');

    // Connect to the socket server
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },             // Send the token so the server can identify us
      transports: ['websocket', 'polling'],   // Use WebSocket transport (faster than polling)
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket error:', error.message);
    });

    // When we receive an unread_update event, increment the badge count
    newSocket.on('unread_update', () => {
      setUnreadCount((previousCount) => previousCount + 1);
    });

    // Save references
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Cleanup: disconnect when the component unmounts or user changes
    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [user]);


  // -------------------------------------------------------
  // Fetch the total unread count from the server
  // Used when the app first loads or when opening the inbox
  // -------------------------------------------------------
  async function fetchUnreadCount() {
    try {
      const response = await api.get('/chat/unread');
      setUnreadCount(response.data.total || 0);
    } catch (error) {
      // If it fails, keep the current count
    }
  }

  // Fetch unread count when user logs in
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [user]);


  const contextValue = {
    socket,
    unreadCount,
    setUnreadCount,
    fetchUnreadCount,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}


// Custom hook to use socket in any component
export function useSocket() {
  return useContext(SocketContext);
}
