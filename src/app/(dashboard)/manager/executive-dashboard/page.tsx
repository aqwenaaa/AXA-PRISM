"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Shield, Target, ArrowUpRight, CheckCircle2, AlertTriangle, TrendingDown } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { getRiskDistribution, getFinancialTrend, getStrategicActions, approvePolicy } from "@/lib/services/analytics.service";
import { apiGet } from "@/lib/api/api-client";
import type { RiskDistribution, FinancialTrend, StrategicAction } from "@/lib/types";

export default function ExecutiveDashboardPage() {
  const [riskTierData, setRiskTierData] = useState<RiskDistribution[]>([]);
  const [financialTrendData, setFinancialTrendData] = useState<FinancialTrend[]>([]);
  const [strategicActions, setStrategicActions] = useState<StrategicAction[]>([]);
  
  // Dashboard KPIs
  const [kpiMetrics, setKpiMetrics] = useState({
    claimsIncreasePct: 25.5,
    predictedSavings: 7700000,
    highRiskClaimsPct: 23,
    modelConfidence: 96.8
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load manager statistics dynamically from FastAPI
  useEffect(() => {
    async function loadManagerData() {
      setIsLoading(true);
      try {
        const [distribution, trend, actions, managerData] = await Promise.all([
          getRiskDistribution(),
          getFinancialTrend(),
          getStrategicActions(),
          apiGet<any>("/api/v1/dashboard/manager")
        ]);

        setRiskTierData(distribution);
        setFinancialTrendData(trend);
        setStrategicActions(actions);
        
        if (managerData) {
          setKpiMetrics({
            claimsIncreasePct: managerData.total_claims_increase_pct,
            predictedSavings: managerData.predicted_savings,
            highRiskClaimsPct: managerData.high_risk_claims_pct,
            modelConfidence: managerData.model_confidence
          });
        }
      } catch (err) {
        console.error("[ManagerDashboard] Failed to load statistics:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadManagerData();
  }, []);

  const handleApprovePolicy = async () => {
    const actionIds = strategicActions.map(a => a.id);
    try {
      await approvePolicy(actionIds);
      alert("Policy implementation approved!\n\nThe following actions have been initiated in FastAPI & Supabase:\n• Premium adjustments\n• Provider negotiations\n• Enhanced pre-authorizations");
    } catch (err) {
      alert("Failed to approve strategic policy.");
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Executive Command</h1>
            <p className="text-muted-foreground">Strategic insights and policy implementation</p>
          </div>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20">
          Role: Strategic Manager
        </Badge>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center bg-white border border-border rounded-xl">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading strategic analytics from FastAPI...</p>
        </Card>
      ) : (
        <>
          {/* Top KPIs */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Claims Increase</p>
              <p className="text-3xl font-bold text-foreground mb-1">+{kpiMetrics.claimsIncreasePct}%</p>
              <p className="text-xs text-destructive">vs. last quarter</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-xl">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center shadow-lg">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <TrendingDown className="w-5 h-5 text-success" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Predicted Savings</p>
              <p className="text-3xl font-bold text-foreground mb-1">${(kpiMetrics.predictedSavings / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-success">with AI optimization</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-warning flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">High-Risk Claims</p>
              <p className="text-3xl font-bold text-foreground mb-1">{kpiMetrics.highRiskClaimsPct}%</p>
              <p className="text-xs text-warning">require action</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Model Confidence</p>
              <p className="text-3xl font-bold text-foreground mb-1">{kpiMetrics.modelConfidence}%</p>
              <p className="text-xs text-success">validated accuracy</p>
            </Card>
          </div>

          {/* Risk Percentile Summary & Financial Impact */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Risk Tier Distribution */}
            <Card className="p-6 bg-white rounded-xl border border-border">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Risk Percentile Summary</h3>
                <p className="text-sm text-muted-foreground">Claim distribution across risk tiers</p>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={riskTierData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskTierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || "#8884d8"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Financial Impact */}
            <Card className="p-6 bg-white rounded-xl border border-border">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Financial Impact Projection</h3>
                <p className="text-sm text-muted-foreground">Cost optimization with AI recommendations</p>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={financialTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4183d" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#d4183d" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#27AE60" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#27AE60" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Area type="monotone" dataKey="baseline" stroke="#d4183d" fill="url(#colorBaseline)" name="Baseline Cost" />
                  <Area type="monotone" dataKey="predicted" stroke="#27AE60" fill="url(#colorPredicted)" name="With AI Optimization" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Strategic Action Cards */}
          <Card className="p-6 bg-white rounded-xl border border-border mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Strategic Action Recommendations
                </h3>
                <p className="text-sm text-muted-foreground">AI-generated initiatives for risk mitigation</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {strategicActions.length} Recommendations
              </Badge>
            </div>

            <div className="grid gap-4">
              {strategicActions.map((action) => (
                <div key={action.id} className="p-5 rounded-xl border-2 border-border hover:border-primary/50 bg-gradient-to-r from-white to-secondary/20 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-base">{action.title}</h4>
                        <Badge className="text-xs bg-warning text-white">
                          {action.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-success" />
                          <span className="text-sm font-medium text-success">{action.savings}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{action.confidence}% Confidence</span>
                        </div>
                        <Badge variant="outline" className="text-xs">{action.category}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Policy Approval Section */}
          <Card className="p-8 bg-gradient-to-br from-primary/5 via-purple-50 to-indigo-50 rounded-xl border-2 border-primary/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-xl">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Ready for Policy Implementation</h3>
                  <p className="text-sm text-muted-foreground max-w-2xl">
                    All strategic recommendations have been validated and are ready for official approval. 
                    This will trigger automated workflows across pricing, provider management, and fraud prevention systems.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleApprovePolicy}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white px-8 h-14 rounded-xl shadow-xl shadow-primary/30 transition-all text-base whitespace-nowrap"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Approve & Implement Policy
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
