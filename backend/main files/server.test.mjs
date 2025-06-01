import request from 'supertest';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';

let app, httpServer, io, serverInstance;

beforeAll((done) => {
  app = express();
  app.use(cors());

  // In-memory store for evaluations (reset for each test run)
  const evaluations = [];

  // REST endpoint
  app.get('/api/evaluations', (req, res) => {
    res.json(evaluations);
  });

  httpServer = createServer(app);
  io = new SocketServer(httpServer, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    socket.emit('all-evals', evaluations);

    socket.on('submit-eval', (data) => {
      evaluations.push(data);
      io.emit('new-eval', data);
    });
  });

  serverInstance = httpServer.listen(() => done());
});

afterAll((done) => {
  io.close();
  serverInstance.close(done);
});

describe('REST API', () => {
  it('should return empty evaluations array initially', async () => {
    const res = await request(app).get('/api/evaluations');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('Socket.IO', () => {
  let clientSocket, ioClient;

  beforeAll(async () => {
    // Dynamically import socket.io-client for ESM
    const { default: ioClientLib } = await import('socket.io-client');
    ioClient = ioClientLib;
  });

  afterEach(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  it('should receive all-evals on connect', (done) => {
    clientSocket = ioClient(`http://localhost:${serverInstance.address().port}`);
    clientSocket.on('all-evals', (data) => {
      expect(Array.isArray(data)).toBe(true);
      done();
    });
  });

  it('should broadcast new-eval when submit-eval is sent', (done) => {
    clientSocket = ioClient(`http://localhost:${serverInstance.address().port}`);
    const evalData = {
      from: 'test-from',
      to: 'test-to',
      score: 8,
      timestamp: new Date().toISOString(),
    };
    clientSocket.on('all-evals', () => {
      clientSocket.emit('submit-eval', evalData);
    });
    clientSocket.on('new-eval', (data) => {
      expect(data).toMatchObject(evalData);
      done();
    });
  });
});