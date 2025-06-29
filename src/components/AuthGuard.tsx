import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from './LoginForm';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { state } = useAuth();

  if (!state.isAuthenticated) {
    return <LoginForm />;
  }

  return <>{children}</>;
};

export default AuthGuard;