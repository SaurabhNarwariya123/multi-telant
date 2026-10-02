import mongoose from 'mongoose';

const agencySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    plan: { type: String, enum: ['trial', 'pro'], default: 'trial' },
  },
  { timestamps: true }
);

export default mongoose.model('Agency', agencySchema);
