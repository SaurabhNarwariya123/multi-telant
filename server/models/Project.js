import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['planning', 'design', 'development', 'testing', 'client_review', 'launched'],
      default: 'planning',
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    startDate: { type: Date },
    dueDate: { type: Date },
    clientApprovedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
