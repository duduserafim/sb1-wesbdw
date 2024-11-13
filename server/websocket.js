import { evolutionApi } from './services/evolutionApi.js';

export const setupWebSocket = (io) => {
  io.on('connection', (socket) => {
    const { instanceName } = socket.handshake.auth;

    if (instanceName) {
      socket.join(instanceName);
      console.log(`Client connected to instance: ${instanceName}`);

      // Handle instance status updates
      socket.on('instance.status', async () => {
        try {
          const response = await evolutionApi.getInstanceInfo(instanceName);
          io.to(instanceName).emit('instance.status', response.data);
        } catch (error) {
          console.error('Error fetching instance status:', error);
        }
      });

      // Handle message events
      socket.on('message', async (data) => {
        try {
          const response = await evolutionApi.sendMessage(
            instanceName,
            data.chatId,
            data.message
          );
          io.to(instanceName).emit('message.sent', response.data);
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('message.error', error.message);
        }
      });

      // Handle file uploads
      socket.on('file.upload', async (data) => {
        try {
          const response = await evolutionApi.sendFile(
            instanceName,
            data.chatId,
            data.file,
            data.caption
          );
          io.to(instanceName).emit('file.sent', response.data);
        } catch (error) {
          console.error('Error sending file:', error);
          socket.emit('file.error', error.message);
        }
      });
    }

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};