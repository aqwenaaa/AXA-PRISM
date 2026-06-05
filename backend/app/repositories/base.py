from typing import Generic, TypeVar, List, Dict, Any, Optional
from app.database.supabase import supabase_admin

T = TypeVar("T")

class BaseRepository(Generic[T]):
    """
    Abstract base repository model providing boilerplate accessors.
    All operations route via admin service account to allow system management,
    inheriting standard Supabase capabilities.
    """
    def __init__(self, table_name: str):
        self.table_name = table_name
        self.client = supabase_admin

    def get_by_id(self, item_id: Any, id_field: str = "id") -> Optional[Dict[str, Any]]:
        response = self.client.table(self.table_name).select("*").eq(id_field, item_id).maybeSingle().execute()
        return response.data

    def list_all(self, limit: int = 100) -> List[Dict[str, Any]]:
        response = self.client.table(self.table_name).select("*").limit(limit).execute()
        return response.data or []

    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.client.table(self.table_name).insert(data).execute()
        if response.data:
            return response.data[0]
        raise ValueError(f"Failed to create record in {self.table_name}")

    def update(self, item_id: Any, data: Dict[str, Any], id_field: str = "id") -> Dict[str, Any]:
        response = self.client.table(self.table_name).update(data).eq(id_field, item_id).execute()
        if response.data:
            return response.data[0]
        raise ValueError(f"Failed to update record in {self.table_name} for ID {item_id}")

    def delete(self, item_id: Any, id_field: str = "id") -> bool:
        response = self.client.table(self.table_name).delete().eq(id_field, item_id).execute()
        return len(response.data or []) > 0
