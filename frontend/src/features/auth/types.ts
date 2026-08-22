export type Role = 'EMPLOYEE' | 'ADMIN'

export interface User {
  id: string
  employeeId: string
  email: string
  role: Role
  emailVerified: boolean
}

export interface SignInCredentials {
  email: string
  password: string
  role: Role
}

export interface SignUpData extends SignInCredentials {
  employeeId: string
  confirmPassword: string
}

export interface AuthResult {
  success: boolean
  user?: User
  message?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
}

export interface PasswordRule {
  label: string
  isSatisfied: boolean
}
