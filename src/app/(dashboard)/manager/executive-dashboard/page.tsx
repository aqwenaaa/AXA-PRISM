"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Shield, Target, ArrowUpRight, CheckCircle2, AlertTriangle, TrendingDown, Check, X, Edit3, Lightbulb, Coins, CoinsIcon, HandCoinsIcon } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { getRiskDistribution, getFinancialTrend, getRecommendationsList, performRecommendationAction, approvePolicy } from "@/lib/services/analytics.service";
import { apiGet } from "@/lib/api/api-client";
import type { RiskDistribution, FinancialTrend } from "@/lib/types";

export default function ExecutiveDashboardPage() {
  const [riskTierData, setRiskTierData] = useState<RiskDistribution[]>([]);
  const [financialTrendData, setFinancialTrendData] = useState<FinancialTrend[]>([]);
  const [strategicActions, setStrategicActions] = useState<any[]>([]);
  
  // Dashboard KPIs
  const [kpiMetrics, setKpiMetrics] = useState({
    claimsIncreasePct: 25.5,
    predictedSavings: 7700000,
    highRiskClaimsPct: 23,
    modelConfidence: 96.8
  });

  const [isLoading, setIsLoading] = useState(true);

  // States for inline recommendation modification
  const [editingRecId, setEditingRecId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    reasoning: "",
    priority: "MEDIUM",
    notes: ""
  });

  // State for strategic recommendation action confirmation modals
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    recId: string;
    action: "approve" | "reject" | "implement";
    title: string;
    notes?: string;
  } | null>(null);

  // Load manager statistics dynamically from FastAPI
  async function loadManagerData() {
    setIsLoading(true);
    try {
      const [distribution, trend, actions, managerData] = await Promise.all([
        getRiskDistribution(),
        getFinancialTrend(),
        getRecommendationsList(),
        apiGet<any>("/api/v1/dashboard/manager")
      ]);

      setRiskTierData(distribution);
      setFinancialTrendData(trend);
      setStrategicActions(actions);
      
      if (managerData) {
        setKpiMetrics({
          claimsIncreasePct: managerData.total_claims_increase_pct || 25.5,
          predictedSavings: managerData.predicted_savings || 7700000,
          highRiskClaimsPct: managerData.high_risk_claims_pct || 23,
          modelConfidence: managerData.model_confidence || 96.8
        });
      }
    } catch (err) {
      console.error("[ManagerDashboard] Failed to load statistics:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
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

  const triggerActionWithConfirmation = (recId: string, action: "approve" | "reject" | "implement", title: string) => {
    setConfirmModal({
      isOpen: true,
      recId,
      action,
      title,
      notes: ""
    });
  };

  const handleAction = async (recId: string, action: "approve" | "reject" | "implement", notes: string = "") => {
    try {
      await performRecommendationAction(recId, action, { notes });
      alert(`Recommendation successfully ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "marked as implemented"}!`);
      await loadManagerData();
    } catch (err) {
      alert(`Failed to ${action} recommendation.`);
    }
  };

  const executeConfirmedAction = async () => {
    if (!confirmModal) return;
    const { recId, action, notes } = confirmModal;
    await handleAction(recId, action, notes);
    setConfirmModal(null);
  };

  const startModify = (rec: any) => {
    setEditingRecId(rec.id);
    setEditForm({
      title: rec.title || "",
      description: rec.description || "",
      reasoning: rec.reasoning || "",
      priority: rec.priority || "MEDIUM",
      notes: rec.implementation_notes || ""
    });
  };

  const submitModify = async (recId: string) => {
    try {
      await performRecommendationAction(recId, "modify", {
        priority: editForm.priority,
        title: editForm.title,
        description: editForm.description,
        reasoning: editForm.reasoning,
        notes: editForm.notes
      });
      alert("Recommendation successfully modified and saved!");
      setEditingRecId(null);
      await loadManagerData();
    } catch (err) {
      alert("Failed to save modifications.");
    }
  };

  const formatCurrency = (val: number) => {
    if (val === undefined || val === null) return "$0";
    if (val > 10000) {
      return `Rp ${val.toLocaleString()}`;
    }
    return `$${val.toLocaleString()}`;
  };

  // Helper styles for priority and status badges
  const getPriorityStyle = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "CRITICAL": return "bg-red-600 text-white";
      case "HIGH": return "bg-destructive text-white";
      case "MEDIUM": return "bg-warning text-slate-800";
      case "LOW": return "bg-slate-200 text-slate-700";
      default: return "bg-slate-200 text-slate-700";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "APPROVED": return "bg-success/15 text-success border-success/30";
      case "REJECTED": return "bg-destructive/15 text-destructive border-destructive/30";
      case "MODIFIED": return "bg-primary/15 text-primary border-primary/30";
      case "IMPLEMENTED": return "bg-indigo-600/15 text-indigo-700 border-indigo-600/30";
      case "PENDING":
      default: return "bg-warning/15 text-warning border-warning/30";
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
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                  <CoinsIcon className="w-6 h-6 text-white" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Claims Increase</p>
              <p className="text-3xl font-bold text-foreground mb-1">+{kpiMetrics.claimsIncreasePct}%</p>
              <p className="text-xs text-destructive font-medium">vs. last quarter</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-xl">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center shadow-lg">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <TrendingDown className="w-5 h-5 text-success" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Predicted Savings</p>
              <p className="text-3xl font-bold text-foreground mb-1">{formatCurrency(kpiMetrics.predictedSavings)}</p>
              <p className="text-xs text-success font-medium">with AI optimization</p>
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
              <p className="text-xs text-warning font-medium">require action</p>
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
              <p className="text-xs text-success font-medium">validated accuracy</p>
            </Card>
          </div>

          {/* Risk Percentile Summary & Financial Impact */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Risk Tier Distribution */}
            <Card className="p-6 bg-white rounded-xl border border-border animate-fade-in">
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

          {/* Strategic Action Recommendations */}
          <Card className="p-6 bg-white rounded-xl border border-border mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Strategic Action Recommendations
                </h3>
                <p className="text-sm text-muted-foreground">AI-generated initiatives for risk mitigation and pricing adjustments</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {strategicActions.length} Initiatives
              </Badge>
            </div>

            <div className="grid gap-6">
              {strategicActions.map((action) => (
                <div key={action.id} className="p-6 rounded-xl border-2 border-border hover:border-primary/50 bg-gradient-to-r from-white to-secondary/10 transition-all flex flex-col justify-between shadow-sm">
                  {editingRecId === action.id ? (
                    /* EDITING / MODIFY INLINE FORM */
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Recommendation Title</label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full p-2 border border-border rounded-lg text-sm bg-white"
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">Priority Level</label>
                          <select
                            value={editForm.priority}
                            onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                            className="w-full p-2 border border-border rounded-lg text-sm bg-white"
                          >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="CRITICAL">CRITICAL</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">Implementation Notes</label>
                          <input
                            type="text"
                            value={editForm.notes}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            placeholder="Add notes for the implementation team..."
                            className="w-full p-2 border border-border rounded-lg text-sm bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Description</label>
                        <Textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full p-2 border border-border rounded-lg text-sm bg-white min-h-16"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Clinical Reasoning & Justification</label>
                        <Textarea
                          value={editForm.reasoning}
                          onChange={(e) => setEditForm({ ...editForm, reasoning: e.target.value })}
                          className="w-full p-2 border border-border rounded-lg text-sm bg-white min-h-20"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <Button
                          onClick={() => submitModify(action.id)}
                          className="bg-primary hover:bg-primary/95 text-white h-9 px-4 rounded-lg text-xs"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          Save Modifications
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingRecId(null)}
                          className="h-9 px-4 rounded-lg text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* STANDARD VIEW CARD */
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-lg text-foreground">{action.title}</h4>
                          <Badge className="bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                            EDAS Rank #{action.edas_rank || "N/A"}
                          </Badge>
                          <Badge className={`text-xs font-semibold ${getPriorityStyle(action.priority)}`}>
                            {action.priority} Priority
                          </Badge>
                          <Badge variant="outline" className={`text-xs font-bold border-2 ${getStatusStyle(action.status)}`}>
                            {action.status}
                          </Badge>
                        </div>
                        
                        {/* Manager Actions Panel */}
                        {action.status === "PENDING" && (
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => triggerActionWithConfirmation(action.id, "approve", action.title)}
                              size="sm"
                              className="bg-success hover:bg-success/90 text-white h-8 rounded-lg"
                              title="Approve"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => triggerActionWithConfirmation(action.id, "reject", action.title)}
                              size="sm"
                              variant="outline"
                              className="border-destructive hover:bg-destructive/5 text-destructive h-8 rounded-lg"
                              title="Reject"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              onClick={() => startModify(action)}
                              size="sm"
                              variant="outline"
                              className="border-primary hover:bg-primary/5 text-primary h-8 rounded-lg"
                              title="Modify"
                            >
                              <Edit3 className="w-4 h-4 mr-1" />
                              Modify
                            </Button>
                          </div>
                        )}
                        {(action.status === "APPROVED" || action.status === "MODIFIED") && (
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => triggerActionWithConfirmation(action.id, "implement", action.title)}
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 rounded-lg flex items-center"
                              title="Mark as Implemented"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Mark as Implemented
                            </Button>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                      
                      {/* 2. Reasoning Box */}
                      {action.reasoning && (
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-4 flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-0.5">Clinical Reasoning & Evidence</div>
                            <p className="text-xs text-slate-600 leading-relaxed">{action.reasoning}</p>
                          </div>
                        </div>
                      )}

                      {/* Evidence Indicators (EDAS / Savings / Confidence) */}
                      <div className="flex flex-wrap items-center justify-between border-t border-border pt-4 mt-2 gap-4">
                        <div className="flex flex-wrap items-center gap-6">
                          <div className="flex items-center gap-2">
                            <HandCoinsIcon className="w-4 h-4 text-success" />
                            <span className="text-xs text-muted-foreground">Est. Savings:</span>
                            <span className="text-sm font-bold text-success">{formatCurrency(action.estimated_savings || action.savings)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="text-xs text-muted-foreground">Confidence:</span>
                            <span className="text-sm font-semibold">{action.confidence || 90}%</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-indigo-600" />
                            <span className="text-xs text-muted-foreground">Category:</span>
                            <Badge variant="outline" className="text-xs font-bold bg-slate-50">{action.category || "Risk Strategy"}</Badge>
                          </div>
                        </div>

                        {action.implementation_notes && (
                          <div className="text-xs text-slate-500 font-medium italic">
                            Notes: {action.implementation_notes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white px-8 h-14 rounded-xl shadow-xl shadow-primary/30 transition-all text-base font-semibold whitespace-nowrap"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Approve & Implement Policy
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  confirmModal.action === "approve" ? "bg-emerald-100 text-emerald-600" :
                  confirmModal.action === "reject" ? "bg-rose-100 text-rose-600" :
                  "bg-indigo-100 text-indigo-600"
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Confirm Status Transition</h3>
                  <p className="text-xs text-slate-500">Review recommendations update before applying changes.</p>
                </div>
              </div>
              
              <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-xs text-muted-foreground mb-1">Initiative</div>
                <div className="text-sm font-semibold text-slate-800">{confirmModal.title}</div>
                <div className="text-xs font-semibold mt-2 text-indigo-600 uppercase tracking-wide">
                  New Status: {confirmModal.action === "approve" ? "APPROVED" : confirmModal.action === "reject" ? "REJECTED" : "IMPLEMENTED"}
                </div>
              </div>

              {(confirmModal.action === "approve" || confirmModal.action === "reject") && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Justification Notes (Optional)</label>
                  <Textarea
                    value={confirmModal.notes}
                    onChange={(e) => setConfirmModal({ ...confirmModal, notes: e.target.value })}
                    placeholder="Provide notes or reasons for this action..."
                    className="min-h-16 text-sm bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setConfirmModal(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={executeConfirmedAction}
                  className={`rounded-xl text-white ${
                    confirmModal.action === "approve" ? "bg-success hover:bg-success/90" :
                    confirmModal.action === "reject" ? "bg-destructive hover:bg-destructive/90" :
                    "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  Confirm Action
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
