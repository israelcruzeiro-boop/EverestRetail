import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storageService } from '../lib/storageService';
import { AdminUser, UserRole } from '../types/admin';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string) => Promise<AdminUser>;
  signup: (name: string, email: string) => Promise<AdminUser>;
  logout: () => void;
}

const AUTH_KEY = 'ENT_AUTH_USER';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem(AUTH_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const login = async (email: string): Promise<AdminUser> => {
    const users = storageService.getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      throw new Error('Usuário não encontrado.');
    }

    if (found.status !== 'active') {
      throw new Error('Esta conta está inativa. Entre em contato com o suporte.');
    }

    setUser(found);
    localStorage.setItem(AUTH_KEY, JSON.stringify(found));
    return found;
  };

  const signup = async (name: string, email: string): Promise<AdminUser> => {
    const users = storageService.getUsers();
    const alreadyExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (alreadyExists) {
      throw new Error('Este e-mail já está cadastrado.');
    }

    const newUser: AdminUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role: 'viewer',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    storageService.saveUsers([...users, newUser]);
    setUser(newUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}