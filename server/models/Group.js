import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    groupId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    instanceName: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [{
      id: String,
      admin: Boolean,
      superAdmin: Boolean,
      name: String,
    }],
    inviteLink: String,
    memberCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Group = mongoose.model('Group', groupSchema);

export default Group;