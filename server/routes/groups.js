import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Group from '../models/Group.js';
import { evolutionApi } from '../services/evolutionApi.js';

const router = express.Router();

// Get all groups for an instance
router.get('/:instanceName', authenticateToken, async (req, res) => {
  try {
    const { instanceName } = req.params;
    const response = await evolutionApi.fetchGroups(instanceName);
    
    // Update local database with fetched groups
    const groups = response.data;
    for (const group of groups) {
      await Group.findOneAndUpdate(
        { groupId: group.id },
        {
          groupId: group.id,
          name: group.name,
          description: group.description,
          instanceName,
          owner: req.user.userId,
          participants: group.participants,
          inviteLink: group.inviteLink,
          memberCount: group.participants.length,
        },
        { upsert: true, new: true }
      );
    }

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups', error: error.message });
  }
});

// Create new group
router.post('/:instanceName', authenticateToken, async (req, res) => {
  try {
    const { instanceName } = req.params;
    const { name, participants } = req.body;

    const response = await evolutionApi.createGroup(instanceName, name, participants);
    const groupData = response.data;

    const group = new Group({
      groupId: groupData.id,
      name: groupData.name,
      instanceName,
      owner: req.user.userId,
      participants: groupData.participants,
      memberCount: groupData.participants.length,
    });

    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error creating group', error: error.message });
  }
});

// Update group name
router.put('/:instanceName/:groupId/name', authenticateToken, async (req, res) => {
  try {
    const { instanceName, groupId } = req.params;
    const { name } = req.body;

    await evolutionApi.updateGroupName(instanceName, groupId, name);
    
    const group = await Group.findOneAndUpdate(
      { groupId },
      { name },
      { new: true }
    );

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error updating group name', error: error.message });
  }
});

// Update group description
router.put('/:instanceName/:groupId/description', authenticateToken, async (req, res) => {
  try {
    const { instanceName, groupId } = req.params;
    const { description } = req.body;

    await evolutionApi.updateGroupDescription(instanceName, groupId, description);
    
    const group = await Group.findOneAndUpdate(
      { groupId },
      { description },
      { new: true }
    );

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error updating group description', error: error.message });
  }
});

// Add participants to group
router.post('/:instanceName/:groupId/participants', authenticateToken, async (req, res) => {
  try {
    const { instanceName, groupId } = req.params;
    const { participants } = req.body;

    await evolutionApi.addParticipants(instanceName, groupId, participants);
    
    const group = await Group.findOne({ groupId });
    group.participants.push(...participants.map(p => ({ id: p, admin: false })));
    group.memberCount = group.participants.length;
    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error adding participants', error: error.message });
  }
});

// Remove participants from group
router.delete('/:instanceName/:groupId/participants', authenticateToken, async (req, res) => {
  try {
    const { instanceName, groupId } = req.params;
    const { participants } = req.body;

    await evolutionApi.removeParticipants(instanceName, groupId, participants);
    
    const group = await Group.findOne({ groupId });
    group.participants = group.participants.filter(p => !participants.includes(p.id));
    group.memberCount = group.participants.length;
    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error removing participants', error: error.message });
  }
});

// Promote participants to admin
router.post('/:instanceName/:groupId/promote', authenticateToken, async (req, res) => {
  try {
    const { instanceName, groupId } = req.params;
    const { participants } = req.body;

    await evolutionApi.promoteParticipants(instanceName, groupId, participants);
    
    const group = await Group.findOne({ groupId });
    group.participants = group.participants.map(p => ({
      ...p,
      admin: participants.includes(p.id) ? true : p.admin,
    }));
    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error promoting participants', error: error.message });
  }
});

// Demote participants from admin
router.post('/:instanceName/:groupId/demote', authenticateToken, async (req, res) => {
  try {
    const { instanceName, groupId } = req.params;
    const { participants } = req.body;

    await evolutionApi.demoteParticipants(instanceName, groupId, participants);
    
    const group = await Group.findOne({ groupId });
    group.participants = group.participants.map(p => ({
      ...p,
      admin: participants.includes(p.id) ? false : p.admin,
    }));
    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error demoting participants', error: error.message });
  }
});

// Leave group
router.post('/:instanceName/:groupId/leave', authenticateToken, async (req, res) => {
  try {
    const { instanceName, groupId } = req.params;

    await evolutionApi.leaveGroup(instanceName, groupId);
    await Group.deleteOne({ groupId });

    res.json({ message: 'Successfully left group' });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving group', error: error.message });
  }
});

export default router;