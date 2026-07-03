const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const aboutRoutes = require('./routes/about');
const mediaRoutes = require('./routes/media');
const articlesRoutes = require('./routes/articles');
const postsRoutes = require('./routes/posts');

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json({ limit: '5mb' }));
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);
app.use(morgan('combined'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/posts', postsRoutes);

// serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Prometheus metrics (optional)
try {
  const client = require('prom-client');
  const collectDefaultMetrics = client.collectDefaultMetrics;
  collectDefaultMetrics();
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  });
} catch (e) {
  // prom-client not installed
}

module.exports = app;
