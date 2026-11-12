import { api } from './api';

export interface SourceItem {
  id: string;
  externalId: string;
  threadId: string | null;
  sourceType: string;
  subject: string | null;
  sender: string | null;
  receivedAt: string | null;
  createdAt: string;
  responsibilities: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
  }>;
}

export interface SyncSummary {
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
    receivedAt: string;
    alreadyExisted: boolean;
  }>;
}

export interface GmailStatus {
  isConnected: boolean;
  providerAccountId?: string;
  scope?: string;
  totalIngestedEmails: number;
  lastSyncedAt?: string | null;
}

export const syncGmailEmails = async (limit: number = 15): Promise<SyncSummary> => {
  const res = await api.post(`/gmail/sync?limit=${limit}`);
  return res.data.data;
};

export const fetchGmailStatus = async (): Promise<GmailStatus> => {
  const res = await api.get('/gmail/status');
  return res.data.data;
};

export const fetchSourceItems = async (
  page = 1,
  limit = 20
): Promise<{ items: SourceItem[]; pagination: { total: number; page: number; totalPages: number } }> => {
  const res = await api.get(`/gmail/source-items?page=${page}&limit=${limit}`);
  return res.data.data;
};
