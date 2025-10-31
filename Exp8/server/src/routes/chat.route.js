import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { startConversation, getConversations, getMessages, sendMessage } from '../controllers/chat.controller.js';

const router = Router();

router.get('/conversations', authRequired, getConversations);
router.post('/conversations', authRequired, startConversation);
router.get('/conversations/:id/messages', authRequired, getMessages);
router.post('/conversations/:id/messages', authRequired, sendMessage);

export default router;
