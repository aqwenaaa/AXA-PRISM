from fastapi import APIRouter, Depends, HTTPException, status
from app.repositories.notification import NotificationRepository
from app.middleware.auth import get_current_user
from typing import Dict, Any, List

router = APIRouter()
notification_repo = NotificationRepository()

@router.get("")
def get_user_notifications(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns unread alerts tailored to the caller's role.
    """
    unread = notification_repo.list_unread_by_user(current_user["id"])
    all_notifs = notification_repo.list_all_by_user(current_user["id"], limit=20)
    
    return {
        "unread_count": len(unread),
        "notifications": all_notifs
    }

@router.put("/{notification_id}/read")
def mark_notification_read(notification_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Marks a single notification as read.
    """
    notif = notification_repo.get_by_id(notification_id, id_field="id")
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification with ID {notification_id} not found."
        )
        
    notification_repo.mark_as_read(notification_id)
    return {"success": True, "detail": "Notification marked as read."}

@router.post("/read-all")
def mark_all_notifications_read(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Marks all notifications for the requesting user as read.
    """
    notification_repo.mark_all_read(current_user["id"])
    return {"success": True, "detail": "All notifications marked as read."}
