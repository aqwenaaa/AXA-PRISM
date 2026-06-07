import os
import logging
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Configure Logging
def setup_logging(name="seeding"):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Check if handlers already exist to prevent duplicates
    if not logger.handlers:
        formatter = logging.Formatter(
            "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)d] - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        ch = logging.StreamHandler()
        ch.setFormatter(formatter)
        logger.addHandler(ch)
        
    return logger

logger = setup_logging()

# Supabase Admin Client Initialization
def get_supabase_client() -> Client:
    # Try loading env from multiple possible relative paths
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    env_local = os.path.join(base_dir, ".env.local")
    env_backend = os.path.join(base_dir, "backend", ".env")
    env_root = os.path.join(base_dir, ".env")
    
    if os.path.exists(env_local):
        load_dotenv(dotenv_path=env_local)
        logger.info(f"Loaded env from .env.local: {env_local}")
    elif os.path.exists(env_backend):
        load_dotenv(dotenv_path=env_backend)
        logger.info(f"Loaded env from backend/.env: {env_backend}")
    elif os.path.exists(env_root):
        load_dotenv(dotenv_path=env_root)
        logger.info(f"Loaded env from root .env: {env_root}")
    else:
        load_dotenv()
        logger.info("Loaded default system env")

    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not service_role_key:
        raise ValueError(
            "Missing Supabase URL or Service Role Key in environment. "
            "Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
        )
        
    # Standardize URL formatting
    supabase_url = supabase_url.strip()
    service_role_key = service_role_key.strip()
    
    return create_client(supabase_url, service_role_key)

# Clean Numerical Cost Fields
def clean_cost_value(val) -> float:
    if val is None or str(val).strip().lower() in ("null", "nil", "none", "nan", ""):
        return 0.0
    val_str = str(val).strip()
    # Remove currency symbols or commas if they exist
    val_str = val_str.replace("Rp", "").replace("$", "").replace(",", "")
    try:
        return float(val_str)
    except ValueError:
        return 0.0

# Parse Date into PostgreSQL DATE ISO Format (YYYY-MM-DD)
def parse_date_to_iso(date_val, source_format="klaim") -> str:
    if date_val is None or str(date_val).strip().lower() in ("null", "nil", "none", "nan", ""):
        return None
        
    date_str = str(date_val).strip()
    
    if source_format == "polis":
        # Format is YYYYMMDD (e.g., 19640811)
        try:
            return datetime.strptime(date_str, "%Y%m%d").strftime("%Y-%m-%d")
        except ValueError:
            pass
            
    # Try parsing slash formats: M/D/YYYY or MM/DD/YYYY
    for fmt in ("%m/%d/%Y", "%d/%m/%Y", "%Y-%m-%d", "%Y/%m/%d"):
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
            
    # Handle split slash logic fallback
    try:
        parts = date_str.split('/')
        if len(parts) == 3:
            # Check if year is first or last
            if len(parts[0]) == 4: # YYYY/MM/DD
                year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
            else: # MM/DD/YYYY or DD/MM/YYYY. Defaulting to MM/DD/YYYY based on 10/17/2024 analysis
                month, day, year = int(parts[0]), int(parts[1]), int(parts[2])
            return f"{year:04d}-{month:02d}-{day:02d}"
    except Exception:
        pass
        
    logger.warning(f"Could not parse date string: '{date_val}' with format '{source_format}'. Returning None.")
    return None
