import { useState, useEffect, useCallback } from 'react';
import { Transaction, Budget, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useFinance() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [tRes, bRes, pRes] = await Promise.all([
        fetch('/api/transactions', { credentials: 'include' }),
        fetch('/api/budgets', { credentials: 'include' }),
        fetch('/api/profile', { credentials: 'include' })
      ]);

      if (tRes.ok) setTransactions(await tRes.json());
      if (bRes.ok) setBudgets(await bRes.json());
      if (pRes.ok) setUserProfile(await pRes.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (res.ok) {
        await fetchData();
      } else {
        const errorData = await res.json();
        console.error("Update profile failed:", errorData.error);
        alert(`Failed to update profile: ${errorData.error}`);
        throw new Error(errorData.error);
      }
    } catch (err: any) {
      console.error("Update profile failed:", err);
      alert("Update profile failed due to a network error.");
      throw err;
    }
  };

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (res.ok) {
        await fetchData();
      } else {
        const errorData = await res.json();
        console.error("Add transaction failed:", errorData.error);
        alert(`Failed to add transaction: ${errorData.error}`);
        throw new Error(errorData.error);
      }
    } catch (err: any) {
      console.error("Add transaction failed:", err);
      alert("Add transaction failed due to a network error.");
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, { 
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        await fetchData();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err: any) {
      console.error("Delete transaction failed:", err);
      throw err;
    }
  };

  const addOrUpdateBudget = async (categoryId: string, amount: number, period: string) => {
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, amount, period }),
        credentials: 'include'
      });
      if (res.ok) await fetchData();
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
    refresh: fetchData
  };
}
