import logging
from typing import Optional
from datetime import datetime
from app.repositories.base import BaseRepository

logger = logging.getLogger("notification_service")

class NotificationService(BaseRepository):
    def __init__(self):
        super().__init__("notifications")

    def create_notification(
        self,
        type_str: str,
        severity: str,
        title: str,
        message: str,
        recipient_role: Optional[str] = None,
        recipient_user_id: Optional[str] = None,
        action_url: Optional[str] = None
    ) -> bool:
        """
        Creates and stores a lightweight notification in the database.
        Safe against schema differences.
        """
        payload = {
            "type": type_str,
            "severity": severity,
            "title": title,
            "message": message,
            "is_read": False,
            "recipient_role": recipient_role,
            "recipient_user_id": recipient_user_id,
            "action_url": action_url,
            "created_at": datetime.now().isoformat()
        }

        try:
            # First try insert with recipient fields
            self.client.table("notifications").insert(payload).execute()
            logger.info(f"✅ Notification '{title}' created successfully.")
            return True
        except Exception as e:
            logger.warning(f"⚠️ Failed to insert notification with unified columns: {e}. Trying fallback...")
            try:
                # Fallback to base columns if migration hasn't been run yet
                fallback_payload = {
                    "type": type_str,
                    "severity": severity,
                    "title": title,
                    "message": message,
                    "is_read": False,
                    "user_id": recipient_user_id, # maps to user_id in old schema
                    "created_at": datetime.now().isoformat()
                }
                self.client.table("notifications").insert(fallback_payload).execute()
                logger.info(f"✅ Notification '{title}' created using old schema fallback.")
                return True
            except Exception as ex:
                logger.error(f"❌ Both primary and fallback notification insertions failed: {ex}")
                return False

notification_service = NotificationService()
