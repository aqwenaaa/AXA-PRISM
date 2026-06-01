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
        ).eq("claim_id", claim_id).maybeSingle().execute()
        
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
            
        response = query.order("created_at", descending=True).range(offset, offset + limit - 1).execute()
        
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
        
        # Step 2: Insert into Audit Logs
        audit_payload = {
            "claim_id": claim_id,
            "auditor_id": auditor_id,
            "final_label": status,
            "auditor_notes": notes,
            "retrain_ai_flag": retrain_flag
        }
        response = self.client.table("audit_logs").insert(audit_payload).execute()
        return response.data[0] if response.data else {}

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
        formatted["final_risk_score"] = 0.0
        formatted["recommended_action"] = "no_action"
        
        if ml_data:
            # If standard list of items returned (sometimes Supabase nests inside a list)
            if isinstance(ml_data, list) and len(ml_data) > 0:
                ml_data = ml_data[0]
            
            if isinstance(ml_data, dict):
                formatted["expected_claim_cost"] = ml_data.get("expected_claim_cost")
                formatted["residual"] = ml_data.get("residual")
                formatted["anomaly_score"] = ml_data.get("anomaly_score")
                formatted["risk_cluster"] = ml_data.get("risk_cluster")
                formatted["cf_score"] = ml_data.get("cf_score")
                formatted["final_risk_score"] = float(ml_data.get("final_risk_score", 0.0) or 0.0)
                formatted["recommended_action"] = ml_data.get("recommended_action", "no_action")
                
        return formatted
