import { useState, useEffect, useCallback } from 'react';
import { Transaction, Budget, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

export function useFinance() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setBudgets([]);
      setUserProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Transactions Listener
    const qTransactions = query(
      collection(db, 'transactions'),
      where('userId', '==', user.email),
      orderBy('date', 'desc')
    );
    const unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(docs);
      setLoading(false);
    }, (err) => {
      console.error("Transactions error:", err);
      setError(err.message);
    });

    // 2. Budgets Listener
    const qBudgets = query(
      collection(db, 'budgets'),
      where('userId', '==', user.email)
    );
    const unsubBudgets = onSnapshot(qBudgets, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
      setBudgets(docs);
    });

    // 3. Profile Listener
    // Use doc reference for profile, assuming userId as doc key
    const docRef = doc(db, 'profiles', user.email);
    const unsubProfile = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile({ ...docSnap.data(), uid: docSnap.id } as UserProfile);
      } else {
        // Create default profile if missing
        const defaultProfile: UserProfile = {
          uid: user.email,
          username: user.email.split('@')[0],
          displayName: user.email.split('@')[0],
          photoURL: '',
          preferredCurrency: 'USD'
        };
        setUserProfile(defaultProfile);
      }
    });

    return () => {
      unsubTransactions();
      unsubBudgets();
      unsubProfile();
    };
  }, [user]);

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'profiles', user.email);
      await setDoc(docRef, { 
        ...data, 
        userId: user.email,
        updatedAt: new Date().toISOString() 
      }, { merge: true });
    } catch (err: any) {
      console.error("Update profile failed:", err);
      throw err;
    }
  };

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    try {
      const colRef = collection(db, 'transactions');
      await addDoc(colRef, {
        ...data,
        userId: user.email,
        createdAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Add transaction failed:", err);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (err: any) {
      console.error("Delete transaction failed:", err);
      throw err;
    }
  };

  const addOrUpdateBudget = async (categoryId: string, amount: number, period: string) => {
    if (!user) return;
    try {
      const budgetId = `${user.email}_${categoryId}_${period}`;
      const docRef = doc(db, 'budgets', budgetId);
      await setDoc(docRef, {
        userId: user.email,
        categoryId,
        amount,
        period,
        createdAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Update budget failed:", err);
    }
  };

  return {
    transactions,
    budgets,
    userProfile,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    addOrUpdateBudget,
    updateUserProfile,
    refresh: () => {} // Refresh is automatic with onSnapshot
  };
}
