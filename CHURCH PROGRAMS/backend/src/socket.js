function initSocket(server, app) {
  const { Server } = require('socket.io');
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Authorization'],
    },
    maxHttpBufferSize: 1e6,
  });

  app.set('io', io);

  io.on('connection', (socket) => {
    console.log('Client connected', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected', socket.id);
    });

    socket.on('joinRoom', (room) => {
      socket.join(room);
      socket.emit('roomJoined', room);
    });

    socket.on('leaveRoom', (room) => {
      socket.leave(room);
      socket.emit('roomLeft', room);
    });

    socket.on('missionUpdate', (data) => {
      // Broadcast mission updates to listeners
      io.emit('missionUpdated', data);
    });
  });

  return io;
}

module.exports = initSocket;
