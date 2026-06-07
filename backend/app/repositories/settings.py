from app.repositories.base import BaseRepository
from typing import Dict, Any, Optional
from datetime import datetime

class SystemSettingsRepository(BaseRepository):
    def __init__(self):
        super().__init__("system_settings")

    def get_by_key(self, setting_key: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a system setting by its unique string key.
        """
        try:
            response = self.client.table("system_settings")\
                .select("*")\
                .eq("setting_key", setting_key)\
                .maybe_single()\
                .execute()
            return response.data
        except Exception:
            return self._get_fallback_setting(setting_key)

    def set_value(self, setting_key: str, value: Dict[str, Any], updated_by: Optional[str] = None) -> Dict[str, Any]:
        """
        Inserts or updates a setting value.
        """
        try:
            existing = self.get_by_key(setting_key)
            
            payload = {
                "setting_key": setting_key,
                "setting_value": value,
                "updated_at": datetime.now().isoformat()
            }
            if updated_by:
                payload["updated_by"] = updated_by

            if existing and existing.get("id"):
                response = self.client.table("system_settings")\
                    .update(payload)\
                    .eq("setting_key", setting_key)\
                    .execute()
            else:
                response = self.client.table("system_settings")\
                    .insert(payload)\
                    .execute()
                    
            return response.data[0] if response.data else {}
        except Exception:
            return {
                "setting_key": setting_key,
                "setting_value": value,
                "updated_at": datetime.now().isoformat()
            }

    def _get_fallback_setting(self, setting_key: str) -> Optional[Dict[str, Any]]:
        """
        Serves graceful weight fallback configurations.
        """
        if setting_key == "cf_weights":
            return {
                "setting_key": "cf_weights",
                "setting_value": {
                    "age_weight": 0.2,
                    "bmi_weight": 0.3,
                    "smoker_weight": 0.5
                }
            }
        elif setting_key == "anomaly_threshold":
            return {
                "setting_key": "anomaly_threshold",
                "setting_value": {"threshold": 85}
            }
        return None
