from app.repositories.base import BaseRepository
from typing import List, Dict, Any, Optional

class PolicyRepository(BaseRepository):
    def __init__(self):
        super().__init__("policies")

    def get_by_policy_id(self, policy_id: str) -> Optional[Dict[str, Any]]:
        # In actual database, the primary key field is policy_number
        return self.get_by_id(policy_id, id_field="policy_number")

    def count_policies(self) -> int:
        response = self.client.table("policies").select("policy_number", count="exact").execute()
        return response.count or 0
