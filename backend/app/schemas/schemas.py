from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Health Schemas
class HealthStatus(BaseModel):
    status: str
    timestamp: str
    version: str
    services: Dict[str, str]

# User profile schemas
class UserProfile(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# Claims Schemas (Includes final_risk_score and recommended_action)
class ClaimRecord(BaseModel):
    claim_id: str
    policy_id: Optional[str] = None
    hospital_name: str
    diagnosis_code: str
    actual_claim_cost: float
    status: str
    uploaded_by: Optional[str] = None
    created_at: datetime
    
    # ML Outcomes (CTO Revisions 3 & 4)
    expected_claim_cost: Optional[float] = None
    residual: Optional[float] = None
    anomaly_score: Optional[float] = None
    risk_cluster: Optional[int] = None
    cf_score: Optional[float] = None
    final_risk_score: Optional[float] = 0.0
    recommended_action: Optional[str] = "no_action"

class ClaimAuditSubmit(BaseModel):
    claim_id: str
    status: str # valid, fraud, over_treatment
    auditor_notes: Optional[str] = None
    retrain_ai_flag: Optional[bool] = False

# Policies Schemas
class PolicyRecord(BaseModel):
    policy_id: str
    patient_id: str
    age: int
    sex: str
    bmi: float
    children: int
    smoker: bool
    region: str
    created_at: datetime

# Ingestion & Ingestion Log Schemas
class IngestionJob(BaseModel):
    id: str
    type: str # policy, claims
    filename: str
    rowCount: int
    status: str # completed, processing, failed
    timestamp: str

class DataQualityReport(BaseModel):
    totalRows: str
    missingValuePercentage: str
    formatConsistency: str
    keyIntegrityCheck: bool
    schemaValidation: bool
    dateFormatCheck: bool

# Prediction Jobs Schemas (Async-Ready)
class PredictRequest(BaseModel):
    claim_ids: List[str]

class PredictResponse(BaseModel):
    job_id: str
    status: str
    task_id: Optional[str] = None
    created_at: str

# Notification Schemas
class AppNotificationSchema(BaseModel):
    id: str
    type: str
    severity: str
    title: str
    message: str
    timestamp: str
    read: bool

# Settings Schemas (CTO Revision 5)
class CFWeights(BaseModel):
    age_weight: float = Field(default=0.2, ge=0.0, le=1.0)
    bmi_weight: float = Field(default=0.3, ge=0.0, le=1.0)
    smoker_weight: float = Field(default=0.5, ge=0.0, le=1.0)

class SystemSettingsSchema(BaseModel):
    cf_weights: CFWeights
    anomaly_threshold: int = Field(default=85, ge=50, le=100)

# Dashboard Response Schemas
class AdminDashboardResponse(BaseModel):
    system_status: str
    active_users: int
    data_quality_score: float
    model_version: str
    recent_activities: List[Dict[str, Any]]

class OperatorDashboardResponse(BaseModel):
    total_processed_rows: int
    missing_value_percentage: float
    format_consistency: float
    recent_jobs: List[IngestionJob]

class AnalystDashboardResponse(BaseModel):
    accuracy: float
    outlier_count: int
    claim_increase_percent: float
    risk_clusters: int
    scatter_data: List[Dict[str, Any]]
    feature_importance: List[Dict[str, Any]]

class AuditorDashboardResponse(BaseModel):
    pending_reviews: int
    avg_anomaly_score: float
    reviewed_today: int
    claims: List[ClaimRecord]

class ManagerDashboardResponse(BaseModel):
    total_claims_increase_pct: float
    predicted_savings: float
    high_risk_claims_pct: float
    model_confidence: float
    risk_tier_distribution: List[Dict[str, Any]]
    strategic_actions: List[Dict[str, Any]]
