/**
 * Model Debug Page — AI Model Lab (Admin Only)
 *
 * Features:
 * - Register FastAPI / modelling endpoints
 * - Test endpoint connectivity
 * - Deploy models to specific roles (data_operator, risk_analyst, medical_auditor, strategic_manager)
 * - RBAC Guard: Admin role CANNOT be assigned to any custom model
 * - View model version history and deployment status
 * - Enable/Disable models per-role
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Plus,
  Zap,
  Check,
  X,
  Trash2,
  Edit2,
  Play,
  Pause,
  RefreshCw,
  Globe,
  Code2,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Save,
  FlaskConical,
  Server,
  Eye,
  EyeOff,
  Copy,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { UserRole, ROLE_CONFIG } from "../../lib/types";
import { useNotifications } from "../../lib/notifications/notification-context";

// ── Types ─────────────────────────────────────────────────────────────────────

type ModelStatus = "active" | "inactive" | "testing" | "error";
type ModelCategory =
  | "anomaly_detection"
  | "clustering"
  | "regression"
  | "classification"
  | "nlp";

// Roles that can use custom models — Admin is EXCLUDED by design
const ASSIGNABLE_ROLES: UserRole[] = [
  "data_operator",
  "risk_analyst",
  "medical_auditor",
  "strategic_manager",
];

interface ModelEndpoint {
  id: string;
  name: string;
  description: string;
  category: ModelCategory;
  endpoint: string;
  version: string;
  status: ModelStatus;
  assignedRoles: UserRole[];
  lastTested: string;
  latencyMs: number | null;
  accuracy: number | null;
  createdAt: string;
  apiKey: string;
  tags: string[];
}

interface ModelFormData {
  name: string;
  description: string;
  category: ModelCategory;
  endpoint: string;
  version: string;
  apiKey: string;
  assignedRoles: UserRole[];
  tags: string;
}

type DialogMode = "add" | "edit" | null;

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_MODELS: ModelEndpoint[] = [
  {
    id: "mdl-001",
    name: "Fraud Anomaly Detector",
    description:
      "Isolation Forest model for detecting statistical outliers in medical claim data using multiple feature vectors.",
    category: "anomaly_detection",
    endpoint: "http://fastapi.axa-prism.internal/api/v1/detect-anomalies",
    version: "2.5.1",
    status: "active",
    assignedRoles: ["risk_analyst", "medical_auditor"],
    lastTested: "2026-05-06 14:10:00",
    latencyMs: 142,
    accuracy: 94.7,
    createdAt: "2026-04-15",
    apiKey: "sk-prod-axaprism-anom-****",
    tags: ["production", "isolation-forest", "claims"],
  },
  {
    id: "mdl-002",
    name: "Claim Risk Clustering",
    description:
      "K-Means clustering to segment claims into risk tiers based on hospital tier, diagnosis code, and cost deviation.",
    category: "clustering",
    endpoint: "http://fastapi.axa-prism.internal/api/v1/cluster",
    version: "1.8.0",
    status: "active",
    assignedRoles: ["risk_analyst", "strategic_manager"],
    lastTested: "2026-05-06 13:55:00",
    latencyMs: 89,
    accuracy: 91.2,
    createdAt: "2026-03-20",
    apiKey: "sk-prod-axaprism-clus-****",
    tags: ["production", "k-means", "segmentation"],
  },
  {
    id: "mdl-003",
    name: "Cost Regression Predictor",
    description:
      "Linear regression model predicting expected medical costs from patient demographic and diagnosis features.",
    category: "regression",
    endpoint: "http://fastapi.axa-prism.internal/api/v1/regression",
    version: "3.1.2",
    status: "inactive",
    assignedRoles: ["data_operator"],
    lastTested: "2026-05-04 10:30:00",
    latencyMs: null,
    accuracy: 87.5,
    createdAt: "2026-02-10",
    apiKey: "sk-prod-axaprism-regr-****",
    tags: ["staging", "regression", "cost-prediction"],
  },
  {
    id: "mdl-004",
    name: "Diagnosis Code NLP",
    description:
      "BERT-based NLP classifier for validating ICD-10 diagnosis codes against clinical narrative descriptions.",
    category: "nlp",
    endpoint: "http://fastapi.axa-prism.internal/api/v1/nlp/icd-validate",
    version: "1.0.0-beta",
    status: "testing",
    assignedRoles: ["medical_auditor"],
    lastTested: "2026-05-06 11:00:00",
    latencyMs: 350,
    accuracy: 88.1,
    createdAt: "2026-05-01",
    apiKey: "sk-dev-axaprism-nlp-****",
    tags: ["beta", "nlp", "bert", "icd-10"],
  },
];

const EMPTY_FORM: ModelFormData = {
  name: "",
  description: "",
  category: "anomaly_detection",
  endpoint: "",
  version: "1.0.0",
  apiKey: "",
  assignedRoles: [],
  tags: "",
};

const CATEGORY_CONFIG: Record<
  ModelCategory,
  { label: string; color: string; bg: string }
> = {
  anomaly_detection: {
    label: "Anomaly Detection",
    color: "#1E3A8A",
    bg: "rgba(30,58,138,0.1)",
  },
  clustering: {
    label: "Clustering",
    color: "#8A70D6",
    bg: "rgba(138,112,214,0.1)",
  },
  regression: {
    label: "Regression",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.1)",
  },
  classification: {
    label: "Classification",
    color: "#2563EB",
    bg: "rgba(37,99,235,0.1)",
  },
  nlp: { label: "NLP", color: "#4338CA", bg: "rgba(67,56,202,0.1)" },
};

const STATUS_CONFIG: Record<
  ModelStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  active: {
    label: "Active",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    dot: "bg-success",
  },
  inactive: {
    label: "Inactive",
    color: "#9ca3af",
    bg: "rgba(156,163,175,0.1)",
    dot: "bg-gray-400",
  },
  testing: {
    label: "Testing",
    color: "#8A70D6",
    bg: "rgba(138,112,214,0.1)",
    dot: "bg-primary",
  },
  error: {
    label: "Error",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    dot: "bg-destructive",
  },
};

// ── Model Form Dialog ─────────────────────────────────────────────────────────

function ModelDialog({
  mode,
  model,
  onClose,
  onSave,
}: {
  mode: DialogMode;
  model: ModelEndpoint | null;
  onClose: () => void;
  onSave: (data: ModelFormData, id?: string) => void;
}) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState<ModelFormData>(() => {
    if (isEdit && model) {
      return {
        name: model.name,
        description: model.description,
        category: model.category,
        endpoint: model.endpoint,
        version: model.version,
        apiKey: model.apiKey,
        assignedRoles: [...model.assignedRoles],
        tags: model.tags.join(", "),
      };
    }
    return EMPTY_FORM;
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ModelFormData, string>>>({});

  const set = (field: keyof ModelFormData, value: string | UserRole[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleRole = (role: UserRole) => {
    setForm((prev) => {
      const roles = prev.assignedRoles.includes(role)
        ? prev.assignedRoles.filter((r) => r !== role)
        : [...prev.assignedRoles, role];
      return { ...prev, assignedRoles: roles };
    });
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof ModelFormData, string>> = {};
    if (!form.name.trim()) e.name = "Model name is required";
    if (!form.endpoint.trim()) e.endpoint = "FastAPI endpoint URL is required";
    if (!form.version.trim()) e.version = "Version is required";
    if (form.assignedRoles.length === 0)
      e.assignedRoles = "At least one role must be assigned";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form, isEdit ? model?.id : undefined);
  };

  return (
    <AnimatePresence>
      {mode !== null && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-border overflow-hidden max-h-[90vh] flex flex-col"
              initial={{ scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 24 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-purple-600/5 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-md">
                      {isEdit ? (
                        <Edit2 className="w-5 h-5 text-white" />
                      ) : (
                        <Plus className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">
                        {isEdit ? "Edit Model Endpoint" : "Register New Model"}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        FastAPI / ML Model configuration
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

                {/* Admin restriction notice */}
                <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700">
                    <span className="font-semibold">RBAC Restriction:</span>{" "}
                    Admin role cannot be assigned to custom models. System-level
                    access is managed via platform configuration only.
                  </p>
                </div>
              </div>

              {/* Scrollable Form */}
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Model Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Fraud Anomaly Detector v3"
                    className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                      errors.name ? "border-destructive" : "border-border"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Brief description of the model's purpose and methodology..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Model Category <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        set("category", e.target.value as ModelCategory)
                      }
                      className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                    >
                      {Object.entries(CATEGORY_CONFIG).map(([val, cfg]) => (
                        <option key={val} value={val}>
                          {cfg.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Version */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Version <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.version}
                      onChange={(e) => set("version", e.target.value)}
                      placeholder="e.g. 1.0.0"
                      className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                        errors.version ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.version && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.version}
                      </p>
                    )}
                  </div>
                </div>

                {/* Endpoint URL */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    FastAPI Endpoint URL <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="url"
                      value={form.endpoint}
                      onChange={(e) => set("endpoint", e.target.value)}
                      placeholder="http://fastapi.host/api/v1/endpoint"
                      className={`w-full h-10 pl-9 pr-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-mono ${
                        errors.endpoint ? "border-destructive" : "border-border"
                      }`}
                    />
                  </div>
                  {errors.endpoint && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.endpoint}
                    </p>
                  )}
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    API Key / Bearer Token
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={form.apiKey}
                      onChange={(e) => set("apiKey", e.target.value)}
                      placeholder="sk-... (optional)"
                      className="w-full h-10 px-3 pr-10 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Tags{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (comma-separated)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => set("tags", e.target.value)}
                    placeholder="e.g. production, claims, bert"
                    className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                {/* Role Assignment */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Assign to Roles <span className="text-destructive">*</span>
                  </label>
                  <div className="space-y-2">
                    {ASSIGNABLE_ROLES.map((role) => {
                      const config = ROLE_CONFIG[role];
                      const checked = form.assignedRoles.includes(role);
                      return (
                        <label
                          key={role}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            checked
                              ? "border-primary/40 bg-primary/5"
                              : "border-border hover:bg-sidebar-accent"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleRole(role)}
                            className="hidden"
                          />
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              checked
                                ? "border-primary bg-primary"
                                : "border-border"
                            }`}
                          >
                            {checked && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: config.color }}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground">
                              {config.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {config.description}
                            </div>
                          </div>
                        </label>
                      );
                    })}

                    {/* Admin — always locked/excluded */}
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-amber-200 bg-amber-50/50 opacity-70 cursor-not-allowed">
                      <div className="w-5 h-5 rounded-md border-2 border-amber-300 flex items-center justify-center">
                        <Lock className="w-3 h-3 text-amber-500" />
                      </div>
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: ROLE_CONFIG.admin.color }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-amber-700">
                          {ROLE_CONFIG.admin.label}
                        </div>
                        <div className="text-xs text-amber-600">
                          System Admin cannot be assigned to custom models
                        </div>
                      </div>
                      <Badge className="bg-amber-100 text-amber-600 border-amber-200 text-xs">
                        Restricted
                      </Badge>
                    </div>
                  </div>
                  {errors.assignedRoles && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.assignedRoles}
                    </p>
                  )}
                </div>
              </form>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-border bg-sidebar-accent/30 flex gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? "Save Changes" : "Register Model"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Model Card ────────────────────────────────────────────────────────────────

function ModelCard({
  model,
  onEdit,
  onDelete,
  onTest,
  onToggle,
}: {
  model: ModelEndpoint;
  onEdit: (m: ModelEndpoint) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const statusCfg = STATUS_CONFIG[model.status];
  const catCfg = CATEGORY_CONFIG[model.category];

  const copyEndpoint = () => {
    navigator.clipboard.writeText(model.endpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="bg-white rounded-xl border border-border overflow-hidden"
      layout
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground truncate">
                  {model.name}
                </h3>
                <Badge
                  className="text-xs border shrink-0"
                  style={{
                    backgroundColor: statusCfg.bg,
                    color: statusCfg.color,
                    borderColor: `${statusCfg.color}30`,
                  }}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${statusCfg.dot} ${
                      model.status === "active" ? "animate-pulse" : ""
                    }`}
                  />
                  {statusCfg.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className="text-xs border shrink-0"
                  style={{
                    backgroundColor: catCfg.bg,
                    color: catCfg.color,
                    borderColor: `${catCfg.color}30`,
                  }}
                >
                  {catCfg.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  v{model.version}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onTest(model.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-primary/10 text-primary transition-colors"
              title="Test endpoint"
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggle(model.id)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                model.status === "active"
                  ? "hover:bg-amber-50 text-amber-500"
                  : "hover:bg-success/10 text-success"
              }`}
              title={model.status === "active" ? "Deactivate" : "Activate"}
            >
              {model.status === "active" ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => onEdit(model)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-sidebar-accent text-muted-foreground transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(model.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
          {model.description}
        </p>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-sidebar-accent rounded-lg p-2.5 text-center">
            <div className="text-xs text-muted-foreground mb-0.5">Accuracy</div>
            <div className="font-semibold text-foreground text-sm">
              {model.accuracy ? `${model.accuracy}%` : "—"}
            </div>
          </div>
          <div className="bg-sidebar-accent rounded-lg p-2.5 text-center">
            <div className="text-xs text-muted-foreground mb-0.5">Latency</div>
            <div className="font-semibold text-foreground text-sm">
              {model.latencyMs ? `${model.latencyMs}ms` : "—"}
            </div>
          </div>
          <div className="bg-sidebar-accent rounded-lg p-2.5 text-center">
            <div className="text-xs text-muted-foreground mb-0.5">Roles</div>
            <div className="font-semibold text-foreground text-sm">
              {model.assignedRoles.length}
            </div>
          </div>
        </div>

        {/* Assigned Roles */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {model.assignedRoles.map((role) => (
            <Badge
              key={role}
              className="text-xs border"
              style={{
                backgroundColor: `${ROLE_CONFIG[role].color}15`,
                color: ROLE_CONFIG[role].color,
                borderColor: `${ROLE_CONFIG[role].color}30`,
              }}
            >
              {ROLE_CONFIG[role].label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Expandable Detail */}
      <div className="border-t border-border">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-sidebar-accent/50 transition-colors"
        >
          <span className="text-xs text-muted-foreground">
            Endpoint & Technical Details
          </span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-3">
                {/* Endpoint */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> FastAPI Endpoint
                  </p>
                  <div className="flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-2">
                    <code className="flex-1 text-xs text-green-400 font-mono truncate">
                      {model.endpoint}
                    </code>
                    <button
                      onClick={copyEndpoint}
                      className="text-gray-400 hover:text-white transition-colors shrink-0"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* API Key */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> API Key
                  </p>
                  <div className="bg-sidebar-accent rounded-lg px-3 py-2">
                    <code className="text-xs text-foreground font-mono">
                      {model.apiKey}
                    </code>
                  </div>
                </div>

                {/* Last tested & Tags */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Last Tested
                    </p>
                    <p className="text-xs text-foreground">{model.lastTested}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {model.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ModelDebugPage() {
  const [models, setModels] = useState<ModelEndpoint[]>(MOCK_MODELS);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedModel, setSelectedModel] = useState<ModelEndpoint | null>(null);
  const [filter, setFilter] = useState<ModelStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const openAdd = () => {
    setSelectedModel(null);
    setDialogMode("add");
  };

  const openEdit = (model: ModelEndpoint) => {
    setSelectedModel(model);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedModel(null);
  };

  const handleSave = (data: ModelFormData, id?: string) => {
    const tags = data.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (id) {
      setModels((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                name: data.name,
                description: data.description,
                category: data.category,
                endpoint: data.endpoint,
                version: data.version,
                apiKey: data.apiKey,
                assignedRoles: data.assignedRoles,
                tags,
              }
            : m
        )
      );
      addNotification({
        type: "model_deployed",
        severity: "info",
        title: "Model Updated",
        message: `${data.name} configuration has been updated by Administrator.`,
      });
    } else {
      const newModel: ModelEndpoint = {
        id: `mdl-${Date.now()}`,
        name: data.name,
        description: data.description,
        category: data.category,
        endpoint: data.endpoint,
        version: data.version,
        status: "inactive",
        assignedRoles: data.assignedRoles,
        lastTested: "Never",
        latencyMs: null,
        accuracy: null,
        createdAt: new Date().toISOString().split("T")[0],
        apiKey: data.apiKey,
        tags,
      };
      setModels((prev) => [newModel, ...prev]);
      addNotification({
        type: "model_deployed",
        severity: "success",
        title: "New Model Registered",
        message: `${data.name} has been registered and assigned to ${data.assignedRoles.length} role(s).`,
      });
    }
    closeDialog();
  };

  const handleTest = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      const success = Math.random() > 0.25;
      setModels((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const newLatency = Math.floor(50 + Math.random() * 400);
          return {
            ...m,
            status: success ? "active" : "error",
            lastTested: new Date()
              .toLocaleString("sv")
              .replace("T", " ")
              .substring(0, 19),
            latencyMs: success ? newLatency : null,
          };
        })
      );
      setTestingId(null);
      const model = models.find((m) => m.id === id);
      if (model) {
        if (success) {
          addNotification({
            type: "model_deployed",
            severity: "success",
            title: "Endpoint Test Passed",
            message: `${model.name} endpoint responded successfully. Model set to Active.`,
          });
        } else {
          addNotification({
            type: "model_error",
            severity: "error",
            title: "Endpoint Test Failed",
            message: `${model.name} endpoint did not respond. Status set to Error.`,
          });
        }
      }
    }, 1800);
  };

  const handleToggle = (id: string) => {
    setModels((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const newStatus: ModelStatus =
          m.status === "active" ? "inactive" : "active";
        addNotification({
          type: "model_deployed",
          severity: newStatus === "active" ? "success" : "warning",
          title: `Model ${newStatus === "active" ? "Activated" : "Deactivated"}`,
          message: `${m.name} has been ${newStatus === "active" ? "activated" : "deactivated"} by Administrator.`,
        });
        return { ...m, status: newStatus };
      })
    );
  };

  const handleDelete = (id: string) => {
    const model = models.find((m) => m.id === id);
    setModels((prev) => prev.filter((m) => m.id !== id));
    setDeleteConfirm(null);
    if (model) {
      addNotification({
        type: "model_error",
        severity: "warning",
        title: "Model Removed",
        message: `${model.name} has been permanently removed from the system.`,
      });
    }
  };

  const filtered = models.filter((m) => {
    const matchStatus = filter === "all" || m.status === filter;
    const matchSearch =
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.endpoint.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: models.length,
    active: models.filter((m) => m.status === "active").length,
    testing: models.filter((m) => m.status === "testing").length,
    error: models.filter((m) => m.status === "error").length,
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Model Debug Lab
              </h1>
              <p className="text-sm text-muted-foreground">
                Register, test, and deploy FastAPI / ML model endpoints to
                system roles
              </p>
            </div>
          </div>

          {/* RBAC Notice */}
          <div className="mt-4 flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Shield className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Admin RBAC Restriction Active
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                You can register and deploy custom models for all non-admin
                roles (Data Operator, Risk Analyst, Medical Auditor, Strategic
                Manager). The System Admin role is excluded from custom model
                assignment by design — admin-level capabilities are managed
                through system configuration only.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Models",
              value: stats.total,
              icon: Brain,
              color: "#8A70D6",
              delay: 0.1,
            },
            {
              label: "Active",
              value: stats.active,
              icon: CheckCircle2,
              color: "#22c55e",
              delay: 0.15,
            },
            {
              label: "In Testing",
              value: stats.testing,
              icon: FlaskConical,
              color: "#8A70D6",
              delay: 0.2,
            },
            {
              label: "Errors",
              value: stats.error,
              icon: AlertTriangle,
              color: "#ef4444",
              delay: 0.25,
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                className="bg-white rounded-xl p-5 border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: s.delay }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {s.value}
                    </p>
                  </div>
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${s.color}18` }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: s.color }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Toolbar */}
        <motion.div
          className="bg-white rounded-xl p-4 border border-border mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Search */}
          <div className="relative flex-1">
            <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search models by name, category, or endpoint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "active", "inactive", "testing", "error"] as const).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`h-9 px-3 rounded-lg text-sm font-medium transition-all capitalize ${
                    filter === s
                      ? "bg-primary text-white"
                      : "bg-sidebar-accent text-muted-foreground hover:bg-sidebar-accent/80"
                  }`}
                >
                  {s}
                </button>
              )
            )}
          </div>

          <Button
            onClick={openAdd}
            className="bg-gradient-to-r from-primary to-purple-600 text-white shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Register Model
          </Button>
        </motion.div>

        {/* Model Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((model) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                {testingId === model.id ? (
                  <div className="bg-white rounded-xl border border-primary/30 p-8 flex flex-col items-center justify-center gap-3 min-h-[220px]">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="w-8 h-8 text-primary" />
                    </motion.div>
                    <p className="text-sm font-medium text-foreground">
                      Testing endpoint...
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      GET {model.endpoint}
                    </p>
                  </div>
                ) : (
                  <ModelCard
                    model={model}
                    onEdit={openEdit}
                    onDelete={(id) => setDeleteConfirm(id)}
                    onTest={handleTest}
                    onToggle={handleToggle}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <Server className="w-14 h-14 text-muted-foreground/25 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              No models found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || filter !== "all"
                ? "Try adjusting your filters"
                : "Register your first FastAPI model to get started"}
            </p>
            <Button
              onClick={openAdd}
              className="mt-4 bg-gradient-to-r from-primary to-purple-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Register Model
            </Button>
          </div>
        )}

        {/* API Integration Info */}
        <motion.div
          className="mt-8 bg-white rounded-xl border border-border overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-green-400" />
              <h3 className="text-sm font-semibold text-white">
                FastAPI Integration Reference
              </h3>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                endpoint: "POST /api/v1/detect-anomalies",
                desc: "Anomaly detection — accepts claim features, returns anomaly score",
                badge: "Risk Analyst",
                color: "#1E3A8A",
              },
              {
                endpoint: "POST /api/v1/cluster",
                desc: "K-Means clustering — groups claims by risk tier and pattern",
                badge: "Strategic Manager",
                color: "#8A70D6",
              },
              {
                endpoint: "POST /api/v1/retrain",
                desc: "Model retraining — accepts audit decisions and refits model",
                badge: "Medical Auditor",
                color: "#7C3AED",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-gray-900 rounded-xl p-4 font-mono"
              >
                <code className="text-green-400 text-xs block mb-2">
                  {item.endpoint}
                </code>
                <p className="text-gray-400 text-xs mb-3">{item.desc}</p>
                <Badge
                  className="text-xs border"
                  style={{
                    backgroundColor: `${item.color}30`,
                    color: item.color,
                    borderColor: `${item.color}50`,
                  }}
                >
                  {item.badge}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Dialogs */}
      <ModelDialog
        mode={dialogMode}
        model={selectedModel}
        onClose={closeDialog}
        onSave={handleSave}
      />

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-7 h-7 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Delete Model
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    This will permanently remove the model endpoint and revoke
                    access for all assigned roles.
                  </p>
                  <div className="flex gap-3 w-full">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleDelete(deleteConfirm)}
                      className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
