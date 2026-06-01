from fastapi import APIRouter
from app.schemas.schemas import HealthStatus
from app.database.supabase import supabase_admin
from datetime import datetime

router = APIRouter()

@router.get("", response_model=HealthStatus)
def health_check():
    """
    Base endpoint to confirm system availability and connectivity status.
    """
    db_status = "connected"
    try:
        # Check connection viability by executing a simple count query
        supabase_admin.table("profiles").select("id", count="exact").limit(1).execute()
    except Exception as e:
        db_status = f"error: {str(e)}"
        
    return HealthStatus(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="1.0.0",
        services={"database": db_status}
    )
