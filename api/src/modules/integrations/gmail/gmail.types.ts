export interface ParsedEmailMessage {
  id: string;
  threadId?: string;
  subject: string;
  sender: string;
  receivedAt: Date;
  snippet: string;
  bodyText: string;
}

export interface SyncResultSummary {
  fetchedCount: number;
  processedCount: number;
  skippedCount: number;
  errorCount: number;
  isSimulated?: boolean;
  errors: Array<{ messageId?: string; error: string }>;
  items: Array<{
    id: string;
    externalId: string;
    subject: string;
    sender: string;
    receivedAt: Date;
    alreadyExisted: boolean;
  }>;
}

export interface GmailIntegrationStatus {
  isConnected: boolean;
  providerAccountId?: string;
  scope?: string;
  tokenExpiry?: Date | null;
  totalIngestedEmails: number;
  lastSyncedAt?: Date | null;
}
