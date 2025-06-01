const express = require('express');
const http = require('http');
const cors = require('cors');
const app = express();
const {Server} = require('socket.io');
const port = 4000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const rooms = {}; // { roomId: { host: socket.id, clients: [] } }
const pendingRoomDeletion = {}; // { roomId: timeoutId }
let sessionTimers = {}; // { roomId: { timer: Timeout, index: number } }

io.on('connection', (socket) => {
  socket.on('createRoom', ({ roomId, hostName }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = { host: socket.id, clients: [] };
      socket.join(roomId);
      socket.emit('roomCreated', { roomId });
      console.log(`Room created: ${roomId} by ${hostName}`);
    }
  });

  socket.on('joinRoom', ({ roomId, name, usn, role }) => {
    // If host rejoins, cancel pending deletion
    if (pendingRoomDeletion[roomId] && role === "host") {
      clearTimeout(pendingRoomDeletion[roomId]);
      delete pendingRoomDeletion[roomId];
    }

    if (!rooms[roomId]) {
      if (role === "host") {
        // Host creates the room if it doesn't exist
        rooms[roomId] = { host: socket.id, clients: [{ id: socket.id, name, usn, role }] };
        socket.join(roomId);
        io.to(roomId).emit('users', rooms[roomId].clients);
      } else {
        socket.emit('roomNotFound');
      }
    } else {
      // If host rejoins, update host socket id
      if (role === "host") {
        rooms[roomId].host = socket.id;
        // Optionally update host info in clients array
        const hostIndex = rooms[roomId].clients.findIndex(u => u.role === "host");
        if (hostIndex !== -1) {
          rooms[roomId].clients[hostIndex] = { id: socket.id, name, usn, role };
        } else {
          rooms[roomId].clients.push({ id: socket.id, name, usn, role });
        }
      } else {
        // Prevent duplicate clients
        if (!rooms[roomId].clients.some(u => u.id === socket.id)) {
          rooms[roomId].clients.push({ id: socket.id, name, usn, role });
        }
      }
      socket.join(roomId);
      io.to(roomId).emit('users', rooms[roomId].clients);
    }

    // After joining, send current session state if session is running
    if (sessionTimers[roomId]) {
      const clients = rooms[roomId].clients.filter(u => u.role === "client");
      const index = sessionTimers[roomId].index;
      const currentClient = clients[index];
      // Calculate time left for current client
      let timeLeft = 0;
      if (sessionTimers[roomId].timerStart && sessionTimers[roomId].clientDuration) {
        const elapsed = Math.floor((Date.now() - sessionTimers[roomId].timerStart) / 1000);
        timeLeft = Math.max(sessionTimers[roomId].clientDuration - elapsed, 0);
      }
      socket.emit('sessionState', {
        sessionStarted: true,
        currentClient,
        timeLeft
      });
    }
  });

  socket.on('startSession', ({ roomId }) => {
    if (!rooms[roomId]) return;
    const clients = rooms[roomId].clients.filter(u => u.role === "client");
    if (clients.length === 0) return;

    let index = 0;
    io.to(roomId).emit('sessionStarted');
    // Show the first client
    io.to(roomId).emit('showClient', clients[index]);
    sessionTimers[roomId] = {
      index,
      timer: setInterval(() => {
        index++;
        if (index < clients.length) {
          io.to(roomId).emit('showClient', clients[index]);
          sessionTimers[roomId].index = index;
        } else {
          clearInterval(sessionTimers[roomId].timer);
          delete sessionTimers[roomId];
          io.to(roomId).emit('sessionStopped');
        }
      }, 10000) // 10 seconds per client
    };
  });

  socket.on('stopSession', ({ roomId }) => {
    if (sessionTimers[roomId]) {
      clearInterval(sessionTimers[roomId].timer);
      delete sessionTimers[roomId];
    }
    io.to(roomId).emit('sessionStopped');
  });

  socket.on('pauseSession', ({ roomId }) => {
    if (sessionTimers[roomId]) {
      clearInterval(sessionTimers[roomId].timer);
      sessionTimers[roomId].paused = true;
      io.to(roomId).emit('sessionPaused');
    }
  });

  socket.on('resumeSession', ({ roomId }) => {
    if (sessionTimers[roomId] && sessionTimers[roomId].paused) {
      sessionTimers[roomId].paused = false;
      let index = sessionTimers[roomId].index;
      const clients = rooms[roomId].clients.filter(u => u.role === "client");
      sessionTimers[roomId].timer = setInterval(() => {
        index++;
        if (index < clients.length) {
          io.to(roomId).emit('showClient', clients[index]);
          sessionTimers[roomId].index = index;
        } else {
          clearInterval(sessionTimers[roomId].timer);
          delete sessionTimers[roomId];
          io.to(roomId).emit('sessionStopped');
        }
      }, 10000);
      io.to(roomId).emit('sessionResumed');
    }
  });

  socket.on('nextClient', ({ roomId }) => {
    if (!rooms[roomId] || !sessionTimers[roomId]) return;
    const clients = rooms[roomId].clients.filter(u => u.role === "client");
    let index = sessionTimers[roomId].index + 1;
    if (index < clients.length) {
      sessionTimers[roomId].index = index;
      io.to(roomId).emit('showClient', clients[index]);
    }
  });

  socket.on('prevClient', ({ roomId }) => {
    if (!rooms[roomId] || !sessionTimers[roomId]) return;
    const clients = rooms[roomId].clients.filter(u => u.role === "client");
    let index = sessionTimers[roomId].index - 1;
    if (index >= 0) {
      sessionTimers[roomId].index = index;
      io.to(roomId).emit('showClient', clients[index]);
    }
  });

  socket.on('disconnect', () => {
    // Remove user from rooms
    for (const roomId in rooms) {
      rooms[roomId].clients = rooms[roomId].clients.filter(c => c.id !== socket.id);
      if (rooms[roomId].host === socket.id) {
        // Instead of deleting immediately, set a timeout
        pendingRoomDeletion[roomId] = setTimeout(() => {
          delete rooms[roomId];
          io.to(roomId).emit('roomClosed');
          delete pendingRoomDeletion[roomId];
        }, 5000); // 5 seconds grace period
      } else {
        io.to(roomId).emit('users', rooms[roomId].clients);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});