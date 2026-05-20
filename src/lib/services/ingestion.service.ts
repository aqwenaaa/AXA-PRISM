/**
 * Data Ingestion Service — Upload & Validation Layer
 *
 * Next.js migration:
 * - File uploads: use Next.js Route Handler /app/api/upload/route.ts
 * - Store metadata in Supabase Storage + public.ingestion_jobs table
 * - Call Flask /api/v1/data/validate for schema validation
 * - Use Server Actions for triggering the AI pipeline
 */

import { simulateLatency } from "../api/client";
import type { IngestionJob, DataQualityReport, ValidationStatus } from "../types";

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Validate an uploaded file against the expected schema.
 * Next.js: POST to /app/api/upload/route.ts which proxies to Flask /api/v1/data/validate
 */
export async function validateFile(file: File): Promise<{
  status: ValidationStatus;
  rowCount?: string;
  errors?: string[];
}> {
  await simulateLatency(1500);

  const isValidFormat =
    file.name.endsWith(".csv") ||
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".xls");

  if (!isValidFormat) {
    return {
      status: "error",
      errors: ["Invalid file format. Please upload CSV or Excel file."],
    };
  }

  return {
    status: "success",
    rowCount: file.name.toLowerCase().includes("policy") ? "45,230" : "128,456",
  };
}

/**
 * Submit validated file to the ingestion pipeline.
 * Next.js: Server Action → upload to Supabase Storage → trigger Flask pipeline
 */
export async function ingestFile(
  type: "policy" | "claims",
  file: File
): Promise<IngestionJob> {
  await simulateLatency(800);

  const job: IngestionJob = {
    id: `JOB-${Date.now()}`,
    type,
    filename: file.name,
    rowCount: type === "policy" ? 45230 : 128456,
    status: "completed",
    timestamp: new Date().toISOString(),
  };

  console.info("[IngestionService] File ingested:", job);
  return job;
}

/**
 * Run the AI Intelligence Engine on both uploaded datasets.
 * Next.js: Server Action → POST to Flask /api/v1/data/ingest → start pipeline
 */
export async function runIntelligenceEngine(): Promise<{ success: boolean; jobId: string }> {
  await simulateLatency(3000);
  return { success: true, jobId: `PIPELINE-${Date.now()}` };
}

/**
 * Compute data quality metrics for uploaded datasets.
 * Next.js: fetch from Flask /api/v1/data/quality or Supabase function
 */
export async function getDataQualityReport(
  policyLoaded: boolean,
  claimsLoaded: boolean
): Promise<DataQualityReport> {
  await simulateLatency(200);

  if (!policyLoaded || !claimsLoaded) {
    return {
      totalRows: "0",
      missingValuePercentage: "0%",
      formatConsistency: "0%",
      keyIntegrityCheck: false,
      schemaValidation: false,
      dateFormatCheck: false,
    };
  }

  return {
    totalRows: "173,686",
    missingValuePercentage: "2.3%",
    formatConsistency: "98.7%",
    keyIntegrityCheck: true,
    schemaValidation: true,
    dateFormatCheck: true,
  };
}
