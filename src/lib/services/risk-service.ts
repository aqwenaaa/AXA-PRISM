import { flaskRequest } from "@/lib/api/flask-client";
import { getRecentClaims } from "@/lib/api/supabase-server";

export async function getRiskSummary() {
  const [mlSummary, recentClaims] = await Promise.all([
    flaskRequest<{ anomalyRate: number; clusters: number }>("/risk/summary"),
    getRecentClaims(10),
  ]);

  return {
    mlSummary,
    recentClaims,
  };
}
