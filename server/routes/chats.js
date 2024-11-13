import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import Chat from '../models/Chat.js';
import { evolutionApi } from '../services/evolutionApi.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Get all chats for an instance
router.get('/:instanceName', authenticateToken, async (req, res) => {
  try {
    const { instanceName } = req.params;
    const response = await evolutionApi.getChats(instanceName);
    
    // Update local database with fetched chats
    const chats = response.data;
    for (const chat of chats) {
      await Chat.findOneAndUpdate(
        { chatId: chat.id },
        {
          chatId: chat.id,
          instanceName,
          name: chat.name,
          isGroup: chat.isGroup,
          unreadCount: chat.unreadCount,
          lastMessage: chat.lastMessage,
          profilePicture: chat.profilePicture,
        },
        { upsert: true, new: true }
      );
    }

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chats', error: error.message });
  }
});

// Get chat messages
router.get('/:instanceName/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { instanceName, chatId } = req.params;
    const response = await evolutionApi.getChatMessages(instanceName, chatId);
    
    const chat = await Chat.findOne({ chatId });
    if (chat) {
      chat.messages = response.data;
      await chat.save();
    }

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Send message
router.post('/:instanceName/:chatId/message', authenticateToken, async (req, res) => {
  try {
    const { instanceName, chatId } = req.params;
    const message = req.body;

    const response = await evolutionApi.sendMessage(instanceName, chatId, message);
    
    const chat = await Chat.findOne({ chatId });
    if (chat) {
      chat.messages.push(response.data);
      chat.lastMessage = response.data;
      await chat.save();
    }

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Send file
router.post('/:instanceName/:chatId/file', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { instanceName, chatId } = req.params;
    const { caption } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const response = await evolutionApi.sendFile(instanceName, chatId, file, caption);
    
    const chat = await Chat.findOne({ chatId });
    if (chat) {
      chat.messages.push(response.data);
      chat.lastMessage = response.data;
      await chat.save();
    }

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error sending file', error: error.message });
  }
});

export default router;