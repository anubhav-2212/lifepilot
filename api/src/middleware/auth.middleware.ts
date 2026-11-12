import { Request, Response, NextFunction } from 'express';
import { authService } from '../modules/auth/auth.service.js';
import { prisma } from '../utils/prisma.js';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.lifepilot_session;

    // Also support Authorization: Bearer <token>
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication session required. Please sign in.',
        },
      });
    }

    const payload = authService.verifySessionToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'The user account associated with this session no longer exists.',
        },
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired session. Please sign in again.',
      },
    });
  }
};
