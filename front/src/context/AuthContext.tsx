import React, { createContext, useContext, useState } from 'react';

interface AuthUser {
  email: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    return token && email ? { email, token } : null;
  });

  const login = (email: string, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    setUser({ email, token });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
