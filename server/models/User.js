import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'client'],
      default: 'client',
    },
    settings: {
      notifications: {
        email: { type: Boolean, default: true },
        desktop: { type: Boolean, default: true },
        messageReceived: { type: Boolean, default: true },
        groupUpdates: { type: Boolean, default: true },
      },
      webhooks: {
        url: { type: String, default: '' },
        enabled: { type: Boolean, default: false },
        events: [{ type: String }],
      },
      apiKey: { type: String },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;