import { apiGet } from "@/lib/api/api-client";
import { getRecentClaims } from "@/lib/api/supabase-server";

export async function getRiskSummary() {
  const [mlSummary, recentClaims] = await Promise.all([
    // Fetches actual model summaries and diagnostics from FastAPI analyst endpoint
    apiGet<{ accuracy: number; outlier_count: number; risk_clusters: number }>("/api/v1/dashboard/analyst"),
    getRecentClaims(10),
  ]);

  return {
    mlSummary: {
      anomalyRate: mlSummary.outlier_count, // map outlier count as mock indicator
      clusters: mlSummary.risk_clusters,
    },
    recentClaims,
  };
}
