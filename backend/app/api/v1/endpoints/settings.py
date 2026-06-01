from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.schemas import SystemSettingsSchema
from app.repositories.settings import SystemSettingsRepository
from app.middleware.auth import get_current_user, RoleChecker
from typing import Dict, Any

router = APIRouter()
settings_repo = SystemSettingsRepository()

@router.get("", response_model=SystemSettingsSchema)
def get_system_settings(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retrieves dynamic weights and calibration thresholds.
    """
    weights_record = settings_repo.get_by_key("cf_weights")
    threshold_record = settings_repo.get_by_key("anomaly_threshold")
    
    # Defaults
    cf_weights = {
        "age_weight": 0.2,
        "bmi_weight": 0.3,
        "smoker_weight": 0.5
    }
    anomaly_threshold = 85
    
    if weights_record and "setting_value" in weights_record:
        cf_weights = weights_record["setting_value"]
    if threshold_record and "setting_value" in threshold_record:
        anomaly_threshold = threshold_record["setting_value"].get("threshold", 85)
        
    return SystemSettingsSchema(
        cf_weights=cf_weights,
        anomaly_threshold=anomaly_threshold
    )

@router.put("", response_model=SystemSettingsSchema, dependencies=[Depends(RoleChecker(["risk_analyst"]))])
def update_system_settings(payload: SystemSettingsSchema, current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Saves calibration weights. Requires Risk Analyst credentials.
    """
    cf_weights_payload = payload.cf_weights.model_dump()
    settings_repo.set_value(
        setting_key="cf_weights",
        value=cf_weights_payload,
        updated_by=current_user["id"]
    )
    
    settings_repo.set_value(
        setting_key="anomaly_threshold",
        value={"threshold": payload.anomaly_threshold},
        updated_by=current_user["id"]
    )
    
    return payload
