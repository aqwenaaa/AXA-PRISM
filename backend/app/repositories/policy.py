from app.repositories.base import BaseRepository
from typing import List, Dict, Any, Optional

class PolicyRepository(BaseRepository):
    def __init__(self):
        super().__init__("policies")

    def get_by_policy_id(self, policy_id: str) -> Optional[Dict[str, Any]]:
        return self.get_by_id(policy_id, id_field="policy_id")

    def count_policies(self) -> int:
        response = self.client.table("policies").select("policy_id", count="exact").execute()
        return response.count or 0
