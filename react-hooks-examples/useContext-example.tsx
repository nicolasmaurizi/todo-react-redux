import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Ejemplo 1: Context de Autenticación
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Provider de Autenticación
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Verificar si hay un usuario logueado al cargar la app
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Simular validación de token
          const userData = await validateToken(token);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error al validar token:', error);
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simular llamada de login
      const response = await mockLogin(email, password);
      setUser(response.user);
      localStorage.setItem('authToken', response.token);
    } catch (error) {
      throw new Error('Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    
    const permissions = {
      admin: ['read', 'write', 'delete', 'manage_users'],
      user: ['read', 'write']
    };
    
    return permissions[user.role].includes(permission);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Funciones mock para simular API
const validateToken = async (token: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    role: 'admin'
  };
};

const mockLogin = async (email: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    user: {
      id: '1',
      name: 'Juan Pérez',
      email,
      role: 'admin' as const
    },
    token: 'mock-jwt-token'
  };
};

// Ejemplo 2: Context de Tema
interface Theme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

const themes = {
  light: {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff',
    text: '#333333'
  },
  dark: {
    primary: '#0d6efd',
    secondary: '#6c757d',
    background: '#121212',
    text: '#ffffff'
  }
};

interface ThemeContextType {
  theme: Theme;
  themeName: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Cargar tema guardado o usar preferencia del sistema
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setThemeName(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeName(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = themeName === 'light' ? 'dark' : 'light';
    setThemeName(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const value: ThemeContextType = {
    theme: themes[themeName],
    themeName,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Componentes que usan los contexts
export const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de login');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{ 
        backgroundColor: theme.background, 
        color: theme.text,
        padding: '20px',
        borderRadius: '8px'
      }}
    >
      <h2>Iniciar Sesión</h2>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ 
            backgroundColor: theme.background, 
            color: theme.text,
            border: `1px solid ${theme.primary}`
          }}
        />
      </div>
      
      <div>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ 
            backgroundColor: theme.background, 
            color: theme.text,
            border: `1px solid ${theme.primary}`
          }}
        />
      </div>
      
      <button 
        type="submit" 
        disabled={isLoading}
        style={{ 
          backgroundColor: theme.primary, 
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px'
        }}
      >
        {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
};

export const UserProfile: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const { theme, toggleTheme, themeName } = useTheme();

  if (!user) return null;

  return (
    <div style={{ 
      backgroundColor: theme.background, 
      color: theme.text,
      padding: '20px',
      borderRadius: '8px'
    }}>
      <h2>Perfil de Usuario</h2>
      <p>Nombre: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Rol: {user.role}</p>
      
      {hasPermission('manage_users') && (
        <button style={{ 
          backgroundColor: theme.secondary, 
          color: 'white',
          marginRight: '10px'
        }}>
          Gestionar Usuarios
        </button>
      )}
      
      <button 
        onClick={toggleTheme}
        style={{ 
          backgroundColor: theme.primary, 
          color: 'white',
          marginRight: '10px'
        }}
      >
        Cambiar a tema {themeName === 'light' ? 'oscuro' : 'claro'}
      </button>
      
      <button 
        onClick={logout}
        style={{ 
          backgroundColor: '#dc3545', 
          color: 'white'
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

// Componente principal que combina ambos providers
export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return <div style={{ color: theme.text }}>Cargando...</div>;
  }

  return (
    <div style={{ 
      backgroundColor: theme.background, 
      minHeight: '100vh',
      padding: '20px'
    }}>
      {user ? <UserProfile /> : <LoginForm />}
    </div>
  );
};