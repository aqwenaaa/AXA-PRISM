from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.schemas.schemas import ClaimRecord, ClaimAuditSubmit
from app.repositories.claim import ClaimRepository
from app.middleware.auth import get_current_user, RoleChecker
from typing import List, Dict, Any, Optional

router = APIRouter()
claim_repo = ClaimRepository()

@router.get("", response_model=Dict[str, Any])
def get_claims(
    status: Optional[str] = Query(None, description="Filter by status (pending, valid, fraud, over_treatment)"),
    page: int = Query(1, ge=1, description="Page index"),
    limit: int = Query(10, ge=1, le=100, description="Records limit per page"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns list of medical claims with nested ML outcomes (paginated).
    """
    claims = claim_repo.list_claims_with_ml(status=status, limit=limit, page=page)
    total = claim_repo.count_claims(status=status)
    
    return {
        "data": claims,
        "total_count": total,
        "page": page,
        "limit": limit
    }

@router.get("/{claim_id}", response_model=ClaimRecord)
def get_claim_by_id(claim_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Fetches individual claim data by ID.
    """
    claim = claim_repo.get_claim_with_ml(claim_id)
    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Claim with ID {claim_id} not found."
        )
    return claim

@router.post("/audit", status_code=status.HTTP_201_CREATED, dependencies=[Depends(RoleChecker(["medical_auditor"]))])
def submit_audit_decision(payload: ClaimAuditSubmit, current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Allows a medical auditor to log claim verifications and update statuses.
    """
    claim = claim_repo.get_by_id(payload.claim_id, id_field="claim_id")
    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Claim with ID {payload.claim_id} not found."
        )
        
    audit_log = claim_repo.submit_audit_log(
        claim_id=payload.claim_id,
        auditor_id=current_user["id"],
        status=payload.status,
        notes=payload.auditor_notes or "",
        retrain_flag=payload.retrain_ai_flag or False
    )
    
    # Trigger notification
    try:
        from app.services.notification_service import notification_service
        severity_map = {
            "valid": "success",
            "requires_review": "warning",
            "over_treatment": "warning",
            "fraud": "error"
        }
        status_label = payload.status.upper().replace('_', ' ')
        notification_service.create_notification(
            type_str="audit_submitted",
            severity=severity_map.get(payload.status, "info"),
            title=f"Claim Audited: {status_label}",
            message=f"Claim {payload.claim_id[:8]}... was audited as {payload.status.replace('_', ' ')}.",
            recipient_role="strategic_manager",
            action_url="/manager/executive-dashboard"
        )
    except Exception as e:
        print(f"Failed to issue audit notification: {e}")
        
    return {
        "success": True,
        "detail": "Audit decision successfully recorded.",
        "record": audit_log
    }

