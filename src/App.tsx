/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import BudgetManager from './components/BudgetManager';
import Profile from './components/Profile';
import AIAssistant from './components/AIAssistant';
import { Auth } from './components/Auth';
import { VerifyEmail } from './components/VerifyEmail';
import { useFinance } from './hooks/useFinance';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  
  const { 
    transactions, 
    budgets, 
    userProfile, 
    loading: dataLoading, 
    addTransaction, 
    deleteTransaction, 
    addOrUpdateBudget, 
    updateUserProfile 
  } = useFinance();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#020617] transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 animate-pulse uppercase tracking-[0.2em] ml-1">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const hasInitialData = transactions.length > 0 || budgets.length > 0 || !!userProfile;

  if (dataLoading && !hasInitialData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#020617] transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 animate-pulse uppercase tracking-[0.2em] ml-1">Loading data...</p>
        </div>
      </div>
    );
  }

  const currency = userProfile?.preferredCurrency || 'USD';

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} budgets={budgets} currency={currency} />;
      case 'transactions':
        return (
          <TransactionList 
            transactions={transactions} 
            onDelete={deleteTransaction} 
            onAdd={() => setIsAddModalOpen(true)}
            currency={currency}
          />
        );
      case 'budgets':
        return (
          <BudgetManager 
            budgets={budgets} 
            transactions={transactions} 
            onUpdate={addOrUpdateBudget}
            currency={currency}
          />
        );
      case 'assistant':
        return (
          <AIAssistant 
            transactions={transactions} 
            budgets={budgets} 
            userProfile={userProfile} 
          />
        );
      case 'profile':
        return (
          <Profile 
            transactions={transactions} 
            budgets={budgets} 
            userProfile={userProfile} 
            onUpdateProfile={updateUserProfile} 
          />
        );
      default:
        return <Dashboard transactions={transactions} budgets={budgets} currency={currency} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onAddClick={() => setIsAddModalOpen(true)}
      isLoading={dataLoading}
    >
      {renderContent()}
      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={addTransaction}
      />
    </Layout>
  );
}
