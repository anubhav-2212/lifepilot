import { Router } from 'express';
import {
  initiateGoogleAuth,
  handleGoogleCallback,
  getCurrentUser,
  logout,
  disconnectGoogle,
  devLogin,
} from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

export const authRouter = Router();

// Public OAuth routes
authRouter.get('/google', initiateGoogleAuth);
authRouter.get('/google/callback', handleGoogleCallback);
authRouter.post('/dev-login', devLogin);

// Protected routes (require session cookie)
authRouter.get('/me', requireAuth, getCurrentUser);
authRouter.post('/logout', requireAuth, logout);
authRouter.post('/disconnect-google', requireAuth, disconnectGoogle);
