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
    
    updated_by_name = "System Default"
    updated_at_str = None
    
    if weights_record and "setting_value" in weights_record:
        cf_weights = weights_record["setting_value"]
        updated_at = weights_record.get("updated_at")
        if updated_at:
            updated_at_str = str(updated_at)
        updater_id = weights_record.get("updated_by")
        if updater_id:
            try:
                profile_res = settings_repo.client.table("profiles").select("full_name").eq("id", updater_id).maybe_single().execute()
                if profile_res.data:
                    updated_by_name = profile_res.data.get("full_name") or "Risk Analyst"
            except Exception:
                pass
                
    if threshold_record and "setting_value" in threshold_record:
        anomaly_threshold = threshold_record["setting_value"].get("threshold", 85)
        # Use newer updated_at if available
        t_updated_at = threshold_record.get("updated_at")
        if t_updated_at and (not updated_at_str or t_updated_at > updated_at_str):
            updated_at_str = str(t_updated_at)
            t_updater_id = threshold_record.get("updated_by")
            if t_updater_id:
                try:
                    profile_res = settings_repo.client.table("profiles").select("full_name").eq("id", t_updater_id).maybe_single().execute()
                    if profile_res.data:
                        updated_by_name = profile_res.data.get("full_name") or "Risk Analyst"
                except Exception:
                    pass
        
    return SystemSettingsSchema(
        cf_weights=cf_weights,
        anomaly_threshold=anomaly_threshold,
        updated_by_name=updated_by_name,
        updated_at_str=updated_at_str
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
    
    # Trigger lightweight notification
    try:
        from app.services.notification_service import notification_service
        notification_service.create_notification(
            type_str="calibration_changed",
            severity="warning",
            title="Calibration Settings Adjusted",
            message=f"Weights adjusted: Age {payload.cf_weights.age_weight * 100:.0f}%, BMI {payload.cf_weights.bmi_weight * 100:.0f}%, Smoker {payload.cf_weights.smoker_weight * 100:.0f}%. Threshold set to {payload.anomaly_threshold}%.",
            recipient_role="medical_auditor",
            action_url="/auditor/medical-audit"
        )
    except Exception as e:
        print(f"Failed to issue calibration notification: {e}")
        
    return payload

