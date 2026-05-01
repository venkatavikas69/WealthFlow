import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, signInWithGoogle, logout } from '../lib/firebase';
import { LogOut, LogIn, PieChart, Wallet, CreditCard, LayoutDashboard, User as UserIcon, Sun, Moon, Sparkles, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddClick?: () => void;
  isLoading?: boolean;
}

export default function Layout({ children, activeTab, setActiveTab, onAddClick, isLoading }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'Wallet', icon: Wallet },
    { id: 'assistant', label: 'Assistant', icon: Sparkles, premium: true },
    { id: 'budgets', label: 'Budgets', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-[#1e293b] dark:text-[#f8fafc] font-sans selection:bg-blue-100 dark:selection:bg-indigo-900 selection:text-blue-700 dark:selection:text-indigo-100 transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <nav className="hidden md:flex fixed top-4 left-4 h-[calc(100vh-2rem)] w-72 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border border-gray-100 dark:border-white/5 flex-col z-50 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-all duration-300">
        <div className="p-8 flex-1 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white italic font-display">WealthFlow</h1>
            </div>
          </div>

          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-500 relative group overflow-hidden",
                    isActive 
                      ? tab.premium 
                        ? "text-indigo-600 dark:text-indigo-400 font-bold"
                        : "text-indigo-600 dark:text-indigo-400 font-bold" 
                      : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className={cn(
                        "absolute inset-0 -z-10",
                        tab.premium 
                          ? "bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20"
                          : "bg-indigo-50/50 dark:bg-indigo-500/10"
                      )}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <div className="relative">
                    <Icon className={cn(
                      "w-5 h-5 transition-transform duration-500 group-hover:scale-110",
                      isActive 
                        ? tab.premium ? "text-purple-600 dark:text-purple-400" : "text-indigo-600 dark:text-indigo-400" 
                        : "text-gray-400 dark:text-gray-500"
                    )} />
                    {tab.premium && !isActive && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em]",
                    tab.premium && isActive && "bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent"
                  )}>
                    {tab.label}
                  </span>

                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-indicator"
                      className={cn(
                        "absolute right-2 w-1.5 h-6 rounded-full shadow-lg",
                        tab.premium 
                          ? "bg-gradient-to-b from-purple-500 to-indigo-600 shadow-purple-200 dark:shadow-none" 
                          : "bg-indigo-600 dark:bg-indigo-400 shadow-indigo-200 dark:shadow-none"
                      )}
                    />
                  )}
                </button>
              );
            })}
            
            <button
              onClick={() => setActiveTab('profile')}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-500 relative group overflow-hidden",
                activeTab === 'profile'
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-white/5"
              )}
            >
               {activeTab === 'profile' && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-indigo-50/50 dark:bg-indigo-500/10 -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <UserIcon className={cn("w-5 h-5", activeTab === 'profile' ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500")} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Profile</span>
            </button>
          </div>

          <div className="mt-12 space-y-3">
             <button 
              onClick={onAddClick}
              className="w-full flex items-center justify-center gap-2 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </button>
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gray-50/50 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-auto pt-8 border-t border-gray-50 dark:border-gray-800/50">
            {user && (
              <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('profile')}>
                <div className="relative">
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="" className="w-12 h-12 rounded-[1.2rem] object-cover ring-2 ring-gray-100 dark:ring-white/5 transition-transform group-hover:scale-105" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white dark:border-[#0f172a] rounded-full" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-gray-900 dark:text-white truncate uppercase tracking-wider">{user.displayName}</span>
                  <button onClick={(e) => { e.stopPropagation(); logout(); }} className="text-[9px] text-gray-400 dark:text-gray-500 hover:text-red-500 font-bold uppercase tracking-widest text-left mt-0.5">
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-2xl border border-white dark:border-white/5 shadow-[0_15px_40px_rgba(0,0,0,0.12)] rounded-[2.5rem] px-4 py-4 z-50">
        <div className="grid grid-cols-5 items-center">
          {tabs.slice(0, 2).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 transition-all duration-300 relative",
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"
                )}
              >
                <Icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} />
                <span className="text-[8px] font-black uppercase tracking-[0.1em]">{tab.label}</span>
                {isActive && (
                  <motion.div layoutId="mobile-indicator" className="absolute -bottom-1 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </button>
            );
          })}

          <div className="flex justify-center">
            <button 
              onClick={onAddClick}
              className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 -mt-12 border-4 border-[#f8fafc] dark:border-[#020617] active:scale-90 transition-all hover:rotate-90 group"
            >
              <Plus className="w-6 h-6 text-white group-hover:scale-125 transition-transform" />
            </button>
          </div>

          {tabs.slice(2).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 transition-all duration-300 relative",
                  isActive 
                    ? tab.premium ? "text-purple-600 dark:text-purple-400" : "text-indigo-600 dark:text-indigo-400" 
                    : "text-gray-400 dark:text-gray-500"
                )}
              >
                <div className="relative">
                  <Icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} />
                  {tab.premium && !isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.1em]">{tab.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="mobile-indicator" 
                    className={cn("absolute -bottom-1 w-1 h-1 rounded-full", tab.premium ? "bg-purple-600" : "bg-indigo-600 dark:bg-indigo-400")} 
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:pl-80 min-h-screen relative transition-all duration-300">
        <header className="md:hidden flex items-center justify-between p-6 bg-white dark:bg-[#0f172a] sticky top-0 z-40 border-b border-gray-50 dark:border-gray-800 uppercase tracking-tighter transition-colors">
           <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black italic text-gray-900 dark:text-white">WealthFlow</h1>
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse ml-2" 
                />
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-xl active:scale-90 transition-all"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>
            {user && (
              <button onClick={() => setActiveTab('profile')}>
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="" className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-50 dark:ring-indigo-900/20" />
              </button>
            )}
          </div>
        </header>

        {/* Desktop Syncing Indicator */}
        <div className="hidden md:block">
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="fixed top-8 right-8 z-[60] flex items-center gap-3 bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl shadow-indigo-100 dark:shadow-none"
              >
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Synchronizing</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 md:p-12 pb-32 md:pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ 
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="max-w-6xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
