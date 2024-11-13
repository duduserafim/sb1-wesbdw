import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Instance from '../models/Instance.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get all clients (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const clients = await User.find({ role: 'client' }).select('-password');

    // Get instance count for each client
    const clientsWithData = await Promise.all(
      clients.map(async (client) => {
        const instanceCount = await Instance.countDocuments({ owner: client._id });
        return {
          id: client._id,
          name: client.name,
          email: client.email,
          role: client.role,
          status: client.status || 'active',
          instances: instanceCount,
          createdAt: client.createdAt,
        };
      })
    );

    res.json(clientsWithData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients', error: error.message });
  }
});

// Create new client (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, email, password } = req.body;

    // Check if client already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create new client
    const client = new User({
      name,
      email,
      password,
      role: 'client',
      settings: {
        apiKey: Math.random().toString(36).substring(2, 15),
      },
    });

    await client.save();
    res.status(201).json({
      id: client._id,
      name: client.name,
      email: client.email,
      role: client.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating client', error: error.message });
  }
});

// Update client (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, email, password } = req.body;
    const client = await User.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Update fields
    client.name = name;
    client.email = email;
    if (password) {
      client.password = await bcrypt.hash(password, 10);
    }

    await client.save();
    res.json({
      id: client._id,
      name: client.name,
      email: client.email,
      role: client.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating client', error: error.message });
  }
});

// Delete client (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const client = await User.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Delete all instances owned by this client
    await Instance.deleteMany({ owner: client._id });

    // Delete client
    await client.remove();
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting client', error: error.message });
  }
});

// Regenerate API key (admin only)
router.post('/:id/api-key', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const client = await User.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Generate new API key
    const apiKey = Math.random().toString(36).substring(2, 15);
    client.settings.apiKey = apiKey;
    await client.save();

    res.json({ apiKey });
  } catch (error) {
    res.status(500).json({ message: 'Error regenerating API key', error: error.message });
  }
});

export default router;