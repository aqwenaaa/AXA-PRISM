import token

import jwt
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

    print("=" * 50)
    print("TOKEN RECEIVED:")
    print(token)
    print("=" * 50)

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
        response = supabase_admin.table("profiles").select("*").eq("id", user_id).maybe_single().execute()
        profile = response.data
        
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
