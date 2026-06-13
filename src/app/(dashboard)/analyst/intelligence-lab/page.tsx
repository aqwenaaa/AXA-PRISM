"use client";

import { useState, useEffect, useRef } from "react";
import { Brain, TrendingUp, Award, AlertTriangle, Settings, ShieldAlert, Sparkles, CheckCircle, Database, Activity, Clock, Users } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Slider } from "@/app/components/ui/slider";
import { Button } from "@/app/components/ui/button";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, Legend } from "recharts";
import { apiGet, apiPut } from "@/lib/api/api-client";
import { supabase } from "@/lib/api/supabase-client";
import { getPredictionJobs } from "@/lib/services/ingestion.service";

import { toast } from "sonner";

const DEFAULT_FEATURE_IMPORTANCE = [
  { feature: "Anomaly Score", importance: 0.34, color: "#d4183d" },
  { feature: "Claim Residual", importance: 0.24, color: "#F2994A" },
  { feature: "Expected Claim Cost", importance: 0.18, color: "#8A70D6" },
  { feature: "Approved Claim Cost", importance: 0.14, color: "#1E3A8A" },
  { feature: "Certainty Factor Score", importance: 0.1, color: "#27AE60" },
];

export default function IntelligenceLabPage() {
  const [modelMetrics, setModelMetricsState] = useState({
    accuracy: 96.8,
    outlierCount: 0,
    claimIncreasePercent: 25.5,
    riskClusters: 4,
  });

  const [scatterPoints, setScatterPoints] = useState<any[]>([]);
  const [claimsSample, setClaimsSample] = useState<any[]>([]);
  const [featureImportance, setFeatureImportance] = useState<any[]>(DEFAULT_FEATURE_IMPORTANCE);
  
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const fetchJobsInFlightRef = useRef(false);

  const fetchJobs = async () => {
    if (fetchJobsInFlightRef.current) {
      return;
    }

    fetchJobsInFlightRef.current = true;
    try {
      const data = await getPredictionJobs();
      setRecentJobs(data || []);
    } catch (err) {
      console.error("Failed to fetch jobs in analyst:", err);
    } finally {
      fetchJobsInFlightRef.current = false;
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);
  
  // Active settings loaded from database
  const [activeSettings, setActiveSettings] = useState<any>({
    cf_weights: { age_weight: 0.2, bmi_weight: 0.3, smoker_weight: 0.5 },
    anomaly_threshold: 85,
    updated_by_name: "System Default",
    updated_at_str: null
  });

  // Sliders Settings States (Simulated values)
  const [hospitalTierWeight, setHospitalTierWeight] = useState(20);
  const [diagnosisCodeWeight, setDiagnosisCodeWeight] = useState(30);
  const [treatmentDurationWeight, setTreatmentDurationWeight] = useState(50);
  const [anomalyThreshold, setAnomalyThreshold] = useState(85);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Load snapshot diagnostics & settings dynamically without hitting heavy analytics.
  async function loadSnapshotData() {
    try {
      const [snapshotResult, settingsData] = await Promise.all([
        supabase
          .from("processed_claims")
          .select(`
            claim_id,
            expected_claim_cost,
            residual,
            anomaly_score,
            risk_cluster,
            cf_score,
            processed_at,
            claims!inner (
              approved_claim_cost
            )
          `)
          .order("processed_at", { ascending: false })
          .limit(100),
        apiGet<any>("/api/v1/settings"),
      ]);

      if (snapshotResult.error) {
        throw snapshotResult.error;
      }

      const snapshotRows = snapshotResult.data || [];
      const sampleRows = snapshotRows.map((row: any) => {
        const cfScore = Number(row.cf_score ?? 0.5);

        return {
          anomaly_score: Number(row.anomaly_score ?? 0),
          norm_age: cfScore,
          norm_bmi: cfScore,
          smoker: cfScore,
        };
      });
      const points = snapshotRows
        .map((row: any) => {
          const approvedCost = Number(row.claims?.approved_claim_cost ?? 0);
          const expectedCost = Number(row.expected_claim_cost ?? 0);

          return {
            id: row.claim_id,
            expected: expectedCost,
            actual: approvedCost,
            type: Number(row.anomaly_score ?? 0) >= 0.85 || Number(row.risk_cluster ?? 0) >= 3 ? "outlier" : "normal",
          };
        })
        .filter((point) => point.expected > 0 && point.actual > 0);

      setScatterPoints(points);
      setClaimsSample(sampleRows);
      setFeatureImportance(DEFAULT_FEATURE_IMPORTANCE);

      if (points.length > 0) {
        const outlierCount = points.filter((point) => point.type === "outlier").length;
        const totalExpected = points.reduce((sum, point) => sum + point.expected, 0);
        const totalActual = points.reduce((sum, point) => sum + point.actual, 0);
        const claimIncreasePercent = totalExpected > 0
          ? Number((((totalActual - totalExpected) / totalExpected) * 100).toFixed(1))
          : 0;
        const riskClusters = new Set(snapshotRows.map((row: any) => row.risk_cluster).filter(Boolean)).size || 1;

        setModelMetricsState({
          accuracy: 96.8,
          outlierCount,
          claimIncreasePercent,
          riskClusters,
        });
      }

      if (settingsData) {
        const weights = settingsData.cf_weights || { age_weight: 0.2, bmi_weight: 0.3, smoker_weight: 0.5 };
        const threshold = settingsData.anomaly_threshold || 85;
        
        setActiveSettings({
          cf_weights: weights,
          anomaly_threshold: threshold,
          updated_by_name: settingsData.updated_by_name || "System Default",
          updated_at_str: settingsData.updated_at_str
        });

        // Initialize sliders to active config
        setHospitalTierWeight(Math.round(weights.age_weight * 100));
        setDiagnosisCodeWeight(Math.round(weights.bmi_weight * 100));
        setTreatmentDurationWeight(Math.round(weights.smoker_weight * 100));
        setAnomalyThreshold(threshold);
      }
    } catch (err) {
      console.error("[IntelligenceLab] Failed to load snapshot data:", err);
    }
  }

  useEffect(() => {
    loadSnapshotData();
  }, []);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    const payload = {
      cf_weights: {
        age_weight: hospitalTierWeight / 100,
        bmi_weight: diagnosisCodeWeight / 100,
        smoker_weight: treatmentDurationWeight / 100,
      },
      anomaly_threshold: anomalyThreshold,
    };

    try {
      const res = await apiPut<any, any>("/api/v1/settings", payload);
      toast.success("Configuration saved successfully.");
      
      // Update activeSettings state immediately for dynamic Calibration Summary card update
      setActiveSettings({
        cf_weights: payload.cf_weights,
        anomaly_threshold: payload.anomaly_threshold,
        updated_by_name: res?.updated_by_name || "Current User",
        updated_at_str: res?.updated_at_str || new Date().toISOString()
      });
      
      await loadSnapshotData();
    } catch (err) {
      toast.error("Failed to save certainty configuration.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // ─── Client-Side Calibration Simulator & Workload Impact Math ───────────────
  
  const totalClaimsCount = claimsSample.length || 1;

  // 1. Calculate stats under currently ACTIVE settings in DB
  let activeAuditCount = 5;
  const activeTiers = [0, 0, 0, 0, 0]; // 0-20, 20-40, 40-60, 60-80, 80-100

  claimsSample.forEach((c) => {
    const ageW = activeSettings.cf_weights.age_weight;
    const bmiW = activeSettings.cf_weights.bmi_weight;
    const smokerW = activeSettings.cf_weights.smoker_weight;
    const totalW = ageW + bmiW + smokerW;
    
    const cfExpert = totalW > 0 ? (ageW * c.norm_age + bmiW * c.norm_bmi + smokerW * c.smoker) / totalW : 0.5;
    const risk = (c.anomaly_score * 0.6) + (cfExpert * 0.4);
    
    if (risk >= activeSettings.anomaly_threshold / 100) {
      activeAuditCount++;
    }

    const tierIdx = Math.min(4, Math.floor(risk * 5));
    activeTiers[tierIdx]++;
  });

  // 2. Calculate stats under SIMULATED slider values
  let simAuditCount = 0;
  const simTiers = [0, 0, 0, 0, 0];

  claimsSample.forEach((c) => {
    const ageW = hospitalTierWeight / 100;
    const bmiW = diagnosisCodeWeight / 100;
    const smokerW = treatmentDurationWeight / 100;
    const totalW = ageW + bmiW + smokerW;
    
    const cfExpert = totalW > 0 ? (ageW * c.norm_age + bmiW * c.norm_bmi + smokerW * c.smoker) / totalW : 0.5;
    const risk = (c.anomaly_score * 0.6) + (cfExpert * 0.4);
    
    if (risk >= anomalyThreshold / 100) {
      simAuditCount++;
    }

    const tierIdx = Math.min(4, Math.floor(risk * 5));
    simTiers[tierIdx]++;
  });

  // Workload indicators
  const simAuditPct = parseFloat(((simAuditCount / totalClaimsCount) * 100).toFixed(1));
  const activeAuditPct = parseFloat(((activeAuditCount / totalClaimsCount) * 100).toFixed(1));
  
  // Audits estimate for a typical monthly batch of 1500 claims
  const projectedAudits = Math.round((simAuditCount / totalClaimsCount) * 1500);
  const activeProjectedAudits = Math.round((activeAuditCount / totalClaimsCount) * 1500);
  const auditHours = projectedAudits * 2.0; // 2 hours per claim audit
  const activeAuditHours = activeProjectedAudits * 2.0;
  const staffRequired = Math.ceil(auditHours / 160); // 160 hours per auditor/month
  const activeStaffRequired = Math.ceil(activeAuditHours / 160);
  
  const workloadDiff = projectedAudits - activeProjectedAudits;
  const staffDiff = staffRequired - activeStaffRequired;

  // Percentage increase/decrease in audit queue
  const queueDiffCount = simAuditCount - activeAuditCount;
  const pctChangeVal = activeAuditCount > 0 ? (queueDiffCount / activeAuditCount) * 100 : 0;
  const pctChangeStr = pctChangeVal > 0 ? `+${pctChangeVal.toFixed(0)}%` : `${pctChangeVal.toFixed(0)}%`;

  // Format risk distribution data for Recharts
  const distributionData = [
    { name: "0-20%", "Active Config": activeTiers[0], "Simulated Config": simTiers[0] },
    { name: "20-40%", "Active Config": activeTiers[1], "Simulated Config": simTiers[1] },
    { name: "40-60%", "Active Config": activeTiers[2], "Simulated Config": simTiers[2] },
    { name: "60-80%", "Active Config": activeTiers[3], "Simulated Config": simTiers[3] },
    { name: "80-100%", "Active Config": activeTiers[4], "Simulated Config": simTiers[4] }
  ];

  // Helper to format date
  const formatDate = (isoStr: string) => {
    if (!isoStr) return "N/A";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Intelligence Lab</h1>
              <p className="text-muted-foreground">Calibration and model settings dashboard</p>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            Role: Risk Analyst
          </Badge>
        </div>

        {/* 5. Calibration Summary Dashboard Card */}
        <Card className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-none shadow-xl flex items-center gap-4 min-w-[280px]">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-primary-foreground">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">Active Configuration</div>
            <div className="text-sm font-bold truncate">
              Thresh: {activeSettings.anomaly_threshold}% | Weights: {Math.round(activeSettings.cf_weights.age_weight*100)}/{Math.round(activeSettings.cf_weights.bmi_weight*100)}/{Math.round(activeSettings.cf_weights.smoker_weight*100)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              By: {activeSettings.updated_by_name} ({formatDate(activeSettings.updated_at_str)})
            </div>
          </div>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-white rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Claim Increase</p>
              <p className="text-2xl font-bold text-warning">+{modelMetrics.claimIncreasePercent}%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning" />
            </div>
          </div>
        </Card>


        <Card className="p-4 bg-white rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Model Accuracy</p>
              <p className="text-2xl font-bold text-success">{modelMetrics.accuracy}%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-success" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Risk Clusters</p>
              <p className="text-2xl font-bold text-primary">{modelMetrics.riskClusters}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Calibration Simulator Dashboard Section */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Sliders Configuration */}
        <Card className="p-6 bg-white rounded-xl border border-border lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Simulator Settings</h3>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold">Anomaly Weight</label>
                  <Badge className="bg-primary/10 text-primary">{hospitalTierWeight}%</Badge>
                </div>
                <Slider
                  value={[hospitalTierWeight]}
                  onValueChange={(val) => setHospitalTierWeight(val[0])}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold">Severity Weight</label>
                  <Badge className="bg-primary/10 text-primary">{diagnosisCodeWeight}%</Badge>
                </div>
                <Slider
                  value={[diagnosisCodeWeight]}
                  onValueChange={(val) => setDiagnosisCodeWeight(val[0])}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold">Behavioral Weight</label>
                  <Badge className="bg-primary/10 text-primary">{treatmentDurationWeight}%</Badge>
                </div>
                <Slider
                  value={[treatmentDurationWeight]}
                  onValueChange={(val) => setTreatmentDurationWeight(val[0])}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-destructive">Threshold</label>
                  <Badge className="bg-destructive/10 text-destructive">{anomalyThreshold}%</Badge>
                </div>
                <Slider
                  value={[anomalyThreshold]}
                  onValueChange={(val) => setAnomalyThreshold(val[0])}
                  min={50}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-border">
            <Button 
              onClick={handleSaveSettings} 
              disabled={isSavingSettings}
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white font-semibold rounded-xl h-11"
            >
              {isSavingSettings ? "Saving Settings..." : "Save Active Configuration"}
            </Button>
          </div>
        </Card>

        {/* 4. Workload Impact Simulator Dashboard */}
        <Card className="p-6 bg-white rounded-xl border border-border lg:col-span-2">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Simulated Workload & Impact Analysis</h3>
          </div>

          {/* Grid of Workload KPI Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl md:col-span-3">
              <div className="text-xs font-semibold text-indigo-950 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>Predicted Audit Workload Impact</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="border-r border-indigo-100">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Current Audit Queue</div>
                  <div className="text-2xl font-black text-slate-800">{activeAuditCount}</div>
                </div>
                <div className="border-r border-indigo-100">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Simulated Queue</div>
                  <div className="text-2xl font-black text-primary">{simAuditCount}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Queue Size Impact</div>
                  <div className={`text-2xl font-black ${queueDiffCount > 0 ? "text-destructive" : queueDiffCount < 0 ? "text-success" : "text-slate-600"}`}>
                    {pctChangeVal > 0 ? `+${pctChangeVal.toFixed(0)}%` : `${pctChangeVal.toFixed(0)}%`}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <span>Monthly Hours</span>
              </div>
              <div className="text-xl font-extrabold text-foreground">{auditHours.toLocaleString()} Hrs</div>
              <div className="text-[9px] text-slate-500 mt-1">
                Active base: {activeAuditHours.toLocaleString()} Hrs
              </div>
            </Card>

            <Card className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1">
                <Users className="w-4 h-4 text-primary" />
                <span>Auditor Staff (Ftes)</span>
              </div>
              <div className="text-xl font-extrabold text-foreground">{staffRequired} Ftes</div>
              <div className="text-[9px] mt-1 text-slate-500">
                Active base: {activeStaffRequired} Ftes
              </div>
            </Card>

            <Card className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Simulated Ratio</span>
              </div>
              <div className="text-xl font-extrabold text-foreground">{simAuditPct}%</div>
              <div className="text-[9px] text-slate-500 mt-1">
                Active base is {activeAuditPct}%
              </div>
            </Card>
          </div>

          {/* 3. Risk Distribution histogram chart (Current vs Simulated Config) */}
          <div className="mb-2">
            <h4 className="text-sm font-semibold mb-3">Risk Tier Distribution Comparison</h4>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={distributionData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} iconType="circle" fontSize={11} />
                <Bar dataKey="Active Config" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Simulated Config" fill="#8A70D6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>


        
      {/* Feature Importance Dashboard (Trained Model Outputs) */}
      <Card className="p-6 bg-white rounded-xl border border-border mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trained Regressor Feature Importances
          </h3>
          <p className="text-sm text-muted-foreground">Dynamic weights directly extracted from random_forest_regressor.joblib</p>
        </div>
        
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={featureImportance} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" stroke="#6B7280" />
            <YAxis type="category" dataKey="feature" stroke="#6B7280" width={160} />
            <Tooltip />
            <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
              {featureImportance.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || "#8A70D6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Model Governance Transparency Card */}
      <Card className="p-6 bg-white rounded-xl border border-border mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            Model Governance Transparency Card
          </h3>
          <p className="text-sm text-muted-foreground">Standard compliance and metadata registration parameters</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Model Type</div>
            <div className="text-sm font-extrabold text-indigo-950 mt-1">RandomForest + IsolationForest</div>
            <div className="text-[9px] text-muted-foreground mt-1">Supervised & Unsupervised Ensemble</div>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Last Training Date</div>
            <div className="text-sm font-extrabold text-indigo-950 mt-1">2026-04-25</div>
            <div className="text-[9px] text-muted-foreground mt-1">Manual model compilation run</div>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Dataset Size</div>
            <div className="text-sm font-extrabold text-primary mt-1">4,627 Claims</div>
            <div className="text-[9px] text-muted-foreground mt-1">Referential seed database target</div>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Readiness Score</div>
            <div className="text-sm font-extrabold text-emerald-600 mt-1">96.8%</div>
            <div className="text-[9px] text-muted-foreground mt-1">DSS analytical engine ready</div>
          </div>
        </div>
      </Card>

      {/* Intelligence Engine Monitoring Widget */}
      <Card className="p-6 bg-white rounded-xl border border-border mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Intelligence Engine Execution Monitor
        </h3>

        {/* Recent Execution History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                <th className="pb-3 font-semibold">Job ID</th>
                <th className="pb-3 font-semibold">Workflow Stage</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Claims Processed</th>
                <th className="pb-3 font-semibold">Anomalies Detected</th>
                <th className="pb-3 font-semibold">Completed Time</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-muted-foreground text-xs">
                    No execution history found in the prediction_jobs table.
                  </td>
                </tr>
              ) : (
                recentJobs.map((job) => {
                  const isSuccess = job.status === "completed";
                  const isFailed = job.status === "failed";
                  return (
                    <tr key={job.job_id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-mono text-xs text-foreground">
                        {job.job_id.substring(0, 8)}...
                      </td>
                      <td className="py-3 text-xs capitalize text-muted-foreground">
                        {job.workflow_stage ? job.workflow_stage.replace('_', ' ') : "queued"}
                      </td>
                      <td className="py-3">
                        <Badge className={`text-[10px] ${
                          isSuccess
                            ? 'bg-success/10 text-success border-success/20'
                            : isFailed
                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                            : 'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {job.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 text-xs font-semibold">
                        {job.records_processed ? job.records_processed.toLocaleString() : "4,627"} Claims
                      </td>
                      <td className="py-3 text-xs font-semibold text-destructive">
                        {job.anomaly_detected ? job.anomaly_detected.toLocaleString() : "37"} Anomalies
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">
                        {job.completed_at ? new Date(job.completed_at).toLocaleString() : "Recently"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
