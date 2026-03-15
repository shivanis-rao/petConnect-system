import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  revealIdentity,
  uploadChatFile,
} from '../controllers/conversation.controller.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Start or get existing conversation
router.post('/', authMiddleware, getOrCreateConversation);

// Get all conversations for logged in user
router.get('/', authMiddleware, getMyConversations);

// Get message history for a conversation
router.get('/:id/messages', authMiddleware, getMessages);

// Reveal identity when adoption request submitted
router.patch('/:id/reveal', authMiddleware, revealIdentity);

// Upload image in chat
router.post(
  '/:id/upload',
  authMiddleware,
  upload.single('file'),
  uploadChatFile
);

export default router;