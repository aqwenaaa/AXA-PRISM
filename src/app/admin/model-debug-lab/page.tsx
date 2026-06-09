"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Plus,
  Zap,
  Check,
  X,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  Globe,
  Code2,
  Lock,
  AlertTriangle,
  Save,
  FlaskConical,
  Server,
  Shield,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
// import { UserRole, ROLE_CONFIG } from "@/lib/types";
// import { useNotifications } from "@/lib/notifications/notification-context";

type ModelStatus = "active" | "inactive" | "testing" | "error";
type ModelCategory = "anomaly_detection" | "clustering" | "regression" | "classification" | "nlp";

interface AIModel {
  id: string;
  name: string;
  version: string;
  category: ModelCategory;
  endpoint: string;
  status: ModelStatus;
  accuracy: number;
  // assignedRoles: Exclude<UserRole, "admin">[];
  createdAt: string;
  lastTested?: string;
  latency?: number;
}

const INITIAL_MODELS: AIModel[] = [
  {
    id: "mdl-01",
    name: "PRISM Isolation Forest",
    version: "v2.4.3",
    category: "anomaly_detection",
    endpoint: "https://api.prism-ai.internal/v1/models/iso-forest",
    status: "active",
    accuracy: 96.4,
    // assignedRoles: ["risk_analyst", "medical_auditor"],
    createdAt: "2026-01-15",
    lastTested: "2026-05-19 14:22",
    latency: 42,
  },
  {
    id: "mdl-02",
    name: "Claim Cost Regressor",
    version: "v1.1.0",
    category: "regression",
    endpoint: "https://api.prism-ai.internal/v1/models/cost-predict",
    status: "testing",
    accuracy: 91.2,
    // assignedRoles: ["strategic_manager"],
    createdAt: "2026-03-10",
    lastTested: "2026-05-19 16:05",
    latency: 118,
  },
  {
    id: "mdl-03",
    name: "ICD-10 Auto Coder",
    version: "v3.0.2",
    category: "nlp",
    endpoint: "https://api.prism-ai.internal/v1/models/nlp-icd10",
    status: "error",
    accuracy: 88.7,
    // assignedRoles: ["data_operator", "medical_auditor"],
    createdAt: "2025-11-02",
    lastTested: "2026-05-20 09:11",
    latency: 0,
  },
];

