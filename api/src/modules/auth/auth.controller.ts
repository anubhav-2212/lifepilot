import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { env } from '../../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export const initiateGoogleAuth = (_req: Request, res: Response) => {
  try {
    const url = authService.getGoogleAuthUrl();
    return res.redirect(url);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'OAUTH_CONFIG_ERROR',
        message: error.message,
      },
    });
  }
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const error = req.query.error as string;

  if (error) {
    return res.redirect(`${env.CLIENT_URL}/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect(`${env.CLIENT_URL}/login?error=no_code_provided`);
  }

  try {
    const { token } = await authService.handleGoogleCallback(code);
    res.cookie('lifepilot_session', token, COOKIE_OPTIONS);
    return res.redirect(`${env.CLIENT_URL}/dashboard?auth=success`);
  } catch (err: any) {
    console.error('OAuth Callback Failed:', err.message);
    return res.redirect(`${env.CLIENT_URL}/login?error=${encodeURIComponent(err.message || 'oauth_failed')}`);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const profile = await authService.getUserProfile(req.user.id);
    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('lifepilot_session', { path: '/' });
  return res.status(200).json({
    success: true,
    data: { message: 'Successfully logged out' },
  });
};

export const disconnectGoogle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    await authService.disconnectGoogleAccount(req.user.id);
    return res.status(200).json({
      success: true,
      data: { message: 'Google account disconnected successfully' },
    });
  } catch (error) {
    return next(error);
  }
};

export const devLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name } = req.body;
    const { token, user } = await authService.devLogin(email, name);
    res.cookie('lifepilot_session', token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};
