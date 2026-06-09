"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Upload,
  Brain,
  Stethoscope,
  TrendingUp,
  Activity,
  LogOut,
  Monitor,
  Users,
  FlaskConical,
} from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const adminItems = [
    { path: "/admin/system-overview", icon: Monitor, label: "System Overview", subtitle: "God Mode — Admin Only" },
    { path: "/admin/user-management", icon: Users, label: "User Management", subtitle: "Control Center — Admin Only" },
    { path: "/admin/model-debug-lab", icon: FlaskConical, label: "Model Debug Lab", subtitle: "AI Model Registry — Admin Only" },
  ];

  const operationItems = [
    { path: "/operator/data-ingestion", icon: Upload, label: "Data Ingestion", subtitle: "Hulu — Data Operator" },
    { path: "/analyst/intelligence-lab", icon: Brain, label: "Intelligence Lab", subtitle: "The Brain — Risk Analyst" },
    { path: "/auditor/medical-audit", icon: Stethoscope, label: "Medical Audit", subtitle: "Worklist — Medical Auditor" },
    { path: "/manager/executive-dashboard", icon: TrendingUp, label: "Executive Command", subtitle: "Strategic Manager" },
    { path: "/manager/claim-growth", icon: Activity, label: "Claim Growth Analysis", subtitle: "All Roles" },
  ];

  const NavItem = ({ path, icon: Icon, label, subtitle }: {
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    subtitle: string;
  }) => {
    const isActive = pathname === path;
    return (
      <Link
        href={path}
        className={`
          w-full flex items-start gap-3 px-4 py-3 rounded-xl transition-all
          ${isActive
            ? 'bg-primary text-white shadow-lg shadow-primary/30'
            : 'text-foreground hover:bg-sidebar-accent'
          }
        `}
      >
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-primary'}`} />
        <div className="text-left flex-1">
          <div className="text-sm font-medium">{label}</div>
          <div className={`text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
            {subtitle}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-sidebar-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/assets/logo.png" alt="AXA-PRISM Logo" className="h-10 w-auto object-contain" />
              <div>
                <h2 className="text-base font-semibold text-foreground">AXA-PRISM</h2>
                <p className="text-xs text-muted-foreground">Insurance Analytics</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* System Administration Section */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-4 mb-2">
              System Administration
            </p>
            <div className="space-y-1">
              {adminItems.map((item) => (
                <NavItem key={item.path} {...item} />
              ))}
            </div>
          </div>

          {/* Operations Section */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-4 mb-2">
              Operations
            </p>
            <div className="space-y-1">
              {operationItems.map((item) => (
                <NavItem key={item.path} {...item} />
              ))}
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-accent">
            <Link href="/profile" className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                AA
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">Aqueena Administrat...</div>
                <div className="text-xs text-muted-foreground">System Administration</div>
              </div>
            </Link>
            <Link href="/logout" className="p-2 hover:bg-white rounded-lg transition-colors" title="Logout">
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}