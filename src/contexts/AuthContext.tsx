import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthUser {
  email: string;
  emailVerified: boolean;
  uid: string;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ mfaRequired?: boolean; email?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated auth check using localStorage
    const savedUser = localStorage.getItem('guest_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      const guest = {
        email: 'guest@example.com',
        emailVerified: true,
        uid: 'guest_user_123',
        displayName: 'Guest User',
        photoURL: null
      };
      localStorage.setItem('guest_user', JSON.stringify(guest));
      setUser(guest);
    }
    setLoading(false);
  }, []);

  const loginWithGitHub = async () => {
    console.warn('Real Auth disabled for static build');
  };

  const loginWithGoogle = async () => {
    console.warn('Real Auth disabled for static build');
  };

  const login = async (email: string, password: string) => {
    const guest = {
      email,
      emailVerified: true,
      uid: 'guest_user_123',
      displayName: email.split('@')[0],
      photoURL: null
    };
    localStorage.setItem('guest_user', JSON.stringify(guest));
    setUser(guest);
    return { email };
  };

  const verifyOTP = async (email: string, otp: string) => {
    console.warn('OTP not available in static mode');
  };

  const register = async (email: string, password: string) => {
    await login(email, password);
  };

  const verifyEmail = async (code: string) => {
    console.warn('Verification not needed');
  };

  const resendVerification = async () => {
    console.warn('Resend disabled');
  };

  const logout = async () => {
    localStorage.removeItem('guest_user');
    setUser(null);
  };

  const changePassword = async (newPassword: string) => {
    console.warn('Password change not available in static mode');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOTP, register, verifyEmail, resendVerification, loginWithGitHub, loginWithGoogle, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
