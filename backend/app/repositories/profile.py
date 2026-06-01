from app.repositories.base import BaseRepository
from typing import Dict, Any, Optional

class ProfileRepository(BaseRepository):
    def __init__(self):
        super().__init__("profiles")

    def get_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        return self.get_by_id(user_id, id_field="id")

    def count_profiles(self) -> int:
        response = self.client.table("profiles").select("id", count="exact").execute()
        return response.count or 0
