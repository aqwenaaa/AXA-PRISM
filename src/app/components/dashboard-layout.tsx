"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import LogoutModal from "../components/logoutmodal";
import {
  Activity,
  Brain,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Shield,
  Stethoscope,
  TrendingUp,
  Upload,
  Users,
  Bell,
  Inbox,
  Check,
  AlertTriangle,
  Info,
  AlertCircle,
  Settings,
  X
} from "lucide-react";
import { useAuth } from "../../lib/auth/auth-context";
import { useNotifications } from "../../lib/notifications/notification-context";
import { Badge } from "./ui/badge";

type AllowedRoles = "all" | Array<"admin" | "data_operator" | "risk_analyst" | "medical_auditor" | "strategic_manager">;

type MenuItem = {
  path: string;
  icon: typeof Shield;
  label: string;
  role: string;
  section: string;
  allowedRoles: AllowedRoles;
};

const menuItems: MenuItem[] = [
  {
    path: "/admin/system-overview",
    icon: LayoutDashboard,
    label: "System Overview",
    role: "System Admin",
    section: "System Administration",
    allowedRoles: ["admin"],
  },
  {
    path: "/admin/user-management",
    icon: Users,
    label: "User Management",
    role: "System Admin",
    section: "System Administration",
    allowedRoles: ["admin"],
  },
  {
    path: "/admin/model-debug",
    icon: FlaskConical,
    label: "Model Debug Lab",
    role: "ML Engineer",
    section: "System Administration",
    allowedRoles: ["admin"],
  },
  {
    path: "/operator/data-ingestion",
    icon: Upload,
    label: "Data Ingestion",
    role: "Data Operator",
    section: "Operations",
    allowedRoles: ["admin", "data_operator"],
  },
  {
    path: "/analyst/intelligence-lab",
    icon: Brain,
    label: "Intelligence Lab",
    role: "Risk Analyst",
    section: "Operations",
    allowedRoles: ["admin", "risk_analyst"],
  },
  {
    path: "/auditor/medical-audit",
    icon: Stethoscope,
    label: "Medical Audit",
    role: "Medical Auditor",
    section: "Operations",
    allowedRoles: ["admin", "medical_auditor"],
  },
  {
    path: "/manager/executive-dashboard",
    icon: TrendingUp,
    label: "Executive Command",
    role: "Strategic Manager",
    section: "Operations",
    allowedRoles: ["admin", "strategic_manager"],
  },
  {
    path: "/manager/claim-growth",
    icon: Activity,
    label: "Claim Growth Analysis",
    role: "Strategic Manager",
    section: "Operations",
    allowedRoles: ["admin", "strategic_manager"],
  },
];

const sections = ["System Administration", "Operations", "Shared"];

