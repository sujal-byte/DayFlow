import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { signIn as apiSignIn, signUp as apiSignUp } from './auth-service';
import type {
  AuthResult,
  AuthState,
  SignInCredentials,
  SignUpData,
  User,
} from './types';

const TOKEN_KEY = 'dayflow_access_token';
const USER_KEY = 'dayflow_user_data';

interface AuthContextValue extends AuthState {
  signIn: (credentials: SignInCredentials) => Promise<AuthResult>;
  signUp: (data: SignUpData) => Promise<AuthResult>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedUser =
      localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser) as User;
    } catch {
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(USER_KEY);
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state to localStorage
  const saveSession = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  const clearSession = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  };

  const signIn = useCallback(async (credentials: SignInCredentials): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const result = await apiSignIn(credentials);
      if (result.success && result.token && result.user) {
        saveSession(result.token, result.user);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (data: SignUpData): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      return await apiSignUp(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    clearSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [user, token, isLoading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
