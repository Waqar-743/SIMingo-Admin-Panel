import {
  collectionGroup,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { AdminTransaction, AdminUser, SubscriptionStatus } from '../types';

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
  currentNumber?: string;
  virtualNumber?: string;
  subscription?: {
    subscriptionExpiryTime?: string;
  };
};

type RawTransaction = {
  userId?: string;
  amount?: number;
  cost?: string | number;
  tokenChanged?: number;
  tokensAdded?: number;
  transactionType?: string;
  timestamp?: unknown;
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

  return snapshot.docs.map((entry) => mapUser(entry.id, entry.data() as RawUser));
};

const mapUser = (id: string, data: RawUser): AdminUser => ({
  id,
  uid: data.uid ?? id,
  name: data.name ?? 'Unknown User',
  email: data.email ?? 'No email',
  avatar: data.image ?? '',
  status: mapStatus(data.status),
  rawStatus: data.status ?? 'unknown',
  balance: typeof data.balance === 'number' ? data.balance : 0,
  currentNumber: data.currentNumber || data.virtualNumber || '-',
  packageId: data.packageId ?? '',
  paymentStatus: inferPaymentStatus(data),
  subscriptionExpiryTime: data.subscription?.subscriptionExpiryTime ?? null,
  createdAt: toIsoDate(data.createdAt),
  lastLogin: toIsoDate(data.lastLogin),
});

export const subscribeUsers = (
  onData: (users: AdminUser[]) => void,
  onError?: (error: unknown) => void
) => {
  const usersRef = collection(db, 'users');
  const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    usersQuery,
    (snapshot) => {
      onData(snapshot.docs.map((entry) => mapUser(entry.id, entry.data() as RawUser)));
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

export const isAdminInCollection = async (uid: string, email: string): Promise<boolean> => {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  const adminByUid = await getDoc(doc(db, 'admins', uid));
  if (adminByUid.exists()) return true;

  const adminByEmailDocId = await getDoc(doc(db, 'admins', normalizedEmail));
  if (adminByEmailDocId.exists()) return true;

  const adminByEmailQuery = query(
    collection(db, 'admins'),
    where('email', '==', normalizedEmail),
    limit(1)
  );
  const adminByEmailSnap = await getDocs(adminByEmailQuery);
  return !adminByEmailSnap.empty;
};

export const banUser = async (userId: string) => {
  await updateDoc(doc(db, 'users', userId), {
    status: 'expired',
    isBanned: true,
    bannedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const unbanUser = async (userId: string) => {
  await updateDoc(doc(db, 'users', userId), {
    status: 'active',
    isBanned: false,
    bannedAt: deleteField(),
    updatedAt: serverTimestamp(),
  });
};

export const deleteUserDoc = async (userId: string) => {
  await updateDoc(doc(db, 'users', userId), {
    status: 'deleted',
    isDeleted: true,
    isBanned: true,
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

const toDateText = (value: unknown): string => {
  if (!value) return '-';
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toLocaleString();
  }
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleString();
  }
  return '-';
};

export const subscribeTransactions = (
  onData: (rows: AdminTransaction[]) => void,
  onError?: (error: unknown) => void
) => {
  let purchaseRows: AdminTransaction[] = [];
  let tokenRows: AdminTransaction[] = [];

  const emit = () => {
    const all = [...purchaseRows, ...tokenRows];
    all.sort((a, b) => {
      const aTs = Date.parse(a.date);
      const bTs = Date.parse(b.date);
      if (Number.isNaN(aTs) || Number.isNaN(bTs)) return 0;
      return bTs - aTs;
    });
    onData(all);
  };

  const unsubPurchase = onSnapshot(
    collectionGroup(db, 'purchaseHistory'),
    (snapshot) => {
      purchaseRows = snapshot.docs.map((entry) => {
        const data = entry.data() as RawTransaction;
        const spent = data.cost ?? data.amount ?? '-';
        const tokens = typeof data.tokensAdded === 'number'
          ? data.tokensAdded
          : typeof data.tokenChanged === 'number'
            ? data.tokenChanged
            : 0;

        return {
          id: entry.id,
          userId: data.userId || '',
          userEmail: '',
          amountSpent: String(spent),
          tokensAdded: tokens,
          date: toDateText(data.timestamp),
          source: 'purchaseHistory',
        };
      });
      emit();
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  const unsubTokenTx = onSnapshot(
    collection(db, 'token_transactions'),
    (snapshot) => {
      tokenRows = snapshot.docs
        .map((entry) => {
          const data = entry.data() as RawTransaction;
          if (data.transactionType && data.transactionType !== 'topup') return null;

          const tokens = typeof data.tokenChanged === 'number'
            ? data.tokenChanged
            : typeof data.tokensAdded === 'number'
              ? data.tokensAdded
              : 0;

          return {
            id: entry.id,
            userId: data.userId || '',
            userEmail: '',
            amountSpent: data.cost != null ? String(data.cost) : '-',
            tokensAdded: tokens,
            date: toDateText(data.timestamp),
            source: 'token_transactions' as const,
          };
        })
        .filter((row): row is AdminTransaction => row !== null);
      emit();
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  return () => {
    unsubPurchase();
    unsubTokenTx();
  };
};