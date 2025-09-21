import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, ApiError } from '@/services/api';

// --- FIX: UserRole is now uppercase to match the backend and database ---
export type UserRole = 'CITIZEN' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  // --- FIX: Login function now returns the User object on success ---
  login: (email: string, password: string, role: UserRole) => Promise<User | null>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check local storage first for a faster initial load
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        // Then verify with the server
        const response = await apiService.getProfile();
        setUser(response.user);
      } catch (error) {
        apiService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.login(email, password, role);
      setUser(response.user);
      // --- FIX: Store user object in local storage for session persistence ---
      localStorage.setItem('user', JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setError(null);
    // --- FIX: Clear user from local storage on logout ---
    localStorage.removeItem('user');
    window.location.href = '/login'; // Force a full redirect to clear state
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
