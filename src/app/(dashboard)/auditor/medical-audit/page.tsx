"use client";

import { useState, useEffect } from "react";
import { Stethoscope, AlertTriangle, Clock, Building2, FileText, CheckCircle2, XCircle, AlertCircle, Zap, Brain, HelpCircle } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { getAnomalyClaims, submitAuditDecision, triggerRetrain } from "@/lib/services/claims.service";
import type { ClaimRecord } from "@/lib/types";

export default function MedicalAuditPage() {
  const getConfidenceLabel = (claim: ClaimRecord | null) => {
    if (!claim) return { text: "Low Confidence", color: "bg-rose-50 text-rose-700 border-rose-200" };
    const finalScore = claim.finalRiskScore !== undefined ? claim.finalRiskScore : claim.anomalyScore;
    const cf = claim.cfScore !== undefined ? claim.cfScore : 0;
    const anomaly = claim.anomalyScore !== undefined ? claim.anomalyScore : 0;
    const metric = (finalScore * 0.4) + (cf * 0.3) + (anomaly * 0.3);
    
    if (metric > 75) {
      return { text: "High Confidence", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    } else if (metric > 40) {
      return { text: "Medium Confidence", color: "bg-amber-50 text-amber-700 border-amber-200" };
    } else {
      return { text: "Low Confidence", color: "bg-rose-50 text-rose-700 border-rose-200" };
    }
  };

  const [claimsData, setClaimsData] = useState<ClaimRecord[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ClaimRecord | null>(null);
  const [feedback, setFeedback] = useState("");
  const [auditStatus, setAuditStatus] = useState<"valid" | "overtreatment" | "fraud" | "requires_review" | null>(null);
  const [isRetraining, setIsRetraining] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState(25);
  const [isLoading, setIsLoading] = useState(true);

  // Load pending anomalous claims dynamically from FastAPI
  async function loadClaims() {
    setIsLoading(true);
    try {
      const claims = await getAnomalyClaims();
      // Sort claims by EDAS Rank (ascending) so the highest priority ranks appear first
      const sortedClaims = [...claims].sort((a, b) => {
        const rA = a.edasRank || 9999;
        const rB = b.edasRank || 9999;
        return rA - rB;
      });
      setClaimsData(sortedClaims);
      if (sortedClaims.length > 0) {
        setSelectedClaim(sortedClaims[0]);
      } else {
        setSelectedClaim(null);
      }
    } catch (err) {
      console.error("[MedicalAudit] Failed to load anomalous claims:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadClaims();
  }, []);

  const handleSubmitFeedback = async () => {
    if (auditStatus && selectedClaim) {
      const statusMap: Record<string, "valid" | "overtreatment" | "fraud" | "requires_review"> = {
        "valid": "valid",
        "overtreatment": "overtreatment",
        "fraud": "fraud",
        "requires_review": "requires_review"
      };

      try {
        await submitAuditDecision({
          claimId: selectedClaim.id,
          decision: statusMap[auditStatus],
          notes: feedback,
          auditorId: "auditor-01", // Handled by backend auth
          timestamp: new Date().toISOString()
        });

        alert(`Claim ${selectedClaim.id} marked as: ${auditStatus.toUpperCase().replace('_', ' ')}\nDecision saved in database!`);
        
        // Clear forms and reload
        setFeedback("");
        setAuditStatus(null);
        setFeedbackCount((prev) => prev + 1);
        await loadClaims();
      } catch (err) {
        alert("Failed to submit audit decision to server.");
      }
    }
  };

  const handleRetrainAI = async () => {
    setIsRetraining(true);
    try {
      const res = await triggerRetrain(feedbackCount);
      if (res.success) {
        alert(`AI Model Retrained Successfully!\n\n✓ ${feedbackCount} audit decisions processed\n✓ Model accuracy improved to ${res.newAccuracy}%\n✓ Deployed to production (Version ${res.newVersion})`);
      }
    } catch (err) {
      alert("Failed to initiate model retrain loop.");
    } finally {
      setIsRetraining(false);
    }
  };

  const formatCurrency = (val: number) => {
    if (val === undefined || val === null) return "Rp 0";
    if (val > 10000) {
      return `Rp ${val.toLocaleString()}`;
    }
    return `$${val.toLocaleString()}`;
  };

  const claimHistory = [
    { date: "2024-03-15", type: "Dental Checkup", cost: 150000, status: "approved" },
    { date: "2024-08-22", type: "General Consultation", cost: 80000, status: "approved" },
    { date: "2025-06-10", type: "Lab Tests", cost: 320000, status: "approved" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Medical Audit Worklist</h1>
            <p className="text-muted-foreground">Human-in-the-loop verification and validation</p>
          </div>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20">
          Role: Medical Auditor
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-white rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Pending Reviews</p>
          <p className="text-2xl font-bold text-destructive">{claimsData.length}</p>
        </Card>
        <Card className="p-4 bg-white rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Avg Anomaly Score</p>
          <p className="text-2xl font-bold text-warning">91.2%</p>
        </Card>
        <Card className="p-4 bg-white rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Reviewed Decisions</p>
          <p className="text-2xl font-bold text-success">{feedbackCount}</p>
        </Card>
        <Card className="p-4 bg-white rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Fraud Flagged</p>
          <p className="text-2xl font-bold text-destructive">5</p>
        </Card>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center bg-white border border-border rounded-xl">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading anomalous claims from FastAPI...</p>
        </Card>
      ) : (
        /* Master-Detail View */
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Claims List */}
          <div className="lg:col-span-1">
            <Card className="p-4 bg-white rounded-xl border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Anomalous Claim Queue
              </h3>
                <p className="text-sm text-muted-foreground">Risk Ranking using EDAS multi-criteria decision analysis</p>
        
              
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {claimsData.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 text-center">No pending reviews found in DB.</p>
                ) : (
                  claimsData.map((claim) => (
                    <button
                      key={claim.id}
                      onClick={() => {
                        setSelectedClaim(claim);
                        setFeedback("");
                        setAuditStatus(null);
                      }}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        selectedClaim?.id === claim.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-xs truncate flex items-center gap-1.5">
                            <span className="bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                              #{claim.edasRank || "N/A"}
                            </span>
                            <span className="truncate">{claim.id.substring(0, 18)}...</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{claim.patient}</div>
                        </div>
                        <Badge className={`text-xs ${claim.anomalyScore > 80 ? 'bg-destructive text-white' : 'bg-warning text-slate-800'}`}>
                          {claim.anomalyScore}% Anomaly
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate max-w-[140px]">{claim.diagnosis}</span>
                        <span className="font-semibold text-destructive">
                          {formatCurrency(claim.actualCost)}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right: Claim Details */}
          <div className="lg:col-span-2">
            {selectedClaim ? (
              <Card className="p-6 bg-white rounded-xl border border-border mb-4">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Claim ID: {selectedClaim.id}</h3>
                    <p className="text-sm text-muted-foreground">Review claim details and submit audit decision</p>
                  </div>
                  <div className="flex gap-2">
                    {(() => {
                      const conf = getConfidenceLabel(selectedClaim);
                      return (
                        <Badge className={`border font-semibold ${conf.color}`}>
                          {conf.text}
                        </Badge>
                      );
                    })()}
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20 font-bold">
                      {selectedClaim.tier}
                    </Badge>
                  </div>
                </div>

                {/* Patient & Hospital Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-3">Patient Information</div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {selectedClaim.patient.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{selectedClaim.patient}</div>
                          <div className="text-xs text-muted-foreground">
                            Claim Code: {selectedClaim.id.substring(0, 8)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-secondary/50 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Diagnosis (ICD-10 Code)</div>
                        <div className="text-sm font-semibold text-indigo-950">
                          {selectedClaim.diagnosis} ({selectedClaim.diagnosisCode})
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-3">Hospital Information</div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{selectedClaim.hospital}</div>
                          <div className="text-xs text-muted-foreground">{selectedClaim.hospitalTier || "Tier A"} Facility</div>
                        </div>
                      </div>
                      
                      <div className="bg-secondary/50 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Admission & Discharge Date</div>
                        <div className="text-sm font-medium">{selectedClaim.date}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost Comparison */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl border border-red-100 mb-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Expected Cost (AI Baseline)</div>
                      <div className="text-lg font-bold text-foreground">{formatCurrency(selectedClaim.expectedCost)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Actual Claim Cost</div>
                      <div className="text-lg font-bold text-destructive">{formatCurrency(selectedClaim.actualCost)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Discrepancy Variance</div>
                      <div className="text-lg font-bold text-destructive">
                        +{(((selectedClaim.actualCost - selectedClaim.expectedCost) / Math.max(1, selectedClaim.expectedCost)) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />
                    <span className="text-xs text-destructive font-semibold">
                      Claim cost variance exceeds dynamic confidence threshold by {(selectedClaim.actualCost - selectedClaim.expectedCost) > 0 ? formatCurrency(selectedClaim.actualCost - selectedClaim.expectedCost) : "0"}
                    </span>
                  </div>
                </div>

                {/* 3. ML Explanation Panel (Evidence & Details) */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl mb-6">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-slate-800">
                    <Brain className="w-4 h-4 text-primary" />
                    Decision Support Explanations
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Anomaly Score</div>
                      <div className="text-lg font-bold text-destructive mt-0.5">{selectedClaim.anomalyScore}%</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">Isolation Forest score</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Expected Cost</div>
                      <div className="text-lg font-bold text-foreground mt-0.5">{formatCurrency(selectedClaim.expectedCost)}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">RF Regressor baseline</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Residual Variance</div>
                      <div className="text-lg font-bold text-destructive mt-0.5">{formatCurrency(selectedClaim.residual || 0)}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">Actual vs Expected cost</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Certainty Factor</div>
                      <div className="text-lg font-bold text-primary mt-0.5">{selectedClaim.cfScore || 0}%</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">MYCIN engine fusion</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Final Risk Score</div>
                      <div className="text-lg font-bold text-primary mt-0.5">{selectedClaim.finalRiskScore || 0}%</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">CF weights calibration</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">EDAS priority rank</div>
                      <div className="text-lg font-bold text-indigo-600 mt-0.5">Rank #{selectedClaim.edasRank || "N/A"}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">Multi-criteria DSS priority</div>
                    </div>
                  </div>
                </div>

                {/* Claim History */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">Patient Claim History</h4>
                  </div>
                  
                  <div className="space-y-2">
                    {claimHistory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{item.type}</div>
                          <div className="text-xs text-muted-foreground">{item.date}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{formatCurrency(item.cost)}</span>
                          <Badge className="bg-success/10 text-success border-success/20 text-xs">
                            Approved
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Decision Form */}
                <div className="border-t border-border pt-6">
                  <h4 className="font-semibold mb-4">Audit Decision</h4>
                  
                  {/* 1. Decision choices (Valid, Overtreatment, Fraud, Requires Review) */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <button
                      onClick={() => setAuditStatus("valid")}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center ${
                        auditStatus === "valid"
                          ? 'border-success bg-success/5 shadow-md shadow-success/10'
                          : 'border-border hover:border-success/50 bg-white'
                      }`}
                    >
                      <CheckCircle2 className={`w-6 h-6 mb-2 ${
                        auditStatus === "valid" ? 'text-success' : 'text-muted-foreground'
                      }`} />
                      <div className="text-sm font-semibold">Valid</div>
                      <div className="text-[10px] text-muted-foreground">Legitimate claim</div>
                    </button>

                    <button
                      onClick={() => setAuditStatus("overtreatment")}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center ${
                        auditStatus === "overtreatment"
                          ? 'border-warning bg-warning/5 shadow-md shadow-warning/10'
                          : 'border-border hover:border-warning/50 bg-white'
                      }`}
                    >
                      <AlertCircle className={`w-6 h-6 mb-2 ${
                        auditStatus === "overtreatment" ? 'text-warning' : 'text-muted-foreground'
                      }`} />
                      <div className="text-sm font-semibold">Over-treatment</div>
                      <div className="text-[10px] text-muted-foreground">Excessive care</div>
                    </button>

                    <button
                      onClick={() => setAuditStatus("fraud")}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center ${
                        auditStatus === "fraud"
                          ? 'border-destructive bg-destructive/5 shadow-md shadow-destructive/10'
                          : 'border-border hover:border-destructive/50 bg-white'
                      }`}
                    >
                      <XCircle className={`w-6 h-6 mb-2 ${
                        auditStatus === "fraud" ? 'text-destructive' : 'text-muted-foreground'
                      }`} />
                      <div className="text-sm font-semibold">Fraud</div>
                      <div className="text-[10px] text-muted-foreground">Deceptive billing</div>
                    </button>

                    <button
                      onClick={() => setAuditStatus("requires_review")}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center ${
                        auditStatus === "requires_review"
                          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                          : 'border-border hover:border-primary/50 bg-white'
                      }`}
                    >
                      <HelpCircle className={`w-6 h-6 mb-2 ${
                        auditStatus === "requires_review" ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <div className="text-sm font-semibold">Requires Review</div>
                      <div className="text-[10px] text-muted-foreground">Needs escalation</div>
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm mb-2 font-medium">Auditor Justification Notes (Optional)</label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Enter clinical reasons, audit justifications, or notes for secondary review..."
                      className="min-h-24 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmitFeedback}
                      disabled={!auditStatus}
                      className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white rounded-xl h-11 disabled:opacity-50"
                    >
                      Submit Audit Decision
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => {
                        setAuditStatus(null);
                        setFeedback("");
                      }}
                    >
                      Reset Form
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center bg-white border border-border rounded-xl">
                <p className="text-muted-foreground">Please select a claim from the list to audit.</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* AI Retraining Section */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 via-purple-50 to-indigo-50 rounded-xl border-2 border-primary/30 mt-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">Human-in-the-Loop AI Feedback</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Decisions collected from audits act as future training labels, improving regressor accuracy and reducing future anomalies.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white border-primary/30">
                  {feedbackCount} Audit Decisions Saved
                </Badge>
                <Badge className="bg-white border-primary/30">
                  Current Model: v2.4.3
                </Badge>
                <Badge className="bg-white border-primary/30">
                  Status: Ready for retrain loop
                </Badge>
              </div>
            </div>
          </div>

          <Button
            onClick={handleRetrainAI}
            disabled={isRetraining || feedbackCount < 10}
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white px-8 h-14 rounded-xl shadow-xl shadow-primary/30 transition-all whitespace-nowrap disabled:opacity-50"
          >
            {isRetraining ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                Retraining Model...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Trigger AI Retrain
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
