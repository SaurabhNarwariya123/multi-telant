import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema(
  {
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    notes: { type: String },
    sharedWithClient: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Meeting', meetingSchema);
