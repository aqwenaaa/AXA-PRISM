"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Play, Database, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";

export default function DataIngestionPage() {
  const [policyUploaded, setPolicyUploaded] = useState(false);
  const [claimUploaded, setClaimUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"policy" | "claims">("policy");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationStatus, setValidationStatus] = useState<"idle" | "validating" | "success" | "error">("idle");

  const handleRunEngine = () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => setIsProcessing(false), 3000);
  };

  const openUploadModal = (type: "policy" | "claims") => {
    setUploadType(type);
    setUploadModalOpen(true);
    setSelectedFile(null);
    setValidationStatus("idle");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValidationStatus("validating");

      // Simulate file validation
      setTimeout(() => {
        const isValid = file.name.endsWith('.csv') || file.name.endsWith('.xlsx');
        setValidationStatus(isValid ? "success" : "error");
      }, 1500);
    }
  };

  const handleUploadConfirm = () => {
    if (validationStatus === "success" && selectedFile) {
      if (uploadType === "policy") {
        setPolicyUploaded(true);
      } else {
        setClaimUploaded(true);
      }
      setUploadModalOpen(false);
      setSelectedFile(null);
      setValidationStatus("idle");
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
            <h1 className="text-3xl font-bold text-foreground">Data Ingestion (Hulu)</h1>
            <p className="text-muted-foreground">External data collection and validation</p>
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
              Upload insurance policy master data (CSV, Excel, or JSON format)
            </p>
            
            {policyUploaded ? (
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between bg-success/5 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium">policy_data_2026.csv</span>
                  </div>
                  <Badge className="bg-success text-white">45,230 rows</Badge>
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
              Upload claims transaction data with cost details
            </p>
            
            {claimUploaded ? (
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between bg-success/5 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium">claims_data_2026.csv</span>
                  </div>
                  <Badge className="bg-success text-white">128,456 rows</Badge>
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
              {policyUploaded && claimUploaded ? "173,686" : "0"}
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
              {policyUploaded && claimUploaded ? "2.3%" : "0%"}
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
              {policyUploaded && claimUploaded ? "98.7%" : "0%"}
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
            <Progress value={66} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">Processing data through AI models...</p>
          </div>
        )}
      </Card>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Upload {uploadType === "policy" ? "Policy Data" : "Claims Data"}
            </DialogTitle>
            <DialogDescription>
              Upload CSV or Excel file with {uploadType === "policy" ? "insurance policy master data" : "claims transaction data"}
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
                <p className="text-xs text-muted-foreground">Supported formats: CSV, Excel (.xlsx, .xls)</p>
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
                          <div>✓ {uploadType === "policy" ? "45,230" : "128,456"} rows detected</div>
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
                        <div className="text-xs text-destructive/80 mt-1">
                          Invalid file format. Please upload CSV or Excel file.
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
