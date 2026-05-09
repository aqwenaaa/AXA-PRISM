import { ArrowLeft, Users, Shield, Activity } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { UserRoleTable } from "../components/user-role-table";

export default function UserManagementPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/30 via-primary/20 to-transparent rounded-full blur-[120px] pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-success/30 via-success/20 to-transparent rounded-full blur-[120px] pointer-events-none"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-success/50 flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              AXA-PRISM
            </span>
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Kembali</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 relative">
        <motion.div
          className="text-center max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 via-success/20 to-primary/20 border border-primary/30 text-sm text-primary backdrop-blur-sm mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Manajemen Pengguna & Role</span>
            </div>
          </motion.div>

          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
              User Role Management
            </span>
          </h1>

          <p className="text-xl text-foreground/60 leading-relaxed">
            Kelola role dan akses pengguna secara real-time. Ubah role dengan mudah
            menggunakan antarmuka interaktif yang intuitif.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {[
            {
              icon: Users,
              label: "Total Users",
              value: "5",
              color: "from-blue-500 to-blue-600",
            },
            {
              icon: Shield,
              label: "Roles",
              value: "5",
              color: "from-purple-500 to-purple-600",
            },
            {
              icon: Activity,
              label: "Active Sessions",
              value: "3",
              color: "from-green-500 to-green-600",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                className="glass rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-colors"
                whileHover={{ y: -5 }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg shadow-primary/20`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Daftar Pengguna
            </h2>
            <p className="text-muted-foreground">
              Ubah role pengguna dan kelola akses sistem
            </p>
          </div>

          {/* User Role Table Component */}
          <UserRoleTable />
        </motion.div>

        {/* Features Section */}
        <motion.section
          className="mt-20 pt-20 border-t border-border"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            Fitur Interaktif
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Dropdown Menu Responsif",
                description:
                  "Pilih role baru dengan dropdown yang smooth dan responsif dengan animasi yang menarik.",
                icon: "🎨",
              },
              {
                title: "Real-time Update",
                description:
                  "Perubahan role langsung terlihat dengan animasi smooth dan notifikasi sukses yang jelas.",
                icon: "⚡",
              },
              {
                title: "Toast Notification",
                description:
                  "Konfirmasi visual yang elegan menampilkan nama user dan role baru yang telah diubah.",
                icon: "✨",
              },
              {
                title: "Supabase Ready",
                description:
                  "Kode integrasi Supabase sudah disiapkan dan siap diaktifkan untuk sinkronisasi database.",
                icon: "🔌",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="glass rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </section>

      {/* Footer Note */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-border mt-12">
        <div className="glass rounded-2xl p-8 border border-border/50">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Catatan Keamanan
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground ml-7 list-disc">
            <li>Semua perubahan role akan dicatat dalam audit log</li>
            <li>Admin role hanya dapat diberikan oleh administrator super</li>
            <li>Perubahan role memerlukan autentikasi yang valid</li>
            <li>Data user disinkronkan real-time dengan database Supabase</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
