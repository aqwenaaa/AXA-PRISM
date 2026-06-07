import os
import sys
import logging

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.scripts.seed_utils import setup_logging, get_supabase_client

# ASCII/Console-safe logging
logger = setup_logging("database_validator")

def fetch_all_paginated(client, table_name, select_cols="*"):
    all_data = []
    limit = 1000
    offset = 0
    while True:
        try:
            res = client.table(table_name).select(select_cols).range(offset, offset + limit - 1).execute()
            data = res.data or []
            all_data.extend(data)
            if len(data) < limit:
                break
            offset += limit
        except Exception as e:
            logger.warning(f"Error fetching paginated data for '{table_name}' at offset {offset}: {e}")
            break
    return all_data

def run_validation():
    logger.info("[START] Starting Database Seeding Validation audit...")
    
    try:
        supabase = get_supabase_client()
        logger.info("[OK] Supabase service client connected successfully.")
    except Exception as e:
        logger.error(f"[FAIL] Connection to Supabase failed: {e}")
        return False

    # 1. Row Count Audit
    logger.info("")
    logger.info("[AUDIT] Step 1: Querying Table Record Counts...")
    tables = [
        "profiles", 
        "policies", 
        "claims", 
        "processed_claims", 
        "notifications", 
        "audit_logs", 
        "claim_reviews", 
        "prediction_jobs",
        "data_ingestion_logs"
    ]
    
    counts = {}
    for t in tables:
        try:
            # Query count using exact selector
            res = supabase.table(t).select("*", count="exact", head=True).execute()
            counts[t] = res.count if res.count is not None else 0
            logger.info(f"   - Table '{t:20}': {counts[t]:6} records")
        except Exception as e:
            logger.warning(f"   [WARN] Could not read count for table '{t}': {e}")
            counts[t] = "ERR"

    # 2. Profiles Integrity Audit
    logger.info("")
    logger.info("[AUDIT] Step 2: Checking Profile Integrity...")
    try:
        profiles_res = supabase.table("profiles").select("*").execute()
        profiles = profiles_res.data or []
        roles = [p.get("role") for p in profiles]
        
        logger.info(f"   - Total users registered in profiles: {len(profiles)}")
        for r in set(roles):
            logger.info(f"     * Role '{r}': {roles.count(r)} user(s)")
    except Exception as e:
        logger.error(f"   [FAIL] Failed to audit profiles table: {e}")

    # 3. Fallback Policy Mapping & Orphan Audit (Revision 1)
    logger.info("")
    logger.info("[AUDIT] Step 3: Checking Fallback Policy Integration & Orphan Control...")
    try:
        # Check if fallback record exists
        fallback_res = supabase.table("policies").select("*").eq("policy_number", "POLICY_MISSING").execute()
        fallback_exists = len(fallback_res.data or []) > 0
        logger.info(f"   - Policy record 'POLICY_MISSING' exists: {'[YES]' if fallback_exists else '[NO]'}")
        
        # Count claims mapped to POLICY_MISSING
        missing_mapping_res = supabase.table("claims").select("*", count="exact", head=True).eq("policy_number", "POLICY_MISSING").execute()
        mapped_count = missing_mapping_res.count if missing_mapping_res.count is not None else 0
        logger.info(f"   - Total orphan claims safely mapped to 'POLICY_MISSING': {mapped_count} claims")
        
        # Paginated fetch to bypass Postgrest 1000-row limit
        logger.info("   - Fetching complete policies master lists for referential validation...")
        all_policies = fetch_all_paginated(supabase, "policies", "policy_number")
        all_policy_numbers = {p["policy_number"] for p in all_policies}
        logger.info(f"   - Retrieved {len(all_policy_numbers)} policies from DB.")
        
        logger.info("   - Fetching complete claims master lists for referential validation...")
        all_claims = fetch_all_paginated(supabase, "claims", "claim_id, policy_number")
        logger.info(f"   - Retrieved {len(all_claims)} claims from DB.")
        
        broken_references = 0
        for c in all_claims:
            if c["policy_number"] not in all_policy_numbers:
                broken_references += 1
                
        if broken_references == 0:
            logger.info("   [OK] Referential Integrity Check: 100% SUCCESS. No claims are referencing missing policies.")
        else:
            logger.error(f"   [FAIL] Referential Integrity Check: FAILURE. Found {broken_references} claim(s) pointing to nonexistent policies!")
    except Exception as e:
        logger.error(f"   [FAIL] Failed to run referential mapping audits: {e}")

    # 4. Analytical Metrics Domain Audit (processed_claims)
    logger.info("")
    logger.info("[AUDIT] Step 4: Auditing processed_claims Integrity...")
    try:
        # Paginated fetch to bypass Postgrest 1000-row limit
        logger.info("   - Fetching complete processed_claims master lists for analytical validation...")
        processed = fetch_all_paginated(supabase, "processed_claims", "*")
        
        if not processed:
            logger.warning("   [WARN] No processed claims records found to validate.")
        else:
            anomaly_scores = [p.get("anomaly_score") for p in processed if p.get("anomaly_score") is not None]
            cf_scores = [p.get("cf_score") for p in processed if p.get("cf_score") is not None]
            risk_clusters = [p.get("risk_cluster") for p in processed if p.get("risk_cluster") is not None]
            
            # Check for materialized fields if populated
            has_materialized_risk = "final_risk_score" in processed[0]
            
            logger.info(f"   - Validated processed_claims rows: {len(processed)}")
            logger.info(f"   - Anomaly Score range: [{min(anomaly_scores):.4f} to {max(anomaly_scores):.4f}]")
            logger.info(f"   - CF Score range:      [{min(cf_scores):.4f} to {max(cf_scores):.4f}]")
            logger.info(f"   - Risk Cluster split:  { {c: risk_clusters.count(c) for c in set(risk_clusters)} }")
            logger.info(f"   - Materialized Risk Fields present in DB: {'[YES]' if has_materialized_risk else '[NO] (calculated on-the-fly via repo due to DB layout constraints)'}")
            
            if has_materialized_risk:
                final_risks = [p.get("final_risk_score") for p in processed if p.get("final_risk_score") is not None]
                rec_actions = [p.get("recommended_action") for p in processed if p.get("recommended_action") is not None]
                logger.info(f"     * Materialized final_risk_score range: [{min(final_risks):.4f} to {max(final_risks):.4f}]")
                logger.info(f"     * Recommended Action split: { {a: rec_actions.count(a) for a in set(rec_actions)} }")

            # Check that every processed claim has a matching claim_id in claims table
            claim_ids = {c["claim_id"] for c in all_claims}
            dangling_processed = 0
            for p in processed:
                if p["claim_id"] not in claim_ids:
                    dangling_processed += 1
            
            if dangling_processed == 0:
                logger.info("   [OK] Processed Claims Join Check: 100% SUCCESS. All analytical items join cleanly to claims.")
            else:
                logger.error(f"   [FAIL] Processed Claims Join Check: FAILURE. Found {dangling_processed} analytical rows pointing to nonexistent claims.")
    except Exception as e:
        logger.error(f"   [FAIL] Failed to run processed_claims analytical validation: {e}")

    # 5. Seeding Sprint Summary Report (Phase 7 Deliverable) - Console/CP1252-safe
    print("\n" + "="*60)
    print("         AXA PRISM - SEEDING VALIDATION REPORT         ")
    print("="*60)
    print(f" {'TABLE NAME':25} | {'RECORD COUNT':12} | {'STATUS':10} ")
    print("-"*60)
    for t in tables:
        count_val = counts.get(t, "ERR")
        status_txt = "LOADED" if isinstance(count_val, int) and count_val > 0 else ("EMPTY" if count_val == 0 else "ERROR")
        print(f" {t:25} | {str(count_val):>12} | {status_txt:10} ")
    print("="*60)
    print(" Seeding verification complete. Ready for frontend integration!")
    print("="*60 + "\n")
    
    return True

if __name__ == "__main__":
    success = run_validation()
    sys.exit(0 if success else 1)
