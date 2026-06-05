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
} from "lucide-react";
import { useAuth } from "../../lib/auth/auth-context";

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
    role: "All Roles",
    section: "Shared",
    allowedRoles: "all",
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

  return (
    <div className="flex h-screen bg-background">
      <aside className="flex w-64 flex-col border-r border-sidebar-border bg-white">
        <div className="border-b border-sidebar-border p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600">
              <Shield className="h-6 w-6 text-white" />
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

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent px-3 py-3">
            <button
              onClick={() => onNavigate("/profile")}
              className="flex min-w-0 flex-1 items-center gap-3 text-left transition-opacity hover:opacity-80"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 text-xs font-semibold text-white">
                {user?.initials || "JD"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {user?.name || "John Doe"}
                </div>
                <div className="truncate text-[10px] uppercase text-muted-foreground">
                  {user?.role?.replace("_", " ") || "Admin User"}
                </div>
              </div>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 rounded-lg p-2 transition-colors hover:bg-white"
              title="Logout"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>

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
