import { useState } from "react";
import { Stethoscope, AlertTriangle, Clock, Building2, FileText, CheckCircle2, XCircle, AlertCircle, Zap } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";

// Mock claims data
const claimsData = [
  {
    id: "CLM-2026-08451",
    patient: "John Anderson",
    hospital: "Metropolitan General Hospital",
    diagnosis: "Cardiac Bypass Surgery",
    expectedCost: 2100,
    actualCost: 7500,
    anomalyScore: 98.5,
    date: "2026-04-10",
    status: "pending",
    tier: "High Risk"
  },
  {
    id: "CLM-2026-08452",
    patient: "Sarah Williams",
    hospital: "City Medical Center",
    diagnosis: "Appendectomy",
    expectedCost: 1900,
    actualCost: 6800,
    anomalyScore: 96.2,
    date: "2026-04-12",
    status: "pending",
    tier: "High Risk"
  },
  {
    id: "CLM-2026-08453",
    patient: "Michael Chen",
    hospital: "Regional Healthcare",
    diagnosis: "Hip Replacement",
    expectedCost: 3300,
    actualCost: 8200,
    anomalyScore: 94.8,
    date: "2026-04-13",
    status: "pending",
    tier: "Critical Risk"
  },
  {
    id: "CLM-2026-08454",
    patient: "Emily Davis",
    hospital: "Sunrise Medical",
    diagnosis: "Gallbladder Surgery",
    expectedCost: 2600,
    actualCost: 7100,
    anomalyScore: 92.1,
    date: "2026-04-14",
    status: "pending",
    tier: "High Risk"
  },
];

const claimHistory = [
  { date: "2024-03-15", type: "Dental Checkup", cost: 150, status: "approved" },
  { date: "2024-08-22", type: "General Consultation", cost: 80, status: "approved" },
  { date: "2025-06-10", type: "Lab Tests", cost: 320, status: "approved" },
  { date: "2025-11-05", type: "X-Ray Imaging", cost: 280, status: "approved" },
];

