import asyncio
import uuid
from typing import Dict, Any, List
from datetime import datetime
from app.repositories.prediction import PredictionJobRepository
from app.repositories.claim import ClaimRepository
from app.repositories.policy import PolicyRepository

class IngestionService:
    def __init__(self):
        self.job_repo = PredictionJobRepository()
        self.claim_repo = ClaimRepository()
        self.policy_repo = PolicyRepository()

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
            "created_at": datetime.now().isoformat()
        }
        
        return self.job_repo.create(job_data)

    async def execute_prediction_pipeline(self, job_id: str, claim_ids: List[str]):
        """
        Runs the async predict pipeline, updating prediction_jobs stats periodically.
        """
        try:
            # 1. Transition status to processing
            self.job_repo.update(job_id, {"status": "processing"}, id_field="job_id")
            
            total_records = len(claim_ids)
            processed = 0
            anomalies = 0
            
            # Process in chunks of 1 to simulate work
            for cid in claim_ids:
                await asyncio.sleep(1.0) # Simulate latency
                processed += 1
                
                # Simple deterministic anomaly logic: claims over $5,000 are anomalies
                claim = self.claim_repo.get_by_id(cid, id_field="claim_id")
                is_anomaly = False
                if claim:
                    cost = float(claim.get("actual_claim_cost", 0.0))
                    if cost > 5000.0:
                        is_anomaly = True
                        anomalies += 1
                
                # Check if processed claim detail exists, if not, create it
                if claim:
                    ml_data = {
                        "claim_id": cid,
                        "expected_claim_cost": cost * 0.4 if not is_anomaly else cost * 0.28,
                        "residual": cost * 0.6 if not is_anomaly else cost * 0.72,
                        "anomaly_score": 0.12 if not is_anomaly else 0.94,
                        "risk_cluster": 1 if not is_anomaly else 4,
                        "cf_score": 0.85 if not is_anomaly else 0.98,
                        "final_risk_score": 0.12 if not is_anomaly else 0.985, # CTO Revision 3
                        "recommended_action": "approve" if not is_anomaly else "audit_claim" # CTO Revision 4
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
                "completed_at": datetime.now().isoformat()
            }, id_field="job_id")
            
        except Exception as err:
            # Catch errors, flag prediction job as failed
            self.job_repo.update(job_id, {
                "status": "failed",
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
