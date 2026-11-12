import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { prisma } from '../../utils/prisma.js';
import { encrypt } from '../../utils/crypto.js';

const GMAIL_SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.readonly',
];

export const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );
};

export interface SessionPayload {
  userId: string;
  email: string;
}

export class AuthService {
  /**
   * Generates Google OAuth consent screen redirect URL
   */
  getGoogleAuthUrl(): string {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
    }

    const oauth2Client = createOAuth2Client();
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: GMAIL_SCOPES,
    });
  }

  /**
   * Handles Google OAuth callback, exchanges code for tokens, upserts user and account
   */
  async handleGoogleCallback(code: string): Promise<{ token: string; user: any }> {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (!tokens.access_token) {
      throw new Error('Failed to retrieve access token from Google');
    }

    // Retrieve user profile from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    if (!profile.email || !profile.id) {
      throw new Error('Incomplete user profile received from Google');
    }

    // 1. Upsert User in database
    const user = await prisma.user.upsert({
      where: { email: profile.email },
      update: {
        name: profile.name || undefined,
        picture: profile.picture || undefined,
      },
      create: {
        email: profile.email,
        name: profile.name || 'LifePilot User',
        picture: profile.picture || null,
        timezone: 'UTC',
      },
    });

    // 2. Encrypt OAuth tokens before saving
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token ? encrypt(tokens.refresh_token) : null;
    const tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

    // 3. Upsert ConnectedAccount
    await prisma.connectedAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: profile.id,
        },
      },
      update: {
        userId: user.id,
        encryptedAccessToken,
        ...(encryptedRefreshToken && { encryptedRefreshToken }),
        tokenExpiry,
        scope: tokens.scope || GMAIL_SCOPES.join(' '),
      },
      create: {
        userId: user.id,
        provider: 'google',
        providerAccountId: profile.id,
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiry,
        scope: tokens.scope || GMAIL_SCOPES.join(' '),
      },
    });

    const sessionToken = this.createSessionToken({ userId: user.id, email: user.email });
    return { token: sessionToken, user };
  }

  /**
   * Generates a signed JWT session token (valid for 7 days)
   */
  createSessionToken(payload: SessionPayload): string {
    return jwt.sign(payload, env.SESSION_SECRET, { expiresIn: '7d' });
  }

  /**
   * Verifies a session token
   */
  verifySessionToken(token: string): SessionPayload {
    return jwt.verify(token, env.SESSION_SECRET) as SessionPayload;
  }

  /**
   * Retrieves user profile and integration status by ID
   */
  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        connectedAccounts: {
          select: {
            id: true,
            provider: true,
            createdAt: true,
            tokenExpiry: true,
          },
        },
      },
    });

    if (!user) return null;

    const hasGmailConnected = user.connectedAccounts.some((acc) => acc.provider === 'google');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      timezone: user.timezone,
      createdAt: user.createdAt,
      hasGmailConnected,
      connectedAccounts: user.connectedAccounts,
    };
  }

  /**
   * Disconnects Google account and clears stored tokens
   */
  async disconnectGoogleAccount(userId: string) {
    return prisma.connectedAccount.deleteMany({
      where: {
        userId,
        provider: 'google',
      },
    });
  }

  /**
   * Dev login bypass: creates or signs in a test user without needing Google Cloud credentials
   * (Available only when NODE_ENV is development or test)
   */
  async devLogin(email: string = 'dev.user@lifepilot.local', name: string = 'Alex Pilot') {
    if (env.NODE_ENV === 'production') {
      throw new Error('Dev login is disabled in production mode');
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: {
        email,
        name,
        timezone: 'Asia/Kolkata',
      },
    });

    const sessionToken = this.createSessionToken({ userId: user.id, email: user.email });
    return { token: sessionToken, user };
  }
}

export const authService = new AuthService();
