import express from 'express';
import {
  applyJob,
  getMyApplications,
  getJobApplicants,
  updateStatus,
  getRecruiterStats
} from '../controllers/applicationController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:jobId', protect, authorizeRoles('jobseeker'), applyJob);
router.get('/my/applications', protect, authorizeRoles('jobseeker'), getMyApplications);
router.get('/job/:jobId', protect, authorizeRoles('recruiter'), getJobApplicants);
router.put('/:id/status', protect, authorizeRoles('recruiter'), updateStatus);
router.get('/recruiter/stats', protect, authorizeRoles('recruiter'), getRecruiterStats);

export default router;