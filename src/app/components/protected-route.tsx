/**
 * ProtectedRoute — RBAC Route Guard
 *
 * Next.js equivalent: middleware.ts + layout-level auth checks
 * - Redirects unauthenticated users to /login
 * - Optionally enforces role-based access
 *
 * Usage:
 *   <ProtectedRoute>         ← requires authentication only
 *   <ProtectedRoute roles={['medical_auditor', 'strategic_manager']}>
 */

import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../lib/auth/auth-context";
import type { UserRole } from "../../lib/types";
import { motion } from "motion/react";
import { Shield } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-xl shadow-primary/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="flex gap-1.5 items-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Verifying session...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    // Redirect to the user's default page if they don't have the required role
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
