import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { AdminUser, SubscriptionStatus } from '../types';

type RawUser = {
  uid?: string;
  name?: string;
  email?: string;
  image?: string;
  status?: string;
  balance?: number;
  packageId?: string;
  createdAt?: unknown;
  lastLogin?: unknown;
  subscription?: {
    subscriptionExpiryTime?: string;
  };
};

const toIsoDate = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  if (value instanceof Date) return value.toISOString();
  return null;
};

const inferPaymentStatus = (user: RawUser): 'active' | 'inactive' => {
  const expiry = user.subscription?.subscriptionExpiryTime;
  if (!expiry) return user.status === 'active' ? 'active' : 'inactive';
  const expiryTs = Date.parse(expiry);
  if (Number.isNaN(expiryTs)) return user.status === 'active' ? 'active' : 'inactive';
  return expiryTs > Date.now() ? 'active' : 'inactive';
};

const mapStatus = (status: string | undefined): SubscriptionStatus => {
  if (status === 'active') return SubscriptionStatus.ACTIVE;
  if (status === 'expired') return SubscriptionStatus.BANNED;
  return SubscriptionStatus.NO_PLAN;
};

export const fetchUsers = async (): Promise<AdminUser[]> => {
  const usersRef = collection(db, 'users');
  const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(usersQuery);

  return snapshot.docs.map((entry) => {
    const data = entry.data() as RawUser;
    return {
      id: entry.id,
      uid: data.uid ?? entry.id,
      name: data.name ?? 'Unknown User',
      email: data.email ?? 'No email',
      avatar: data.image ?? '',
      status: mapStatus(data.status),
      rawStatus: data.status ?? 'unknown',
      balance: typeof data.balance === 'number' ? data.balance : 0,
      packageId: data.packageId ?? '',
      paymentStatus: inferPaymentStatus(data),
      subscriptionExpiryTime: data.subscription?.subscriptionExpiryTime ?? null,
      createdAt: toIsoDate(data.createdAt),
      lastLogin: toIsoDate(data.lastLogin),
    };
  });
};

export const banUser = async (userId: string) => {
  await updateDoc(doc(db, 'users', userId), { status: 'expired' });
};

export const unbanUser = async (userId: string) => {
  await updateDoc(doc(db, 'users', userId), { status: 'active' });
};

export const deleteUserDoc = async (userId: string) => {
  await deleteDoc(doc(db, 'users', userId));
};