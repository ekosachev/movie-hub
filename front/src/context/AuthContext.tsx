import React, { createContext, useContext, useMemo, useState } from 'react';
import { parseJwt, roleFromPermissions, userIdFromSub, type AppRole } from '../auth/jwt';

export interface AuthUser {
  email: string;
  token: string;
  id: number | null;
  permissions: string[];
  role: AppRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    if (!token || !email) return null;

    const payload = parseJwt(token);
    const permissions = payload?.permissions ?? [];
    const id = userIdFromSub(payload?.sub);
    const role = roleFromPermissions(permissions);

    return { email, token, id, permissions, role };
  });

  const login = (email: string, token: string) => {
    const payload = parseJwt(token);
    const permissions = payload?.permissions ?? [];
    const id = userIdFromSub(payload?.sub);
    const role = roleFromPermissions(permissions);

    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    setUser({ email, token, id, permissions, role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) ?? false;
  };

  const value = useMemo(() => ({ user, login, logout, hasPermission }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
