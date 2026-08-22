import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { signIn as mockSignIn } from './auth-service'
import type { AuthResult, AuthState, SignInCredentials, User } from './types'

const storageKey = 'dayflow-mock-auth-user'
interface AuthContextValue extends AuthState { signIn: (credentials: SignInCredentials) => Promise<AuthResult>; signOut: () => void }
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = window.sessionStorage.getItem(storageKey)
    if (!savedUser) return null
    try { return JSON.parse(savedUser) as User } catch { window.sessionStorage.removeItem(storageKey); return null }
  })
  const signIn = useCallback(async (credentials: SignInCredentials) => {
    const result = await mockSignIn(credentials)
    if (result.success && result.user) { setUser(result.user); window.sessionStorage.setItem(storageKey, JSON.stringify(result.user)) }
    return result
  }, [])
  const signOut = useCallback(() => { setUser(null); window.sessionStorage.removeItem(storageKey) }, [])
  const value = useMemo(() => ({ user, isLoading: false, signIn, signOut }), [user, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
