/**
 * Analytics Service — Executive Dashboard & Claim Growth Data Layer
 *
 * Next.js migration:
 * - Move to Server Component data fetching (async page.tsx)
 * - Or Server Actions for interactive filtering
 * - Connect to Supabase analytics views or Flask reporting endpoints
 */

import { simulateLatency } from "../api/client";
import type {
  FinancialTrend,
  RiskDistribution,
  StrategicAction,
  ClaimGrowthData,
  CategoryGrowth,
  AIInsight,
} from "../types";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_RISK_DISTRIBUTION: RiskDistribution[] = [
  { name: "Tier 1: Critical", value: 5, color: "#d4183d" },
  { name: "Tier 2: High", value: 18, color: "#F2994A" },
  { name: "Tier 3: Medium", value: 35, color: "#8A70D6" },
  { name: "Tier 4: Low", value: 42, color: "#27AE60" },
];

const MOCK_FINANCIAL_TREND: FinancialTrend[] = [
  { month: "Oct", baseline: 1200, predicted: 1180, savings: 20 },
  { month: "Nov", baseline: 1350, predicted: 1300, savings: 50 },
  { month: "Dec", baseline: 1500, predicted: 1400, savings: 100 },
  { month: "Jan", baseline: 1600, predicted: 1450, savings: 150 },
  { month: "Feb", baseline: 1800, predicted: 1600, savings: 200 },
  { month: "Mar", baseline: 2000, predicted: 1750, savings: 250 },
  { month: "Apr", baseline: 2100, predicted: 1800, savings: 300 },
];

const MOCK_STRATEGIC_ACTIONS: StrategicAction[] = [
  {
    id: 1,
    title: "Premium Adjustment — Cluster X",
    description:
      "Increase premium by 15% for high-risk cardiac surgery cluster to balance claim costs",
    impact: "High",
    savings: "$2.4M annually",
    confidence: 94,
    category: "Pricing Strategy",
  },
  {
    id: 2,
    title: "Hospital Network Optimization",
    description:
      "Renegotiate rates with 3 hospitals showing consistent over-treatment patterns",
    impact: "Medium",
    savings: "$1.8M annually",
    confidence: 87,
    category: "Provider Management",
  },
  {
    id: 3,
    title: "Pre-authorization Enhancement",
    description:
      "Implement stricter pre-auth for procedures exceeding $5,000 threshold",
    impact: "High",
    savings: "$3.1M annually",
    confidence: 91,
    category: "Risk Mitigation",
  },
  {
    id: 4,
    title: "Fraud Investigation Priority",
    description:
      "Initiate investigation on 4 high-anomaly claims flagged by AI system",
    impact: "Critical",
    savings: "$450K immediate",
    confidence: 98,
    category: "Fraud Prevention",
  },
];

const MOCK_CLAIM_GROWTH: ClaimGrowthData[] = [
  { month: "Jan 2025", claims: 8420, cost: 14200000, avgCost: 1686 },
  { month: "Feb 2025", claims: 9150, cost: 15800000, avgCost: 1727 },
  { month: "Mar 2025", claims: 9680, cost: 17100000, avgCost: 1767 },
  { month: "Apr 2025", claims: 10200, cost: 18500000, avgCost: 1814 },
  { month: "May 2025", claims: 10850, cost: 19800000, avgCost: 1825 },
  { month: "Jun 2025", claims: 11500, cost: 21200000, avgCost: 1843 },
  { month: "Jul 2025", claims: 12100, cost: 22800000, avgCost: 1884 },
  { month: "Aug 2025", claims: 12650, cost: 24100000, avgCost: 1905 },
  { month: "Sep 2025", claims: 13200, cost: 25600000, avgCost: 1939 },
  { month: "Oct 2025", claims: 13800, cost: 27200000, avgCost: 1971 },
  { month: "Nov 2025", claims: 14500, cost: 29100000, avgCost: 2007 },
  { month: "Dec 2025", claims: 15200, cost: 31400000, avgCost: 2066 },
  { month: "Jan 2026", claims: 16100, cost: 33800000, avgCost: 2099 },
  { month: "Feb 2026", claims: 17000, cost: 36500000, avgCost: 2147 },
  { month: "Mar 2026", claims: 17850, cost: 39200000, avgCost: 2196 },
  { month: "Apr 2026", claims: 18700, cost: 42100000, avgCost: 2251 },
];

