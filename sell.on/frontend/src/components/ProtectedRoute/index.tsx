import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  permission 
}) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta página.</p>
        <button onClick={() => window.history.back()}>
          Voltar
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
