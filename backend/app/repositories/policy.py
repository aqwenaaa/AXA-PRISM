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

    def bulk_upsert(self, policies: List[Dict[str, Any]]) -> int:
        if not policies:
            return 0
        written = 0
        for idx in range(0, len(policies), 500):
            batch = policies[idx:idx + 500]
            response = self.client.table("policies").upsert(
                batch,
                on_conflict="policy_number"
            ).execute()
            written += len(response.data or batch)
        return written
