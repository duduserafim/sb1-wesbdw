import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    from: String,
    to: String,
    content: String,
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'document'],
      default: 'text',
    },
    timestamp: Number,
    fromMe: Boolean,
    fileName: String,
    fileUrl: String,
    caption: String,
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      unique: true,
    },
    instanceName: {
      type: String,
      required: true,
    },
    name: String,
    isGroup: {
      type: Boolean,
      default: false,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    lastMessage: messageSchema,
    messages: [messageSchema],
    profilePicture: String,
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;