export default function ModelDebugPage() {
  const [models, setModels] = useState<AIModel[]>(INITIAL_MODELS);
  const [showAddForm, setShowAddForm] = useState(false);
  // const { addNotification } = useNotifications();

  const [name, setName] = useState("");
  const [version, setVersion] = useState("v1.0.0");
  const [category, setCategory] = useState<ModelCategory>("anomaly_detection");
  const [endpoint, setEndpoint] = useState("");
  // const [selectedRoles, setSelectedRoles] = useState<Exclude<UserRole, "admin">[]>([]);

  const [testingId, setTestingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // const toggleRole = (role: UserRole) => {
  //   if (role === "admin") return;
  //   setSelectedRoles((prev) =>
  //     prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
  //   );
  // };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // if (!name || !endpoint) {
    //   addNotification?.("error", "Validation Error", "Please fill out all required fields.");
    //   return;
    // }

    const newModel: AIModel = {
      id: `mdl-${Math.random().toString(36).substr(2, 9)}`,
      name,
      version,
      category,
      endpoint,
      status: "inactive",
      accuracy: 90.0 + Math.random() * 8,
      // assignedRoles: selectedRoles,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setModels([newModel, ...models]);
    // addNotification?.("success", "Model Registered", `${name} has been added to the lab.`);
    setName("");
    setVersion("v1.0.0");
    setEndpoint("");
    // setSelectedRoles([]);
    setShowAddForm(false);
  };

  const handleTestConnection = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setModels((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const isSuccessful = Math.random() > 0.2;
          return {
            ...m,
            status: isSuccessful ? "active" : "error",
            latency: isSuccessful ? Math.floor(30 + Math.random() * 90) : 0,
            lastTested: new Date().toISOString().replace("T", " ").substring(0, 16),
          };
        })
      );
      setTestingId(null);
      // addNotification?.("info", "Ping Complete", "Model deployment endpoints health-checked.");
    }, 1200);
  };

  const toggleModelStatus = (id: string) => {
    setModels((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        return { ...m, status: m.status === "active" ? "inactive" : "active" };
      })
    );
  };

  const handleDelete = (id: string) => {
    setModels(models.filter((m) => m.id !== id));
    setDeleteConfirm(null);
    // addNotification?.("success", "Model Deleted", "Endpoint configuration removed permanently.");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Model Lab</h1>
            <p className="text-muted-foreground text-sm">
              Register, debug, and enforce RBAC deployment for prediction endpoints
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="rounded-xl h-11">
          {showAddForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showAddForm ? "Cancel Registration" : "Register Endpoint"}
        </Button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className="p-6 bg-white border border-border shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                New Model Endpoint Registration
              </h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Model Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Risk Predictor Forest" className="w-full h-10 px-3 bg-secondary/20 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Version tag</label>
                    <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} className="w-full h-10 px-3 bg-secondary/20 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mathematical Task</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value as ModelCategory)} className="w-full h-10 px-3 bg-secondary/20 rounded-lg border border-border text-sm focus:outline-none focus:border-primary">
                      <option value="anomaly_detection">Anomaly Detection</option>
                      <option value="clustering">Clustering / Isolation</option>
                      <option value="regression">Regression (Cost Target)</option>
                      <option value="classification">Classification</option>
                      <option value="nlp">Natural Language Processing (NLP)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">FastAPI Endpoint URL *</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <input type="url" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://api.prism-ai.internal/v1/models/..." className="w-full h-10 pl-9 pr-3 bg-secondary/20 rounded-lg border border-border text-sm focus:outline-none focus:border-primary" />
                  </div>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-500" />
                    Role Deployment Access (RBAC Enforced)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ROLE_CONFIG).map(([roleKey, config]) => {
                      const isAdmin = roleKey === "admin";
                      const isSelected = selectedRoles.includes(roleKey as any);
                      return (
                        <button
                          key={roleKey}
                          type="button"
                          disabled={isAdmin}
                          onClick={() => toggleRole(roleKey as UserRole)}
                          className={`px-4 py-2 rounded-xl text-xs border font-medium flex items-center gap-2 transition-all ${
                            isAdmin ? "bg-secondary/45 text-muted-foreground border-dashed border-border cursor-not-allowed" : isSelected ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary/50"
                          }`}
                        >
                          {isAdmin ? <Shield className="w-3.5 h-3.5" /> : isSelected ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground" />}
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div> */}
                <div className="pt-2">
                  <Button type="submit"><Save className="w-4 h-4 mr-2" />Save Configuration</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {models.map((model) => (
          <Card key={model.id} className="p-6 bg-white border border-border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-foreground">{model.name}</h3>
                <Badge variant="outline" className="font-mono">{model.version}</Badge>
                <Badge variant="secondary" className="uppercase text-[10px]">{model.category.replace("_", " ")}</Badge>
              </div>

              <div className="font-mono text-xs text-muted-foreground bg-secondary/40 p-2 rounded-lg flex items-center gap-2 max-w-2xl overflow-x-auto">
                <Code2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{model.endpoint}</span>
              </div>

              {/* <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs text-muted-foreground mr-1">Bound Scopes:</span>
                {model.assignedRoles.length === 0 ? (
                  <span className="text-xs text-amber-600 italic">No roles assigned</span>
                ) : (
                  model.assignedRoles.map((role) => (
                    <Badge key={role} className="bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200">
                      {ROLE_CONFIG[role]?.label}
                    </Badge>
                  ))
                )}
              </div> */}
            </div>

            <div className="flex flex-wrap items-center gap-8 border-t lg:border-t-0 pt-4 lg:pt-0 border-border">
              <div className="text-left space-y-1">
                <div className="text-xs text-muted-foreground">Accuracy Metric</div>
                <div className="text-xl font-bold text-foreground">{model.accuracy.toFixed(1)}%</div>
              </div>
              <div className="text-left space-y-1">
                <div className="text-xs text-muted-foreground">Network Latency</div>
                <div className="text-sm font-semibold font-mono text-foreground">{model.status === "active" || model.status === "testing" ? `${model.latency} ms` : "—"}</div>
              </div>
              <div className="min-w-28">
                <div className="text-xs text-muted-foreground mb-1">Status</div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${model.status === "active" ? "bg-emerald-500 animate-pulse" : model.status === "testing" ? "bg-amber-500 animate-pulse" : model.status === "error" ? "bg-destructive" : "bg-gray-400"}`} />
                  <span className="text-sm font-medium capitalize text-foreground">{model.status}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={testingId === model.id} onClick={() => handleTestConnection(model.id)} className="h-9 text-xs">
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${testingId === model.id ? "animate-spin" : ""}`} /> Ping
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleModelStatus(model.id)} className="h-9 text-xs">
                  {model.status === "active" ? <><Pause className="w-3.5 h-3.5 mr-1.5" />Halt</> : <><Play className="w-3.5 h-3.5 mr-1.5" />Deploy</>}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(model.id)} className="border-destructive/20 text-destructive hover:bg-destructive/5 h-9"><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl border border-border p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4"><AlertTriangle className="w-7 h-7 text-destructive" /></div>
                <h3 className="font-semibold text-foreground mb-1">Delete Model</h3>
                <p className="text-sm text-muted-foreground mb-6">This will permanently remove the model endpoint and revoke role access maps.</p>
                <div className="flex gap-3 w-full">
                  <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl">Cancel</Button>
                  <Button onClick={() => handleDelete(deleteConfirm)} className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-white"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}