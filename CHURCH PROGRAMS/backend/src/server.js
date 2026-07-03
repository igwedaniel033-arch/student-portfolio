require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const initSocket = require('./socket');

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected');

    const server = http.createServer(app);
    const io = initSocket(server, app);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Socket.io enabled');
    });

    // attach io to app for route-level events
    app.set('io', io);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
