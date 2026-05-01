import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthUser {
  email: string;
  emailVerified: boolean;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin if needed, but for simplicity in dev:
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        checkAuth();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const loginWithGitHub = async () => {
    const redirectUri = `${window.location.origin}/api/auth/github/callback`;
    const response = await fetch(`/api/auth/github/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to get GitHub auth URL');
    }
    const { url } = await response.json();
    
    window.open(url, 'github_oauth', 'width=600,height=700');
  };

  const loginWithGoogle = async () => {
    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    const response = await fetch(`/api/auth/google/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to get Google auth URL');
    }
    const { url } = await response.json();
    
    window.open(url, 'google_oauth', 'width=600,height=700');
  };

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    
    if (data.mfaRequired) {
      return data;
    }
    
    setUser(data);
    return data;
  };

  const verifyOTP = async (email: string, otp: string) => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'OTP verification failed');
    setUser(data);
  };

  const register = async (email: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    setUser(data);
  };

  const verifyEmail = async (code: string) => {
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    setUser(data);
  };

  const resendVerification = async () => {
    const res = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to resend code');
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOTP, register, verifyEmail, resendVerification, loginWithGitHub, loginWithGoogle, logout }}>
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
