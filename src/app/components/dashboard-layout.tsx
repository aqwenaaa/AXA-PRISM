import { Outlet, useNavigate, useLocation } from "react-router";
import { useState } from "react";
import LogoutModal from "../components/logoutmodal"; 
import {
  LayoutDashboard,
  Upload,
  Brain,
  Stethoscope,
  TrendingUp,
  Activity,
  LogOut,
  Users, // [BARU] Icon untuk User Management
  Shield, // [BARU] Icon untuk role Admin
  FlaskConical, 
} from "lucide-react";
import { useAuth } from "../../lib/auth/auth-context"; // [BARU] Agar Sidebar tahu siapa yang login

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // [BARU] Ambil data user asli
  const [isModalOpen, setIsModalOpen] = useState(false);

 const menuItems = [
    // --- Section: System Administration ---
    { 
      path: "/system-overview", 
      icon: LayoutDashboard, 
      label: "System Overview", 
      role: "System Admin",
      section: "System Administration", // [TAMBAHKAN INI]
      adminOnly: true 
    },
    { 
      path: "/user-management", 
      icon: Users, 
      label: "User Management", 
      role: "System Admin",
      section: "System Administration", // [TAMBAHKAN INI]
      adminOnly: true 
    },
    { 
      path: "/model-debug", 
      icon: FlaskConical, 
      label: "Model Debug Lab", 
      role: "ML Engineer",
      section: "System Administration", // [TAMBAHKAN INI]
      adminOnly: true 
    },

    // --- Section: Operation ---
    { 
      path: "/data-ingestion", 
      icon: Upload, 
      label: "Data Ingestion", 
      role: "Data Operator",
      section: "Operations" // [TAMBAHKAN INI]
    },
    { 
      path: "/intelligence-lab", 
      icon: Brain, 
      label: "Intelligence Lab", 
      role: "Risk Analyst",
      section: "Operations" // [TAMBAHKAN INI]
    },
    { 
      path: "/medical-audit", 
      icon: Stethoscope, 
      label: "Medical Audit", 
      role: "Medical Auditor",
      section: "Operations" // [TAMBAHKAN INI]
    },
    { 
      path: "/executive-dashboard", 
      icon: TrendingUp, 
      label: "Executive Command", 
      role: "Strategic Manager",
      section: "Operations" // [TAMBAHKAN INI]
    },

    // --- Section: Shared ---
    { 
      path: "/claim-growth", 
      icon: Activity, 
      label: "Claim Growth Analysis", 
      role: "All Roles",
      section: "Shared" // [TAMBAHKAN INI]
    },
  ];

  // [TAMBAHKAN INI] List kategori untuk di-loop
  const sections = ["System Administration", "Operations", "Shared"];
  
  // Filter menu: Kalau bukan admin, jangan tunjukin menu User Management
  const visibleMenu = menuItems.filter(item => 
    !item.adminOnly || (item.adminOnly && user?.role === 'admin')
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-sidebar-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">AXA-PRISM</h2>
              <p className="text-xs text-muted-foreground">Insurance Analytics</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-8 overflow-y-auto">
          {/* [UBAH BAGIAN LOOP INI] */}
          {sections.map((sectionName) => {
            // Filter menu yang masuk ke section ini dan sesuai role
            const filteredMenus = menuItems.filter(item => 
              item.section === sectionName && 
              (!item.adminOnly || (item.adminOnly && user?.role === 'admin'))
            );

            // Kalau nggak ada menu yang boleh dilihat di section ini, sembunyikan section-nya
            if (filteredMenus.length === 0) return null;

            return (
              <div key={sectionName} className="space-y-3">
                {/* Teks Judul Kategori (Gaya kayak lingkaran merahmu) */}
                <h3 className="px-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em]">
                  {sectionName}
                </h3>
                
                <div className="space-y-1">
                  {filteredMenus.map((item) => {
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
                        <div className="text-left flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{item.label}</div>
                          <div className={`text-[10px] ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                            {item.role}
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
        
        {/* User Section - [SUDAH OTOMATIS] */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-sidebar-accent">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity min-w-0"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {user?.initials || "JD"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {user?.name || "John Doe"}
                </div>
                <div className="text-[10px] text-muted-foreground truncate uppercase">
                  {user?.role?.replace('_', ' ') || "Admin User"}
                </div>
              </div>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 hover:bg-white rounded-lg transition-colors shrink-0"
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

      <LogoutModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={() => {
          setIsModalOpen(false);
          logout(); // Bersihkan session
          navigate("/login");
        }}
      />
    </div>
  );
}