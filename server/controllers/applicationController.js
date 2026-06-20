import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { sendStatusEmail } from '../utils/sendEmail.js';

export const applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const already = await Application.findOne({
      job: req.params.jobId,
      applicant: req.user._id
    });
    if (already) return res.status(400).json({ message: 'Already applied to this job' });

    const application = await Application.create({
      job: req.params.jobId,
      applicant: req.user._id,
      coverLetter: req.body.coverLetter || '',
      resume: req.body.resume || ''
    });

    job.applications.push(application._id);
    await job.save();

    res.status(201).json({ success: true, application });
  } catch (error) {
    console.error('Apply error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location jobType salary skills')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email skills bio resume profilePicture experience education linkedin github website')
      .sort({ createdAt: -1 });

    const isBlind = job.blindHiring;

    const applicationsWithResume = applications.map((app) => ({
      _id: app._id,
      status: app.status,
      coverLetter: app.coverLetter,
      resume: app.resume,
      createdAt: app.createdAt,
      blindHiring: isBlind,
      applicant: isBlind ? {
        // Blind mode: name, email, linkedin, github, skills, resume ONLY
        name: app.applicant?.name,
        email: app.applicant?.email,
        linkedin: app.applicant?.linkedin || null,
        github: app.applicant?.github || null,
        skills: app.applicant?.skills || [],
        resume: app.resume,
        profilePicture: '',
        bio: '',
        experience: '',
        education: '',
        website: null,
      } : {
        // Full visibility
        name: app.applicant?.name,
        email: app.applicant?.email,
        profilePicture: app.applicant?.profilePicture,
        bio: app.applicant?.bio,
        skills: app.applicant?.skills || [],
        experience: app.applicant?.experience,
        education: app.applicant?.education,
        resume: app.resume,
        linkedin: app.applicant?.linkedin,
        github: app.applicant?.github,
        website: app.applicant?.website,
      }
    }));

    res.status(200).json({
      success: true,
      applications: applicationsWithResume,
      blindHiring: isBlind
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email')
      .populate('job', 'title company');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status = status;
    await application.save();

    try {
      await sendStatusEmail(
        application.applicant.email,
        application.applicant.name,
        application.job.title,
        application.job.company,
        status
      );
    } catch (emailError) {
      console.error('Email failed:', emailError.message);
    }

    res.status(200).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecruiterStats = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id });
    const jobIds = jobs.map(j => j._id);
    const total = await Application.countDocuments({ job: { $in: jobIds } });
    const pending = await Application.countDocuments({ job: { $in: jobIds }, status: 'Pending' });
    const shortlisted = await Application.countDocuments({ job: { $in: jobIds }, status: 'Shortlisted' });
    const rejected = await Application.countDocuments({ job: { $in: jobIds }, status: 'Rejected' });
    res.status(200).json({
      success: true,
      stats: { totalJobs: jobs.length, total, pending, shortlisted, rejected }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};