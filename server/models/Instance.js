import mongoose from 'mongoose';

const instanceSchema = new mongoose.Schema(
  {
    instanceName: {
      type: String,
      required: true,
      unique: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected', 'connecting'],
      default: 'disconnected',
    },
    profileName: String,
    profilePictureUrl: String,
    qrcode: String,
  },
  { timestamps: true }
);

const Instance = mongoose.model('Instance', instanceSchema);

export default Instance;