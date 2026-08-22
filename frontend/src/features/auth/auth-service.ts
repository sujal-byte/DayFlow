import type { AuthResult, PasswordRule, SignInCredentials, SignUpData } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getPasswordRules = (password: string): PasswordRule[] => [
  { label: 'At least 6 characters', isSatisfied: password.length >= 6 },
  { label: 'One uppercase letter', isSatisfied: /[A-Z]/.test(password) },
  { label: 'One lowercase letter', isSatisfied: /[a-z]/.test(password) },
  { label: 'One number or special character', isSatisfied: /[\d\W]/.test(password) },
];

export const isPasswordSecure = (password: string) =>
  password.length >= 6;

/**
 * Sends login credentials to NestJS backend: POST /auth/login
 */
export async function signIn(credentials: SignInCredentials): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Invalid email or password';
      return { success: false, message };
    }

    const token = data.access_token || data.accessToken;
    const user = data.user;

    return {
      success: true,
      token,
      user,
    };
  } catch (error) {
    console.error('Sign-in error:', error);
    return {
      success: false,
      message: 'Unable to connect to the server. Please check that the backend is running.',
    };
  }
}

/**
 * Registers a new user on NestJS backend: POST /auth/register
 */
export async function signUp(data: SignUpData): Promise<AuthResult> {
  try {
    if (data.confirmPassword && data.password !== data.confirmPassword) {
      return { success: false, message: 'Passwords do not match' };
    }

    if (!isPasswordSecure(data.password)) {
      return {
        success: false,
        message: 'Password must be at least 6 characters long',
      };
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email.trim(),
        password: data.password,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        employeeId: data.employeeId ? data.employeeId.trim() : undefined,
      }),
    });

    const resData = await response.json();

    if (!response.ok) {
      const message = Array.isArray(resData.message)
        ? resData.message.join(', ')
        : resData.message || 'Registration failed';
      return { success: false, message };
    }

    return {
      success: true,
      user: resData,
    };
  } catch (error) {
    console.error('Sign-up error:', error);
    return {
      success: false,
      message: 'Unable to connect to the server. Please check that the backend is running.',
    };
  }
}
