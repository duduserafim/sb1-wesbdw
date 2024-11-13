import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Schedule from '../models/Schedule.js';
import { evolutionApi } from '../services/evolutionApi.js';
import { addJob, removeJob } from '../services/scheduler.js';

const router = express.Router();

// Get all schedules for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const schedules = await Schedule.find({ owner: req.user.userId });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schedules', error: error.message });
  }
});

// Create new schedule
router.post('/', authenticateToken, async (req, res) => {
  try {
    const scheduleData = {
      ...req.body,
      owner: req.user.userId,
      nextRun: new Date(req.body.scheduledTime),
    };

    const schedule = new Schedule(scheduleData);
    await schedule.save();

    // Add to scheduler
    addJob(schedule);

    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Error creating schedule', error: error.message });
  }
});

// Update schedule
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      owner: req.user.userId,
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Remove old job
    removeJob(schedule._id.toString());

    // Update schedule
    Object.assign(schedule, req.body);
    schedule.nextRun = new Date(req.body.scheduledTime);
    await schedule.save();

    // Add new job
    addJob(schedule);

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Error updating schedule', error: error.message });
  }
});

// Delete schedule
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      owner: req.user.userId,
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Remove from scheduler
    removeJob(schedule._id.toString());

    // Delete schedule
    await schedule.remove();
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting schedule', error: error.message });
  }
});

export default router;