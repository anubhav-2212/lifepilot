import { google, gmail_v1 } from 'googleapis';
import { prisma } from '../../../utils/prisma.js';
import { decrypt, encrypt } from '../../../utils/crypto.js';
import { createOAuth2Client } from '../../auth/auth.service.js';
import { ParsedEmailMessage, SyncResultSummary, GmailIntegrationStatus } from './gmail.types.js';

export class GmailService {
  /**
   * Retrieves ConnectedAccount for the user, decrypts tokens, and sets up OAuth2 client
   */
  async getAuthenticatedClient(userId: string) {
    const account = await prisma.connectedAccount.findFirst({
      where: { userId, provider: 'google' },
    });

    if (!account) {
      return null;
    }

    const accessToken = decrypt(account.encryptedAccessToken);
    const refreshToken = account.encryptedRefreshToken
      ? decrypt(account.encryptedRefreshToken)
      : undefined;

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: account.tokenExpiry ? account.tokenExpiry.getTime() : undefined,
    });

    // Listen for automatic token refreshes by Google SDK and persist new encrypted tokens
    oauth2Client.on('tokens', async (newTokens) => {
      try {
        const updateData: Record<string, any> = {};
        if (newTokens.access_token) {
          updateData.encryptedAccessToken = encrypt(newTokens.access_token);
        }
        if (newTokens.refresh_token) {
          updateData.encryptedRefreshToken = encrypt(newTokens.refresh_token);
        }
        if (newTokens.expiry_date) {
          updateData.tokenExpiry = new Date(newTokens.expiry_date);
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.connectedAccount.update({
            where: { id: account.id },
            data: updateData,
          });
        }
      } catch (err) {
        console.error('Failed to persist refreshed Google tokens:', err);
      }
    });

    return { oauth2Client, account };
  }

  /**
   * Recursively parses Gmail message payload to extract clean text content
   */
  private extractMessageBody(payload?: gmail_v1.Schema$MessagePart): string {
    if (!payload) return '';

    let plainText = '';
    let htmlText = '';

    const traversePart = (part: gmail_v1.Schema$MessagePart) => {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        plainText += Buffer.from(part.body.data, 'base64url').toString('utf8');
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        htmlText += Buffer.from(part.body.data, 'base64url').toString('utf8');
      }

      if (part.parts && part.parts.length > 0) {
        for (const childPart of part.parts) {
          traversePart(childPart);
        }
      }
    };

    traversePart(payload);

    if (plainText.trim()) {
      return plainText.trim();
    }

    // Basic HTML tag stripping if only HTML was present
    return htmlText
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Helper to parse header fields from Gmail Message
   */
  private getHeader(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, name: string): string {
    if (!headers) return '';
    const match = headers.find((h) => h.name?.toLowerCase() === name.toLowerCase());
    return match?.value || '';
  }

  /**
   * Fetches recent messages from Gmail API, deduplicating against stored SourceItems
   */
  async syncEmails(userId: string, limit: number = 15): Promise<SyncResultSummary> {
    const auth = await this.getAuthenticatedClient(userId);

    // If no real Google connection exists or this is a dev test account
    if (!auth || auth.account.providerAccountId.startsWith('dev-google-')) {
      return this.syncSimulatedEmails(userId);
    }

    const { oauth2Client, account } = auth;
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const summary: SyncResultSummary = {
      fetchedCount: 0,
      processedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [],
      items: [],
    };

    // 1. Fetch recent message references
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults: Math.min(limit, 50),
      q: 'category:primary OR category:updates OR label:INBOX',
    });

    const messages = listRes.data.messages || [];
    summary.fetchedCount = messages.length;

    for (const msgRef of messages) {
      if (!msgRef.id) continue;

      try {
        // 2. Check for duplicate ingestion
        const existing = await prisma.sourceItem.findUnique({
          where: {
            account_external_id_unique: {
              accountId: account.id,
              externalId: msgRef.id,
            },
          },
        });

        if (existing) {
          summary.skippedCount++;
          summary.items.push({
            id: existing.id,
            externalId: existing.externalId,
            subject: existing.subject || 'No Subject',
            sender: existing.sender || 'Unknown Sender',
            receivedAt: existing.receivedAt || existing.createdAt,
            alreadyExisted: true,
          });
          continue;
        }

        // 3. Fetch full email metadata and body
        const fullMsg = await gmail.users.messages.get({
          userId: 'me',
          id: msgRef.id,
          format: 'full',
        });

        const headers = fullMsg.data.payload?.headers;
        const subject = this.getHeader(headers, 'Subject') || '(No Subject)';
        const sender = this.getHeader(headers, 'From') || 'Unknown Sender';
        const dateHeader = this.getHeader(headers, 'Date');
        const receivedAt = dateHeader ? new Date(dateHeader) : new Date(Number(fullMsg.data.internalDate) || Date.now());

        // 4. Save to PostgreSQL as SourceItem (headers + metadata)
        const savedItem = await prisma.sourceItem.create({
          data: {
            userId,
            accountId: account.id,
            externalId: msgRef.id,
            threadId: fullMsg.data.threadId || null,
            sourceType: 'GMAIL',
            subject,
            sender,
            receivedAt: isNaN(receivedAt.getTime()) ? new Date() : receivedAt,
          },
        });

        summary.processedCount++;
        summary.items.push({
          id: savedItem.id,
          externalId: savedItem.externalId,
          subject: savedItem.subject || '(No Subject)',
          sender: savedItem.sender || 'Unknown Sender',
          receivedAt: savedItem.receivedAt || savedItem.createdAt,
          alreadyExisted: false,
        });
      } catch (err: any) {
        summary.errorCount++;
        summary.errors.push({
          messageId: msgRef.id,
          error: err.message || 'Failed to process message',
        });
      }
    }

    return summary;
  }

  /**
   * Retrieves integration status and ingestion statistics
   */
  async getStatus(userId: string): Promise<GmailIntegrationStatus> {
    const account = await prisma.connectedAccount.findFirst({
      where: { userId, provider: 'google' },
    });

    const totalIngestedEmails = await prisma.sourceItem.count({
      where: { userId, sourceType: 'GMAIL' },
    });

    const lastItem = await prisma.sourceItem.findFirst({
      where: { userId, sourceType: 'GMAIL' },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    return {
      isConnected: Boolean(account),
      providerAccountId: account?.providerAccountId,
      scope: account?.scope || undefined,
      tokenExpiry: account?.tokenExpiry,
      totalIngestedEmails,
      lastSyncedAt: lastItem?.createdAt || null,
    };
  }

  /**
   * Retrieves ingested source items for auditing and UI display
   */
  async getSourceItems(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.sourceItem.findMany({
        where: { userId },
        orderBy: { receivedAt: 'desc' },
        skip,
        take: limit,
        include: {
          responsibilities: {
            select: {
              id: true,
              title: true,
              category: true,
              status: true,
            },
          },
        },
      }),
      prisma.sourceItem.count({ where: { userId } }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Realistic simulated email sync for developer testing before Google OAuth credentials are added
   */
  private async syncSimulatedEmails(userId: string): Promise<SyncResultSummary> {
    // Check or create a dev connected account for this user
    let account = await prisma.connectedAccount.findFirst({
      where: { userId, provider: 'google' },
    });

    if (!account) {
      account = await prisma.connectedAccount.create({
        data: {
          userId,
          provider: 'google',
          providerAccountId: `dev-google-${userId}`,
          encryptedAccessToken: encrypt('dev-mock-access-token'),
          scope: 'https://www.googleapis.com/auth/gmail.readonly',
        },
      });
    }

    const sampleEmails = [
      {
        externalId: 'gmail_msg_bescom_101',
        subject: 'BESCOM Electricity Bill Notice - Consumer No: 492019',
        sender: 'billing@bescom.karnataka.gov.in',
        receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        threadId: 'thread_bescom_101',
      },
      {
        externalId: 'gmail_msg_practo_102',
        subject: 'Appointment Confirmed: Dr. Sarah Rao (Dentist)',
        sender: 'appointments@practo.com',
        receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        threadId: 'thread_practo_102',
      },
      {
        externalId: 'gmail_msg_spotify_103',
        subject: 'Your Spotify Premium Family subscription renews soon',
        sender: 'no-reply@spotify.com',
        receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
        threadId: 'thread_spotify_103',
      },
      {
        externalId: 'gmail_msg_client_104',
        subject: 'LifePilot Architecture Review: Notes & Follow-up',
        sender: 'partner@techventure.io',
        receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        threadId: 'thread_client_104',
      },
      {
        externalId: 'gmail_msg_newsletter_105',
        subject: 'Weekly Tech Insights: Serverless Trends in 2026',
        sender: 'newsletter@techdaily.dev',
        receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago (irrelevant email)
        threadId: 'thread_newsletter_105',
      },
    ];

    const summary: SyncResultSummary = {
      fetchedCount: sampleEmails.length,
      processedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      isSimulated: true,
      errors: [],
      items: [],
    };

    for (const email of sampleEmails) {
      const existing = await prisma.sourceItem.findUnique({
        where: {
          account_external_id_unique: {
            accountId: account.id,
            externalId: email.externalId,
          },
        },
      });

      if (existing) {
        summary.skippedCount++;
        summary.items.push({
          id: existing.id,
          externalId: existing.externalId,
          subject: existing.subject || '',
          sender: existing.sender || '',
          receivedAt: existing.receivedAt || existing.createdAt,
          alreadyExisted: true,
        });
      } else {
        const created = await prisma.sourceItem.create({
          data: {
            userId,
            accountId: account.id,
            externalId: email.externalId,
            threadId: email.threadId,
            sourceType: 'GMAIL',
            subject: email.subject,
            sender: email.sender,
            receivedAt: email.receivedAt,
          },
        });
        summary.processedCount++;
        summary.items.push({
          id: created.id,
          externalId: created.externalId,
          subject: created.subject || '',
          sender: created.sender || '',
          receivedAt: created.receivedAt || created.createdAt,
          alreadyExisted: false,
        });
      }
    }

    return summary;
  }
}

export const gmailService = new GmailService();
