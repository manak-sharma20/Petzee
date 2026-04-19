import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('petzee_token') },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-user', user.id);
    });

    socket.on('disconnect', () => setConnected(false));

    socketRef.current = socket;

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [user]);

  const joinConsultation = (consultationId) => {
    socketRef.current?.emit('join-consultation', { consultationId, userId: user?.id });
  };

  const sendMessage = (consultationId, content) => {
    socketRef.current?.emit('send-message', { consultationId, senderId: user?.id, content });
  };

  const emitTyping = (consultationId, isTyping) => {
    const event = isTyping ? 'typing' : 'stop-typing';
    socketRef.current?.emit(event, { consultationId, userId: user?.id, name: user?.name });
  };

  const onEvent = (event, cb) => { socketRef.current?.on(event, cb); };
  const offEvent = (event, cb) => { socketRef.current?.off(event, cb); };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, joinConsultation, sendMessage, emitTyping, onEvent, offEvent }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
