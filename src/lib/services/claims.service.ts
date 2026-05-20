/**
 * Claims Service — Data Layer
 *
 * Separation of Concerns (MVC → Controller):
 * ──────────────────────────────────────────
 * This module acts as the "Model/Service" layer.
 * UI components (Views) should NEVER define raw data arrays inline.
 * Instead, they import from here — making backend swaps transparent.
 *
 * Next.js migration:
 * - Move fetch() calls to Server Actions (/app/actions/claims.ts)
 * - Call flaskPost(FLASK_ENDPOINTS.ANOMALY_DETECTION, payload) instead of mock
 * - Supabase: store audit decisions to public.audit_decisions table
 */

import { simulateLatency } from "../api/client";
import type {
  ClaimRecord,
  ClaimHistory,
  AuditDecision,
  ModelMetrics,
  ScatterPoint,
  ClusterPoint,
  FeatureImportance,
} from "../types";

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_CLAIMS: ClaimRecord[] = [
  {
    id: "CLM-2026-08451",
    patient: "John Anderson",
    hospital: "Metropolitan General Hospital",
    diagnosis: "Cardiac Bypass Surgery",
    expectedCost: 2100,
    actualCost: 7500,
    anomalyScore: 98.5,
    date: "2026-04-10",
    status: "pending",
    tier: "High Risk",
    diagnosisCode: "ICD-10: I25.10",
    hospitalTier: "Tier A",
    treatmentDuration: 8,
  },
  {
    id: "CLM-2026-08452",
    patient: "Sarah Williams",
    hospital: "City Medical Center",
    diagnosis: "Appendectomy",
    expectedCost: 1900,
    actualCost: 6800,
    anomalyScore: 96.2,
    date: "2026-04-12",
    status: "pending",
    tier: "High Risk",
    diagnosisCode: "ICD-10: K37",
    hospitalTier: "Tier B",
    treatmentDuration: 5,
  },
  {
    id: "CLM-2026-08453",
    patient: "Michael Chen",
    hospital: "Regional Healthcare",
    diagnosis: "Hip Replacement",
    expectedCost: 3300,
    actualCost: 8200,
    anomalyScore: 94.8,
    date: "2026-04-13",
    status: "pending",
    tier: "Critical Risk",
    diagnosisCode: "ICD-10: Z96.641",
    hospitalTier: "Tier A",
    treatmentDuration: 12,
  },
  {
    id: "CLM-2026-08454",
    patient: "Emily Davis",
    hospital: "Sunrise Medical",
    diagnosis: "Gallbladder Surgery",
    expectedCost: 2600,
    actualCost: 7100,
    anomalyScore: 92.1,
    date: "2026-04-14",
    status: "pending",
    tier: "High Risk",
    diagnosisCode: "ICD-10: K80.20",
    hospitalTier: "Tier B",
    treatmentDuration: 6,
  },
];

const MOCK_CLAIM_HISTORY: ClaimHistory[] = [
  { date: "2024-03-15", type: "Dental Checkup", cost: 150, status: "approved" },
  { date: "2024-08-22", type: "General Consultation", cost: 80, status: "approved" },
  { date: "2025-06-10", type: "Lab Tests", cost: 320, status: "approved" },
  { date: "2025-11-05", type: "X-Ray Imaging", cost: 280, status: "approved" },
];

const MOCK_SCATTER_DATA: ScatterPoint[] = [
  { expected: 1200, actual: 1150, type: "normal" },
  { expected: 2500, actual: 2600, type: "normal" },
  { expected: 3200, actual: 3100, type: "normal" },
  { expected: 1800, actual: 1900, type: "normal" },
  { expected: 4500, actual: 4400, type: "normal" },
  { expected: 2200, actual: 2150, type: "normal" },
  { expected: 3800, actual: 3900, type: "normal" },
  { expected: 1500, actual: 1450, type: "normal" },
  { expected: 5200, actual: 5100, type: "normal" },
  { expected: 2800, actual: 2900, type: "normal" },
  { expected: 1600, actual: 1550, type: "normal" },
  { expected: 3500, actual: 3600, type: "normal" },
  { expected: 4200, actual: 4150, type: "normal" },
  { expected: 2100, actual: 7500, type: "outlier" },
  { expected: 1900, actual: 6800, type: "outlier" },
  { expected: 3300, actual: 8200, type: "outlier" },
  { expected: 2600, actual: 7100, type: "outlier" },
];

