import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'author';
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('sard_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('sard_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email && password.length >= 6) {
      const newUser: User = {
        id: '1',
        name: email.split('@')[0],
        email,
        role: 'admin',
      };
      setUser(newUser);
      localStorage.setItem('sard_user', JSON.stringify(newUser));
      return;
    }
    throw new Error('Invalid credentials');
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('sard_user');
  };

  const register = async (name: string, email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (name && email && password.length >= 6) {
      const newUser: User = {
        id: '1',
        name,
        email,
        role: 'admin',
      };
      setUser(newUser);
      localStorage.setItem('sard_user', JSON.stringify(newUser));
      return;
    }
    throw new Error('Invalid registration data');
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
