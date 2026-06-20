import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Shortlisted', 'Rejected'],
    default: 'Pending'
  },
  coverLetter: {
    type: String,
    default: ''
  },
  resume: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Application', applicationSchema);