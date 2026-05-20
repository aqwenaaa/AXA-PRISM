/**
 * AXA-PRISM Authentication Context — RBAC Provider
 *
 * Next.js migration note:
 * ──────────────────────
 * In Next.js App Router:
 * - This file gets "use client" directive (already implied here as React context)
 * - Auth state would be backed by Supabase via @supabase/ssr
 * - Session validation happens in middleware.ts (server-side)
 * - This client context would hydrate from server-fetched session
 *
 * Current: in-memory auth with demo credentials.
 * Production: swap login() to call Supabase signInWithPassword()
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  User,
  UserRole,
  Permission,
  ROLE_CONFIG,
  DEMO_USERS,
} from "../types";

// ─── Context Shape ──────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

export type AuthContextValue = AuthState & AuthActions;

export interface LoginResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

// ─── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);
AuthContext.displayName = "AXAPRISMAuthContext";

const SESSION_KEY = "axa_prism_session";

// ─── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Authenticate user.
   *
   * Next.js migration: replace body with:
   *   const { data, error } = await supabase.auth.signInWithPassword({ email, password })
   *   Then fetch user role from public.users table.
   */
  const login = useCallback(
    async (username: string, password: string): Promise<LoginResult> => {
      setIsLoading(true);

      // Simulate network latency
      await new Promise((r) => setTimeout(r, 800));

      const match = DEMO_USERS[username.toLowerCase()];
      if (!match || match.password !== password) {
        setIsLoading(false);
        return { success: false, error: "Invalid username or password." };
      }

      const loggedInUser = match.user;
      setUser(loggedInUser);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(loggedInUser));
      setIsLoading(false);

      return {
        success: true,
        redirectTo: ROLE_CONFIG[loggedInUser.role].defaultRoute,
      };
    },
    []
  );

  /**
   * Sign out.
   * Next.js migration: also call supabase.auth.signOut()
   */
  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  /** Fine-grained permission check */
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      return ROLE_CONFIG[user.role].permissions.includes(permission);
    },
    [user]
  );

  /** Role check (single or list of roles) */
  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      return Array.isArray(role) ? role.includes(user.role) : user.role === role;
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      hasPermission,
      hasRole,
    }),
    [user, isLoading, login, logout, hasPermission, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>.");
  }
  return ctx;
}
