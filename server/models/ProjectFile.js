import mongoose from 'mongoose';

const projectFileSchema = new mongoose.Schema(
  {
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    attachedToType: { type: String, enum: ['project', 'task', 'feedback'], required: true },
    attachedToId: { type: mongoose.Schema.Types.ObjectId, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
    resourceType: { type: String, enum: ['image', 'video', 'raw'], required: true },
    format: { type: String },
    size: { type: Number },
    sharedWithClient: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('ProjectFile', projectFileSchema);
