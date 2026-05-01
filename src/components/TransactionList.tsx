import React, { useState } from 'react';
import { Transaction, DEFAULT_CATEGORIES } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Trash2, Plus, Calendar, Tag, FileText, Search, Filter, ArrowUpRight, ArrowDownLeft, X, ChevronDown, Info, Clock, ExternalLink } from 'lucide-react';
import { format, isToday, isYesterday, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onAdd: () => void;
  currency?: string;
}

export default function TransactionList({ transactions, onDelete, onAdd, currency = 'USD' }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await onDelete(id);
      if (selectedTransaction?.id === id) {
        setSelectedTransaction(null);
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
  };

  const activeFilterCount = (searchTerm ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0) + (categoryFilter !== 'all' ? 1 : 0);

  // Group by date
  const groupedTransactions = filteredTransactions.reduce((acc, t) => {
    const dateKey = format(parseISO(t.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col gap-8 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black dark:bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">Journal</h2>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium tracking-tight">Your chronological financial history</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-[#0f172a]/50 border border-gray-100 dark:border-gray-800 rounded-[2rem]">
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Search journal..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-800 rounded-2xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium text-gray-900 dark:text-white"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 relative",
              showFilters || activeFilterCount > 0
                ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg shadow-gray-200 dark:shadow-none"
                : "bg-white dark:bg-[#1e293b] border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
            )}
          >
            <Filter className="w-5 h-5" />
            {activeFilterCount > 0 && !showFilters && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[9px] font-black border-2 border-white dark:border-[#0f172a]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: -24 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden mb-10"
          >
            <div className="p-8 bg-white dark:bg-[#0f172a] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100 dark:shadow-none space-y-8">
              <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800 pb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Filter Parameters</h3>
                <button 
                  onClick={resetFilters}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors flex items-center gap-2"
                >
                  <X className="w-3 h-3" /> Reset
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 pl-1">Transaction Type</label>
                  <div className="flex p-1 bg-white dark:bg-[#1e293b] rounded-xl border border-gray-100 dark:border-gray-800">
                    {(['all', 'income', 'expense'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setTypeFilter(type)}
                        className={cn(
                          "flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize",
                          typeFilter === type
                            ? "bg-black dark:bg-indigo-600 text-white"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 pl-1">Category</label>
                  <div className="relative group">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full pl-5 pr-12 py-4 bg-gray-50 dark:bg-[#1e293b] border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-bold text-gray-900 dark:text-white appearance-none outline-none focus:ring-2 focus:ring-black dark:focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {DEFAULT_CATEGORIES.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none p-1 bg-white dark:bg-[#0f172a] rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-12">
        {Object.keys(groupedTransactions).length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#0f172a] rounded-[3rem] p-12 lg:p-20 border border-gray-100 dark:border-gray-800 text-center shadow-xl shadow-gray-50/50 dark:shadow-none relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-50/30 dark:bg-indigo-500/10 rounded-full blur-3xl -z-10" />
            <div className="w-24 h-24 bg-white dark:bg-[#1e293b] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-100 dark:shadow-none border border-gray-50 dark:border-gray-800">
              <FileText className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-3">No transactions yet</h3>
            <p className="text-gray-400 dark:text-gray-500 max-w-sm mx-auto mb-10 leading-relaxed">
              Start your financial journal today. Track every inflow and outflow to gain complete control over your wealth.
            </p>
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-10 py-5 bg-indigo-600 text-white rounded-2xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all font-black text-[10px] uppercase tracking-[0.2em] active:scale-95"
            >
              <Plus className="w-4 h-4" /> Create First Entry
            </button>
          </motion.div>
        ) : (
          Object.entries(groupedTransactions).map(([date, group], groupIndex) => (
            <motion.div 
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 px-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  {getDateLabel(date)}
                </span>
                <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800" />
              </div>
              
              <div className="space-y-3">
                {group.map((t) => {
                  const category = DEFAULT_CATEGORIES.find(c => c.name === t.category);
                  const isIncome = t.type === 'income';
                  
                  return (
                    <motion.div 
                      key={t.id}
                      layout
                      onClick={() => setSelectedTransaction(t)}
                      className="bg-white dark:bg-[#0f172a] p-4 sm:p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl dark:hover:shadow-indigo-900/10 hover:shadow-gray-100 transition-all group flex items-center gap-3 sm:gap-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
                        <div 
                          className="w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-2xl flex items-center justify-center text-white shadow-lg relative"
                          style={{ backgroundColor: category?.color || '#94a3b8' }}
                        >
                          {isIncome ? <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" /> : <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 dark:text-white text-sm sm:text-lg tracking-tight truncate">
                            {t.description || t.category}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 sm:mt-1 overflow-hidden">
                            <span 
                              className="px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-800 text-[9px] sm:text-[10px] font-black uppercase tracking-widest truncate shrink-0"
                              style={{ color: category?.color, borderColor: `${category?.color}20` }}
                            >
                              {t.category}
                            </span>
                            <span className="w-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap">
                              {format(parseISO(t.date), 'HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-6 shrink-0">
                        <div className="text-right">
                          <span className={cn(
                            "text-base sm:text-xl font-black tracking-tighter whitespace-nowrap block",
                            isIncome ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                          )}>
                            {isIncome ? '+' : '-'}{formatCurrency(t.amount, currency)}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDelete(t.id, e)}
                          disabled={deletingId === t.id}
                          className="p-2 sm:p-3 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all lg:opacity-0 group-hover:opacity-100 disabled:opacity-100 shrink-0"
                        >
                          {deletingId === t.id ? (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-red-200 dark:border-red-900 border-t-red-500 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTransaction(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border-t sm:border border-gray-100 dark:border-gray-800 max-h-[90vh] flex flex-col"
            >
              {/* Mobile Grab Handle */}
              <div className="sm:hidden absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/30 rounded-full z-10" />

              <div className="overflow-y-auto flex-1">
                {/* Header with color background */}
                <div 
                  className="h-28 sm:h-40 relative flex items-center justify-center"
                  style={{ backgroundColor: DEFAULT_CATEGORIES.find(c => c.name === selectedTransaction.category)?.color || '#94a3b8' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="relative w-14 h-14 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center border border-white/30 shadow-2xl">
                    {selectedTransaction.type === 'income' ? (
                      <ArrowUpRight className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
                    ) : (
                      <ArrowDownLeft className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
                    )}
                  </div>
                  <button 
                    onClick={() => setSelectedTransaction(null)}
                    className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                  <div className="text-center space-y-1 sm:space-y-2">
                    <div className={cn(
                      "text-2xl sm:text-4xl font-black tracking-tighter",
                      selectedTransaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                    )}>
                      {selectedTransaction.type === 'income' ? '+' : '-'}{formatCurrency(selectedTransaction.amount, currency)}
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{selectedTransaction.type}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-gray-50 dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <Tag className="w-3 h-3 text-gray-400" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Category</span>
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">{selectedTransaction.category}</div>
                    </div>
                    <div className="p-3 sm:p-4 bg-gray-50 dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Date</span>
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                        {format(parseISO(selectedTransaction.date), 'MMM d, HH:mm')}
                      </div>
                    </div>
                  </div>

                  {selectedTransaction.description && (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <Info className="w-3 h-3 text-gray-400" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Memo Details</span>
                      </div>
                      <div className="p-4 sm:p-6 bg-gray-50 dark:bg-[#1e293b] rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed break-words font-medium">
                        {selectedTransaction.description}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky Footer for Buttons */}
              <div className="p-6 sm:p-10 pt-6 sm:pt-8 bg-white dark:bg-[#0f172a] border-t border-gray-50 dark:border-gray-800 flex gap-3 sm:gap-4 mt-auto">
                 <button
                  onClick={() => setSelectedTransaction(null)}
                  className="flex-1 py-3.5 sm:py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Close
                </button>
                <button
                  onClick={(e) => handleDelete(selectedTransaction.id, e as any)}
                  disabled={deletingId === selectedTransaction.id}
                  className="flex-1 py-3.5 sm:py-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deletingId === selectedTransaction.id ? (
                    <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

