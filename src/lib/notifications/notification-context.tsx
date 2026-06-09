"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { apiGet, apiPut, apiPost } from "../api/api-client";

export type NotificationType =
  | "user_added"
  | "user_edited"
  | "user_deleted"
  | "system_error"
  | "model_deployed"
  | "model_error"
  | "ingestion_warning"
  | "calibration_changed"
  | "audit_submitted"
  | "recommendation_action"
  | "engine_started"
  | "engine_completed"
  | "engine_failed";

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
  actionUrl?: string;
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
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ── Initial mock notifications fallback ──────────────────────────────────────

const FALLBACK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-001",
    type: "system_error",
    severity: "error",
    title: "Model Inference Error",
    message: "Anomaly detection model timed out for claim batch #2024-05-06. Retry scheduled.",
    timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
    read: false,
  },
  {
    id: "notif-002",
    type: "user_edited",
    severity: "info",
    title: "User Role Updated",
    message: "Dr. Budi Santoso role changed to Medical Auditor by Administrator.",
    timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
    read: false,
  },
  {
    id: "notif-003",
    type: "model_deployed",
    severity: "success",
    title: "Model Deployed Successfully",
    message: "Ensemble regressor and anomaly detection models are now active.",
    timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
    read: true,
  }
];

// ── Provider ────────────────────────────────────────────────────────────────

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [useFallback, setUseFallback] = useState(false);
  const notificationsLengthRef = useRef(0);
  const fetchNotificationsInFlightRef = useRef(false);

  useEffect(() => {
    notificationsLengthRef.current = notifications.length;
  }, [notifications.length]);

  const fetchNotifications = useCallback(async () => {
    if (fetchNotificationsInFlightRef.current) {
      return;
    }

    fetchNotificationsInFlightRef.current = true;
    try {
      const res = await apiGet<any>("/api/v1/notifications");
      if (res && res.notifications) {
        const mapped: AppNotification[] = res.notifications.map((n: any) => ({
          id: n.id,
          type: n.type || "system_error",
          severity: n.severity || "info",
          title: n.title || "Alert",
          message: n.message || "",
          timestamp: n.created_at 
            ? n.created_at.substring(0, 19).replace('T', ' ')
            : new Date().toISOString().substring(0, 19).replace('T', ' '),
          read: n.is_read || n.read || false,
          actionUrl: n.action_url || n.actionUrl || ""
        }));
        setNotifications(mapped);
        setUseFallback(false);
      } else {
        // Empty response or unmigrated DB setup
        if (notificationsLengthRef.current === 0) {
          setNotifications(FALLBACK_NOTIFICATIONS);
          setUseFallback(true);
        }
      }
    } catch (err) {
      console.warn("Failed to load notifications from API, using fallback memory state.", err);
      if (notificationsLengthRef.current === 0) {
        setNotifications(FALLBACK_NOTIFICATIONS);
        setUseFallback(true);
      }
    } finally {
      fetchNotificationsInFlightRef.current = false;
    }
  }, []);

  // Load and poll notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

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

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    if (!useFallback) {
      try {
        await apiPut(`/api/v1/notifications/${id}/read`, {});
      } catch (err) {
        console.error("Failed to mark notification as read on server:", err);
      }
    }
  }, [useFallback]);

  const markAllAsRead = useCallback(async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    if (!useFallback) {
      try {
        await apiPost("/api/v1/notifications/read-all", {});
      } catch (err) {
        console.error("Failed to mark all notifications read on server:", err);
      }
    }
  }, [useFallback]);

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
      refresh: fetchNotifications
    }),
    [
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      fetchNotifications
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
