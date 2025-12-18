
import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'Requester' | 'Approver' | 'Finance' | 'Admin' | 'FPA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  dept: string;
  initials: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<UserRole, User> = {
  Admin: { id: 'u1', name: 'Alex Admin', email: 'alex@mims.com', role: 'Admin', dept: 'IT', initials: 'AA' },
  Requester: { id: 'u2', name: 'John Requester', email: 'john@mims.com', role: 'Requester', dept: 'Marketing', initials: 'JR' },
  Approver: { id: 'u3', name: 'Sarah Manager', email: 'sarah@mims.com', role: 'Approver', dept: 'Sales', initials: 'SM' },
  Finance: { id: 'u4', name: 'Mike Finance', email: 'mike@mims.com', role: 'Finance', dept: 'Finance', initials: 'MF' },
  FPA: { id: 'u5', name: 'Fiona FPA', email: 'fiona@mims.com', role: 'FPA', dept: 'Finance', initials: 'FF' },
};

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // Start as null to force login

  const login = (role: UserRole) => {
    setUser(DEMO_USERS[role]);
  };

  const logout = () => {
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
