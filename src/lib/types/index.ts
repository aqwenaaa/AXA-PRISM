/**
 * AXA-PRISM Domain Types & Interfaces
 *
 * Mirrors Next.js App Router conventions:
 * - Shared types used by both "Server" (service layer) and "Client" (UI) code
 * - In a real Next.js migration: move to /types/index.ts at project root
 */

// ─── Authentication & RBAC ──────────────────────────────────────────────────

export type UserRole =
  | "admin"
  | "data_operator"
  | "risk_analyst"
  | "medical_auditor"
  | "strategic_manager";

export type Permission =
  | "view:data-ingestion"
  | "edit:data-ingestion"
  | "view:intelligence-lab"
  | "edit:intelligence-lab"
  | "view:medical-audit"
  | "edit:medical-audit"
  | "view:executive-dashboard"
  | "edit:executive-dashboard"
  | "view:claim-growth"
  | "trigger:ai-retrain"
  | "approve:policy"
  | "view:user-management"
  | "edit:user-management"
  | "view:system-overview"
  | "view:model-debug"
  | "edit:model-debug";

export interface RoleConfig {
  label: string;
  defaultRoute: string;
  color: string;
  gradientClass: string;
  description: string;
  permissions: Permission[];
  icon: string;
}

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  admin: {
    label: "System Admin",
    defaultRoute: "/user-management",
    color: "#1a1a2e",
    gradientClass: "from-gray-900 to-gray-700",
    description: "Full system control & user management",
    icon: "Shield",
    permissions: [
      "view:system-overview",
      "view:user-management",
      "edit:user-management",
      "view:data-ingestion",
      "edit:data-ingestion",
      "view:intelligence-lab",
      "edit:intelligence-lab",
      "view:medical-audit",
      "edit:medical-audit",
      "view:executive-dashboard",
      "edit:executive-dashboard",
      "view:claim-growth",
      "trigger:ai-retrain",
      "approve:policy",
      "view:model-debug",
      "edit:model-debug",
    ],
  },
  data_operator: {
    label: "Data Operator",
    defaultRoute: "/data-ingestion",
    color: "#8A70D6",
    gradientClass: "from-primary to-purple-700",
    description: "Data collection, upload & validation pipeline",
    icon: "Upload",
    permissions: [
      "view:data-ingestion",
      "edit:data-ingestion",
      "view:claim-growth",
    ],
  },
  risk_analyst: {
    label: "Risk Analyst",
    defaultRoute: "/intelligence-lab",
    color: "#1E3A8A",
    gradientClass: "from-blue-700 to-primary",
    description: "AI analytics & anomaly pattern recognition",
    icon: "Brain",
    permissions: [
      "view:intelligence-lab",
      "edit:intelligence-lab",
      "view:claim-growth",
      "view:data-ingestion",
    ],
  },
  medical_auditor: {
    label: "Medical Auditor",
    defaultRoute: "/medical-audit",
    color: "#8A70D6",
    gradientClass: "from-primary to-indigo-700",
    description: "Human-in-the-loop claim verification",
    icon: "Stethoscope",
    permissions: [
      "view:medical-audit",
      "edit:medical-audit",
      "trigger:ai-retrain",
      "view:claim-growth",
    ],
  },
  strategic_manager: {
    label: "Strategic Manager",
    defaultRoute: "/executive-dashboard",
    color: "#1E3A8A",
    gradientClass: "from-indigo-700 to-primary",
    description: "Strategic oversight & policy implementation",
    icon: "TrendingUp",
    permissions: [
      "view:executive-dashboard",
      "edit:executive-dashboard",
      "approve:policy",
      "view:claim-growth",
      "view:data-ingestion",
      "view:intelligence-lab",
      "view:medical-audit",
    ],
  },
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
  department: string;
}

/** Demo credentials — replace with Supabase auth in production */
export const DEMO_USERS: Record<string, { user: User; password: string }> = {
  admin: {
    user: {
      id: "usr-000",
      name: "Aqueena Administrator",
      email: "admin@axa.co.id",
      role: "admin",
      initials: "AA",
      department: "System Administration",
    },
    password: "admin123",
  },
  operator: {
    user: {
      id: "usr-001",
      name: "Ahmad Fauzi",
      email: "ahmad.fauzi@axa.co.id",
      role: "data_operator",
      initials: "AF",
      department: "Data Management Unit",
    },
    password: "operator123",
  },
  analyst: {
    user: {
      id: "usr-002",
      name: "Dr. Sari Dewi",
      email: "sari.dewi@axa.co.id",
      role: "risk_analyst",
      initials: "SD",
      department: "Risk Intelligence Division",
    },
    password: "analyst123",
  },
  auditor: {
    user: {
      id: "usr-003",
      name: "Dr. Budi Santoso",
      email: "budi.santoso@axa.co.id",
      role: "medical_auditor",
      initials: "BS",
      department: "Medical Audit Department",
    },
    password: "auditor123",
  },
  manager: {
    user: {
      id: "usr-004",
      name: "Ir. Dian Pratiwi",
      email: "dian.pratiwi@axa.co.id",
      role: "strategic_manager",
      initials: "DP",
      department: "Executive Management",
    },
    password: "manager123",
  },
};

