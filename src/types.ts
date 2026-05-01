export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  photoURL: string;
  preferredCurrency: 'USD' | 'INR';
  updatedAt?: any;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  type: TransactionType;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  period: string; // YYYY-MM
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'housing', name: 'Housing', icon: 'Home', color: '#3b82f6' },
  { id: 'transport', name: 'Transport', icon: 'Car', color: '#ef4444' },
  { id: 'food', name: 'Food', icon: 'Utensils', color: '#f59e0b' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: '#8b5cf6' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'health', name: 'Health', icon: 'Heart', color: '#10b981' },
  { id: 'utilities', name: 'Utilities', icon: 'Zap', color: '#6366f1' },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: '#6b7280' },
  { id: 'income_salary', name: 'Salary', icon: 'Briefcase', color: '#10b981' },
  { id: 'income_gift', name: 'Gift', icon: 'Gift', color: '#3b82f6' },
];
