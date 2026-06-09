from app.repositories.base import BaseRepository
from typing import List, Dict, Any, Optional

class ClaimRepository(BaseRepository):
    def __init__(self):
        super().__init__("claims")

    def get_claim_with_ml(self, claim_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves claim data joined with ML processing outcomes (processed_claims).
        """
        response = self.client.table("claims").select(
            "*, processed_claims:processed_claims(*)"
        ).eq("claim_id", claim_id).maybe_single().execute()
        
        if not response.data:
            return None
            
        return self._format_claim_join(response.data)

    def list_claims_with_ml(self, status: Optional[str] = None, limit: int = 100, page: int = 1) -> List[Dict[str, Any]]:
        """
        Lists paginated claims joined with ML attributes.
        """
        offset = (page - 1) * limit
        query = self.client.table("claims").select("*, processed_claims:processed_claims(*)")
        
        if status:
            query = query.eq("status", status)
            
        response = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        formatted_list = []
        for raw_claim in (response.data or []):
            formatted_list.append(self._format_claim_join(raw_claim))
            
        return formatted_list

    def count_claims(self, status: Optional[str] = None) -> int:
        query = self.client.table("claims").select("claim_id", count="exact")
        if status:
            query = query.eq("status", status)
        response = query.execute()
        return response.count or 0

    def bulk_upsert(self, claims: List[Dict[str, Any]]) -> int:
        if not claims:
            return 0
        written = 0
        for idx in range(0, len(claims), 500):
            batch = claims[idx:idx + 500]
            response = self.client.table("claims").upsert(
                batch,
                on_conflict="claim_id"
            ).execute()
            written += len(response.data or batch)
        return written

    def existing_policy_numbers(self, policy_numbers: List[str]) -> set[str]:
        if not policy_numbers:
            return set()

        found: set[str] = set()
        unique_numbers = sorted({p for p in policy_numbers if p})
        for idx in range(0, len(unique_numbers), 500):
            chunk = unique_numbers[idx:idx + 500]
            response = self.client.table("policies").select("policy_number").in_("policy_number", chunk).execute()
            found.update(row["policy_number"] for row in (response.data or []) if row.get("policy_number"))
        return found

    def submit_audit_log(self, claim_id: str, auditor_id: str, status: str, notes: str, retrain_flag: bool) -> Dict[str, Any]:
        """
        Inserts an audit verification record and updates the main claim status.
        """
        # Step 1: Update Claims status
        self.update(claim_id, {"status": status}, id_field="claim_id")

        # Step 2: Store the human review state in claim_reviews.
        review_payload = {
            "claim_id": claim_id,
            "reviewer_id": auditor_id,
            "notes": notes,
            "suggested_status": status
        }
        self.client.table("claim_reviews").upsert(review_payload, on_conflict="claim_id").execute()

        # Step 3: Insert immutable audit outcome into audit_logs.
        audit_payload = {
            "claim_id": claim_id,
            "auditor_id": auditor_id,
            "final_label": status,
            "auditor_notes": notes,
            "retrain_ai_flag": retrain_flag
        }
        
        # Safe fallback trigger for different audit logging setups
        try:
            response = self.client.table("audit_logs").insert(audit_payload).execute()
            return response.data[0] if response.data else {}
        except Exception:
            # Fallback to alternative setup if named audit_feedback
            try:
                feedback_payload = {
                    "claim_id": claim_id,
                    "auditor_id": auditor_id,
                    "status": status,
                    "notes": notes,
                    "retrain_ai": retrain_flag
                }
                response = self.client.table("audit_feedback").insert(feedback_payload).execute()
                return response.data[0] if response.data else {}
            except Exception as err:
                print(f"Failed to write to audit feedback tables: {err}")
                return {}

    def _format_claim_join(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """
        Utility mapper flattening nested processed_claims attributes.
        """
        formatted = dict(raw)
        ml_data = formatted.pop("processed_claims", None)
        
        # Default empty values
        formatted["expected_claim_cost"] = None
        formatted["residual"] = None
        formatted["anomaly_score"] = None
        formatted["risk_cluster"] = None
        formatted["cf_score"] = None
        
        # Dynamic calculations as requested by the CTO (Revision 3 & 4)
        formatted["final_risk_score"] = 0.0
        formatted["recommended_action"] = "approve"
        
        if ml_data:
            # If standard list of items returned (sometimes Supabase nests inside a list)
            if isinstance(ml_data, list) and len(ml_data) > 0:
                ml_data = ml_data[0]
            
            if isinstance(ml_data, dict):
                formatted["expected_claim_cost"] = ml_data.get("expected_claim_cost")
                formatted["residual"] = ml_data.get("residual")
                
                anomaly = ml_data.get("anomaly_score")
                formatted["anomaly_score"] = anomaly
                formatted["risk_cluster"] = ml_data.get("risk_cluster")
                formatted["cf_score"] = ml_data.get("cf_score")
                
                # Dynamic mappings prioritizing database columns
                db_final_risk = ml_data.get("final_risk_score")
                db_rec_action = ml_data.get("recommended_action")
                
                if db_final_risk is not None:
                    formatted["final_risk_score"] = float(db_final_risk)
                elif anomaly is not None:
                    formatted["final_risk_score"] = float(anomaly)
                    
                if db_rec_action is not None:
                    formatted["recommended_action"] = db_rec_action
                elif anomaly is not None:
                    formatted["recommended_action"] = "audit_claim" if float(anomaly) > 0.5 else "approve"
                
        return formatted

