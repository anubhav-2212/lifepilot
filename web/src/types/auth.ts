export interface ConnectedAccountInfo {
  id: string;
  provider: string;
  createdAt: string;
  tokenExpiry: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  timezone: string;
  createdAt: string;
  hasGmailConnected: boolean;
  connectedAccounts: ConnectedAccountInfo[];
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => void;
  devLogin: (email?: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  disconnectGoogle: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