export default function MedicalAuditPage() {
  const [selectedClaim, setSelectedClaim] = useState(claimsData[0]);
  const [feedback, setFeedback] = useState("");
  const [auditStatus, setAuditStatus] = useState<"valid" | "overtreatment" | "fraud" | null>(null);
  const [isRetraining, setIsRetraining] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState(12);

  const handleSubmitFeedback = () => {
    if (auditStatus) {
      alert(`Claim ${selectedClaim.id} marked as: ${auditStatus.toUpperCase()}\nFeedback submitted to AI retraining pipeline.`);
      setFeedback("");
      setAuditStatus(null);
      setFeedbackCount((prev) => prev + 1);
    }
  };

  const handleRetrainAI = () => {
    setIsRetraining(true);
    setTimeout(() => {
      setIsRetraining(false);
      alert(`AI Model Retrained Successfully!\n\n✓ ${feedbackCount} audit decisions processed\n✓ Model accuracy improved to 97.2%\n✓ New anomaly patterns learned\n✓ Deployed to production`);
    }, 3000);
  };

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
          <p className="text-2xl font-bold text-destructive">4</p>
        </Card>
        <Card className="p-4 bg-white rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Avg Anomaly Score</p>
          <p className="text-2xl font-bold text-warning">95.4%</p>
        </Card>
        <Card className="p-4 bg-white rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Reviewed Today</p>
          <p className="text-2xl font-bold text-success">12</p>
        </Card>
        <Card className="p-4 bg-white rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Fraud Detected</p>
          <p className="text-2xl font-bold text-destructive">3</p>
        </Card>
      </div>

      {/* Master-Detail View */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Claims List */}
        <div className="lg:col-span-1">
          <Card className="p-4 bg-white rounded-xl border border-border">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              High Anomaly Claims
            </h3>
            
            <div className="space-y-2">
              {claimsData.map((claim) => (
                <button
                  key={claim.id}
                  onClick={() => setSelectedClaim(claim)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    selectedClaim.id === claim.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">{claim.id}</div>
                      <div className="text-xs text-muted-foreground">{claim.patient}</div>
                    </div>
                    <Badge 
                      className={`text-xs ${
                        claim.anomalyScore > 95 
                          ? 'bg-destructive text-white' 
                          : 'bg-warning text-white'
                      }`}
                    >
                      {claim.anomalyScore}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{claim.diagnosis}</span>
                    <span className="font-medium text-destructive">
                      ${claim.actualCost.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {claim.date}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Claim Details */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-white rounded-xl border border-border mb-4">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-1">{selectedClaim.id}</h3>
                <p className="text-sm text-muted-foreground">Review claim details and submit audit decision</p>
              </div>
              <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                {selectedClaim.tier}
              </Badge>
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
                      <div className="text-xs text-muted-foreground">Member ID: MBR-2024-{Math.floor(Math.random() * 10000)}</div>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Diagnosis</div>
                    <div className="text-sm font-medium">{selectedClaim.diagnosis}</div>
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
                      <div className="text-xs text-muted-foreground">Tier A Facility</div>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Service Date</div>
                    <div className="text-sm font-medium">{selectedClaim.date}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Comparison */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl border border-red-100 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Expected Cost</div>
                  <div className="text-xl font-bold text-foreground">${selectedClaim.expectedCost.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Actual Cost</div>
                  <div className="text-xl font-bold text-destructive">${selectedClaim.actualCost.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Variance</div>
                  <div className="text-xl font-bold text-destructive">
                    +{(((selectedClaim.actualCost - selectedClaim.expectedCost) / selectedClaim.expectedCost) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive font-medium">
                  Cost variance exceeds {selectedClaim.anomalyScore}% confidence threshold
                </span>
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
                      <span className="text-sm font-medium">${item.cost}</span>
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
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => setAuditStatus("valid")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    auditStatus === "valid"
                      ? 'border-success bg-success/10'
                      : 'border-border hover:border-success/50 bg-white'
                  }`}
                >
                  <CheckCircle2 className={`w-8 h-8 mx-auto mb-2 ${
                    auditStatus === "valid" ? 'text-success' : 'text-muted-foreground'
                  }`} />
                  <div className="text-sm font-medium">Valid</div>
                  <div className="text-xs text-muted-foreground">Legitimate claim</div>
                </button>

                <button
                  onClick={() => setAuditStatus("overtreatment")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    auditStatus === "overtreatment"
                      ? 'border-warning bg-warning/10'
                      : 'border-border hover:border-warning/50 bg-white'
                  }`}
                >
                  <AlertCircle className={`w-8 h-8 mx-auto mb-2 ${
                    auditStatus === "overtreatment" ? 'text-warning' : 'text-muted-foreground'
                  }`} />
                  <div className="text-sm font-medium">Over-treatment</div>
                  <div className="text-xs text-muted-foreground">Excessive care</div>
                </button>

                <button
                  onClick={() => setAuditStatus("fraud")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    auditStatus === "fraud"
                      ? 'border-destructive bg-destructive/10'
                      : 'border-border hover:border-destructive/50 bg-white'
                  }`}
                >
                  <XCircle className={`w-8 h-8 mx-auto mb-2 ${
                    auditStatus === "fraud" ? 'text-destructive' : 'text-muted-foreground'
                  }`} />
                  <div className="text-sm font-medium">Fraud</div>
                  <div className="text-xs text-muted-foreground">Fraudulent claim</div>
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-2">Additional Notes (Optional)</label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter your audit notes, medical justification, or concerns..."
                  className="min-h-24 bg-input-background rounded-xl"
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
                  Reset
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Your feedback will be used to retrain the AI anomaly detection model
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* AI Retraining Section */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 via-purple-50 to-indigo-50 rounded-xl border-2 border-primary/30 mt-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">Human-in-the-Loop AI Retraining</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Retrain the anomaly detection model with your expert feedback to improve accuracy and reduce false positives
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white border-primary/30">
                  {feedbackCount} Audit Decisions Collected
                </Badge>
                <Badge className="bg-white border-primary/30">
                  Current Model: v2.4.3
                </Badge>
                <Badge className="bg-white border-primary/30">
                  Last Retrained: 2026-04-25
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
                Retrain AI Model
              </>
            )}
          </Button>
        </div>

        {feedbackCount < 10 && (
          <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            <span className="text-sm text-warning">
              Minimum 10 audit decisions required for retraining. Current: {feedbackCount}
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}
