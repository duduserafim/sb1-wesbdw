import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Instance from '../models/Instance.js';
import { evolutionApi } from '../services/evolutionApi.js';

const router = express.Router();

// Get all instances for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const instances = await Instance.find({ owner: req.user.userId });
    
    // Fetch real-time status from Evolution API
    const instancesWithStatus = await Promise.all(
      instances.map(async (instance) => {
        try {
          const response = await evolutionApi.getInstanceInfo(instance.instanceName);
          return {
            ...instance.toObject(),
            status: response.data.status,
            profileName: response.data.profileName,
            profilePictureUrl: response.data.profilePictureUrl,
          };
        } catch (error) {
          return {
            ...instance.toObject(),
            status: 'disconnected',
          };
        }
      })
    );

    res.json(instancesWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching instances', error: error.message });
  }
});

// Create new instance
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { instanceName } = req.body;

    // Check if instance already exists
    const existingInstance = await Instance.findOne({ instanceName });
    if (existingInstance) {
      return res.status(400).json({ message: 'Instance already exists' });
    }

    // Create instance in Evolution API
    await evolutionApi.createInstance(instanceName);

    // Create instance in database
    const instance = new Instance({
      instanceName,
      owner: req.user.userId,
    });

    await instance.save();
    res.status(201).json(instance);
  } catch (error) {
    res.status(500).json({ message: 'Error creating instance', error: error.message });
  }
});

// Delete instance
router.delete('/:instanceName', authenticateToken, async (req, res) => {
  try {
    const { instanceName } = req.params;

    // Check if instance exists and belongs to user
    const instance = await Instance.findOne({
      instanceName,
      owner: req.user.userId,
    });

    if (!instance) {
      return res.status(404).json({ message: 'Instance not found' });
    }

    // Delete from Evolution API
    await evolutionApi.deleteInstance(instanceName);

    // Delete from database
    await instance.remove();
    res.json({ message: 'Instance deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting instance', error: error.message });
  }
});

// Connect instance
router.post('/:instanceName/connect', authenticateToken, async (req, res) => {
  try {
    const { instanceName } = req.params;

    // Check if instance exists and belongs to user
    const instance = await Instance.findOne({
      instanceName,
      owner: req.user.userId,
    });

    if (!instance) {
      return res.status(404).json({ message: 'Instance not found' });
    }

    // Connect instance in Evolution API
    const response = await evolutionApi.connectInstance(instanceName);

    // Update instance status
    instance.status = 'connecting';
    instance.qrcode = response.data.qrcode;
    await instance.save();

    res.json(instance);
  } catch (error) {
    res.status(500).json({ message: 'Error connecting instance', error: error.message });
  }
});

// Logout instance
router.post('/:instanceName/logout', authenticateToken, async (req, res) => {
  try {
    const { instanceName } = req.params;

    // Check if instance exists and belongs to user
    const instance = await Instance.findOne({
      instanceName,
      owner: req.user.userId,
    });

    if (!instance) {
      return res.status(404).json({ message: 'Instance not found' });
    }

    // Logout instance in Evolution API
    await evolutionApi.logoutInstance(instanceName);

    // Update instance status
    instance.status = 'disconnected';
    instance.qrcode = null;
    await instance.save();

    res.json(instance);
  } catch (error) {
    res.status(500).json({ message: 'Error logging out instance', error: error.message });
  }
});

// Get instance QR code
router.get('/:instanceName/qr', authenticateToken, async (req, res) => {
  try {
    const { instanceName } = req.params;

    // Check if instance exists and belongs to user
    const instance = await Instance.findOne({
      instanceName,
      owner: req.user.userId,
    });

    if (!instance) {
      return res.status(404).json({ message: 'Instance not found' });
    }

    const response = await evolutionApi.getInstanceQR(instanceName);
    res.json({ qrcode: response.data.qrcode });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching QR code', error: error.message });
  }
});

export default router;