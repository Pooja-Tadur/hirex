import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['jobseeker', 'recruiter'],
    default: 'jobseeker'
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  skills: [String],
  resume: {
    type: String,
    default: ''
  },
  company: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);