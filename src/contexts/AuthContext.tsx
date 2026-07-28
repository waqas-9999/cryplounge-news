'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SecureStorage } from '../utils/secureStorage';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'email' | 'google';
  createdAt: string;
  xp: number;
  level: number;
  coursesCompleted: number;
  articlesRead: number;
  watchlist: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  signupWithGoogle: () => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = SecureStorage.get<User>('cryplounge_user');
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  // Save user to secure storage whenever it changes
  useEffect(() => {
    if (user) {
      SecureStorage.set('cryplounge_user', user);
    } else {
      SecureStorage.remove('cryplounge_user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - In production, this would come from your backend
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        provider: 'email',
        createdAt: new Date().toISOString(),
        xp: 0,
        level: 1,
        coursesCompleted: 0,
        articlesRead: 0,
        watchlist: [],
      };
      
      setUser(mockUser);
    } catch (error) {
      throw new Error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Simulate Google OAuth
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: 'user@gmail.com',
        name: 'Google User',
        avatar: 'https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff',
        provider: 'google',
        createdAt: new Date().toISOString(),
        xp: 0,
        level: 1,
        coursesCompleted: 0,
        articlesRead: 0,
        watchlist: [],
      };
      
      setUser(mockUser);
    } catch (error) {
      throw new Error('Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        provider: 'email',
        createdAt: new Date().toISOString(),
        xp: 0,
        level: 1,
        coursesCompleted: 0,
        articlesRead: 0,
        watchlist: [],
      };
      
      setUser(mockUser);
    } catch (error) {
      throw new Error('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithGoogle = async () => {
    // Same as loginWithGoogle for this demo
    return loginWithGoogle();
  };

  const logout = () => {
    setUser(null);
    SecureStorage.remove('cryplounge_user');
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In production, this would send a password reset email
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In production, this would update the password
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    signup,
    signupWithGoogle,
    logout,
    updateProfile,
    resetPassword,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
