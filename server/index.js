import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import authRoutes from './routes/auth.js';
import instanceRoutes from './routes/instances.js';
import groupRoutes from './routes/groups.js';
import chatRoutes from './routes/chats.js';
import scheduleRoutes from './routes/schedules.js';
import clientRoutes from './routes/clients.js';
import { setupWebSocket } from './websocket.js';
import { initializeScheduler } from './services/scheduler.js';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup WebSocket
setupWebSocket(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/instances', instanceRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/clients', clientRoutes);

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Create in-memory MongoDB instance
    const mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();

    await mongoose.connect(mongoUri);
    console.log('Connected to in-memory MongoDB');

    // Create test admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      settings: {
        apiKey: 'admin-api-key-123',
      },
    });

    // Create test client user
    await User.create({
      name: 'Client User',
      email: 'client@example.com',
      password: 'client123',
      role: 'client',
      settings: {
        apiKey: 'client-api-key-123',
      },
    });

    // Initialize scheduler after DB connection
    initializeScheduler();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
});