const MOCK_CLUSTER_DATA: ClusterPoint[] = [
  { cluster: "Low Risk", x: 20, y: 30, size: 150, color: "#27AE60" },
  { cluster: "Medium Risk", x: 50, y: 50, size: 200, color: "#F2994A" },
  { cluster: "High Risk", x: 80, y: 75, size: 100, color: "#8A70D6" },
  { cluster: "Critical Risk", x: 90, y: 85, size: 50, color: "#d4183d" },
];

const MOCK_FEATURE_DATA: FeatureImportance[] = [
  { feature: "Hospital Tier", importance: 92, color: "#8A70D6" },
  { feature: "Diagnosis Code", importance: 87, color: "#8A70D6" },
  { feature: "Treatment Duration", importance: 78, color: "#8A70D6" },
  { feature: "Patient Age", importance: 65, color: "#F2994A" },
  { feature: "Policy Type", importance: 58, color: "#F2994A" },
  { feature: "Geographic Region", importance: 45, color: "#27AE60" },
  { feature: "Previous Claims", importance: 38, color: "#27AE60" },
];

const MOCK_MODEL_METRICS: ModelMetrics = {
  accuracy: 96.8,
  version: "v2.4.3",
  lastRetrained: "2026-04-25",
  outlierCount: 4,
  claimIncreasePercent: 25.5,
  riskClusters: 4,
  feedbackCount: 12,
};

// ─── Service Functions ───────────────────────────────────────────────────────

/**
 * Fetch all high-anomaly claims for the audit worklist.
 * Next.js: call flaskGet(FLASK_ENDPOINTS.ANOMALY_DETECTION) or Supabase query.
 */
export async function getAnomalyClaims(): Promise<ClaimRecord[]> {
  await simulateLatency(400);
  return MOCK_CLAIMS;
}

/**
 * Fetch claim history for a given patient / member.
 */
export async function getClaimHistory(_patientId: string): Promise<ClaimHistory[]> {
  await simulateLatency(300);
  return MOCK_CLAIM_HISTORY;
}

/**
 * Submit an audit decision for a claim.
 * Next.js: Server Action → INSERT into Supabase public.audit_decisions
 */
export async function submitAuditDecision(decision: AuditDecision): Promise<void> {
  await simulateLatency(500);
  console.info("[AuditService] Decision submitted:", decision);
  // Production: await supabase.from('audit_decisions').insert(decision)
}

/**
 * Trigger AI model retraining with collected feedback.
 * Next.js: Server Action → POST to Flask RETRAIN endpoint
 */
export async function triggerRetrain(feedbackCount: number): Promise<{
  success: boolean;
  newAccuracy: number;
  newVersion: string;
}> {
  await simulateLatency(3000);
  return {
    success: true,
    newAccuracy: 97.2,
    newVersion: "v2.5.0",
  };
}

/**
 * Get scatter plot data for Expected vs Actual cost regression.
 */
export async function getScatterData(): Promise<ScatterPoint[]> {
  await simulateLatency(200);
  return MOCK_SCATTER_DATA;
}

/**
 * Get K-Means cluster map data.
 */
export async function getClusterData(): Promise<ClusterPoint[]> {
  await simulateLatency(200);
  return MOCK_CLUSTER_DATA;
}

/**
 * Get feature importance rankings from the trained model.
 */
export async function getFeatureImportance(): Promise<FeatureImportance[]> {
  await simulateLatency(200);
  return MOCK_FEATURE_DATA;
}

/**
 * Get current model performance metrics.
 */
export async function getModelMetrics(): Promise<ModelMetrics> {
  await simulateLatency(300);
  return MOCK_MODEL_METRICS;
}
