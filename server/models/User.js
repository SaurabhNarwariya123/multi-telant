import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['superadmin', 'admin', 'member', 'client'], required: true },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
