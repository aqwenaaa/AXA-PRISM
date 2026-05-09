import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface User {
  id: string;
  name: string;
  email: string;
  currentRole: "data_operator" | "risk_analyst" | "medical_auditor" | "strategic_manager" | "admin";
  joinDate: string;
}

const AVAILABLE_ROLES = [
  { value: "data_operator", label: "Data Operator" },
  { value: "risk_analyst", label: "Risk Analyst" },
  { value: "medical_auditor", label: "Medical Auditor" },
  { value: "strategic_manager", label: "Strategic Manager" },
  { value: "admin", label: "Admin" },
] as const;

interface UserWithPendingRole extends User {
  pendingRole?: string;
}

export function UserRoleTable() {
  // Sample data - dalam praktik akan diambil dari Supabase
  const [users, setUsers] = useState<UserWithPendingRole[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@axa.com",
      currentRole: "admin",
      joinDate: "Jan 15, 2024",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.johnson@axa.com",
      currentRole: "risk_analyst",
      joinDate: "Feb 20, 2024",
    },
    {
      id: "3",
      name: "Michael Chen",
      email: "michael.chen@axa.com",
      currentRole: "medical_auditor",
      joinDate: "Mar 10, 2024",
    },
    {
      id: "4",
      name: "Emma Wilson",
      email: "emma.wilson@axa.com",
      currentRole: "data_operator",
      joinDate: "Apr 5, 2024",
    },
    {
      id: "5",
      name: "Robert Garcia",
      email: "robert.garcia@axa.com",
      currentRole: "strategic_manager",
      joinDate: "May 1, 2024",
    },
  ]);

  const [updateNotification, setUpdateNotification] = useState<{
    visible: boolean;
    userId: string;
    userName: string;
    newRole: string;
  }>({
    visible: false,
    userId: "",
    userName: "",
    newRole: "",
  });

  /**
   * Menangkap perubahan role ketika user memilih dari dropdown
   */
  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, pendingRole: newRole } : user
      )
    );
  };

  /**
   * Menghandle update role - dijalankan ketika tombol Update diklik
   * @param userId - ID user yang akan diubah rolenya
   * @param newRole - Role baru untuk user
   */
  const handleRoleUpdate = async (userId: string, newRole: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    try {
      // LOG SIMULASI - Untuk demonstrasi
      console.log(`🔄 Mengubah user ${user.name} (ID: ${userId}) menjadi role ${newRole}`);

      // INTEGRASI SUPABASE (saat ini dalam komentar - siap untuk diaktifkan)
      // Uncomment kode di bawah untuk integrasi sebenarnya:
      /*
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('❌ Error updating role:', error);
        return;
      }
      */

      // Update state lokal untuk mencerminkan perubahan
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId
            ? { ...u, currentRole: newRole as typeof u.currentRole, pendingRole: undefined }
            : u
        )
      );

      // Tampilkan notifikasi sukses dengan animasi
      const roleLabel = AVAILABLE_ROLES.find((r) => r.value === newRole)?.label || newRole;
      setUpdateNotification({
        visible: true,
        userId,
        userName: user.name,
        newRole: roleLabel,
      });

      // Sembunyikan notifikasi setelah 4 detik
      setTimeout(() => {
        setUpdateNotification({ ...updateNotification, visible: false });
      }, 4000);
    } catch (error) {
      console.error("❌ Unexpected error:", error);
    }
  };

  /**
   * Mendapatkan warna badge berdasarkan role
   */
  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      data_operator: "bg-blue-100 text-blue-800 border border-blue-200",
      risk_analyst: "bg-purple-100 text-purple-800 border border-purple-200",
      medical_auditor: "bg-green-100 text-green-800 border border-green-200",
      strategic_manager: "bg-amber-100 text-amber-800 border border-amber-200",
      admin: "bg-red-100 text-red-800 border border-red-200",
    };
    return colors[role] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  /**
   * Format label role dari snake_case ke Title Case
   */
  const formatRoleLabel = (role: string): string => {
    return AVAILABLE_ROLES.find((r) => r.value === role)?.label || role;
  };

  return (
    <div className="w-full space-y-4">
      {/* Notifikasi Sukses - Toast Animation */}
      <AnimatePresence>
        {updateNotification.visible && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 right-4 z-50 px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl shadow-green-500/30 border border-green-400/50 flex items-center gap-3"
          >
            <Check className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">
                Peran berhasil diubah!
              </p>
              <p className="text-xs opacity-90">
                {updateNotification.userName} sekarang adalah {updateNotification.newRole}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabel User dengan Role Management */}
      <div className="glass rounded-2xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Nama</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role Saat Ini</TableHead>
              <TableHead className="font-semibold">Ubah Role</TableHead>
              <TableHead className="font-semibold text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-medium text-foreground">
                  {user.name}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.email}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                      user.currentRole
                    )}`}
                  >
                    {formatRoleLabel(user.currentRole)}
                  </span>
                </TableCell>
                <TableCell>
                  {/* Dropdown Menu untuk Ubah Role */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white hover:bg-muted/50 transition-colors text-sm font-medium text-foreground"
                      >
                        <span>
                          {user.pendingRole
                            ? formatRoleLabel(user.pendingRole)
                            : "Pilih Role"}
                        </span>
                        <ChevronDown className="w-4 h-4 opacity-60" />
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {AVAILABLE_ROLES.map((role) => (
                        <DropdownMenuItem
                          key={role.value}
                          onClick={() => handleRoleChange(user.id, role.value)}
                          className={`cursor-pointer ${
                            user.currentRole === role.value
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`}
                        >
                          <span>{role.label}</span>
                          {user.currentRole === role.value && (
                            <Check className="ml-auto w-4 h-4" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell className="text-right">
                  {user.pendingRole && user.pendingRole !== user.currentRole ? (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
                      onClick={() =>
                        handleRoleUpdate(user.id, user.pendingRole as string)
                      }
                    >
                      Update
                    </motion.button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {user.pendingRole === user.currentRole
                        ? "Tidak ada perubahan"
                        : "-"}
                    </span>
                  )}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Info Message */}
      <div className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
        <p className="font-semibold mb-1">📋 Panduan Penggunaan:</p>
        <ul className="text-xs space-y-1 ml-4 list-disc">
          <li>Klik dropdown di kolom "Ubah Role" untuk memilih role baru</li>
          <li>Tombol "Update" akan muncul setelah memilih role yang berbeda</li>
          <li>Klik "Update" untuk menyimpan perubahan role</li>
          <li>Notifikasi sukses akan muncul setelah perubahan berhasil</li>
        </ul>
      </div>
    </div>
  );
}
