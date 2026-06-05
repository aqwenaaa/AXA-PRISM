"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "../lib/auth/auth-context";
import { NotificationProvider } from "../lib/notifications/notification-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </AuthProvider>
  );
}
