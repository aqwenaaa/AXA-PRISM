from app.repositories.base import BaseRepository
from typing import List, Dict, Any, Optional
from datetime import datetime

class NotificationRepository(BaseRepository):
    def __init__(self):
        super().__init__("notifications")

    def list_unread_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Lists unread alerts for a specific user ID, plus global admin broadcasts.
        """
        response = self.client.table("notifications")\
            .select("*")\
            .or_(f"user_id.eq.{user_id},user_id.is.null")\
            .eq("read", False)\
            .order("created_at", descending=True)\
            .execute()
        return response.data or []

    def list_all_by_user(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        response = self.client.table("notifications")\
            .select("*")\
            .or_(f"user_id.eq.{user_id},user_id.is.null")\
            .order("created_at", descending=True)\
            .limit(limit)\
            .execute()
        return response.data or []

    def mark_as_read(self, notification_id: str) -> Dict[str, Any]:
        return self.update(notification_id, {"read": True}, id_field="id")

    def mark_all_read(self, user_id: str) -> List[Dict[str, Any]]:
        response = self.client.table("notifications")\
            .update({"read": True})\
            .eq("user_id", user_id)\
            .eq("read", False)\
            .execute()
        return response.data or []
