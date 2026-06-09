"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "../api/supabase-client";
import {
  getProfileRoleRedirect,
  ROLE_CONFIG,
  type Permission,
  type ProfileRecord,
  type User,
  type UserRole,
} from "../types";

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: ProfileRecord | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileLoading: boolean;
}

interface LoginResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
  role?: UserRole;
}

interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

interface RegisterResult {
  success: boolean;
  error?: string;
  requiresEmailVerification?: boolean;
  redirectTo?: string;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<ProfileRecord | null>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

export type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

function getInitials(fullName: string, email: string) {
  const parts = fullName
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return email.slice(0, 2).toUpperCase();
}

function buildUser(sessionUser: Session["user"], profile: ProfileRecord): User {
  const fullName =
    profile.full_name?.trim() ||
    (typeof sessionUser.user_metadata?.full_name === "string"
      ? sessionUser.user_metadata.full_name
      : "") ||
    sessionUser.email?.split("@")[0] ||
    "AXA Staff";

  const uiRole = profile.role as UserRole;

  return {
    id: sessionUser.id,
    name: fullName,
    email: sessionUser.email ?? "",
    role: uiRole,
    profileRole: profile.role,
    initials: getInitials(fullName, sessionUser.email ?? ""),
    department: ROLE_CONFIG[uiRole].description,
  };
}

async function fetchProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, avatar_url, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ProfileRecord | null;
}

async function ensureProfile(sessionUser: Session["user"]) {
  const profile = await fetchProfileByUserId(sessionUser.id);

  if (!profile) {
    throw new Error(
      "Your account exists, but the profile record is missing. Contact an administrator."
    );
  }

  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const syncProfile = async (nextSession: Session | null) => {
    setSession(nextSession);

    if (!nextSession?.user) {
      setProfile(null);
      setUser(null);
      setIsProfileLoading(false);
      return null;
    }

    setIsProfileLoading(true);

    try {
      const nextProfile = await ensureProfile(nextSession.user);
      setProfile(nextProfile);
      setUser(buildUser(nextSession.user, nextProfile));
      return nextProfile;
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const {
          data: { session: activeSession },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        await syncProfile(activeSession);
      } catch (error) {
        console.error("Failed to restore auth session", error);
        if (isMounted) {
          setSession(null);
          setProfile(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, nextSession) => {
        if (!isMounted) return;

        try {
          await syncProfile(nextSession);
        } catch (error) {
          console.error("Failed to synchronize auth state", error);
          setProfile(null);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setIsProfileLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "Unable to resolve the authenticated user." };
      }

      const nextProfile = await ensureProfile(data.user);
      const nextUser = buildUser(data.user, nextProfile);

      setSession(data.session ?? null);
      setProfile(nextProfile);
      setUser(nextUser);

      return {
        success: true,
        redirectTo: getProfileRoleRedirect(nextProfile.role),
        role: nextProfile.role,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in right now.";
      return { success: false, error: message };
    } finally {
      setIsProfileLoading(false);
      setIsLoading(false);
    }
  };

  const register = async ({
    fullName,
    email,
    password,
  }: RegisterInput): Promise<RegisterResult> => {
    setIsProfileLoading(true);

    try {
      const emailRedirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/dashboard`
          : undefined;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const requiresEmailVerification = !data.session;

      if (!data.user) {
        return {
          success: true,
          requiresEmailVerification,
          redirectTo: "/login",
        };
      }

      if (data.session) {
        const nextProfile = await ensureProfile(data.user);
        const nextUser = buildUser(data.user, nextProfile);
        setSession(data.session);
        setProfile(nextProfile);
        setUser(nextUser);

        return {
          success: true,
          requiresEmailVerification: false,
          redirectTo: getProfileRoleRedirect(nextProfile.role),
        };
      }

      return {
        success: true,
        requiresEmailVerification,
        redirectTo: "/login",
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to register right now.";
      return { success: false, error: message };
    } finally {
      setIsProfileLoading(false);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setSession(null);
    setProfile(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!session?.user) {
      setProfile(null);
      setUser(null);
      return null;
    }

    setIsProfileLoading(true);

    try {
      const nextProfile = await ensureProfile(session.user);
      setProfile(nextProfile);
      setUser(buildUser(session.user, nextProfile));
      return nextProfile;
    } finally {
      setIsProfileLoading(false);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      isAuthenticated: Boolean(session?.user && user),
      isLoading,
      isProfileLoading,
      login,
      register,
      logout,
      refreshProfile,
      hasPermission: (permission) =>
        user ? ROLE_CONFIG[user.role].permissions.includes(permission) : false,
      hasRole: (role) =>
        user ? (Array.isArray(role) ? role.includes(user.role) : user.role === role) : false,
    }),
    [isLoading, isProfileLoading, profile, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within <AuthProvider>.");
  }

  return context;
}
