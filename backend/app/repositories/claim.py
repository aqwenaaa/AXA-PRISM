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

    def submit_audit_log(self, claim_id: str, auditor_id: str, status: str, notes: str, retrain_flag: bool) -> Dict[str, Any]:
        """
        Inserts an audit verification record and updates the main claim status.
        """
        # Step 1: Update Claims status
        self.update(claim_id, {"status": status}, id_field="claim_id")
        
        # Step 2: Insert into Audit Logs (using audit_logs table or audit_feedback if table is named differently)
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
                
                # Dynamic mappings avoiding database schema alterations (Constraint 2)
                if anomaly is not None:
                    anomaly_f = float(anomaly)
                    formatted["final_risk_score"] = anomaly_f
                    formatted["recommended_action"] = "audit_claim" if anomaly_f > 0.5 else "approve"
                
        return formatted
