import { Router } from 'express';
import { syncEmails, getGmailStatus, getSourceItems } from './gmail.controller.js';
import { requireAuth } from '../../../middleware/auth.middleware.js';

export const gmailRouter = Router();

// All Gmail integration endpoints require authenticated user session
gmailRouter.use(requireAuth);

gmailRouter.post('/sync', syncEmails);
gmailRouter.get('/status', getGmailStatus);
gmailRouter.get('/source-items', getSourceItems);