function DashboardShell({
  children,
  pathname,
  onNavigate,
}: {
  children: ReactNode;
  pathname: string;
  onNavigate: (path: string) => void;
}) {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Helper to resolve notification style & icon
  const getNotifIcon = (severity: string, type: string) => {
    switch (type) {
      case "calibration_changed": return <Settings className="h-4 w-4 text-warning" />;
      case "engine_completed": return <Brain className="h-4 w-4 text-success" />;
      case "engine_failed": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "audit_submitted": return <Stethoscope className="h-4 w-4 text-primary" />;
      case "recommendation_action": return <TrendingUp className="h-4 w-4 text-success" />;
      default:
        if (severity === "error") return <AlertCircle className="h-4 w-4 text-destructive" />;
        if (severity === "warning") return <AlertTriangle className="h-4 w-4 text-warning" />;
        if (severity === "success") return <Check className="h-4 w-4 text-success" />;
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getNotifBg = (severity: string) => {
    if (severity === "error") return "bg-red-50 border-red-100";
    if (severity === "warning") return "bg-amber-50 border-amber-100";
    if (severity === "success") return "bg-emerald-50 border-emerald-100";
    return "bg-slate-50 border-slate-100";
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className="flex w-64 flex-col border-r border-sidebar-border bg-white relative">
        <div className="border-b border-sidebar-border p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-white to-white-600">
              <img src="/assets/logo.png" alt="AXA-PRISM Logo" className="h-9 w-9" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">AXA-PRISM</h2>
              <p className="text-xs text-muted-foreground">Insurance Analytics</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-8 overflow-y-auto p-4">
          {sections.map((sectionName) => {
            const filteredMenus = menuItems.filter((item) => {
              if (item.section !== sectionName) return false;
              if (item.allowedRoles === "all") return true;
              return user ? item.allowedRoles.includes(user.role) : false;
            });

            if (filteredMenus.length === 0) return null;

            return (
              <div key={sectionName} className="space-y-3">
                <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                  {sectionName}
                </h3>

                <div className="space-y-1">
                  {filteredMenus.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                      <button
                        key={item.path}
                        onClick={() => onNavigate(item.path)}
                        className={`w-full rounded-xl px-4 py-3 text-left transition-all ${
                          isActive
                            ? "bg-primary text-white shadow-lg shadow-primary/30"
                            : "text-foreground hover:bg-sidebar-accent"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon
                            className={`mt-0.5 h-5 w-5 shrink-0 ${
                              isActive ? "text-white" : "text-primary"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{item.label}</div>
                            <div
                              className={`text-[10px] ${
                                isActive ? "text-white/80" : "text-muted-foreground"
                              }`}
                            >
                              {item.role}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer Panel */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-2 rounded-xl bg-sidebar-accent px-2 py-3">
            <button
              onClick={() => onNavigate("/profile")}
              className="flex min-w-0 flex-1 items-center gap-2.5 text-left transition-opacity hover:opacity-80"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 text-xs font-semibold text-white">
                {user?.initials || "JD"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-foreground">
                  {user?.name || "John Doe"}
                </div>
                <div className="truncate text-[9px] uppercase text-muted-foreground font-semibold">
                  {user?.role?.replace("_", " ") || "Admin User"}
                </div>
              </div>
            </button>

            {/* Bell Notifications Trigger */}
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`relative shrink-0 rounded-lg p-2 transition-colors ${
                isNotifOpen ? "bg-white text-primary" : "hover:bg-white text-muted-foreground"
              }`}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 rounded-lg p-2 transition-colors hover:bg-white text-muted-foreground hover:text-destructive"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Floating Notification Drawer/Popover */}
      {isNotifOpen && (
        <div className="fixed left-68 bottom-4 z-50 w-96 bg-white border border-border shadow-2xl rounded-2xl overflow-hidden animate-fade-in flex flex-col max-h-[480px]">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-indigo-400" />
              <span className="font-bold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <Badge className="bg-destructive hover:bg-destructive/90 text-white text-[9px] px-1.5 py-0">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] text-indigo-300 hover:text-white font-semibold flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  Mark all read
                </button>
              )}
              <button 
                onClick={() => setIsNotifOpen(false)}
                className="text-slate-400 hover:text-white rounded-full p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List of Notifications */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[380px]">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Inbox className="h-8 w-8 text-slate-300" />
                <span className="text-xs">All caught up! No notifications.</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.actionUrl) {
                      onNavigate(notif.actionUrl);
                      setIsNotifOpen(false);
                      if (!notif.read) {
                        markAsRead(notif.id);
                      }
                    }
                  }}
                  className={`p-3 rounded-xl border flex gap-3 transition-all relative ${getNotifBg(notif.severity)} ${
                    notif.actionUrl ? "cursor-pointer hover:shadow-md hover:border-slate-300" : ""
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {getNotifIcon(notif.severity, notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                      {notif.title}
                      {notif.actionUrl && (
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-semibold px-1 rounded-sm">Link</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                    <span className="text-[9px] text-slate-400 mt-1.5 block font-semibold">
                      {notif.timestamp}
                    </span>
                  </div>
                  
                  {/* Unread dot action */}
                  {!notif.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif.id);
                      }}
                      className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary hover:scale-155 transition-transform"
                      title="Mark as read"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto bg-background">{children}</main>

      <LogoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={async () => {
          setIsModalOpen(false);
          try {
            await logout();
          } finally {
            onNavigate("/login");
          }
        }}
      />
    </div>
  );
}

export function NextDashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "";

  return (
    <DashboardShell pathname={pathname} onNavigate={(path) => router.push(path)}>
      {children}
    </DashboardShell>
  );
}
