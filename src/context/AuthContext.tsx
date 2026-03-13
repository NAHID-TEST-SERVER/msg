import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  logoutDemoAdmin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  logout: async () => {},
  logoutDemoAdmin: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoAdmin, setIsDemoAdmin] = useState(localStorage.getItem('isDemoAdmin') === 'true');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Listen to profile changes in real-time
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile({ id: docSnap.id, ...docSnap.data() } as UserProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        // If we are demo admin, we don't need a firebase user for the dashboard
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const isAdmin = profile?.role === 'admin' || isDemoAdmin;

  const logout = async () => {
    try {
      await auth.signOut();
      setProfile(null);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const logoutDemoAdmin = () => {
    localStorage.removeItem('isDemoAdmin');
    setIsDemoAdmin(false);
    window.location.href = '/admin/login';
  };

  return (
    <AuthContext.Provider value={{ user: isDemoAdmin ? ({ uid: 'demo-admin', email: 'admin@demo.com' } as any) : user, profile, loading, isAdmin, logout, logoutDemoAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
