import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  fullname: string;
  email: string;
  role: 'owner' | 'tenant';
  profilePic: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'owner' | 'tenant') => Promise<boolean>;
  register: (fullname: string, email: string, password: string, role: 'owner' | 'tenant') => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers = [
  { id: 'owner_1', email: 'proprio@domia.ga', password: 'password', role: 'owner' as const, fullname: 'Jean Dupont', profilePic: '/placeholder.svg' },
  { id: 'tenant_1', email: 'locataire@domia.ga', password: 'password', role: 'tenant' as const, fullname: 'Aïcha Locataire', profilePic: '/placeholder.svg' }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('domia_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string, role: 'owner' | 'tenant') => {
    const foundUser = mockUsers.find(u => u.email === email && u.password === password && u.role === role);
    if (foundUser) {
      const userData = {
        id: foundUser.id,
        fullname: foundUser.fullname,
        email: foundUser.email,
        role: foundUser.role,
        profilePic: foundUser.profilePic
      };
      setUser(userData);
      localStorage.setItem('domia_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const register = async (fullname: string, email: string, password: string, role: 'owner' | 'tenant') => {
    const newUser = {
      id: `${role}_${Date.now()}`,
      fullname,
      email,
      role,
      profilePic: '/placeholder.svg'
    };
    setUser(newUser);
    localStorage.setItem('domia_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('domia_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
