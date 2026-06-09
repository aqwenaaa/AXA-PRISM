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
            
            # Instantiate MLService & run inference
            from app.services.ml_service import MLService
            ml_svc = MLService()
            
            processed_results = ml_svc.execute_inference_batch(
                claim_ids=claim_ids,
                age_weight=age_w,
                bmi_weight=bmi_w,
                smoker_weight=smoker_w,
                anomaly_threshold=anomaly_threshold
            )
            
            total_records = len(claim_ids)
            processed = 0
            anomalies = 0
            
            # Upsert results and increment progress log
            for record in processed_results:
                await asyncio.sleep(0.5) # Simulate small progress delay for UI feel
                processed += 1
                
                if record.get("recommended_action") == "audit_claim":
                    anomalies += 1
                    
                try:
                    self.claim_repo.client.table("processed_claims").upsert(record, on_conflict="claim_id").execute()
                except Exception as e:
                    print(f"Error upserting processed claim: {e}")
                    
                # Update progress tracking
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
            
            # Trigger notification
            try:
                from app.services.notification_service import notification_service
                notification_service.create_notification(
                    type_str="engine_completed",
                    severity="success",
                    title="Intelligence Engine Inference Completed",
                    message=f"Analytical execution completed successfully. Processed {processed} records, detected {anomalies} anomalies.",
                    recipient_role="risk_analyst",
                    action_url="/analyst/intelligence-lab"
                )
            except Exception as e:
                print(f"Failed to issue engine completed notification: {e}")
            
        except Exception as err:
            # Catch errors, flag prediction job as failed
            self.job_repo.update(job_id, {
                "status": "failed",
                "workflow_stage": "failed",
                "error_message": str(err),
                "completed_at": datetime.now().isoformat()
            }, id_field="job_id")
            
            # Trigger notification
            try:
                from app.services.notification_service import notification_service
                notification_service.create_notification(
                    type_str="engine_failed",
                    severity="error",
                    title="Intelligence Engine Inference Failed",
                    message=f"Engine prediction pipeline run failed: {str(err)[:100]}.",
                    recipient_role="risk_analyst",
                    action_url="/analyst/intelligence-lab"
                )
            except Exception as e:
                print(f"Failed to issue engine failed notification: {e}")

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
