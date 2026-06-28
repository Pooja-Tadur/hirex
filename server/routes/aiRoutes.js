import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { gradeResume, semanticMatch, chatReply, interviewPrep } from '../controllers/aiController.js';

const router = express.Router();

router.post('/grade-resume', protect, gradeResume);
router.post('/semantic-match', protect, semanticMatch);
router.post('/chat', chatReply);  // ✅ No login required
router.post('/interview-prep', protect, interviewPrep);

export default router;