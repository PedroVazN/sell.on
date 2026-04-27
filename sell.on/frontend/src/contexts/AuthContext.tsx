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
        const storedUser = localStorage.getItem('currentUser');
        
        if (token && storedUser) {
          try {
            // Tentar usar o usuário armazenado no localStorage
            const userData = JSON.parse(storedUser);
            console.log('🔍 Usuário armazenado encontrado:', userData);
            
            // Verificar se o token ainda é válido fazendo uma requisição simples
            const response = await apiService.getUsers(1, 1);
            if (response.success) {
              setUser(userData);
              setIsAuthenticated(true);
              console.log('✅ Usuário restaurado do localStorage:', userData.email);
            } else {
              // Token inválido, limpar dados
              localStorage.removeItem('token');
              localStorage.removeItem('authToken');
              localStorage.removeItem('currentUser');
              console.log('❌ Token inválido, limpando dados');
            }
          } catch (parseError) {
            console.error('Erro ao parsear usuário armazenado:', parseError);
            localStorage.removeItem('currentUser');
          }
        } else {
          console.log('🔍 Nenhum token ou usuário armazenado encontrado');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('🔐 Iniciando login para:', email);
      
      // Fazer login real via API
      const credentials: LoginRequest = { email, password };
      const response = await apiService.login(credentials);
      
      console.log('🔐 Resposta do login:', response);
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        console.log('✅ Usuário logado com sucesso:', userData.email, 'Role:', userData.role);
        
        // Salvar token e usuário no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('💾 Token e usuário salvos no localStorage');
        
        return true;
      } else {
        console.log('❌ Login falhou:', response);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
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
    localStorage.removeItem('currentUser');
    console.log('🚪 Logout realizado - dados limpos');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Admin tem acesso a tudo
    if (user.role === 'admin') return true;

    // Permissões exclusivas de admin
    if (permission === 'users' || permission === 'checklist') {
      return false;
    }

    // Vendedor tem acesso a propostas, dashboard, avisos e funil de vendas (portfólio)
    if (user.role === 'vendedor') {
      const allowedPermissions = ['proposals', 'dashboard', 'notices', 'funnel'];
      return allowedPermissions.includes(permission);
    }

    // Analista: perfil de visualização para análise de dados (dashboards e insights)
    if (user.role === 'analista') {
      const allowedPermissions = ['dashboard', 'notices', 'analytics'];
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
