import React from 'react';
import { 
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { Transaction, DEFAULT_CATEGORIES, Budget } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft, Clock, Zap, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { format, subDays, startOfDay, isWithinInterval, parseISO } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  currency?: string;
}

export default function Dashboard({ transactions, budgets, currency = 'USD' }: DashboardProps) {
  const { theme } = useTheme();
  const incomes = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Calculate weekly trend
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), i);
    const formattedTarget = format(date, 'yyyy-MM-dd');
    const dayTransactions = transactions.filter(t => 
      format(parseISO(t.date), 'yyyy-MM-dd') === formattedTarget
    );
    const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return {
      date: format(date, 'MMM d'),
      income: dayIncome,
      expense: dayExpense,
    };
  }).reverse();

  // Group by category for pie chart
  const categoryData = expenses.reduce((acc, t) => {
    const existing = acc.find(item => item.name === t.category);
    if (existing) {
      existing.value += t.amount;
    } else {
      acc.push({ name: t.category, value: t.amount });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const COLORS = DEFAULT_CATEGORIES.reduce((acc, cat) => {
    acc[cat.name] = cat.color;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
      {/* Hero Section - Wallet & Balance */}
      <div className="lg:col-span-8 space-y-6 sm:space-y-8">
        <div className="relative overflow-hidden bg-black dark:bg-indigo-950 rounded-[2.5rem] p-6 sm:p-8 lg:p-12 text-white shadow-2xl transition-colors duration-300">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-[10px] sm:text-sm font-bold tracking-widest uppercase text-white/40">Total Liquidity</span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tighter truncate leading-tight">
                {formatCurrency(balance, currency)}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-2">
                <div className="flex items-center gap-1 text-green-400 font-bold bg-green-400/10 px-3 py-1 rounded-full text-[10px] sm:text-sm">
                  <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>+12.5%</span>
                </div>
                <span className="text-white/40 text-[10px] sm:text-sm font-medium">Growth this month</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-white/10">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-white/40 text-[9px] sm:text-xs font-bold uppercase tracking-wider truncate">
                  <ArrowUpRight className="w-3 h-3 shrink-0" /> Monthly Income
                </div>
                <div className="text-xl sm:text-2xl font-bold truncate">{formatCurrency(totalIncome, currency)}</div>
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-white/40 text-[9px] sm:text-xs font-bold uppercase tracking-wider truncate">
                  <ArrowDownLeft className="w-3 h-3 shrink-0" /> Monthly Spending
                </div>
                <div className="text-xl sm:text-2xl font-bold truncate">{formatCurrency(totalExpense, currency)}</div>
              </div>
            </div>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/30 dark:bg-indigo-600/30 rounded-full blur-[120px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 dark:bg-blue-600/20 rounded-full blur-[100px] -ml-32 -mb-32" />
        </div>

        {/* Dynamic Activity Chart */}
        <div className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative group transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Financial Pulse</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-tight">Net activity over the last 7 days</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-indigo-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inflow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Outflow</span>
              </div>
            </div>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'light' ? '#2563eb' : '#818cf8'} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={theme === 'light' ? '#2563eb' : '#818cf8'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'light' ? '#f8fafc' : '#1e293b'} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: theme === 'light' ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <ReTooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)', 
                    padding: '16px',
                    backgroundColor: theme === 'light' ? '#fff' : '#1e293b',
                    color: theme === 'light' ? '#1e293b' : '#fff'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke={theme === 'light' ? '#2563eb' : '#818cf8'} 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={0} 
                  fill="transparent" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sidebar Section - Allocation & Insights */}
      <div className="lg:col-span-4 space-y-6 sm:space-y-8">
        <div className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-gray-900 dark:text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight truncate">Allocation</h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest truncate">By Category</p>
            </div>
          </div>
          
          <div className="h-[200px] relative">
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#cbd5e1'} strokeWidth={0} />
                      ))}
                    </Pie>
                    <ReTooltip 
                      formatter={(value: number) => formatCurrency(value, currency)}
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                        backgroundColor: theme === 'light' ? '#fff' : '#1e293b',
                        color: theme === 'light' ? '#1e293b' : '#fff'
                      }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center px-4">
                    <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Spent</span>
                    <span className="text-base sm:text-lg font-black text-gray-900 dark:text-white truncate block max-w-[120px]">
                      {formatCurrency(totalExpense, currency)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-300 dark:text-gray-700 italic text-sm">No spendings yet</div>
            )}
          </div>

          <div className="mt-8 space-y-3">
            {categoryData.sort((a, b) => b.value - a.value).slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center justify-between group cursor-default gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[item.name] || '#cbd5e1' }} />
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors truncate">{item.name}</span>
                </div>
                <span className="text-xs font-black text-gray-900 dark:text-white shrink-0">{Math.round((item.value / totalExpense) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Insights */}
        <div className="bg-indigo-600 dark:bg-indigo-700 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden transition-colors duration-300">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold tracking-tight">Active Goals</h3>
            </div>
            
            <div className="space-y-6">
              {budgets.length > 0 ? budgets.slice(0, 2).map((budget) => {
                const spending = transactions
                  .filter(t => t.type === 'expense' && t.category === budget.categoryId)
                  .reduce((sum, t) => sum + t.amount, 0);
                const progress = Math.min((spending / budget.amount) * 100, 100);
                
                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest opacity-80 gap-4">
                      <span className="truncate">{budget.categoryId}</span>
                      <span className="shrink-0">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          progress > 90 ? "bg-red-400" : "bg-white"
                        )}
                      />
                    </div>
                  </div>
                );
              }) : (
                <p className="text-xs text-white/50 italic leading-relaxed">No budgets set. Define your financial limits in the Budgets tab.</p>
              )}
            </div>
          </div>
          
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
}

