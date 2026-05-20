/**
 * AXA-PRISM Notification System
 *
 * Tracks real-time events:
 * - User management changes (add, edit role, status change)
 * - System errors (model failures, ingestion issues)
 * - Model deployments
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

export type NotificationType =
  | "user_added"
  | "user_edited"
  | "user_deleted"
  | "system_error"
  | "model_deployed"
  | "model_error"
  | "ingestion_warning";

export type NotificationSeverity = "info" | "warning" | "error" | "success";

export interface AppNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  metadata?: Record<string, unknown>;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<AppNotification, "id" | "timestamp" | "read">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ── Initial mock notifications ──────────────────────────────────────────────

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-001",
    type: "system_error",
    severity: "error",
    title: "Model Inference Error",
    message:
      "Anomaly detection model timed out for claim batch #2024-05-06. Retry scheduled in 5 minutes.",
    timestamp: "2026-05-06 14:15:00",
    read: false,
  },
  {
    id: "notif-002",
    type: "user_edited",
    severity: "info",
    title: "User Role Updated",
    message:
      "Dr. Budi Santoso role changed to Medical Auditor by Administrator.",
    timestamp: "2026-05-06 13:45:00",
    read: false,
  },
  {
    id: "notif-003",
    type: "ingestion_warning",
    severity: "warning",
    title: "Data Ingestion Warning",
    message:
      "12 records with missing fields found in latest upload batch. Manual review required.",
    timestamp: "2026-05-06 12:30:00",
    read: false,
  },
  {
    id: "notif-004",
    type: "model_deployed",
    severity: "success",
    title: "Model Deployed Successfully",
    message:
      "Fraud Detection API v2.5 is now active and available for Risk Analyst role.",
    timestamp: "2026-05-05 16:00:00",
    read: true,
  },
  {
    id: "notif-005",
    type: "user_added",
    severity: "success",
    title: "New User Registered",
    message: "Ahmad Fauzi has been added as Data Operator by Administrator.",
    timestamp: "2026-05-05 10:30:00",
    read: true,
  },
  {
    id: "notif-006",
    type: "model_error",
    severity: "warning",
    title: "FastAPI Endpoint Unreachable",
    message:
      "Clustering model endpoint /api/v1/cluster returned HTTP 503. Fallback model active.",
    timestamp: "2026-05-04 18:15:00",
    read: true,
  },
];

// ── Provider ────────────────────────────────────────────────────────────────

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] =
    useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const addNotification = useCallback(
    (notification: Omit<AppNotification, "id" | "timestamp" | "read">) => {
      const now = new Date();
      const timestamp = now
        .toLocaleString("sv")
        .replace("T", " ")
        .substring(0, 19);

      const newNotif: AppNotification = {
        ...notification,
        id: `notif-${Date.now()}`,
        timestamp,
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
    }),
    [
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within <NotificationProvider>."
    );
  }
  return ctx;
}
