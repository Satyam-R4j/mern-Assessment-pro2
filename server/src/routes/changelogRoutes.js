import express from 'express';
import {
  getChangelogs,
  getPublicFeed,
  getChangelogBySlug,
  getUnreadCount,
  toggleReaction,
  getAllAdminChangelogs,
  createChangelog,
  updateChangelog,
  deleteChangelog,
} from '../controllers/changelogController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// public endpoints
router.get('/feed', getPublicFeed);
router.get('/', getChangelogs);
router.get('/unread-count', optionalAuth, getUnreadCount);
router.get('/slug/:slug', getChangelogBySlug);
router.post('/:id/react', optionalAuth, toggleReaction);

// admin CRUD endpoints
router.get('/admin/all', protect, adminOnly, getAllAdminChangelogs);
router.post('/admin', protect, adminOnly, createChangelog);
router.put('/admin/:id', protect, adminOnly, updateChangelog);
router.delete('/admin/:id', protect, adminOnly, deleteChangelog);

export default router;
