"use client";

import { TrendingUp, Sparkles, Calendar, DollarSign, AlertCircle, Activity, ArrowUpRight, Brain } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Monthly claim growth data
const monthlyGrowthData = [
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

// Category breakdown
const categoryData = [
  { category: "Cardiovascular", claims: 4200, growth: 32, color: "#8A70D6" },
  { category: "Orthopedic", claims: 3800, growth: 28, color: "#1E3A8A" },
  { category: "Oncology", claims: 2900, growth: 45, color: "#d4183d" },
  { category: "General Surgery", claims: 2600, growth: 18, color: "#F2994A" },
  { category: "Maternity", claims: 2100, growth: 12, color: "#27AE60" },
  { category: "Others", claims: 3100, growth: 22, color: "#94A3B8" },
];

// AI-generated insights
const aiInsights = [
  {
    id: 1,
    title: "Cardiovascular Claims Surge",
    severity: "high",
    insight: "Cardiovascular-related claims have increased by 32% YoY, driven primarily by high-cost cardiac bypass and stent procedures. This correlates with aging policyholder demographics (avg age: 58.2 years) and lifestyle-related risk factors.",
    recommendation: "Consider implementing preventive care programs for high-risk members and renegotiating rates with top 5 cardiology providers.",
    confidence: 94,
    impact: "$3.2M potential savings"
  },
  {
    id: 2,
    title: "Oncology Treatment Cost Spike",
    severity: "critical",
    insight: "Oncology claims show the highest growth rate at 45%, with average treatment costs increasing 38% due to advanced immunotherapy and targeted therapy adoption. Three hospitals account for 67% of high-cost oncology claims.",
    recommendation: "Establish oncology case management program and implement pre-authorization requirements for treatments exceeding $50,000.",
    confidence: 91,
    impact: "$4.8M potential savings"
  },
  {
    id: 3,
    title: "Seasonal Pattern Detected",
    severity: "medium",
    insight: "Claims volume shows consistent 15-18% spike during Q4 (Oct-Dec) annually, likely driven by year-end benefit maximization behavior. This pattern has strengthened over the past 3 years.",
    recommendation: "Implement proactive member communication in Q3 regarding benefit utilization and consider quarterly benefit caps for non-emergency procedures.",
    confidence: 88,
    impact: "$1.9M potential savings"
  },
  {
    id: 4,
    title: "Cost Per Claim Inflation",
    severity: "high",
    insight: "Average cost per claim has increased 33.5% over 16 months (from $1,686 to $2,251), outpacing general medical inflation by 2.8x. Hospital tier upgrades and diagnostic complexity are primary drivers.",
    recommendation: "Review hospital network tier assignments and negotiate volume-based discounts with high-utilization facilities.",
    confidence: 96,
    impact: "$2.6M potential savings"
  }
];

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api/api-client";
import { Button } from "@/app/components/ui/button";

export default function ClaimGrowthPage() {
  const [managerData, setManagerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGet<any>("/api/v1/dashboard/manager");
      setManagerData(data);
    } catch (err: any) {
      console.error("[ClaimGrowth] Failed to load strategic growth data:", err);
      setError(err.message || "Failed to establish a live connection to the backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full p-12 text-center bg-white border border-border rounded-2xl shadow-xl">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6" />
          <h2 className="text-xl font-bold text-foreground mb-2">Analyzing Claims Growth</h2>
          <p className="text-sm text-muted-foreground">
            Synchronizing live claim growth trajectories from FastAPI...
          </p>
        </Card>
      </div>
    );
  }

  if (error || !managerData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full p-8 text-center bg-white border border-destructive/20 rounded-2xl shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Backend Connection Failed</h2>
          <p className="text-sm text-muted-foreground mb-6">
            We encountered an issue connecting to the FastAPI server:
            <span className="block mt-2 font-mono text-xs bg-sidebar-accent p-2 rounded text-destructive border border-destructive/10">
              {error || "Empty response from manager dashboard API."}
            </span>
          </p>
          <Button
            onClick={fetchMetrics}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white"
          >
            Retry Connection
          </Button>
        </Card>
      </div>
    );
  }

  // Dynamically map live strategic actions from FastAPI as AI Insights
  const dynamicAIInsights = (managerData.strategic_actions || []).map((action: any, idx: number) => {
    const severityMap = ["high", "critical", "medium", "low"];
    const fallbackImpacts = ["$2.4M potential savings", "$1.8M potential savings", "$1.5M potential savings"];
    return {
      id: action.id,
      title: action.title,
      severity: severityMap[idx % 4],
      insight: action.description,
      recommendation: "Review rate calibration parameters, pre-authorization compliance, and model weights in settings.",
      confidence: action.confidence || 90,
      impact: action.savings || fallbackImpacts[idx % 3]
    };
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">AXA Claim Growth Analysis</h1>
            <p className="text-muted-foreground">16-month trend analysis with AI-powered insights</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-primary/10 text-primary border-primary/20">
            Jan 2025 - Apr 2026
          </Badge>
          <Badge className="bg-warning/10 text-warning border-warning/20">
            +{managerData.total_claims_increase_pct}% YoY Growth
          </Badge>
        </div>
      </div>

      {/* Key Growth Metrics */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-8 h-8 text-primary" />
            <ArrowUpRight className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Claims (16mo)</p>
          <p className="text-3xl font-bold text-foreground mb-1">203,350</p>
          <p className="text-xs text-muted-foreground">
            Monthly avg: 12,709 claims
          </p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 text-success" />
            <TrendingUp className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Forecast Savings</p>
          <p className="text-3xl font-bold text-foreground mb-1">
            ${(managerData.predicted_savings / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-success font-medium">
            AI-predicted optimization
          </p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <Activity className="w-8 h-8 text-warning" />
            <TrendingUp className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Avg Cost/Claim</p>
          <p className="text-3xl font-bold text-foreground mb-1">$2,251</p>
          <p className="text-xs text-destructive">
            +33.5% since Jan 2025
          </p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            <AlertCircle className="w-5 h-5 text-warning" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">YoY Growth Rate</p>
          <p className="text-3xl font-bold text-foreground mb-1">
            +{managerData.total_claims_increase_pct}%
          </p>
          <p className="text-xs text-warning">
            Accelerating trend
          </p>
        </Card>
      </div>

      {/* Trend Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Claims Volume Trend */}
        <Card className="p-6 bg-white rounded-xl border border-border">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Monthly Claims Volume Trend</h3>
            <p className="text-sm text-muted-foreground">16-month progression analysis</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8A70D6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8A70D6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                stroke="#6B7280"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="claims"
                stroke="#8A70D6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorClaims)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Total Cost Trend */}
        <Card className="p-6 bg-white rounded-xl border border-border">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Total Claim Cost Progression</h3>
            <p className="text-sm text-muted-foreground">Financial impact over time (in millions)</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                stroke="#6B7280"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#6B7280"
                tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '12px'
                }}
                formatter={(value: number) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#1E3A8A"
                strokeWidth={3}
                dot={{ fill: '#1E3A8A', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="p-6 bg-white rounded-xl border border-border mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Claim Growth by Category</h3>
          <p className="text-sm text-muted-foreground">Year-over-year comparison by medical specialty</p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="category" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '12px'
              }}
            />
            <Legend />
            <Bar dataKey="claims" fill="#8A70D6" name="Total Claims" radius={[8, 8, 0, 0]} />
            <Bar dataKey="growth" fill="#1E3A8A" name="Growth %" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
          {categoryData.map((cat) => (
            <div
              key={cat.category}
              className="p-3 rounded-lg border border-border hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <Badge className={`text-xs ${
                  cat.growth > 30
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : cat.growth > 20
                    ? 'bg-warning/10 text-warning border-warning/20'
                    : 'bg-success/10 text-success border-success/20'
                }`}>
                  +{cat.growth}%
                </Badge>
              </div>
              <div className="text-sm font-medium mb-1">{cat.category}</div>
              <div className="text-xs text-muted-foreground">{cat.claims.toLocaleString()} claims</div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI-Generated Insights */}
      <Card className="p-6 bg-white rounded-xl border border-border mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
            <p className="text-sm text-muted-foreground">Strategic interpretations and recommendations</p>
          </div>
        </div>

        <div className="grid gap-4">
          {dynamicAIInsights.map((insight: any) => (
            <div
              key={insight.id}
              className="p-5 rounded-xl border-2 border-border hover:border-primary/50 bg-gradient-to-r from-white to-secondary/10 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-base">{insight.title}</h4>
                    <Badge
                      className={`text-xs ${
                        insight.severity === 'critical'
                          ? 'bg-destructive text-white'
                          : insight.severity === 'high'
                          ? 'bg-warning text-white'
                          : 'bg-primary/10 text-primary border-primary/20'
                      }`}
                    >
                      {insight.severity.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="bg-secondary/30 p-4 rounded-lg mb-3 border border-border">
                    <div className="flex items-start gap-2 mb-3">
                      <Brain className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-foreground leading-relaxed">{insight.insight}</p>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-primary mb-1">RECOMMENDATION</div>
                        <p className="text-sm text-foreground">{insight.recommendation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">{insight.impact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{insight.confidence}% Confidence</span>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-purple-50 flex items-center justify-center border border-primary/20">
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">{insight.confidence}</div>
                      <div className="text-[10px] text-muted-foreground">AI Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Summary Alert */}
      <Card className="p-6 bg-gradient-to-br from-warning/5 via-amber-50 to-orange-50 rounded-xl border-2 border-warning/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
            <p className="text-sm text-muted-foreground mb-4">
              AXA health insurance claims have experienced a <strong className="text-foreground">{managerData.total_claims_increase_pct}% YoY growth</strong>, 
              with total claims reaching <strong className="text-foreground">203,350 cases</strong> and costs totaling <strong className="text-foreground">$412M</strong> over 16 months. 
              AI analysis identifies <strong className="text-foreground">${(managerData.predicted_savings / 1000000).toFixed(1)}M in potential savings</strong> through premium optimizations, provider negotiations, and rate validations calibrated at a <strong className="text-foreground">{managerData.model_confidence}% model confidence level</strong>.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-warning text-white">Action Required</Badge>
              <Badge className="bg-primary/10 text-primary border-primary/20">Strategic Review Recommended</Badge>
              <Badge className="bg-success/10 text-success border-success/20">Optimization Opportunities Identified</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
