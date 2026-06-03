/**
 * User Management Page (Admin Only)
 *
 * Features:
 * - View all users in the system
 * - Add new user via modal (name, email, role, status, password)
 * - Edit full user details via modal
 * - Role badges with color coding
 * - Status indicators (Active/Inactive)
 * - Last login tracking
 * - RBAC Guard: Admin role rows are protected (role field locked)
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Shield,
  Edit2,
  Trash2,
  Search,
  UserPlus,
  Activity,
  Clock,
  X,
  Eye,
  EyeOff,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Save,
} from "lucide-react";
import { Button } from "../../../../../src/app/components/ui/button";
import { Badge } from "../../../../../src/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../src/app/components/ui/select";
import { UserRole, ROLE_CONFIG } from "../../../../../src/lib/types";
import { useNotifications } from "../../../lib/notifications/notification-context";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
  lastLogin: string;
  department: string;
  passwordHash?: string; // mock — in production use Supabase Auth
}

type DialogMode = "add" | "edit" | null;

interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
  password: string;
  confirmPassword: string;
  department: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_USERS: SystemUser[] = [
  {
    id: "usr-000",
    name: "Aqueena Administrator",
    email: "admin@axa.co.id",
    role: "admin",
    status: "active",
    lastLogin: "2026-05-06 14:23:00",
    department: "System Administration",
  },
  {
    id: "usr-001",
    name: "Ahmad Fauzi",
    email: "ahmad.fauzi@axa.co.id",
    role: "data_operator",
    status: "active",
    lastLogin: "2026-05-06 13:45:12",
    department: "Data Management Unit",
  },
  {
    id: "usr-002",
    name: "Dr. Sari Dewi",
    email: "sari.dewi@axa.co.id",
    role: "risk_analyst",
    status: "active",
    lastLogin: "2026-05-06 14:01:33",
    department: "Risk Intelligence Division",
  },
  {
    id: "usr-003",
    name: "Dr. Budi Santoso",
    email: "budi.santoso@axa.co.id",
    role: "medical_auditor",
    status: "active",
    lastLogin: "2026-05-05 16:22:45",
    department: "Medical Audit Department",
  },
  {
    id: "usr-004",
    name: "Ir. Dian Pratiwi",
    email: "dian.pratiwi@axa.co.id",
    role: "strategic_manager",
    status: "active",
    lastLogin: "2026-05-06 09:15:22",
    department: "Executive Management",
  },
];

const EMPTY_FORM: UserFormData = {
  name: "",
  email: "",
  role: "data_operator",
  status: "active",
  password: "",
  confirmPassword: "",
  department: "",
};

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "data_operator", label: "Data Operator" },
  { value: "risk_analyst", label: "Risk Analyst" },
  { value: "medical_auditor", label: "Medical Auditor" },
  { value: "strategic_manager", label: "Strategic Manager" },
  // Admin role is intentionally NOT included to prevent self-delegation issues
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

function getRoleBadgeStyle(role: UserRole) {
  const config = ROLE_CONFIG[role];
  return {
    backgroundColor: `${config.color}18`,
    color: config.color,
    borderColor: `${config.color}30`,
  };
}

// ── User Dialog ───────────────────────────────────────────────────────────────

function UserDialog({
  mode,
  user,
  onClose,
  onSave,
}: {
  mode: DialogMode;
  user: SystemUser | null;
  onClose: () => void;
  onSave: (data: UserFormData, userId?: string) => void;
}) {
  const isEdit = mode === "edit";
  const isAdminUser = user?.role === "admin";

  const [form, setForm] = useState<UserFormData>(() => {
    if (isEdit && user) {
      return {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        password: "",
        confirmPassword: "",
        department: user.department,
      };
    }
    return EMPTY_FORM;
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<UserFormData>>({});

  const validate = (): boolean => {
    const newErrors: Partial<UserFormData> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email format";
    if (!form.department.trim()) newErrors.department = "Department is required";
    if (!isEdit && !form.password) newErrors.password = "Password is required";
    if (form.password && form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (form.password && form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form, isEdit ? user?.id : undefined);
  };

  const set = (field: keyof UserFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <AnimatePresence>
      {mode !== null && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-border overflow-hidden"
              initial={{ scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 24 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dialog Header */}
              <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-purple-600/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-md">
                      {isEdit ? (
                        <Edit2 className="w-5 h-5 text-white" />
                      ) : (
                        <UserPlus className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">
                        {isEdit ? "Edit User" : "Add New User"}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {isEdit
                          ? `Editing: ${user?.name}`
                          : "Create a new system account"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-sidebar-accent text-muted-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Admin protection notice */}
                {isAdminUser && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      <span className="font-semibold">Admin Role Protected:</span>{" "}
                      Role field is locked for Admin users to prevent privilege escalation.
                    </p>
                  </div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Dr. Ahmad Fauzi"
                    className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                      errors.name ? "border-destructive" : "border-border"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="user@axa.co.id"
                    className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                      errors.email ? "border-destructive" : "border-border"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Department <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => set("department", e.target.value)}
                    placeholder="e.g. Risk Intelligence Division"
                    className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                      errors.department ? "border-destructive" : "border-border"
                    }`}
                  />
                  {errors.department && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.department}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Role <span className="text-destructive">*</span>
                    </label>
                    {isAdminUser ? (
                      <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-sidebar-accent">
                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          System Admin
                        </span>
                      </div>
                    ) : (
                      <Select
                        value={form.role}
                        onValueChange={(v) => set("role", v)}
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: ROLE_CONFIG[opt.value].color,
                                  }}
                                />
                                {opt.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Status <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={form.status}
                      onValueChange={(v) => set("status", v)}
                    >
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-success" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                            Inactive
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Password */}
                <div className="pt-1">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {isEdit ? "New Password" : "Password"}{" "}
                    {!isEdit && <span className="text-destructive">*</span>}
                    {isEdit && (
                      <span className="text-xs text-muted-foreground font-normal ml-1">
                        (leave blank to keep current)
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="Min. 8 characters"
                      className={`w-full h-10 px-3 pr-10 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                        errors.password ? "border-destructive" : "border-border"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                {(form.password || !isEdit) && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Confirm Password{" "}
                      {!isEdit && <span className="text-destructive">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) => set("confirmPassword", e.target.value)}
                        placeholder="Re-enter password"
                        className={`w-full h-10 px-3 pr-10 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                          errors.confirmPassword
                            ? "border-destructive"
                            : "border-border"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isEdit ? "Save Changes" : "Create User"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Delete Confirm Dialog ─────────────────────────────────────────────────────

function DeleteConfirmDialog({
  user,
  onClose,
  onConfirm,
}: {
  user: SystemUser | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}) {
  if (!user) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Delete User</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{user.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => onConfirm(user.id)}
                className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const [users, setUsers] = useState<SystemUser[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SystemUser | null>(null);
  const { addNotification } = useNotifications();

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAdd = () => {
    setSelectedUser(null);
    setDialogMode("add");
  };

  const openEdit = (user: SystemUser) => {
    setSelectedUser(user);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedUser(null);
  };

  const handleSave = (data: UserFormData, userId?: string) => {
    if (userId) {
      // Edit existing
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                name: data.name,
                email: data.email,
                role: u.role === "admin" ? "admin" : data.role, // lock admin role
                status: data.status,
                department: data.department,
              }
            : u
        )
      );
      addNotification({
        type: "user_edited",
        severity: "info",
        title: "User Updated",
        message: `${data.name}'s profile has been updated by Administrator.`,
      });
    } else {
      // Add new
      const newUser: SystemUser = {
        id: `usr-${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        lastLogin: "Never",
        department: data.department,
      };
      setUsers((prev) => [...prev, newUser]);
      addNotification({
        type: "user_added",
        severity: "success",
        title: "New User Added",
        message: `${data.name} has been added as ${ROLE_CONFIG[data.role].label} by Administrator.`,
      });
    }
    closeDialog();
  };

  const handleDelete = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (user) {
      addNotification({
        type: "user_deleted",
        severity: "warning",
        title: "User Deleted",
        message: `${user.name} (${ROLE_CONFIG[user.role].label}) has been removed from the system.`,
      });
    }
    setDeleteTarget(null);
  };

  return (
    <div className="h-full bg-background overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                User Management
              </h1>
              <p className="text-sm text-muted-foreground">
                The Control Center — Manage team roles, permissions, and access
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Users",
              value: users.length,
              icon: Users,
              color: "primary",
              delay: 0.1,
            },
            {
              label: "Active Users",
              value: users.filter((u) => u.status === "active").length,
              icon: Activity,
              color: "success",
              delay: 0.2,
            },
            {
              label: "Admins",
              value: users.filter((u) => u.role === "admin").length,
              icon: Shield,
              color: "gray-900",
              delay: 0.3,
            },
            {
              label: "Roles",
              value: 5,
              icon: UserPlus,
              color: "primary",
              delay: 0.4,
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                className="bg-white rounded-xl p-5 border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: card.delay }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center`}
                    style={{
                      backgroundColor:
                        card.color === "success"
                          ? "rgba(34,197,94,0.1)"
                          : card.color === "gray-900"
                          ? "rgba(17,24,39,0.1)"
                          : "rgba(138,112,214,0.1)",
                    }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{
                        color:
                          card.color === "success"
                            ? "#22c55e"
                            : card.color === "gray-900"
                            ? "#111827"
                            : "#8A70D6",
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Search & Actions Bar */}
        <motion.div
          className="bg-white rounded-xl p-4 border border-border mb-6 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <Button
            onClick={openAdd}
            className="bg-gradient-to-r from-primary to-purple-600 text-white shrink-0"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add New User
          </Button>
        </motion.div>

        {/* User Table */}
        <motion.div
          className="bg-white rounded-xl border border-border overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sidebar-accent border-b border-border">
                <tr>
                  {[
                    "Name",
                    "Email",
                    "Department",
                    "Role",
                    "Status",
                    "Last Login",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    className="hover:bg-sidebar-accent/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {user.name}
                          </div>
                          {user.role === "admin" && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Lock className="w-3 h-3 text-amber-500" />
                              <span className="text-[10px] text-amber-600">
                                Protected
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {user.department}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className="text-xs font-medium border"
                        style={getRoleBadgeStyle(user.role)}
                      >
                        {ROLE_CONFIG[user.role].label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            user.status === "active"
                              ? "bg-success"
                              : "bg-gray-400"
                          }`}
                        />
                        <span
                          className={`text-sm capitalize ${
                            user.status === "active"
                              ? "text-success font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs">{user.lastLogin}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(user)}
                          className="h-8 text-primary border-primary/30 hover:bg-primary/5"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                          Edit
                        </Button>
                        {user.role !== "admin" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteTarget(user)}
                            className="h-8 text-destructive border-destructive/30 hover:bg-destructive/5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="py-16 text-center">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No users found matching your search.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Role Legend */}
        <motion.div
          className="mt-6 bg-white rounded-xl p-6 border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Role Permission Map
            </h3>
            <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Admin role is system-protected
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(ROLE_CONFIG).map(([role, config]) => (
              <div key={role} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded flex-shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {config.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {config.permissions.length} permissions
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Dialogs ─────────────────────────────────────────────────────────── */}
      <UserDialog
        mode={dialogMode}
        user={selectedUser}
        onClose={closeDialog}
        onSave={handleSave}
      />

      {deleteTarget && (
        <DeleteConfirmDialog
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
