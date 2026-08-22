import type { AuthResult, PasswordRule, SignInCredentials, SignUpData } from './types'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const pause = (duration: number) => new Promise<void>((resolve) => window.setTimeout(resolve, duration))

export const getPasswordRules = (password: string): PasswordRule[] => [
  { label: 'At least 8 characters', isSatisfied: password.length >= 8 },
  { label: 'One uppercase letter', isSatisfied: /[A-Z]/.test(password) },
  { label: 'One lowercase letter', isSatisfied: /[a-z]/.test(password) },
  { label: 'One number', isSatisfied: /\d/.test(password) },
  { label: 'One special character', isSatisfied: /[^A-Za-z0-9]/.test(password) },
]

export const isPasswordSecure = (password: string) => getPasswordRules(password).every((rule) => rule.isSatisfied)

export async function signIn(credentials: SignInCredentials): Promise<AuthResult> {
  await pause(700)
  if (!emailPattern.test(credentials.email) || !credentials.password || credentials.email.toLowerCase().startsWith('incorrect') || credentials.password.toLowerCase() === 'incorrect') {
    return { success: false, message: 'Incorrect credentials' }
  }
  return { success: true, user: { id: `mock-${credentials.email.toLowerCase()}`, employeeId: 'MOCK-USER', email: credentials.email.toLowerCase(), role: credentials.role, emailVerified: true } }
}

export async function signUp(data: SignUpData): Promise<AuthResult> {
  await pause(800)
  if (!data.employeeId.trim()) return { success: false, message: 'Employee ID is required' }
  if (!emailPattern.test(data.email)) return { success: false, message: 'Enter a valid email address' }
  if (!isPasswordSecure(data.password)) return { success: false, message: 'Your password does not meet the security requirements' }
  if (data.password !== data.confirmPassword) return { success: false, message: 'Passwords do not match' }
  return { success: true, user: { id: `pending-${data.employeeId.trim().toLowerCase()}`, employeeId: data.employeeId.trim(), email: data.email.toLowerCase(), role: data.role, emailVerified: false } }
}
