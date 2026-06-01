from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from app.services.ingestion import IngestionService
from app.middleware.auth import get_current_user, RoleChecker
from typing import Dict, Any

router = APIRouter()
ingestion_svc = IngestionService()

@router.post("/policy", dependencies=[Depends(RoleChecker(["data_operator"]))])
async def upload_policy_csv(file: UploadFile = File(...), current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Ingests and validates CSV containing policy records.
    """
    if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload CSV or Excel files."
        )
        
    contents = await file.read()
    content_str = contents.decode("utf-8")
    
    result = ingestion_svc.parse_and_validate_csv(
        filename=file.filename,
        content=content_str,
        file_type="policy",
        processed_by=current_user["id"]
    )
    
    return {
        "success": True,
        "detail": "Policies successfully ingested and scheduled for risk parsing.",
        "metadata": result
    }

@router.post("/claims", dependencies=[Depends(RoleChecker(["data_operator"]))])
async def upload_claims_csv(file: UploadFile = File(...), current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Ingests and validates CSV containing claims data.
    """
    if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload CSV or Excel files."
        )
        
    contents = await file.read()
    content_str = contents.decode("utf-8")
    
    result = ingestion_svc.parse_and_validate_csv(
        filename=file.filename,
        content=content_str,
        file_type="claims",
        processed_by=current_user["id"]
    )
    
    return {
        "success": True,
        "detail": "Claims successfully ingested and scheduled for risk parsing.",
        "metadata": result
    }
