import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const connectSocket = (instanceName: string) => {
  socket.auth = { instanceName };
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export default socket;