import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User as UserIcon, 
  LogOut, 
  Settings, 
  Shield, 
  Bell, 
  HelpCircle,
  CreditCard,
  Target,
  Edit2,
  Check,
  X,
  Camera,
  ChevronRight,
  Globe,
  AtSign,
  Lock
} from 'lucide-react';
import { Transaction, Budget, UserProfile } from '../types';
import { formatCurrency, cn } from '../lib/utils';

interface ProfileProps {
  transactions: Transaction[];
  budgets: Budget[];
  userProfile: UserProfile | null;
  onUpdateProfile: (data: Partial<UserProfile>) => void;
}

interface PasswordManagerProps {
  user: any;
}

function PasswordManager({ user }: PasswordManagerProps) {
  const { changePassword } = useAuth();
  const [isChanging, setIsChanging] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleAction = async () => {
    if (newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await changePassword(newPassword);
      setMessage({ text: 'Password updated successfully!', type: 'success' });
      setNewPassword('');
      setTimeout(() => setIsChanging(false), 2000);
    } catch (error: any) {
      console.error("Password action failed:", error);
      const friendlyMessage = error.message.includes('auth/requires-recent-login') 
        ? "Please re-login to change your password for security."
        : error.message;
      setMessage({ text: friendlyMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Security Control</span>
        </div>
        {isChanging && (
          <button 
            onClick={() => { setIsChanging(false); setMessage(null); }}
            className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase hover:text-gray-600 dark:hover:text-gray-300"
          >
            Cancel
          </button>
        )}
      </div>

      {!isChanging ? (
        <div className="space-y-2">
          <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
            Manage your account's primary password.
          </p>
          <button 
            onClick={() => setIsChanging(true)}
            className="w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
          >
            Change Account Password
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="password"
              placeholder="New password (min. 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-3 pr-3 py-2 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:ring-1 focus:ring-black dark:focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
              autoFocus
            />
          </div>
          {message && (
            <p className={cn(
              "text-[10px] font-bold",
              message.type === 'success' ? "text-green-600" : "text-red-500"
            )}>
              {message.text}
            </p>
          )}
          <button 
            onClick={handleAction}
            disabled={loading}
            className="w-full py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : "Update Password"}
          </button>
        </div>
      )}
    </div>
  );
}

function MFAManager() {
  return (
    <div className="space-y-3 pt-4 border-t border-gray-200/50 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3 text-gray-400 dark:text-gray-500" />
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cloud Security</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            Active
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
          Your account is protected by standard Firebase Security protocols.
        </p>
      </div>
    </div>
  );
}

export default function Profile({ transactions, budgets, userProfile, onUpdateProfile }: ProfileProps) {
  const { user, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync state when userProfile arrives or changes
  React.useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setUsername(userProfile.username || '');
      setPhotoURL(userProfile.photoURL || '');
    }
  }, [userProfile]);

  // Simple local state for settings to make them interactive
  const [notifications, setNotifications] = useState(true);

  if (!user) return null;

  // Fallback if userProfile is missing (should not happen with our server)
  const profile = userProfile || {
    uid: user.email,
    displayName: user.email.split('@')[0],
    username: user.email.split('@')[0],
    photoURL: '',
    preferredCurrency: 'USD' as const
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await onUpdateProfile({
        displayName,
        username,
        photoURL,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const currentCurrency = profile.preferredCurrency || 'USD';
  const totalTransactions = transactions.length;
  const totalBudgets = budgets.length;
  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    { label: 'Transactions', value: totalTransactions, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Spent', value: formatCurrency(totalSpent, currentCurrency), icon: Shield, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Active Budgets', value: totalBudgets, icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
        {/* Header/Cover */}
        <div className="h-24 bg-black dark:bg-indigo-900 relative">
          <button 
            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            disabled={loading}
            className={cn(
              "absolute top-4 right-4 p-2 rounded-xl backdrop-blur-md transition-all",
              isEditing ? "bg-green-500 text-white" : "bg-white/20 text-white hover:bg-white/30"
            )}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isEditing ? (
              <Check className="w-5 h-5" />
            ) : (
              <Edit2 className="w-5 h-5" />
            )}
          </button>
          {isEditing && (
            <button 
              onClick={() => {
                setIsEditing(false);
                setDisplayName(profile.displayName || '');
                setPhotoURL(profile.photoURL || '');
              }}
              className="absolute top-4 right-16 p-2 bg-white/20 text-white rounded-xl backdrop-blur-md hover:bg-white/30 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="px-6 pb-6 relative">
          <div className="relative -top-10 flex flex-col items-center">
            <div className="relative group">
              <img 
                src={photoURL || `https://ui-avatars.com/api/?name=${displayName || user.email}`} 
                alt={displayName || 'User'} 
                className="w-24 h-24 rounded-3xl border-4 border-white dark:border-gray-800 shadow-md mb-4 bg-white dark:bg-[#1e293b] object-cover"
              />
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl mb-4 group-hover:bg-black/50 transition-all cursor-pointer">
                  <Camera className="text-white w-8 h-8" />
                  <input 
                    type="text" 
                    placeholder="Photo URL"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 text-[10px] p-2 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-800 rounded-lg shadow-xl z-10 text-gray-900 dark:text-white"
                  />
                </div>
              )}
            </div>
            
              {isEditing ? (
                <div className="flex flex-col items-center">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    className="text-xl font-bold text-center border-b-2 border-black dark:border-indigo-500 focus:outline-none mb-1 bg-transparent w-full text-gray-900 dark:text-white"
                  />
                  <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-sm">
                    <AtSign className="w-3 h-3" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                      placeholder="username"
                      className="border-b border-gray-200 dark:border-gray-800 focus:outline-none bg-transparent text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{displayName || 'Anonymous'}</h2>
                  <p className="text-black dark:text-indigo-400 font-semibold text-xs transition-all hover:scale-105 cursor-pointer">
                    @{username || 'user'}
                  </p>
                </div>
              )}
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-2">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-1`} />
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tighter mb-1">{stat.label}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f172a] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800 transition-colors duration-300">
        <div className="p-6">
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Account Settings</h3>
          <div className="space-y-2">
            {/* Notifications Toggle */}
            <button 
              onClick={() => setNotifications(!notifications)}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notifications</span>
              </div>
              <div className={cn(
                "w-10 h-5 rounded-full transition-all relative",
                notifications ? "bg-black dark:bg-indigo-600" : "bg-gray-200 dark:bg-gray-800"
              )}>
                <div className={cn(
                  "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                  notifications ? "right-1" : "left-1"
                )} />
              </div>
            </button>

            {/* Currency Preference */}
            <button 
              onClick={async () => {
                setLoading(true);
                try {
                  await onUpdateProfile({ preferredCurrency: currentCurrency === 'USD' ? 'INR' : 'USD' });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Currency</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 font-bold">
                {currentCurrency === 'USD' ? 'USD ($)' : 'INR (₹)'} <Settings className="w-3 h-3 ml-1" />
              </div>
            </button>

            {/* Security Section */}
            <div className="p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Data & Security</span>
              </div>
              <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                <div className="space-y-4">
                  <PasswordManager user={user} />
                  <MFAManager />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <button 
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-3 py-4 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-2xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors active:scale-[0.98]"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
          <div className="mt-6 text-center">
            <p className="text-[10px] text-gray-300 dark:text-gray-700 font-bold uppercase tracking-[0.2em]">FinStream v2.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
