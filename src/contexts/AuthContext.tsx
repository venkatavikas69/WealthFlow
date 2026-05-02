import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  sendEmailVerification
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../lib/firebase';

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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          email: firebaseUser.email || '',
          emailVerified: firebaseUser.emailVerified,
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGitHub = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (error: any) {
      console.error('GitHub Auth Error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { email: result.user.email || '' };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    // Note: Firebase standard auth doesn't use this exact pattern for OTP unless using Phone Auth.
    // Since we're migrating, we'll bypass this or implement if necessary.
    console.warn('OTP Verification not implemented in Firebase standard email/password flow');
  };

  const register = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const verifyEmail = async (code: string) => {
    // Handled automatically by Firebase if using standard verification links
    console.warn('Manual email verification code not supported in standard Firebase flow');
  };

  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const changePassword = async (newPassword: string) => {
    if (auth.currentUser) {
      const { updatePassword } = await import('firebase/auth');
      await updatePassword(auth.currentUser, newPassword);
    } else {
      throw new Error('No user authenticated');
    }
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