const MOCK_CATEGORY_GROWTH: CategoryGrowth[] = [
  { category: "Cardiovascular", claims: 4200, growth: 32, color: "#8A70D6" },
  { category: "Orthopedic", claims: 3800, growth: 28, color: "#1E3A8A" },
  { category: "Oncology", claims: 2900, growth: 45, color: "#d4183d" },
  { category: "General Surgery", claims: 2600, growth: 18, color: "#F2994A" },
  { category: "Maternity", claims: 2100, growth: 12, color: "#27AE60" },
  { category: "Others", claims: 3100, growth: 22, color: "#94A3B8" },
];

const MOCK_AI_INSIGHTS: AIInsight[] = [
  {
    id: 1,
    title: "Cardiovascular Claims Surge",
    severity: "high",
    insight:
      "Cardiovascular-related claims have increased by 32% YoY, driven primarily by high-cost cardiac bypass and stent procedures. This correlates with aging policyholder demographics (avg age: 58.2 years) and lifestyle-related risk factors.",
    recommendation:
      "Consider implementing preventive care programs for high-risk members and renegotiating rates with top 5 cardiology providers.",
    confidence: 94,
    impact: "$3.2M potential savings",
  },
  {
    id: 2,
    title: "Oncology Treatment Cost Spike",
    severity: "critical",
    insight:
      "Oncology claims show the highest growth rate at 45%, with average treatment costs increasing 38% due to advanced immunotherapy and targeted therapy adoption. Three hospitals account for 67% of high-cost oncology claims.",
    recommendation:
      "Establish oncology case management program and implement pre-authorization requirements for treatments exceeding $50,000.",
    confidence: 91,
    impact: "$4.8M potential savings",
  },
  {
    id: 3,
    title: "Seasonal Pattern Detected",
    severity: "medium",
    insight:
      "Claims volume shows consistent 15-18% spike during Q4 (Oct–Dec) annually, likely driven by year-end benefit maximization behavior. This pattern has strengthened over the past 3 years.",
    recommendation:
      "Implement proactive member communication in Q3 regarding benefit utilization and consider quarterly benefit caps for non-emergency procedures.",
    confidence: 88,
    impact: "$1.9M potential savings",
  },
  {
    id: 4,
    title: "Cost Per Claim Inflation",
    severity: "high",
    insight:
      "Average cost per claim has increased 33.5% over 16 months (from $1,686 to $2,251), outpacing general medical inflation by 2.8×. Hospital tier upgrades and diagnostic complexity are primary drivers.",
    recommendation:
      "Review hospital network tier assignments and negotiate volume-based discounts with high-utilization facilities.",
    confidence: 96,
    impact: "$2.6M potential savings",
  },
];

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getRiskDistribution(): Promise<RiskDistribution[]> {
  await simulateLatency(300);
  return MOCK_RISK_DISTRIBUTION;
}

export async function getFinancialTrend(): Promise<FinancialTrend[]> {
  await simulateLatency(350);
  return MOCK_FINANCIAL_TREND;
}

export async function getStrategicActions(): Promise<StrategicAction[]> {
  await simulateLatency(400);
  return MOCK_STRATEGIC_ACTIONS;
}

export async function getClaimGrowthData(): Promise<ClaimGrowthData[]> {
  await simulateLatency(300);
  return MOCK_CLAIM_GROWTH;
}

export async function getCategoryGrowth(): Promise<CategoryGrowth[]> {
  await simulateLatency(250);
  return MOCK_CATEGORY_GROWTH;
}

export async function getAIInsights(): Promise<AIInsight[]> {
  await simulateLatency(500);
  return MOCK_AI_INSIGHTS;
}

/**
 * Approve and submit strategic policy for implementation.
 * Next.js: Server Action → update Supabase + notify downstream systems
 */
export async function approvePolicy(actionIds: number[]): Promise<void> {
  await simulateLatency(1200);
  console.info("[AnalyticsService] Policy approved for actions:", actionIds);
}
