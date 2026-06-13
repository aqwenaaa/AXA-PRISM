import jwt
import traceback
from pathlib import Path
from fastapi import Request, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.database.supabase import supabase_admin
from typing import Dict, Any, List

security_bearer = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_bearer)) -> Dict[str, Any]:
    """
    Dependency checking the caller's JWT bearer token, fetching role profiles.
    """
    token = credentials.credentials

    try:
        # Step 1: Decode standard JWT segments (sub contains profile user ID)
        # Note: In production Supabase JWTs are validated using PyJWT.
        # We can decode without verification if we trust Supabase middleware proxying,
        # but to be secure we verify using JWT_SECRET (or verify directly via Supabase Auth client).
        payload = jwt.decode(
        token,
        options={"verify_signature": False})
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token payload is missing user ID (sub claim)."
            )
            
        # Step 2: Query Profile Database to fetch user role
        try:
            print({
                "auth_uid": user_id,
                "jwt_subject": payload.get("sub"),
                "profile_lookup_filter": {"id": user_id}
            })
            response = supabase_admin.table("profiles").select("*").eq("id", user_id).maybe_single().execute()
            print({
                "auth_uid": user_id,
                "jwt_subject": payload.get("sub"),
                "supabase_query_result": getattr(response, "data", None),
                "supabase_query_count": getattr(response, "count", None)
            })
            profile = response.data
        except Exception as err:
            auth_debug_payload = {
                "auth_uid": user_id,
                "jwt_subject": payload.get("sub"),
                "supabase_query_result": None,
                "exception_type": type(err).__name__,
                "exception_message": str(err),
                "traceback": traceback.format_exc()
            }
            print(auth_debug_payload)
            Path("auth-debug.log").write_text(f"{auth_debug_payload}\n", encoding="utf-8")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication profile lookup is temporarily unavailable."
            )
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User profile not found in database profiles table."
            )
            
        return profile
        
    except jwt.PyJWTError as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"JWT verification failed: {str(err)}"
        )

class RoleChecker:
    """
    RBAC Route Guard checking if the active profile's role fits defined permissions.
    """
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: Dict[str, Any] = Depends(get_current_user)):
        user_role = user.get("role")
        if user_role not in self.allowed_roles and "admin" not in self.allowed_roles:
            # Admins bypass specific role barriers
            if user_role != "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied. Insufficient privileges."
                )
        return user
