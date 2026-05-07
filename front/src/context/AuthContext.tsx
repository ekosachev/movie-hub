import React, { createContext, useContext, useState } from 'react';

interface AuthUser {
  email: string;
  token: string;
  permissions: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

function decodePermissions(token: string): string[] {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Array.isArray(payload.permissions) ? payload.permissions : [];
  } catch {
    return [];
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    if (!token || !email) return null;
    return { email, token, permissions: decodePermissions(token) };
  });

  const login = (email: string, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    setUser({ email, token, permissions: decodePermissions(token) });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
