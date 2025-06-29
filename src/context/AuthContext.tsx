import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'SHO' | 'IO' | 'SP' | 'Admin';
  badgeNumber: string;
  stationId?: string;
  department: string;
  designation?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: true, 
        isLoading: false, 
        error: null 
      };
    case 'LOGIN_FAILURE':
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: action.payload 
      };
    case 'LOGOUT':
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: null 
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
} | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');
      
      if (storedUser && token) {
        try {
          const user = JSON.parse(storedUser);
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } catch (error) {
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
        }
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - replace with actual API response
      const mockUser: User = {
        id: crypto.randomUUID(),
        email: email,
        fullName: 'Inspector Ramesh Kumar',
        role: 'IO',
        badgeNumber: 'AP001234',
        stationId: 'VSK001',
        department: 'Andhra Pradesh Police',
        designation: 'Inspector',
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00Z'
      };

      // Store in localStorage (in production, use secure token storage)
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'mock-jwt-token');
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Invalid credentials' });
    }
  };

  const signup = async (userData: any) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser: User = {
        id: crypto.randomUUID(),
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        badgeNumber: userData.badgeNumber,
        stationId: userData.stationId,
        department: 'Andhra Pradesh Police',
        designation: userData.designation,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('authToken', 'mock-jwt-token');
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: newUser });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Registration failed' });
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, dispatch, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};