// ─── Claims Domain ──────────────────────────────────────────────────────────

export type ClaimStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "investigating"
  | "fraud";
export type RiskTier =
  | "Low Risk"
  | "Medium Risk"
  | "High Risk"
  | "Critical Risk";

export interface ClaimRecord {
  id: string;
  patient: string;
  hospital: string;
  diagnosis: string;
  expectedCost: number;
  actualCost: number;
  anomalyScore: number;
  date: string;
  status: ClaimStatus;
  tier: RiskTier;
  diagnosisCode?: string;
  hospitalTier?: string;
  treatmentDuration?: number;
}

export interface ClaimHistory {
  date: string;
  type: string;
  cost: number;
  status: "approved" | "rejected";
}

export type AuditDecisionType = "valid" | "overtreatment" | "fraud";

export interface AuditDecision {
  claimId: string;
  decision: AuditDecisionType;
  notes: string;
  auditorId: string;
  timestamp: string;
}

// ─── Data Ingestion ────────────────────────────────────────────────────────

export type IngestionFileType = "policy" | "claims";
export type ValidationStatus = "idle" | "validating" | "success" | "error";

export interface IngestionJob {
  id: string;
  type: IngestionFileType;
  filename: string;
  rowCount: number;
  status: "pending" | "processing" | "completed" | "failed";
  timestamp: string;
}

export interface DataQualityReport {
  totalRows: string;
  missingValuePercentage: string;
  formatConsistency: string;
  keyIntegrityCheck: boolean;
  schemaValidation: boolean;
  dateFormatCheck: boolean;
}

// ─── AI / Intelligence ──────────────────────────────────────────────────────

export interface ScatterPoint {
  expected: number;
  actual: number;
  type: "normal" | "outlier";
}

export interface ClusterPoint {
  cluster: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  color: string;
}

export interface CertaintyFactorConfig {
  hospitalTierWeight: number;
  diagnosisCodeWeight: number;
  treatmentDurationWeight: number;
  anomalyThreshold: number;
}

export interface ModelMetrics {
  accuracy: number;
  version: string;
  lastRetrained: string;
  outlierCount: number;
  claimIncreasePercent: number;
  riskClusters: number;
  feedbackCount: number;
}

// ─── Analytics / Executive ────────────────────────────────────���─────────────

export interface FinancialTrend {
  month: string;
  baseline: number;
  predicted: number;
  savings: number;
}

export interface RiskDistribution {
  name: string;
  value: number;
  color: string;
}

export interface StrategicAction {
  id: number;
  title: string;
  description: string;
  impact: "Critical" | "High" | "Medium" | "Low";
  savings: string;
  confidence: number;
  category: string;
}

export interface ClaimGrowthData {
  month: string;
  claims: number;
  cost: number;
  avgCost: number;
}

export interface CategoryGrowth {
  category: string;
  claims: number;
  growth: number;
  color: string;
}

export interface AIInsight {
  id: number;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  insight: string;
  recommendation: string;
  confidence: number;
  impact: string;
}

// ─── Flask API Integration Types ────────────────────────────────────────────
/**
 * Next.js Migration Note:
 * These types power the /app/api/flask-proxy/route.ts Server Action.
 * Replace mock implementations in services/ with real fetch() calls to Flask.
 *
 * Flask Base URL: process.env.FLASK_INTERNAL_URL (server-side only)
 */

export interface AnomalyDetectionRequest {
  claimId: string;
  features: {
    hospitalTier: number;
    diagnosisCode: string;
    treatmentDuration: number;
    claimAmount: number;
  };
  thresholds: CertaintyFactorConfig;
}

export interface AnomalyDetectionResponse {
  claimId: string;
  anomalyScore: number;
  isAnomaly: boolean;
  confidence: number;
  explanation: string[];
}

export interface RetrainRequest {
  auditDecisions: AuditDecision[];
  modelVersion: string;
}

export interface RetrainResponse {
  success: boolean;
  newVersion: string;
  accuracyDelta: number;
  message: string;
}

export const FLASK_ENDPOINTS = {
  ANOMALY_DETECTION: "/api/v1/detect-anomalies",
  CLUSTERING: "/api/v1/cluster",
  REGRESSION: "/api/v1/regression",
  RETRAIN: "/api/v1/retrain",
  MODEL_STATUS: "/api/v1/model/status",
  DATA_VALIDATE: "/api/v1/data/validate",
  DATA_INGEST: "/api/v1/data/ingest",
} as const;