from fastapi import APIRouter, Depends, BackgroundTasks, status
from app.schemas.schemas import PredictRequest, PredictResponse
from app.services.ingestion import IngestionService
from app.middleware.auth import get_current_user, RoleChecker
from typing import Dict, Any

router = APIRouter()
ingestion_svc = IngestionService()

@router.post("", response_model=PredictResponse, status_code=status.HTTP_202_ACCEPTED, dependencies=[Depends(RoleChecker(["data_operator", "risk_analyst"]))])
def trigger_prediction_pipeline(
    payload: PredictRequest,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Enqueues prediction runs for claims batch in background, returning the job status immediately.
    """
    # Create the prediction job log immediately
    job = ingestion_svc.create_async_job(
        claim_ids=payload.claim_ids,
        triggered_by=current_user["id"]
    )
    
    # Enqueue background pipeline execution task
    background_tasks.add_task(
        ingestion_svc.execute_prediction_pipeline,
        job_id=job["job_id"],
        claim_ids=payload.claim_ids
    )
    
    return PredictResponse(
        job_id=job["job_id"],
        status=job["status"],
        task_id=job["task_id"],
        created_at=job["created_at"]
    )

import time

@router.get("/jobs")
def get_recent_prediction_jobs(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns list of prediction runs to track progress dynamically.
    """
    start_time = time.perf_counter()
    res = ingestion_svc.job_repo.get_recent_jobs(limit=10)
    duration_ms = (time.perf_counter() - start_time) * 1000
    print(f"[API Route GET /predict/jobs] duration_ms={duration_ms:.2f}ms")
    return res
