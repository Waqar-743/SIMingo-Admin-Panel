
export enum SubscriptionStatus {
  ACTIVE = 'Active',
  BANNED = 'Banned',
  NO_PLAN = 'No Plan',
  TRIALING = 'Trialing'
}

export type UserStatus = SubscriptionStatus;

export interface AdminUser {
  id: string;
  uid: string;
  name: string;
  email: string;
  status: SubscriptionStatus;
  rawStatus: string;
  avatar?: string;
  balance: number;
  packageId: string;
  paymentStatus: 'active' | 'inactive';
  subscriptionExpiryTime: string | null;
  createdAt: string | null;
  lastLogin: string | null;
}

export interface SecurityLog {
  id: string;
  action: string;
  targetAccount: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface DashboardStats {
  totalUsers: number;
  activePlans: number;
  bannedAccounts: number;
  totalRevenue: string;
  newSignups: number;
  activeSessions: number;
}
