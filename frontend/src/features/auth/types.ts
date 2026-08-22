export type Role = 'EMPLOYEE' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  employeeId?: string;
  phone?: string;
  address?: string;
  profilePicUrl?: string;
  salary?: number;
  emailVerified?: boolean;
}

export interface SignInCredentials {
  email: string;
  password: string;
  role?: Role;
}

export interface SignUpData {
  employeeId?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: Role;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface PasswordRule {
  label: string;
  isSatisfied: boolean;
}
