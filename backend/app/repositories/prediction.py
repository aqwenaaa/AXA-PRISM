from app.repositories.base import BaseRepository
from typing import List, Dict, Any, Optional

class PredictionJobRepository(BaseRepository):
    def __init__(self):
        super().__init__("prediction_jobs")

    def get_by_job_id(self, job_id: str) -> Optional[Dict[str, Any]]:
        return self.get_by_id(job_id, id_field="job_id")

    def get_recent_jobs(self, limit: int = 10) -> List[Dict[str, Any]]:
        response = self.client.table("prediction_jobs")\
            .select("*")\
            .order("created_at", descending=True)\
            .limit(limit)\
            .execute()
        return response.data or []
