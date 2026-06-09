import asyncio
import csv
import io
import uuid
from typing import Dict, Any, List
from datetime import datetime
from app.repositories.prediction import PredictionJobRepository
from app.repositories.claim import ClaimRepository
from app.repositories.policy import PolicyRepository
from app.repositories.settings import SystemSettingsRepository
import pandas as pd


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

    def execute_prediction_pipeline(self, job_id: str, claim_ids: List[str]):
        """
        Runs the async predict pipeline, updating prediction_jobs stats periodically.
        """
        import time
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
                time.sleep(0.5) # Simulate small progress delay for UI feel
                processed += 1
                
                if record.get("recommended_action") == "audit_claim":
                    anomalies += 1
                    
                try:
                    db_record = {
                        k: v for k, v in record.items()
                        if k in [
                            "claim_id", "expected_claim_cost", "residual",
                            "anomaly_score", "risk_cluster", "cf_score",
                            "final_risk_score", "recommended_action"
                        ]
                    }
                    print(f"[Upsert Processed Claim] ID: {db_record.get('claim_id')}, "
                          f"Expected Cost: {db_record.get('expected_claim_cost')}, "
                          f"Anomaly Score: {db_record.get('anomaly_score')}, "
                          f"Risk Cluster: {db_record.get('risk_cluster')}, "
                          f"Final Risk Score: {db_record.get('final_risk_score')}")
                    self.claim_repo.client.table("processed_claims").upsert(db_record, on_conflict="claim_id").execute()
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
            import traceback
            tb_str = traceback.format_exc()
            print(f"Prediction pipeline execution failed:\n{tb_str}")
            # Catch errors, flag prediction job as failed
            self.job_repo.update(job_id, {
                "status": "failed",
                "workflow_stage": "failed",
                "error_message": tb_str,
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
        Parses CSV contents, validates schema, writes domain records, and logs ingestion.
        """
        rows = self._read_csv_rows(content)
        header = list(rows[0].keys()) if rows else []
        

        if file_type == "policy":
            records = self._map_policy_rows(rows)
            records_written = self.policy_repo.bulk_upsert(records)
        elif file_type == "claims":
            records = self._map_claim_rows(rows, processed_by)
            policy_numbers = [record["policy_number"] for record in records if record.get("policy_number")]
            existing_policy_numbers = self.claim_repo.existing_policy_numbers(policy_numbers)
            missing_policy_numbers = sorted(set(policy_numbers) - existing_policy_numbers)
            if missing_policy_numbers:
                preview = ", ".join(missing_policy_numbers[:10])
                raise ValueError(f"Claims upload contains unknown policy_number values: {preview}")
            records_written = self.claim_repo.bulk_upsert(records)
        else:
            raise ValueError(f"Unsupported ingestion file_type: {file_type}")
        
        # Log Ingestion activity
        log_payload = {
            "file_name": filename,
            "file_type": file_type,
            "records_processed": records_written,
            "records_failed": 0,
            "status": "completed",
            "processed_by": processed_by,
            "completed_at": datetime.now().isoformat()
        }
        
        self.claim_repo.client.table("data_ingestion_logs").insert(log_payload).execute()
        
        return {
            "success": True,
            "file_name": filename,
            "rows_detected": records_written,
            "columns": header
        }
        

    def _read_csv_rows(self, content: str) -> List[Dict[str, str]]:
        stream = io.StringIO(content.lstrip("\ufeff"))
        reader = csv.DictReader(stream)
        if not reader.fieldnames:
            raise ValueError("CSV file is empty or missing a header row.")

        rows = []
        for row in reader:
            if any((value or "").strip() for value in row.values()):
                rows.append({(key or "").strip(): (value or "").strip() for key, value in row.items()})

        if not rows:
            raise ValueError("CSV file does not contain any data rows.")
        return rows

    def _require_columns(self, rows: List[Dict[str, str]], required_columns: List[str]) -> None:
        available = set(rows[0].keys()) if rows else set()
        missing = [column for column in required_columns if column not in available]
        if missing:
            raise ValueError(f"CSV schema mismatch. Missing columns: {', '.join(missing)}")

    def _parse_date(self, value: str) -> str:
        raw = (value or "").strip()
        if not raw:
            raise ValueError("Date value is required.")

        for fmt in ("%Y%m%d", "%m/%d/%Y", "%Y-%m-%d", "%d/%m/%Y"):
            try:
                return datetime.strptime(raw, fmt).date().isoformat()
            except ValueError:
                continue
        raise ValueError(f"Unsupported date format: {raw}")

    def _parse_number(self, value: str) -> float:
        raw = (value or "").strip().replace(",", "")
        if not raw:
            return 0.0
        return float(raw)

    def _map_policy_rows(self, rows: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        self._require_columns(rows, [
            "Nomor Polis",
            "Plan Code",
            "Gender",
            "Tanggal Lahir",
            "Tanggal Efektif Polis",
            "Domisili",
        ])

        mapped = []
        for idx, row in enumerate(rows, start=2):
            policy_number = row["Nomor Polis"].strip()
            if not policy_number:
                raise ValueError(f"Missing policy number at CSV row {idx}.")

            mapped.append({
                "policy_number": policy_number,
                "plan_code": row["Plan Code"].strip(),
                "gender": row["Gender"].strip(),
                "birth_date": self._parse_date(row["Tanggal Lahir"]),
                "effective_date": self._parse_date(row["Tanggal Efektif Polis"]),
                "domicile": row["Domisili"].strip(),
            })
        return mapped

    def _map_claim_rows(self, rows: List[Dict[str, str]], uploaded_by: str) -> List[Dict[str, Any]]:
        self._require_columns(rows, [
            "Claim ID",
            "Nomor Polis",
            "Reimburse/Cashless",
            "Inpatient/Outpatient",
            "ICD Diagnosis",
            "ICD Description",
            "Tanggal Pembayaran Klaim",
            "Tanggal Pasien Masuk RS",
            "Tanggal Pasien Keluar RS",
            "Nominal Klaim Yang Disetujui",
            "Nominal Biaya RS Yang Terjadi",
            "Lokasi RS",
        ])

        mapped = []
        for idx, row in enumerate(rows, start=2):
            claim_id = row["Claim ID"].strip()
            policy_number = row["Nomor Polis"].strip()
            if not claim_id:
                raise ValueError(f"Missing claim_id at CSV row {idx}.")
            if not policy_number:
                raise ValueError(f"Missing policy_number at CSV row {idx}.")

            mapped.append({
                "claim_id": claim_id,
                "policy_number": policy_number,
                "claim_type": row["Reimburse/Cashless"].strip(),
                "patient_type": row["Inpatient/Outpatient"].strip(),
                "icd_diagnosis": row["ICD Diagnosis"].strip(),
                "icd_description": row["ICD Description"].strip(),
                "payment_date": self._parse_date(row["Tanggal Pembayaran Klaim"]),
                "admission_date": self._parse_date(row["Tanggal Pasien Masuk RS"]),
                "discharge_date": self._parse_date(row["Tanggal Pasien Keluar RS"]),
                "approved_claim_cost": self._parse_number(row["Nominal Klaim Yang Disetujui"]),
                "hospital_cost": self._parse_number(row["Nominal Biaya RS Yang Terjadi"]),
                "hospital_location": row["Lokasi RS"].strip(),
                "status": "pending",
                "uploaded_by": uploaded_by,
            })
        return mapped
