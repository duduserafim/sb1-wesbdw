import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    instanceName: {
      type: String,
      required: true,
    },
    chatId: {
      type: String,
      required: true,
    },
    chatName: String,
    content: String,
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'document'],
      default: 'text',
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    repeat: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none',
    },
    fileUrl: String,
    fileName: String,
    caption: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastRun: Date,
    nextRun: Date,
  },
  { timestamps: true }
);

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;