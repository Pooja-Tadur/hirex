import express from 'express';
import {
  postJob, getAllJobs, getJobById,
  getMyJobs, updateJob, deleteJob, getSalaryInsights
} from '../controllers/jobController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllJobs);
router.get('/myjobs', protect, authorizeRoles('recruiter'), getMyJobs);
router.get('/salary-insights', getSalaryInsights);
router.get('/:id', getJobById);
router.post('/', protect, authorizeRoles('recruiter'), postJob);
router.put('/:id', protect, authorizeRoles('recruiter'), updateJob);
router.delete('/:id', protect, authorizeRoles('recruiter'), deleteJob);

export default router;