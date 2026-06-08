import os
import sys
import logging

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.scripts.seed_utils import setup_logging, get_supabase_client

logger = setup_logging("run_migration")

def execute_migration():
    logger.info("🎬 Starting database migration execution...")
    try:
        supabase = get_supabase_client()
        logger.info("✅ Supabase client connected.")
    except Exception as e:
        logger.error(f"❌ Failed to connect: {e}")
        return False

    migration_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "migration_v2.sql")
    if not os.path.exists(migration_file):
        logger.error(f"❌ Migration file not found at: {migration_file}")
        return False

    with open(migration_file, "r", encoding="utf-8") as f:
        sql_content = f.read()

    # Split SQL content into statements by semicolon, ignoring comments
    raw_statements = sql_content.split(";")
    statements = []
    current_statement = []
    
    # Simple block statement accumulator (handles DO $$ ... END $$ blocks cleanly)
    in_block = False
    for stmt in raw_statements:
        clean_stmt = stmt.strip()
        if not clean_stmt:
            continue
        
        # Detect start of a block
        if "DO $$" in clean_stmt or "DECLARE" in clean_stmt:
            in_block = True
            
        current_statement.append(stmt)
        
        # Detect end of a block
        if in_block and "END $$" in clean_stmt:
            in_block = False
            statements.append(";".join(current_statement) + ";")
            current_statement = []
        elif not in_block:
            statements.append(";".join(current_statement) + ";")
            current_statement = []

    if current_statement:
        statements.append(";".join(current_statement))

    logger.info(f"📋 Found {len(statements)} SQL blocks to execute.")

    for i, statement in enumerate(statements):
        statement_strip = statement.strip()
        if not statement_strip or statement_strip == ";":
            continue
        logger.info(f"⚡ Executing statement {i+1}/{len(statements)}...")
        try:
            res = supabase.rpc("exec_sql", {"sql": statement_strip}).execute()
            logger.info(f"✅ Statement {i+1} completed successfully.")
        except Exception as e:
            logger.error(f"❌ Statement {i+1} failed: {e}")
            logger.error(f"Statement content: {statement_strip}")
            return False

    logger.info("🎉 Database migration v2 completed successfully!")
    return True

if __name__ == "__main__":
    success = execute_migration()
    sys.exit(0 if success else 1)
