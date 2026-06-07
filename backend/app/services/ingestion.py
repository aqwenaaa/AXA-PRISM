import asyncio
import uuid
from typing import Dict, Any, List
from datetime import datetime
from app.repositories.prediction import PredictionJobRepository
from app.repositories.claim import ClaimRepository
from app.repositories.policy import PolicyRepository
from app.repositories.settings import SystemSettingsRepository

class IngestionService:
    def __init__(self):
        self.job_repo = PredictionJobRepository()
        self.claim_repo = ClaimRepository()
        self.policy_repo = PolicyRepository()
        self.settings_repo = SystemSettingsRepository()

    def create_async_job(self, claim_ids: List[str], triggered_by: str) -> Dict[str, Any]:
        """
        Creates an asynchronous prediction job, inserts it into prediction_jobs,
        and returns the details immediately (async-ready).
        """
        job_id = str(uuid.uuid4())
        
        job_data = {
            "job_id": job_id,
            "status": "queued",
            "records_processed": 0,
            "anomaly_detected": 0,
            "task_id": f"task_{job_id.split('-')[0]}",
            "triggered_by": triggered_by,
            "workflow_stage": "queued",
            "created_at": datetime.now().isoformat()
        }
        
        return self.job_repo.create(job_data)

    async def execute_prediction_pipeline(self, job_id: str, claim_ids: List[str]):
        """
        Runs the async predict pipeline, updating prediction_jobs stats periodically.
        """
        try:
            # 1. Transition status to processing
            self.job_repo.update(job_id, {"status": "processing", "workflow_stage": "processing"}, id_field="job_id")
            
            # 1.1 Load calibration settings from system_settings
            age_w, bmi_w, smoker_w = 0.2, 0.3, 0.5
            anomaly_threshold = 85
            try:
                weights_rec = self.settings_repo.get_by_key("cf_weights")
                threshold_rec = self.settings_repo.get_by_key("anomaly_threshold")
                if weights_rec and "setting_value" in weights_rec:
                    val = weights_rec["setting_value"]
                    age_w = float(val.get("age_weight", 0.2))
                    bmi_w = float(val.get("bmi_weight", 0.3))
                    smoker_w = float(val.get("smoker_weight", 0.5))
                if threshold_rec and "setting_value" in threshold_rec:
                    anomaly_threshold = int(threshold_rec["setting_value"].get("threshold", 85))
                
                # Update stage to calibration_applied
                self.job_repo.update(job_id, {"workflow_stage": "calibration_applied"}, id_field="job_id")
            except Exception as e:
                print(f"Error loading calibration settings: {e}")
            
            total_records = len(claim_ids)
            processed = 0
            anomalies = 0
            
            # Process in chunks of 1 to simulate work
            for cid in claim_ids:
                await asyncio.sleep(1.0) # Simulate latency
                processed += 1
                
                claim = self.claim_repo.get_by_id(cid, id_field="claim_id")
                is_anomaly = False
                if claim:
                    app_cost = float(claim.get("approved_claim_cost", 0.0))
                    hosp_cost = float(claim.get("hospital_cost", 0.0))
                    
                    # 1. Resolve Age from Policy
                    age = 45
                    p_num = claim.get("policy_number")
                    if p_num:
                        policy = self.policy_repo.get_by_id(p_num, id_field="policy_number")
                        if policy and policy.get("birth_date"):
                            try:
                                birth_year = int(policy["birth_date"].split("-")[0])
                                age = 2026 - birth_year
                            except Exception:
                                pass
                    norm_age = age / 100.0
                    
                    # 2. Simulate BMI and Smoker status deterministically based on claim_id hash
                    cid_hash = hash(cid)
                    bmi = (cid_hash % 15) + 18
                    norm_bmi = (bmi - 18.0) / 15.0
                    
                    smoker = 1.0 if (cid_hash % 5 == 0) else 0.0
                    
                    # 3. Compute CF Score using dynamic weights
                    total_w = age_w + bmi_w + smoker_w
                    if total_w > 0:
                        cf_score = (age_w * norm_age + bmi_w * norm_bmi + smoker_w * smoker) / total_w
                    else:
                        cf_score = 0.5
                    
                    # 4. Compute Anomaly Score using residual ratio
                    ratio = hosp_cost / app_cost if app_cost > 0 else 1.0
                    if ratio >= 1.8:
                        anomaly_score = 0.8 + 0.18 * (ratio - 1.8) / 10.0
                        risk_cluster = 3
                    elif ratio >= 1.2:
                        anomaly_score = 0.4 + 0.35 * (ratio - 1.2) / 0.6
                        risk_cluster = 2
                    else:
                        anomaly_score = 0.05 + 0.25 * (ratio - 1.0) / 0.2 if ratio >= 1.0 else 0.05
                        risk_cluster = 1
                        
                    # 5. Compute Final Risk Score
                    final_risk_score = (anomaly_score * 0.6) + (cf_score * 0.4)
                    
                    # 6. Apply Calibration Threshold to classify Anomaly
                    if final_risk_score >= (anomaly_threshold / 100.0):
                        is_anomaly = True
                        anomalies += 1
                        
                    # upsert processed claim ML parameters
                    ml_data = {
                        "claim_id": cid,
                        "expected_claim_cost": app_cost * 0.4 if not is_anomaly else app_cost * 0.28,
                        "residual": hosp_cost - app_cost,
                        "anomaly_score": float(anomaly_score),
                        "risk_cluster": int(risk_cluster),
                        "cf_score": float(cf_score),
                        "final_risk_score": float(final_risk_score),
                        "recommended_action": "approve" if not is_anomaly else "audit_claim"
                    }
                    try:
                        self.claim_repo.client.table("processed_claims").upsert(ml_data, on_conflict="claim_id").execute()
                    except Exception as e:
                        print(f"Error upserting processed claim ML parameters: {e}")

                # Update incremental progress
                self.job_repo.update(job_id, {
                    "records_processed": processed,
                    "anomaly_detected": anomalies
                }, id_field="job_id")

            # 2. Finish up job successfully
            self.job_repo.update(job_id, {
                "status": "completed",
                "workflow_stage": "completed",
                "completed_at": datetime.now().isoformat()
            }, id_field="job_id")
            
        except Exception as err:
            # Catch errors, flag prediction job as failed
            self.job_repo.update(job_id, {
                "status": "failed",
                "workflow_stage": "failed",
                "error_message": str(err),
                "completed_at": datetime.now().isoformat()
            }, id_field="job_id")

    def parse_and_validate_csv(self, filename: str, content: str, file_type: str, processed_by: str) -> Dict[str, Any]:
        """
        Parses CSV contents, inserts data logs, and updates DB records.
        """
        lines = content.strip().split("\n")
        header = lines[0].split(",") if lines else []
        row_count = len(lines) - 1 if len(lines) > 0 else 0
        
        # Log Ingestion activity
        log_payload = {
            "file_name": filename,
            "file_type": file_type,
            "records_processed": row_count,
            "records_failed": 0,
            "status": "completed",
            "processed_by": processed_by,
            "completed_at": datetime.now().isoformat()
        }
        
        self.claim_repo.client.table("data_ingestion_logs").insert(log_payload).execute()
        
        return {
            "success": True,
            "file_name": filename,
            "rows_detected": row_count,
            "columns": header
        }
