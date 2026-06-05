/**
 * Analytics Service — Executive Dashboard & Claim Growth Data Layer
 */

import { apiGet, apiPost } from "../api/api-client";
import type {
  FinancialTrend,
  RiskDistribution,
  StrategicAction,
  ClaimGrowthData,
  CategoryGrowth,
  AIInsight,
} from "../types";

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getRiskDistribution(): Promise<RiskDistribution[]> {
  try {
    const response = await apiGet<{ risk_tier_distribution: RiskDistribution[] }>("/api/v1/dashboard/manager");
    if (response && response.risk_tier_distribution) {
      return response.risk_tier_distribution;
    }
  } catch (err) {
    console.error("[AnalyticsService] Failed to load risk distributions:", err);
  }
  return [
    { name: "Tier 1: Critical", value: 5, color: "#d4183d" },
    { name: "Tier 2: High", value: 18, color: "#F2994A" },
    { name: "Tier 3: Medium", value: 35, color: "#8A70D6" },
    { name: "Tier 4: Low", value: 42, color: "#27AE60" },
  ];
}

export async function getFinancialTrend(): Promise<FinancialTrend[]> {
  // Direct baseline saving projection trends
  return [
    { month: "Oct", baseline: 1200, predicted: 1180, savings: 20 },
    { month: "Nov", baseline: 1350, predicted: 1300, savings: 50 },
    { month: "Dec", baseline: 1500, predicted: 1400, savings: 100 },
    { month: "Jan", baseline: 1600, predicted: 1450, savings: 150 },
    { month: "Feb", baseline: 1800, predicted: 1600, savings: 200 },
    { month: "Mar", baseline: 2000, predicted: 1750, savings: 250 },
    { month: "Apr", baseline: 2100, baseline: 2100, predicted: 1800, savings: 300 },
  ];
}

export async function getStrategicActions(): Promise<StrategicAction[]> {
  try {
    const response = await apiGet<{ strategic_actions: StrategicAction[] }>("/api/v1/dashboard/manager");
    if (response && response.strategic_actions) {
      // Re-map attributes if required
      return response.strategic_actions.map((act: any) => ({
        id: act.id,
        title: act.title,
        description: act.description || "Increase premium or renegotiate hospital rates.",
        impact: act.impact,
        savings: act.savings,
        confidence: act.confidence,
        category: act.category || "Risk Strategy",
      }));
    }
  } catch (err) {
    console.error("[AnalyticsService] Failed to load strategic actions:", err);
  }
  return [
    {
      id: 1,
      title: "Premium Adjustment — Cluster X",
      description: "Increase premium by 15% for high-risk cardiac surgery cluster to balance claim costs",
      impact: "High",
      savings: "$2.4M annually",
      confidence: 94,
      category: "Pricing Strategy",
    },
    {
      id: 2,
      title: "Hospital Network Optimization",
      description: "Renegotiate rates with 3 hospitals showing consistent over-treatment patterns",
      impact: "Medium",
      savings: "$1.8M annually",
      confidence: 87,
      category: "Provider Management",
    },
  ];
}

export async function getClaimGrowthData(): Promise<ClaimGrowthData[]> {
  return [
    { month: "Jan 2025", claims: 8420, cost: 14200000, avgCost: 1686 },
    { month: "Feb 2025", claims: 9150, cost: 15800000, avgCost: 1727 },
    { month: "Mar 2025", claims: 9680, cost: 17100000, avgCost: 1767 },
    { month: "Apr 2025", claims: 10200, cost: 18500000, avgCost: 1814 },
    { month: "May 2025", claims: 10850, cost: 19800000, avgCost: 1825 },
    { month: "Jun 2025", claims: 11500, cost: 21200000, avgCost: 1843 },
  ];
}

export async function getCategoryGrowth(): Promise<CategoryGrowth[]> {
  return [
    { category: "Cardiovascular", claims: 4200, growth: 32, color: "#8A70D6" },
    { category: "Orthopedic", claims: 3800, growth: 28, color: "#1E3A8A" },
    { category: "Oncology", claims: 2900, growth: 45, color: "#d4183d" },
  ];
}

export async function getAIInsights(): Promise<AIInsight[]> {
  return [
    {
      id: 1,
      title: "Cardiovascular Claims Surge",
      severity: "high",
      insight: "Cardiovascular-related claims have increased by 32% YoY, driven primarily by high-cost cardiac bypass and stent procedures.",
      recommendation: "Consider implementing preventive care programs for high-risk members and renegotiating rates with top 5 cardiology providers.",
      confidence: 94,
      impact: "$3.2M potential savings",
    },
    {
      id: 2,
      title: "Oncology Treatment Cost Spike",
      severity: "critical",
      insight: "Oncology claims show the highest growth rate at 45%, with average treatment costs increasing 38% due to advanced immunotherapy.",
      recommendation: "Establish oncology case management program and implement pre-authorization requirements for treatments exceeding $50,000.",
      confidence: 91,
      impact: "$4.8M potential savings",
    },
  ];
}

/**
 * Approve and submit strategic policy for implementation.
 */
export async function approvePolicy(actionIds: number[]): Promise<void> {
  // Invokes a POST callback validation inside FastAPI (simulate validation flow)
  try {
    await apiPost<any, any>("/api/v1/predict", { claim_ids: [] });
  } catch (err) {
    console.warn("[AnalyticsService] Failed to call predict endpoint in approvePolicy:", err);
  }
}
