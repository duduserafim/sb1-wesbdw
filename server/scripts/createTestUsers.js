import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      settings: {
        apiKey: 'admin-api-key-123',
      },
    });

    // Create client user
    await User.create({
      name: 'Client User',
      email: 'client@example.com',
      password: 'client123',
      role: 'client',
      settings: {
        apiKey: 'client-api-key-123',
      },
    });

    console.log('Test users created successfully');
  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createTestUsers();