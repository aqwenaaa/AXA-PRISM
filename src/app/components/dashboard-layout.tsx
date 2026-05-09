import { Outlet, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  Upload,
  Brain,
  Stethoscope,
  TrendingUp,
  Activity,
  Users,
  LogOut
} from "lucide-react";

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/data-ingestion", icon: Upload, label: "Data Ingestion", role: "Data Operator" },
    { path: "/intelligence-lab", icon: Brain, label: "Intelligence Lab", role: "Risk Analyst" },
    { path: "/medical-audit", icon: Stethoscope, label: "Medical Audit", role: "Medical Auditor" },
    { path: "/executive-dashboard", icon: TrendingUp, label: "Executive Command", role: "Strategic Manager" },
    { path: "/claim-growth", icon: Activity, label: "Claim Growth Analysis", role: "All Roles" },
    { path: "/user-management", icon: Users, label: "User Management", role: "Admin" },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-sidebar-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">AXA-PRISM</h2>
              <p className="text-xs text-muted-foreground">Insurance Analytics</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
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
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className={`text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {item.role}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-accent">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                JD
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">John Doe</div>
                <div className="text-xs text-muted-foreground">Admin User</div>
              </div>
            </button>
            <button
              onClick={() => navigate("/logout")}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
