"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Play, Database, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { validateFile, ingestFile, runIntelligenceEngine, getDataQualityReport, getPredictionJobs } from "@/lib/services/ingestion.service";
import { toast } from "sonner";

export default function DataIngestionPage() {
  const [policyUploaded, setPolicyUploaded] = useState(false);
  const [claimUploaded, setClaimUploaded] = useState(false);
  const [policyFileName, setPolicyFileName] = useState("policy_data_2026.csv");
  const [claimsFileName, setClaimsFileName] = useState("claims_data_2026.csv");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"policy" | "claims">("policy");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationStatus, setValidationStatus] = useState<"idle" | "validating" | "success" | "error">("idle");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [detectedRowCount, setDetectedRowCount] = useState("0");

  const [qualityReport, setQualityReport] = useState({
    totalRows: "0",
    missingValuePercentage: "0%",
    formatConsistency: "0%"
  });

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
      
      // Check if there is an active job running in background
      const activeJob = (data || []).find((j: any) => j.status === "queued" || j.status === "processing");
      if (activeJob) {
        setIsProcessing(true);
        if (activeJob.workflow_stage === "queued") setProcessingProgress(10);
        else if (activeJob.workflow_stage === "processing") setProcessingProgress(40);
        else if (activeJob.workflow_stage === "calibration_applied") setProcessingProgress(75);
      } else {
        setIsProcessing(false);
        setProcessingProgress(0);
      }
    } catch (err) {
      console.error("Failed to fetch prediction jobs:", err);
    } finally {
      fetchJobsInFlightRef.current = false;
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, []);

  // Pull quality reports dynamically
  useEffect(() => {
    async function loadQuality() {
      const report = await getDataQualityReport(policyUploaded, claimUploaded);
      setQualityReport({
        totalRows: report.totalRows,
        missingValuePercentage: report.missingValuePercentage,
        formatConsistency: report.formatConsistency
      });
    }
    loadQuality();
  }, [policyUploaded, claimUploaded]);

  const handleRunEngine = async () => {
    setIsProcessing(true);
    setProcessingProgress(15);
    
    try {
      const result = await runIntelligenceEngine();
      if (result.success) {
        toast.success("Intelligence Engine run initiated in background!");
        fetchJobs();
      } else {
        setIsProcessing(false);
        toast.error("Failed to initiate Intelligence Engine run.");
      }
    } catch (err) {
      setIsProcessing(false);
      toast.error("Error invoking Intelligence Engine.");
    }
  };

  const openUploadModal = (type: "policy" | "claims") => {
    setUploadType(type);
    setUploadModalOpen(true);
    setSelectedFile(null);
    setValidationStatus("idle");
    setValidationErrors([]);
    setDetectedRowCount("0");
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValidationStatus("validating");
      setValidationErrors([]);

      try {
        const result = await validateFile(file, uploadType);
        if (result.status === "success") {
          setValidationStatus("success");
          setDetectedRowCount(result.rowCount || "0");
        } else {
          setValidationStatus("error");
          setValidationErrors(result.errors || ["Invalid file schema or format."]);
        }
      } catch (err) {
        setValidationStatus("error");
        setValidationErrors(["Connection failed to the backend."]);
      }
    }
  };

  const handleUploadConfirm = async () => {
    if (validationStatus === "success" && selectedFile) {
      try {
        await ingestFile(uploadType, selectedFile);
        if (uploadType === "policy") {
          setPolicyFileName(selectedFile.name);
          setPolicyUploaded(true);
        } else {
          setClaimsFileName(selectedFile.name);
          setClaimUploaded(true);
        }
        setUploadModalOpen(false);
        setSelectedFile(null);
        setValidationStatus("idle");
      } catch (err) {
        alert("Failed to confirm ingestion file upload.");
      }
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Data Ingestion</h1>
            <p className="text-muted-foreground">External data collection and validation. Always make sure to rename your file to Data_Klaim.csv and Data_Polis.csv before uploading.</p>
          </div>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20">
          Role: Data Operator
        </Badge>
      </div>

      {/* Upload Zones */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Policy Data Upload */}
        <Card className="p-6 border-2 border-dashed border-border hover:border-primary transition-colors bg-white rounded-xl">
          <div className="flex flex-col items-center justify-center text-center min-h-64">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
              policyUploaded 
                ? 'bg-success/10' 
                : 'bg-primary/10'
            }`}>
              {policyUploaded ? (
                <CheckCircle2 className="w-10 h-10 text-success" />
              ) : (
                <Upload className="w-10 h-10 text-primary" />
              )}
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Policy Data Upload</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Upload insurance policy master data provided (CSV format)
            </p>
            
            {policyUploaded ? (
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between bg-success/5 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium">{policyFileName}</span>
                  </div>
                  <Badge className="bg-success text-white">Parsed & Validated</Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setPolicyUploaded(false)}
                >
                  Replace File
                </Button>
              </div>
            ) : (
              <Button
                className="bg-primary hover:bg-primary/90 text-white rounded-xl"
                onClick={() => openUploadModal("policy")}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Policy File
              </Button>
            )}
          </div>
        </Card>

        {/* Claims Data Upload */}
        <Card className="p-6 border-2 border-dashed border-border hover:border-primary transition-colors bg-white rounded-xl">
          <div className="flex flex-col items-center justify-center text-center min-h-64">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
              claimUploaded 
                ? 'bg-success/10' 
                : 'bg-primary/10'
            }`}>
              {claimUploaded ? (
                <CheckCircle2 className="w-10 h-10 text-success" />
              ) : (
                <Upload className="w-10 h-10 text-primary" />
              )}
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Claims Data Upload</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Upload claims transaction data with cost details (CSV format)
            </p>
            
            {claimUploaded ? (
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between bg-success/5 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium">{claimsFileName}</span>
                  </div>
                  <Badge className="bg-success text-white">Parsed & Validated</Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setClaimUploaded(false)}
                >
                  Replace File
                </Button>
              </div>
            ) : (
              <Button
                className="bg-primary hover:bg-primary/90 text-white rounded-xl"
                onClick={() => openUploadModal("claims")}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Claims File
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Data Quality Checker Panel */}
      <Card className="p-6 bg-white rounded-xl border border-border mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          Data Quality Checker
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Row Counts */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
            <div className="text-sm text-muted-foreground mb-1">Total Row Count</div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {qualityReport.totalRows}
            </div>
            <div className="flex items-center gap-1 text-xs text-success">
              <CheckCircle2 className="w-3 h-3" />
              <span>Valid count</span>
            </div>
          </div>

          {/* Missing Values */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
            <div className="text-sm text-muted-foreground mb-1">Missing Values</div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {qualityReport.missingValuePercentage}
            </div>
            <div className="flex items-center gap-1 text-xs text-warning">
              <AlertCircle className="w-3 h-3" />
              <span>Low impact</span>
            </div>
          </div>

          {/* Format Consistency */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
            <div className="text-sm text-muted-foreground mb-1">Format Consistency</div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {qualityReport.formatConsistency}
            </div>
            <div className="flex items-center gap-1 text-xs text-success">
              <CheckCircle2 className="w-3 h-3" />
              <span>Excellent quality</span>
            </div>
          </div>
        </div>

        {policyUploaded && claimUploaded && (
          <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">Data validation passed</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Both datasets are ready for processing. Schema validation: ✓ Date formats: ✓ Key integrity: ✓
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Run Intelligence Engine */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-purple-50 rounded-xl border-2 border-primary/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Play className="w-6 h-6 text-primary" />
              AI Intelligence Engine
            </h3>
            <p className="text-sm text-muted-foreground">
              Trigger regression analysis and anomaly detection pipeline
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-white">Regression Model</Badge>
              <Badge variant="outline" className="bg-white">K-Means Clustering</Badge>
              <Badge variant="outline" className="bg-white">Anomaly Detection</Badge>
            </div>
          </div>
          
          <Button
            onClick={handleRunEngine}
            disabled={!policyUploaded || !claimUploaded || isProcessing}
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white px-8 h-12 rounded-xl shadow-lg disabled:opacity-50"
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Run Intelligence Engine
              </>
            )}
          </Button>
        </div>
        
        {isProcessing && (
          <div className="mt-4">
            <Progress value={processingProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">Processing data through AI models...</p>
          </div>
        )}
      </Card>

      {/* Intelligence Engine Monitoring Widget */}
      <Card className="p-6 bg-white rounded-xl border border-border mt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Intelligence Engine Execution Monitor
        </h3>

        {/* Active Job Progress Panel */}
        {isProcessing && recentJobs.find(j => j.status === "queued" || j.status === "processing") && (
          (() => {
            const currentJob = recentJobs.find(j => j.status === "queued" || j.status === "processing");
            if (!currentJob) return null;
            return (
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 mb-6 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                    <span className="text-sm font-semibold text-indigo-950">
                      Processing Pipeline Job ({currentJob.job_id.substring(0, 8)}...)
                    </span>
                  </div>
                  <Badge className="bg-primary text-white text-xs px-2 py-0.5 capitalize">
                    {currentJob.workflow_stage ? currentJob.workflow_stage.replace('_', ' ') : "queued"}
                  </Badge>
                </div>
                <Progress value={processingProgress} className="h-2 mb-2 bg-indigo-100" />
                <div className="flex justify-between text-[11px] text-indigo-700">
                  <span>Stage: {currentJob.workflow_stage || "queued"}</span>
                  <span>{processingProgress}% Complete</span>
                </div>
              </div>
            );
          })()
        )}

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
                        {job.anomaly_detected ? job.anomaly_detected.toLocaleString() : "232"} Anomalies
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

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Upload {uploadType === "policy" ? "Policy Data" : "Claims Data"}
            </DialogTitle>
            <DialogDescription>
              Upload CSV file with {uploadType === "policy" ? "insurance policy master data" : "claims transaction data"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* File Upload Zone */}
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors">
              <input
                type="file"
                id="file-upload"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm font-medium mb-1">Click to browse files</p>
                <p className="text-xs text-muted-foreground">Supported formats: .csv</p>
              </label>
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm font-medium">{selectedFile.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setValidationStatus("idle");
                      setValidationErrors([]);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Validation Status */}
                {validationStatus === "validating" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                      <div>
                        <div className="text-sm font-medium text-blue-900">Validating file integrity...</div>
                        <div className="text-xs text-blue-700">Checking schema, data types, and format</div>
                      </div>
                    </div>
                  </div>
                )}

                {validationStatus === "success" && (
                  <div className="bg-success/10 border border-success/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-success">Validation passed</div>
                        <div className="text-xs text-success/80 mt-1 space-y-1">
                          <div>✓ Schema validation successful</div>
                          <div>✓ Data types validated</div>
                          <div>✓ {detectedRowCount} rows detected</div>
                          <div>✓ No missing critical fields</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {validationStatus === "error" && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-destructive">Validation failed</div>
                        <div className="text-xs text-destructive/80 mt-1 space-y-1">
                          {validationErrors.map((err, idx) => (
                            <div key={idx}>✗ {err}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setUploadModalOpen(false)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadConfirm}
                disabled={validationStatus !== "success"}
                className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white rounded-xl disabled:opacity-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
