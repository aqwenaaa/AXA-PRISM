from fastapi import APIRouter, Depends, HTTPException, status
from app.middleware.auth import get_current_user, RoleChecker
from app.repositories.base import BaseRepository
from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()

class RecommendationActionPayload(BaseModel):
    action: str # approve, reject, modify
    priority: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    reasoning: Optional[str] = None
    notes: Optional[str] = None

class StrategicRecommendationRepository(BaseRepository):
    def __init__(self):
        super().__init__("strategic_recommendations")

    def run_recommendation_edas(self, recs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        import pandas as pd
        import numpy as np
        if not recs:
            return []
            
        df = pd.DataFrame(recs)
        criteria = ['estimated_savings', 'confidence']
        weights = {'estimated_savings': 0.6, 'confidence': 0.4}
        
        # Ensure numeric type and fill nulls
        for col in criteria:
            if col not in df.columns:
                df[col] = 0.0
            else:
                df[col] = df[col].astype(float).fillna(0.0)
                
        # 1. Average Solution (AV)
        AV = df[criteria].mean()
        
        # 2. PDA / NDA
        PDA = pd.DataFrame(index=df.index, columns=criteria, dtype=float)
        NDA = pd.DataFrame(index=df.index, columns=criteria, dtype=float)
        for col in criteria:
            av_val = AV[col] if AV[col] != 0 else 1e-9
            PDA[col] = ((df[col] - av_val) / av_val).clip(lower=0)
            NDA[col] = ((av_val - df[col]) / av_val).clip(lower=0)
            
        # 3. Weighted Sums
        SP = sum(weights[c] * PDA[c] for c in criteria)
        SN = sum(weights[c] * NDA[c] for c in criteria)
        
        # 4. Normalise NSP and NSN
        max_sp = SP.max()
        max_sn = SN.max()
        NSP = SP / max_sp if max_sp > 0 else SP
        NSN = SN / max_sn if max_sn > 0 else SN
        
        # 5. Calculate EDAS score and Rank
        df['edas_score'] = ((NSP + (1.0 - NSN)) / 2.0).round(4)
        df['edas_rank'] = df['edas_score'].rank(ascending=False, method='first').astype(int)
        
        # Sort by edas_rank
        df = df.sort_values(by='edas_rank')
        return df.to_dict(orient="records")

    def list_all(self) -> List[Dict[str, Any]]:
        recs = []
        try:
            res = self.client.table("strategic_recommendations").select("*").execute()
            recs = res.data or []
        except Exception as e:
            print(f"Failed to fetch strategic recommendations from DB: {e}")
            recs = self._get_fallback_recommendations()
            
        if not recs:
            recs = self._get_fallback_recommendations()
            
        try:
            return self.run_recommendation_edas(recs)
        except Exception as e:
            print(f"Failed to apply EDAS ranking to recommendations: {e}")
            return recs

    def update_recommendation(self, rec_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            res = self.client.table("strategic_recommendations").update(data).eq("id", rec_id).execute()
            return res.data[0] if res.data else {}
        except Exception as e:
            print(f"Failed to update strategic recommendation: {e}")
            return {}

    def _get_fallback_recommendations(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "rec-001",
                "title": "Premium Adjustment — Cardiovascular Cluster",
                "description": "Increase premium by 15% for high-risk cardiovascular surgery cluster.",
                "priority": "HIGH",
                "confidence": 94.00,
                "estimated_savings": 2400000.00,
                "status": "PENDING",
                "category": "Pricing Strategy",
                "reasoning": "AI cluster analysis shows a 32% year-on-year surge in cardiovascular claim costs, with average actual costs exceeding expected regression baselines by 180%. Adjusting premiums mitigates underwriting loss.",
                "implementation_notes": "",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": "rec-002",
                "title": "Hospital Network Optimization (Tier A)",
                "description": "Renegotiate rates with Metropolitan General Hospital due to over-treatment indicators.",
                "priority": "CRITICAL",
                "confidence": 91.00,
                "estimated_savings": 1800000.00,
                "status": "PENDING",
                "category": "Provider Management",
                "reasoning": "Medical audits identified Metropolitan General Hospital as having a high density of over-treatment flags. Claims show a consistent variance pattern where average length of stay is 3.5 days longer than peers for the same diagnosis codes.",
                "implementation_notes": "",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": "rec-003",
                "title": "Enhanced Pre-Authorization for Oncology",
                "description": "Require pre-authorization for oncology therapies exceeding Rp 50,000,000.",
                "priority": "MEDIUM",
                "confidence": 87.00,
                "estimated_savings": 1200000.00,
                "status": "PENDING",
                "category": "Risk Control",
                "reasoning": "Oncology treatment cost variance represents the second largest contributor to overall claim cost inflation. Introducing case management pre-authorizations intercepts non-covered experimental treatments early.",
                "implementation_notes": "",
                "created_at": datetime.now().isoformat()
            }
        ]

rec_repo = StrategicRecommendationRepository()

@router.get("")
def get_recommendations(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retrieves all strategic recommendations.
    """
    return rec_repo.list_all()

@router.post("/{rec_id}/action", dependencies=[Depends(RoleChecker(["strategic_manager"]))])
def perform_recommendation_action(
    rec_id: str,
    payload: RecommendationActionPayload,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Allows a Strategic Manager to approve, reject, or modify a recommendation.
    """
    action = payload.action.upper()
    
    update_data = {}
    if action == "APPROVE":
        update_data = {
            "status": "APPROVED",
            "approved_by": current_user["id"],
            "approved_at": datetime.now().isoformat(),
            "implementation_notes": payload.notes or "Approved for implementation"
        }
    elif action == "REJECT":
        update_data = {
            "status": "REJECTED",
            "implementation_notes": payload.notes or "Rejected by manager"
        }
    elif action == "MODIFY":
        update_data = {
            "status": "MODIFIED"
        }
        if payload.priority:
            update_data["priority"] = payload.priority
        if payload.title:
            update_data["title"] = payload.title
        if payload.description:
            update_data["description"] = payload.description
        if payload.reasoning:
            update_data["reasoning"] = payload.reasoning
        if payload.notes:
            update_data["implementation_notes"] = payload.notes
    elif action == "IMPLEMENT":
        update_data = {
            "status": "IMPLEMENTED",
            "implementation_notes": payload.notes or "Marked as implemented"
        }
            
    updated_rec = rec_repo.update_recommendation(rec_id, update_data)
    
    # Trigger notification
    try:
        from app.services.notification_service import notification_service
        title_label = payload.title or updated_rec.get("title") or "Recommendation"
        
        target_role = "risk_analyst"
        action_url = "/analyst/intelligence-lab"
        
        if action == "APPROVE":
            target_role = "data_operator"
            action_url = "/operator/data-ingestion"
        elif action == "IMPLEMENT":
            target_role = "data_operator"
            action_url = "/operator/data-ingestion"
            
        notification_service.create_notification(
            type_str="recommendation_action",
            severity="success" if action in ("APPROVE", "IMPLEMENT") else "info",
            title=f"Recommendation {action.capitalize()}d",
            message=f"Manager {action.lower()}d strategic recommendation: '{title_label}'.",
            recipient_role=target_role,
            action_url=action_url
        )
    except Exception as e:
        print(f"Failed to issue recommendation action notification: {e}")

    return {
        "success": True,
        "detail": f"Recommendation successfully {action.lower()}d.",
        "record": updated_rec
    }
