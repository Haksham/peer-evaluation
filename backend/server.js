// backend/server.js
import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());

// In-memory store for evaluations
const evaluations = [];

// When a client connects:
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send all past evaluations
  socket.emit('all-evals', evaluations);

  // Handle new evaluation submission
  socket.on('submit-eval', (data) => {
    evaluations.push(data);
    // Broadcast new evaluation to all (including host)
    io.emit('new-eval', data);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Optionally expose a simple REST endpoint
app.get('/api/evaluations', (req, res) => {
  res.json(evaluations);
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
