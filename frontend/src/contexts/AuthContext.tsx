import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verificar se o token é válido fazendo uma requisição
          const response = await apiService.getUsers();
          if (response.success) {
            // Buscar dados do usuário atual
            const currentUser = response.data?.find(u => u.email === 'admin@sellone.com') || 
                              response.data?.find(u => u.email === 'vendedor@sellone.com');
            if (currentUser) {
              setUser(currentUser);
              setIsAuthenticated(true);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simular login com diferentes usuários
      let userData: User | null = null;
      
      if (email === 'admin@sellone.com' && password === '123456') {
        userData = {
          _id: '1',
          name: 'Administrador',
          email: 'admin@sellone.com',
          role: 'admin',
          phone: '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else if (email === 'vendedor@sellone.com' && password === '123456') {
        userData = {
          _id: '2',
          name: 'Vendedor',
          email: 'vendedor@sellone.com',
          role: 'vendedor',
          phone: '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('token', 'fake-token');
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Admin tem acesso a tudo
    if (user.role === 'admin') return true;

    // Vendedor só tem acesso a propostas e dashboard
    if (user.role === 'vendedor') {
      const allowedPermissions = ['proposals', 'dashboard'];
      return allowedPermissions.includes(permission);
    }

    return false;
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
