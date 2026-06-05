"use client";

import { useState, useEffect } from "react";
import { Brain, TrendingUp, Award, AlertTriangle, Settings } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Slider } from "@/app/components/ui/slider";
import { Button } from "@/app/components/ui/button";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, BarChart, Bar } from "recharts";
import { getScatterData, getClusterData, getFeatureImportance, getModelMetrics } from "@/lib/services/claims.service";
import { apiGet, apiPut } from "@/lib/api/api-client";

export default function IntelligenceLabPage() {
  const [modelMetrics, setModelMetricsState] = useState({
    accuracy: 96.8,
    outlierCount: 4,
    claimIncreasePercent: 25.5,
    riskClusters: 4,
  });

  const [scatterPoints, setScatterPoints] = useState<any[]>([]);
  const [clusterPoints, setClusterPoints] = useState<any[]>([]);
  const [featureImportance, setFeatureImportance] = useState<any[]>([]);

  // Sliders Settings States
  const [hospitalTierWeight, setHospitalTierWeight] = useState(20);
  const [diagnosisCodeWeight, setDiagnosisCodeWeight] = useState(30);
  const [treatmentDurationWeight, setTreatmentDurationWeight] = useState(50);
  const [anomalyThreshold, setAnomalyThreshold] = useState(85);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Load analytics diagnostics & settings dynamically
  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [metrics, scatter, clusters, features, settingsData] = await Promise.all([
          getModelMetrics(),
          getScatterData(),
          getClusterData(),
          getFeatureImportance(),
          apiGet<any>("/api/v1/settings"),
        ]);

        setModelMetricsState({
          accuracy: metrics.accuracy,
          outlierCount: metrics.outlierCount,
          claimIncreasePercent: metrics.claimIncreasePercent,
          riskClusters: metrics.riskClusters,
        });

        setScatterPoints(scatter);
        setClusterPoints(clusters);
        setFeatureImportance(features);

        if (settingsData && settingsData.cf_weights) {
          setHospitalTierWeight(Math.round(settingsData.cf_weights.age_weight * 100));
          setDiagnosisCodeWeight(Math.round(settingsData.cf_weights.bmi_weight * 100));
          setTreatmentDurationWeight(Math.round(settingsData.cf_weights.smoker_weight * 100));
          setAnomalyThreshold(settingsData.anomaly_threshold || 85);
        }
      } catch (err) {
        console.error("[IntelligenceLab] Failed to load data from FastAPI:", err);
      }
    }
    loadAnalytics();
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
      await apiPut("/api/v1/settings", payload);
      alert("Calibration settings saved successfully to Supabase public.system_settings!");
    } catch (err) {
      alert("Failed to save certainty configuration.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Intelligence Lab (The Brain)</h1>
            <p className="text-muted-foreground">Advanced AI analytics and pattern recognition</p>
          </div>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20">
          Role: Risk Analyst
        </Badge>
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
              <p className="text-sm text-muted-foreground">Outliers Detected</p>
              <p className="text-2xl font-bold text-destructive">{modelMetrics.outlierCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
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

      {/* Scatter Plot */}
      <Card className="p-6 bg-white rounded-xl border border-border mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Expected vs Actual Claim Cost</h3>
            <p className="text-sm text-muted-foreground">Regression analysis with anomaly highlighting</p>
          </div>
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            {modelMetrics.outlierCount} Outliers
          </Badge>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              type="number" 
              dataKey="expected" 
              name="Expected Cost" 
              label={{ value: 'Expected Cost ($)', position: 'bottom' }}
              stroke="#6B7280"
            />
            <YAxis 
              type="number" 
              dataKey="actual" 
              name="Actual Cost"
              label={{ value: 'Actual Cost ($)', angle: -90, position: 'left' }}
              stroke="#6B7280"
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={scatterPoints} fill="#8A70D6">
              {scatterPoints.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.type === "outlier" ? "#d4183d" : "#8A70D6"}
                  opacity={entry.type === "outlier" ? 1 : 0.6}
                  r={entry.type === "outlier" ? 8 : 6}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Cluster Map */}
        <Card className="p-6 bg-white rounded-xl border border-border">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Risk Cluster Map (K-Means)</h3>
            <p className="text-sm text-muted-foreground">Patient segmentation by risk profile</p>
          </div>
          
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" dataKey="x" domain={[0, 100]} stroke="#6B7280" />
              <YAxis type="number" dataKey="y" domain={[0, 100]} stroke="#6B7280" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={clusterPoints} fill="#8A70D6">
                {clusterPoints.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.7} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        {/* Feature Importance */}
        <Card className="p-6 bg-white rounded-xl border border-border">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Feature Importance</h3>
            <p className="text-sm text-muted-foreground">Key drivers of claim cost increase</p>
          </div>
          
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={featureImportance} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" />
              <YAxis type="category" dataKey="feature" stroke="#6B7280" width={140} />
              <Tooltip />
              <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
                {featureImportance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || "#8A70D6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Calibration settings panel */}
      <Card className="p-6 bg-white rounded-xl border border-border mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Certainty Factor Calibration</h3>
              <p className="text-sm text-muted-foreground">Adjust feature weights and anomaly detection thresholds</p>
            </div>
          </div>
          <Button 
            onClick={handleSaveSettings} 
            disabled={isSavingSettings}
            className="bg-primary hover:bg-primary/95 text-white"
          >
            {isSavingSettings ? "Saving..." : "Save Configuration"}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Age Weight Factor</label>
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
                <label className="text-sm font-medium">BMI Weight Factor</label>
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
                <label className="text-sm font-medium">Smoker Weight Factor</label>
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
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Anomaly Threshold</label>
                <Badge className="bg-success/10 text-success">{anomalyThreshold}%</Badge>
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
      </Card>
    </div>
  );
}
