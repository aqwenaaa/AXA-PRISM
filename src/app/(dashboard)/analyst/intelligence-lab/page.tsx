"use client";

import { useState } from "react";
import { Brain, TrendingUp, Award, AlertTriangle, Settings } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Slider } from "@/app/components/ui/slider";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, Legend } from "recharts";

// Mock data for scatter plot (Expected vs Actual Cost)
const scatterData = [
  { expected: 1200, actual: 1150, type: "normal" },
  { expected: 2500, actual: 2600, type: "normal" },
  { expected: 3200, actual: 3100, type: "normal" },
  { expected: 1800, actual: 1900, type: "normal" },
  { expected: 4500, actual: 4400, type: "normal" },
  { expected: 2200, actual: 2150, type: "normal" },
  { expected: 3800, actual: 3900, type: "normal" },
  { expected: 1500, actual: 1450, type: "normal" },
  { expected: 5200, actual: 5100, type: "normal" },
  { expected: 2800, actual: 2900, type: "normal" },
  { expected: 1600, actual: 1550, type: "normal" },
  { expected: 3500, actual: 3600, type: "normal" },
  { expected: 4200, actual: 4150, type: "normal" },
  { expected: 2100, actual: 7500, type: "outlier" },
  { expected: 1900, actual: 6800, type: "outlier" },
  { expected: 3300, actual: 8200, type: "outlier" },
  { expected: 2600, actual: 7100, type: "outlier" },
];

// Mock data for cluster visualization
const clusterData = [
  { cluster: "Low Risk", x: 20, y: 30, size: 150, color: "#27AE60" },
  { cluster: "Medium Risk", x: 50, y: 50, size: 200, color: "#F2994A" },
  { cluster: "High Risk", x: 80, y: 75, size: 100, color: "#8A70D6" },
  { cluster: "Critical Risk", x: 90, y: 85, size: 50, color: "#d4183d" },
];

// Mock data for feature importance
const featureData = [
  { feature: "Hospital Tier", importance: 92, color: "#8A70D6" },
  { feature: "Diagnosis Code", importance: 87, color: "#8A70D6" },
  { feature: "Treatment Duration", importance: 78, color: "#8A70D6" },
  { feature: "Patient Age", importance: 65, color: "#F2994A" },
  { feature: "Policy Type", importance: 58, color: "#F2994A" },
  { feature: "Geographic Region", importance: 45, color: "#27AE60" },
  { feature: "Previous Claims", importance: 38, color: "#27AE60" },
];

