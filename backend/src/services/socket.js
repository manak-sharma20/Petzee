import prisma from '../utils/prisma.js';

export const initSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Join personal notification room
    socket.on('join-user', (userId) => {
      socket.join(`user:${userId}`);
    });

    // Join a consultation room
    socket.on('join-consultation', async ({ consultationId, userId }) => {
      socket.join(`consultation:${consultationId}`);
      socket.to(`consultation:${consultationId}`).emit('user-joined', { userId });
    });

    // Handle chat message
    socket.on('send-message', async ({ consultationId, senderId, content }) => {
      try {
        // Persist to DB
        const message = await prisma.message.create({
          data: { consultationId, senderId, content },
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
          },
        });

        // Broadcast to room
        io.to(`consultation:${consultationId}`).emit('new-message', message);
      } catch (err) {
        socket.emit('message-error', { error: 'Failed to send message' });
        console.error('[Socket] Message error:', err);
      }
    });

    // Typing indicators
    socket.on('typing', ({ consultationId, userId, name }) => {
      socket.to(`consultation:${consultationId}`).emit('typing', { userId, name });
    });

    socket.on('stop-typing', ({ consultationId, userId }) => {
      socket.to(`consultation:${consultationId}`).emit('stop-typing', { userId });
    });

    socket.on('leave-consultation', ({ consultationId }) => {
      socket.leave(`consultation:${consultationId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
};
