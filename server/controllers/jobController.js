import Job from '../models/Job.js';

// POST A JOB (Recruiter only)
export const postJob = async (req, res) => {
  try {
    const {
      title, description, company, location,
      jobType, salary, skills, experience, positions,
      blindHiring
    } = req.body;

    const job = await Job.create({
      title, description, company, location,
      jobType, salary, skills, experience,
      positions, blindHiring,
      postedBy: req.user._id
    });

    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL JOBS (with search & filter)
export const getAllJobs = async (req, res) => {
  try {
    const { keyword, location, jobType, experience, page = 1, limit = 9 } = req.query;

    const query = { isActive: true };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { company: { $regex: keyword, $options: 'i' } },
        { skills: { $in: [new RegExp(keyword, 'i')] } }
      ];
    }

    if (location) query.location = { $regex: location, $options: 'i' };
    if (jobType) query.jobType = jobType;
    if (experience) query.experience = experience;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('postedBy', 'name company')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      jobs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE JOB
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email company');

    if (!job) return res.status(404).json({ message: 'Job not found' });

    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET RECRUITER'S OWN JOBS
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE JOB
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, job: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE JOB
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SALARY INSIGHTS
export const getSalaryInsights = async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true });

    const byRole = {};
    const byExperience = {};
    const byCompany = {};

    jobs.forEach(job => {
      if (!job.salary?.min || !job.salary?.max) return;

      const roleKey = job.title;
      if (!byRole[roleKey]) byRole[roleKey] = { title: roleKey, min: Infinity, max: 0, count: 0 };
      byRole[roleKey].min = Math.min(byRole[roleKey].min, job.salary.min);
      byRole[roleKey].max = Math.max(byRole[roleKey].max, job.salary.max);
      byRole[roleKey].count += 1;

      const expKey = job.experience;
      if (!byExperience[expKey]) byExperience[expKey] = { experience: expKey, min: Infinity, max: 0, count: 0 };
      byExperience[expKey].min = Math.min(byExperience[expKey].min, job.salary.min);
      byExperience[expKey].max = Math.max(byExperience[expKey].max, job.salary.max);
      byExperience[expKey].count += 1;

      const compKey = job.company;
      if (!byCompany[compKey]) byCompany[compKey] = { company: compKey, min: Infinity, max: 0, count: 0 };
      byCompany[compKey].min = Math.min(byCompany[compKey].min, job.salary.min);
      byCompany[compKey].max = Math.max(byCompany[compKey].max, job.salary.max);
      byCompany[compKey].count += 1;
    });

    res.json({
      byRole: Object.values(byRole).sort((a, b) => b.max - a.max),
      byExperience: Object.values(byExperience),
      byCompany: Object.values(byCompany).sort((a, b) => b.max - a.max),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch salary insights' });
  }
};