export default function IntelligenceLabPage() {
  const [hospitalTierWeight, setHospitalTierWeight] = useState(92);
  const [diagnosisCodeWeight, setDiagnosisCodeWeight] = useState(87);
  const [treatmentDurationWeight, setTreatmentDurationWeight] = useState(78);
  const [anomalyThreshold, setAnomalyThreshold] = useState(85);

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
              <p className="text-2xl font-bold text-warning">+25.5%</p>
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
              <p className="text-2xl font-bold text-destructive">4</p>
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
              <p className="text-2xl font-bold text-success">96.8%</p>
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
              <p className="text-2xl font-bold text-primary">4</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Scatter Plot - Expected vs Actual Cost */}
      <Card className="p-6 bg-white rounded-xl border border-border mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Expected vs Actual Claim Cost</h3>
            <p className="text-sm text-muted-foreground">Regression analysis with anomaly highlighting</p>
          </div>
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            4 Outliers
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
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '12px'
              }}
            />
            <Scatter data={scatterData} fill="#8A70D6">
              {scatterData.map((entry, index) => (
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
              <XAxis 
                type="number" 
                dataKey="x" 
                domain={[0, 100]}
                label={{ value: 'Risk Factor 1', position: 'bottom' }}
                stroke="#6B7280"
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                domain={[0, 100]}
                label={{ value: 'Risk Factor 2', angle: -90, position: 'left' }}
                stroke="#6B7280"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '12px'
                }}
              />
              <Scatter data={clusterData} fill="#8A70D6">
                {clusterData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    opacity={0.7}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap gap-2 mt-4">
            <Badge className="bg-success/10 text-success border-success/20">Low Risk</Badge>
            <Badge className="bg-warning/10 text-warning border-warning/20">Medium Risk</Badge>
            <Badge className="bg-primary/10 text-primary border-primary/20">High Risk</Badge>
            <Badge className="bg-destructive/10 text-destructive border-destructive/20">Critical Risk</Badge>
          </div>
        </Card>

        {/* Feature Importance */}
        <Card className="p-6 bg-white rounded-xl border border-border">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Feature Importance</h3>
            <p className="text-sm text-muted-foreground">Key drivers of claim cost increase</p>
          </div>
          
          <ResponsiveContainer width="100%" height={350}>
            <BarChart 
              data={featureData} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" />
              <YAxis 
                type="category" 
                dataKey="feature" 
                stroke="#6B7280"
                width={140}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '12px'
                }}
              />
              <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
                {featureData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Certainty Factor Calibration */}
      <Card className="p-6 bg-white rounded-xl border border-border mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Certainty Factor Calibration</h3>
            <p className="text-sm text-muted-foreground">Adjust feature weights and anomaly detection thresholds</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Feature Weights */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Hospital Tier Weight</label>
                <Badge className="bg-primary/10 text-primary border-primary/20">{hospitalTierWeight}%</Badge>
              </div>
              <Slider
                value={[hospitalTierWeight]}
                onValueChange={(value) => setHospitalTierWeight(value[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Impact of hospital tier classification on risk prediction
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Diagnosis Code Weight</label>
                <Badge className="bg-primary/10 text-primary border-primary/20">{diagnosisCodeWeight}%</Badge>
              </div>
              <Slider
                value={[diagnosisCodeWeight]}
                onValueChange={(value) => setDiagnosisCodeWeight(value[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Significance of diagnosis code in cost variance prediction
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Treatment Duration Weight</label>
                <Badge className="bg-primary/10 text-primary border-primary/20">{treatmentDurationWeight}%</Badge>
              </div>
              <Slider
                value={[treatmentDurationWeight]}
                onValueChange={(value) => setTreatmentDurationWeight(value[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Influence of treatment duration on anomaly detection
              </p>
            </div>
          </div>

          {/* Anomaly Detection Threshold */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Anomaly Detection Threshold</label>
                <Badge className={`border ${
                  anomalyThreshold >= 90
                    ? 'bg-success/10 text-success border-success/20'
                    : anomalyThreshold >= 70
                    ? 'bg-warning/10 text-warning border-warning/20'
                    : 'bg-destructive/10 text-destructive border-destructive/20'
                }`}>
                  {anomalyThreshold}%
                </Badge>
              </div>
              <Slider
                value={[anomalyThreshold]}
                onValueChange={(value) => setAnomalyThreshold(value[0])}
                min={50}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2 mb-4">
                Minimum confidence score to flag claims as anomalous
              </p>

              {/* Threshold Visual Guide */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-success/10 to-success/5 border border-success/20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-sm font-medium">High Confidence</span>
                  </div>
                  <span className="text-sm text-muted-foreground">90-100%</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span className="text-sm font-medium">Medium Confidence</span>
                  </div>
                  <span className="text-sm text-muted-foreground">70-89%</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <span className="text-sm font-medium">Low Confidence</span>
                  </div>
                  <span className="text-sm text-muted-foreground">50-69%</span>
                </div>
              </div>
            </div>

            {/* Impact Summary */}
            <div className="bg-gradient-to-br from-primary/5 to-purple-50 p-4 rounded-xl border border-primary/20 mt-6">
              <div className="text-sm font-medium mb-2">Calibration Impact</div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Predicted Outliers</span>
                  <span className="font-medium">
                    {anomalyThreshold >= 90 ? "2-3" : anomalyThreshold >= 70 ? "4-6" : "8-12"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">False Positive Rate</span>
                  <span className="font-medium">
                    {anomalyThreshold >= 90 ? "Low (~2%)" : anomalyThreshold >= 70 ? "Medium (~8%)" : "High (~15%)"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Model Sensitivity</span>
                  <span className="font-medium">
                    {anomalyThreshold >= 90 ? "Conservative" : anomalyThreshold >= 70 ? "Balanced" : "Aggressive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Validation Badge */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-purple-50 rounded-xl border-2 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
            <Award className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Model Validation Status</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Cross-validated by Bayesian inference and model chaining techniques
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-success text-white">Bayesian Validation ✓</Badge>
              <Badge className="bg-success text-white">Cross-Validation ✓</Badge>
              <Badge className="bg-success text-white">Ensemble Chaining ✓</Badge>
              <Badge className="bg-primary text-white">Accuracy: 96.8%</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
