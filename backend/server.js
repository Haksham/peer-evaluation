const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require('./config/db.js');
const hostRoutes = require('./routes/host.js');
const clientRoutes = require('./routes/client.js');
const reviewRoutes = require('./routes/review.js');
dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.PROCESS_URL,
}));

app.use(express.json());
connectDB();

// Prometheus metrics setup
const client = require('prom-client');
const register = client.register;
const Counter = client.Counter;
const Histogram = client.Histogram;

const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status']
});

const requestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10]
});

// Middleware to collect metrics
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestCounter.inc({
      method: req.method,
      path: req.route ? req.route.path : req.path,
      status: res.statusCode.toString()
    });
    requestDuration.observe({
      method: req.method,
      path: req.route ? req.route.path : req.path,
      status: res.statusCode.toString()
    }, duration / 1000);
  });

  next();
});

app.use('/api/host', hostRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/review', reviewRoutes);

app.get("/", (req, res) => {
  res.send("Express backend is running!");
});

// Prometheus metrics endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    res.setHeader('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end('Error collecting metrics');
  }
});

// Only start server if not in test environment
// if (require.main === module) {
//   app.listen(PORT, () => {
//     console.log(`Server started on http://localhost:${PORT}`);
//   });
// }

module.exports = app;