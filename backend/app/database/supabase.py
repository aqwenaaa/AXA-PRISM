from supabase import create_client, Client
from app.core.config import settings

def get_supabase_client() -> Client:
    """
    Returns a standard Supabase client with RLS active (using anonymized public key).
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        raise ValueError("Supabase URL and Anon Key must be configured in environment.")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

def get_supabase_service_client() -> Client:
    """
    Returns an administrative Supabase client bypassing RLS (using Service Role Key).
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise ValueError("Supabase URL and Service Role Key must be configured in environment.")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

# Singletons for ease of usage
supabase: Client = get_supabase_client()
supabase_admin: Client = get_supabase_service_client()
