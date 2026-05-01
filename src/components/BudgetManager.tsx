import React, { useState } from 'react';
import { Budget, DEFAULT_CATEGORIES } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Target, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';

interface BudgetManagerProps {
  budgets: Budget[];
  transactions: any[];
  onUpdate: (catId: string, amount: number, period: string) => Promise<void>;
  currency?: string;
}

export default function BudgetManager({ budgets, transactions, onUpdate, currency = 'USD' }: BudgetManagerProps) {
  const currentPeriod = format(new Date(), 'yyyy-MM');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleUpdate = async (catId: string) => {
    const amount = parseFloat(editValue);
    if (isNaN(amount)) return;
    
    setIsUpdating(catId);
    try {
      await onUpdate(catId, amount, currentPeriod);
      setEditingCat(null);
    } catch (error) {
      console.error("Failed to update budget:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const expenseCategories = DEFAULT_CATEGORIES.filter(c => !c.id.startsWith('income'));
  const hasNoBudgets = budgets.filter(b => b.period === currentPeriod).length === 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black dark:bg-indigo-600 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">Limit</h2>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium tracking-tight">Plan your spending for {format(new Date(), 'MMMM yyyy')}</p>
        </div>
      </div>

      {hasNoBudgets && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-600 dark:bg-indigo-700 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center shrink-0 border border-white/20">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black tracking-tight">Master your spending</h3>
              <p className="text-white/70 dark:text-indigo-100 max-w-md leading-relaxed text-sm sm:text-base">
                Setting budgets helps you save more by defining clear limits for each category. Start by setting your first budget below.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {expenseCategories.map((cat) => {
          const budget = budgets.find(b => b.categoryId === cat.id && b.period === currentPeriod);
          const spent = transactions
            .filter(t => t.category === cat.name && t.type === 'expense' && t.date.startsWith(currentPeriod))
            .reduce((sum, t) => sum + t.amount, 0);

          const progress = budget ? (spent / budget.amount) * 100 : 0;
          const isOver = progress > 100;

          return (
            <div key={cat.id} className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {budget ? `${formatCurrency(spent, currency)} spent of ${formatCurrency(budget.amount, currency)}` : 'No budget set'}
                    </p>
                  </div>
                </div>

                {editingCat === cat.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      autoFocus
                      disabled={isUpdating === cat.id}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-20 px-2 py-1 text-sm border-b-2 border-indigo-500 bg-transparent text-gray-900 dark:text-white focus:outline-none disabled:opacity-50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate(cat.id);
                        if (e.key === 'Escape') setEditingCat(null);
                      }}
                    />
                    <button 
                      onClick={() => handleUpdate(cat.id)}
                      disabled={isUpdating === cat.id}
                      className="text-indigo-600 dark:text-indigo-400 disabled:opacity-50"
                    >
                      {isUpdating === cat.id ? (
                        <div className="w-5 h-5 border-2 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setEditingCat(cat.id);
                      setEditValue(budget?.amount.toString() || '');
                    }}
                    disabled={isUpdating !== null}
                    className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
                  >
                    {budget ? 'Edit' : 'Set Budget'}
                  </button>
                )}
              </div>

              {budget && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-500",
                        isOver ? "bg-red-500" : "bg-blue-500 dark:bg-indigo-500"
                      )}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Progress: {progress.toFixed(0)}%</span>
                    {isOver && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Over Budget
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
