from fastapi import APIRouter, Depends, Query, status
from app.schemas.schemas import PolicyRecord
from app.repositories.policy import PolicyRepository
from app.middleware.auth import get_current_user
from typing import List, Dict, Any, Optional

router = APIRouter()
policy_repo = PolicyRepository()

@router.get("", response_model=Dict[str, Any])
def get_policies(
    limit: int = Query(20, ge=1, le=100, description="Records limit"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns list of demographic policy master records.
    """
    policies = policy_repo.list_all(limit=limit)
    total = policy_repo.count_policies()
    
    return {
        "data": policies,
        "total_count": total
    }
