import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, User, LoginRequest } from '../services/api';

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
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
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
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Fazer login real via API
      const credentials: LoginRequest = { email, password };
      const response = await apiService.login(credentials);
      
      if (response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        setIsAuthenticated(true);
        
        // Token já é gerenciado pelo apiService
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
    localStorage.removeItem('authToken');
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
