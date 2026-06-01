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
        response = self.client.table("system_settings")\
            .select("*")\
            .eq("setting_key", setting_key)\
            .maybeSingle()\
            .execute()
        return response.data

    def set_value(self, setting_key: str, value: Dict[str, Any], updated_by: Optional[str] = None) -> Dict[str, Any]:
        """
        Inserts or updates a setting value JSONB.
        """
        existing = self.get_by_key(setting_key)
        
        payload = {
            "setting_key": setting_key,
            "setting_value": value,
            "updated_at": datetime.now().isoformat()
        }
        if updated_by:
            payload["updated_by"] = updated_by

        if existing:
            response = self.client.table("system_settings")\
                .update(payload)\
                .eq("setting_key", setting_key)\
                .execute()
        else:
            response = self.client.table("system_settings")\
                .insert(payload)\
                .execute()
                
        return response.data[0] if response.data else {}
