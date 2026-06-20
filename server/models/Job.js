import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship', 'Remote', 'Contract'],
    default: 'Full-time'
  },
  salary: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  skills: [String],
  experience: {
    type: String,
    enum: ['Fresher', '1-2 years', '2-5 years', '5+ years'],
    default: 'Fresher'
  },
  positions: { type: Number, default: 1 },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  isActive: { type: Boolean, default: true },
  blindHiring: { type: Boolean, default: false }, // ← NEW
}, { timestamps: true });

jobSchema.index({ title: 'text', company: 'text', location: 'text' });
export default mongoose.model('Job', jobSchema);