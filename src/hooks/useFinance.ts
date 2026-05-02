import { useState, useEffect } from 'react';
import { Transaction, Budget, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';

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

    try {
      // Load Transactions
      const savedTransactions = localStorage.getItem(`transactions_${user.uid}`);
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      } else {
        setTransactions([]);
      }

      // Load Budgets
      const savedBudgets = localStorage.getItem(`budgets_${user.uid}`);
      if (savedBudgets) {
        setBudgets(JSON.parse(savedBudgets));
      } else {
        setBudgets([]);
      }

      // Load Profile
      const savedProfile = localStorage.getItem(`profile_${user.uid}`);
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      } else {
        const defaultProfile: UserProfile = {
          uid: user.uid,
          username: user.email.split('@')[0],
          displayName: user.email.split('@')[0],
          photoURL: '',
          preferredCurrency: 'USD'
        };
        setUserProfile(defaultProfile);
        localStorage.setItem(`profile_${user.uid}`, JSON.stringify(defaultProfile));
      }
    } catch (err) {
      console.error("Error loading data from local storage:", err);
      setError("Failed to load local data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !userProfile) return;
    const updated = { ...userProfile, ...data };
    setUserProfile(updated);
    localStorage.setItem(`profile_${user.uid}`, JSON.stringify(updated));
  };

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newTransaction: Transaction = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      userId: user.uid,
      createdAt: new Date().toISOString()
    };
    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    localStorage.setItem(`transactions_${user.uid}`, JSON.stringify(updated));
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem(`transactions_${user.uid}`, JSON.stringify(updated));
  };

  const addOrUpdateBudget = async (categoryId: string, amount: number, period: string) => {
    if (!user) return;
    const existingIndex = budgets.findIndex(b => b.categoryId === categoryId && b.period === period);
    let updated;
    if (existingIndex > -1) {
      updated = [...budgets];
      updated[existingIndex] = { ...updated[existingIndex], amount };
    } else {
      updated = [...budgets, {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.uid,
        categoryId,
        amount,
        period,
        createdAt: new Date().toISOString()
      }];
    }
    setBudgets(updated);
    localStorage.setItem(`budgets_${user.uid}`, JSON.stringify(updated));
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
