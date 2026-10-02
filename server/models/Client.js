import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    company: { type: String, required: true, trim: true },
    contactName: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Client', clientSchema);
