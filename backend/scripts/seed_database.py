import os
import sys
import pandas as pd
import uuid
from datetime import datetime, timedelta
import logging

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.scripts.seed_utils import (
    setup_logging, 
    get_supabase_client, 
    clean_cost_value, 
    parse_date_to_iso
)

logger = setup_logging("database_seeder")

def seed_database():
    logger.info("🎬 Starting database seeding process...")
    
    # 1. Initialize Supabase Admin Client
    try:
        supabase = get_supabase_client()
        logger.info("✅ Supabase service client connected successfully.")
    except Exception as e:
        logger.error(f"❌ Failed to connect to Supabase: {e}")
        return False

    # 2. Dynamically Fetch Existing Profiles
    logger.info("🔍 Resolving existing user profiles to assign references...")
    try:
        profiles_res = supabase.table("profiles").select("id, email, role").execute()
        profiles = profiles_res.data or []
        logger.info(f"👥 Found {len(profiles)} active user profile(s) in database.")
    except Exception as e:
        logger.error(f"❌ Failed to query profiles table: {e}")
        return False
        
    profile_id = None
    if profiles:
        # Use first admin or operator if available, otherwise use first profile
        by_role = {p["role"]: p["id"] for p in profiles}
        profile_id = by_role.get("admin") or by_role.get("data_operator") or profiles[0]["id"]
        logger.info(f"👤 Assigned profile reference: '{profile_id}' for seeding logs and audits.")
    else:
        logger.warning(
            "⚠️ No active profiles found in profiles table! "
            "uploaded_by, auditor_id, reviewer_id, and triggered_by will be seeded as NULL."
        )

    # 3. Cascade Purge Existing Records (Safe Purging Strategy - Revision 2)
    logger.info("🗑️ Cascade purging existing operational tables (excluding auth and profiles)...")
    tables_to_purge = [
        ("processed_claims", "id", True),
        ("claim_reviews", "review_id", True),
        ("audit_logs", "audit_id", True),
        ("notifications", "id", True),
        ("prediction_jobs", "job_id", True),
        ("claims", "claim_id", False),
        ("policies", "policy_number", False)
    ]
    
    for table_name, pk_field, is_uuid in tables_to_purge:
        try:
            logger.info(f"  - Purging table '{table_name}'...")
            if is_uuid:
                supabase.table(table_name).delete().neq(pk_field, "00000000-0000-0000-0000-000000000000").execute()
            else:
                supabase.table(table_name).delete().neq(pk_field, "POLICY_MISSING_NONEXISTENT_DUMMY").execute()
            logger.info(f"  ✅ Purged '{table_name}'.")
        except Exception as e:
            logger.warning(f"  ⚠️ Direct purge for '{table_name}' failed: {e}. Attempting fallback...")
            try:
                supabase.table(table_name).delete().gte("created_at", "1970-01-01T00:00:00Z").execute()
                logger.info(f"  ✅ Purged '{table_name}' via created_at fallback.")
            except Exception as ex:
                logger.error(f"  ❌ Fallback purge failed for '{table_name}': {ex}")

    # 4. Resolve File Paths
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    polis_csv_path = os.path.join(base_dir, "Data_Polis.csv")
    klaim_csv_path = os.path.join(base_dir, "Data_Klaim.csv")

    if not os.path.exists(polis_csv_path) or not os.path.exists(klaim_csv_path):
        logger.error(
            f"❌ Missing source files. "
            f"Verify that '{polis_csv_path}' and '{klaim_csv_path}' exist in the workspace root."
        )
        return False

    # ==========================================
    # PHASE 1 — SEED POLICIES
    # ==========================================
    logger.info("📦 Phase 1: Loading and seeding 'policies'...")
    try:
        df_polis = pd.read_csv(polis_csv_path)
        logger.info(f"📄 Loaded {len(df_polis)} policies from '{polis_csv_path}'.")
    except Exception as e:
        logger.error(f"❌ Failed to parse '{polis_csv_path}': {e}")
        return False

    # Insert POLICY_MISSING Fallback Record (Revision 1)
    logger.info("➕ Inserting synthetic policy fallback record 'POLICY_MISSING'...")
    policy_missing_record = {
        "policy_number": "POLICY_MISSING",
        "plan_code": "M-001",
        "gender": "M",
        "birth_date": "1970-01-01",
        "effective_date": "2020-01-01",
        "domicile": "JAKARTA",
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    try:
        supabase.table("policies").insert(policy_missing_record).execute()
        logger.info("✅ Fallback record 'POLICY_MISSING' created successfully.")
    except Exception as e:
        logger.error(f"❌ Failed to insert fallback record 'POLICY_MISSING': {e}")
        return False

    # Bulk Insert Policies in Batches
    policies_batch = []
    policy_numbers_seeded = {"POLICY_MISSING"}
    
    for idx, row in df_polis.iterrows():
        p_num = str(row["Nomor Polis"]).strip()
        
        # Prevent duplicates
        if p_num in policy_numbers_seeded:
            continue
            
        b_date = parse_date_to_iso(row["Tanggal Lahir"], "polis")
        e_date = parse_date_to_iso(row["Tanggal Efektif Polis"], "polis")
        
        # Handle format fallbacks
        if not b_date:
            b_date = "1980-01-01"
        if not e_date:
            e_date = "2018-01-01"
            
        policy_record = {
            "policy_number": p_num,
            "plan_code": str(row["Plan Code"]).strip(),
            "gender": str(row["Gender"]).strip(),
            "birth_date": b_date,
            "effective_date": e_date,
            "domicile": str(row["Domisili"]).strip()
        }
        
        policies_batch.append(policy_record)
        policy_numbers_seeded.add(p_num)
        
        # Batch insert to Supabase to prevent timeout
        if len(policies_batch) >= 200:
            try:
                supabase.table("policies").insert(policies_batch).execute()
                policies_batch = []
            except Exception as e:
                logger.error(f"❌ Batch insertion of policies failed: {e}")
                return False
                
    # Insert any remaining records
    if policies_batch:
        try:
            supabase.table("policies").insert(policies_batch).execute()
        except Exception as e:
            logger.error(f"❌ Final batch insertion of policies failed: {e}")
            return False
            
    logger.info(f"🎉 Seeding policies complete! Total loaded policies: {len(policy_numbers_seeded)}")

    # ==========================================
    # PHASE 2 — SEED CLAIMS
    # ==========================================
    logger.info("📦 Phase 2: Loading and seeding 'claims'...")
    try:
        df_klaim = pd.read_csv(klaim_csv_path)
        logger.info(f"📄 Loaded {len(df_klaim)} claims from '{klaim_csv_path}'.")
    except Exception as e:
        logger.error(f"❌ Failed to parse '{klaim_csv_path}': {e}")
        return False

    claims_batch = []
    inserted_claims = []
    orphan_count = 0
    claim_ids_seeded = set()

    for idx, row in df_klaim.iterrows():
        c_id = str(row["Claim ID"]).strip()
        
        # Prevent duplicates
        if c_id in claim_ids_seeded:
            continue
            
        p_num = str(row["Nomor Polis"]).strip()
        
        # Revision 1 — Missing Policy Fallback Mapping
        if p_num not in policy_numbers_seeded:
            p_num = "POLICY_MISSING"
            orphan_count += 1

        p_date = parse_date_to_iso(row["Tanggal Pembayaran Klaim"], "klaim")
        adm_date = parse_date_to_iso(row["Tanggal Pasien Masuk RS"], "klaim")
        disc_date = parse_date_to_iso(row["Tanggal Pasien Keluar RS"], "klaim")

        # Guarantee basic admission / discharge dates
        if not adm_date:
            adm_date = "2024-01-01"
        if not disc_date:
            disc_date = adm_date

        approved_cost = clean_cost_value(row["Nominal Klaim Yang Disetujui"])
        hospital_cost = clean_cost_value(row["Nominal Biaya RS Yang Terjadi"])
        
        # Ensure fallback location
        h_location = str(row["Lokasi RS"]).strip()
        if not h_location or h_location.lower() == "nan":
            h_location = "Indonesia"

        # Determine claim patient type
        pat_type = str(row["Inpatient/Outpatient"]).strip()
        if not pat_type or pat_type.lower() == "nan":
            pat_type = "OP"

        # Diagnose description
        diag_code = str(row["ICD Diagnosis"]).strip()
        if not diag_code or diag_code.lower() == "nan":
            diag_code = "Unknown"
        diag_desc = str(row["ICD Description"]).strip()
        if not diag_desc or diag_desc.lower() == "nan":
            diag_desc = "Diagnosis Unspecified"

        claim_record = {
            "claim_id": c_id,
            "policy_number": p_num,
            "claim_type": str(row["Reimburse/Cashless"]).strip(),
            "patient_type": pat_type,
            "icd_diagnosis": diag_code,
            "icd_description": diag_desc,
            "payment_date": p_date,  # Can be NULL
            "admission_date": adm_date,
            "discharge_date": disc_date,
            "approved_claim_cost": approved_cost,
            "hospital_cost": hospital_cost,
            "hospital_location": h_location,
            "status": "valid" if approved_cost > 0 else "pending",
            "uploaded_by": profile_id
        }

        claims_batch.append(claim_record)
        inserted_claims.append(claim_record)
        claim_ids_seeded.add(c_id)

        # Batch insert to Supabase to prevent network timeouts
        if len(claims_batch) >= 200:
            try:
                supabase.table("claims").insert(claims_batch).execute()
                claims_batch = []
            except Exception as e:
                logger.error(f"❌ Batch insertion of claims failed: {e}")
                return False

    # Insert remaining records
    if claims_batch:
        try:
            supabase.table("claims").insert(claims_batch).execute()
        except Exception as e:
            logger.error(f"❌ Final batch insertion of claims failed: {e}")
            return False

    logger.info(
        f"🎉 Seeding claims complete! Total claims loaded: {len(claim_ids_seeded)}. "
        f"Orphan claims mapped to 'POLICY_MISSING': {orphan_count}."
    )

    # ==========================================
    # PHASE 3 — SEED PROCESSED CLAIMS
    # ==========================================
    logger.info("📦 Phase 3: Generating and seeding 'processed_claims' analytical metrics...")
    processed_claims_batch = []
    
    # Store dynamic fallback info
    use_materialized_fields = True

    for claim in inserted_claims:
        c_id = claim["claim_id"]
        app_cost = claim["approved_claim_cost"]
        hosp_cost = claim["hospital_cost"]

        # Deterministic formula (hospital_cost / approved_claim_cost)
        residual_ratio = hosp_cost / app_cost if app_cost > 0 else 1.0
        
        # Deterministic business logic based on cost ratio (Revision 3)
        if residual_ratio >= 1.8:
            # High discrepancy -> High Risk
            anomaly_score = min(0.9850, 0.8000 + 0.18 * (residual_ratio - 1.8) / 10.0)
            cf_score = min(0.9500, 0.7500 + 0.18 * (residual_ratio - 1.8) / 10.0)
            risk_cluster = 3 # High
        elif residual_ratio >= 1.2:
            # Medium discrepancy -> Medium Risk
            anomaly_score = 0.4000 + 0.35 * (residual_ratio - 1.2) / 0.6
            cf_score = 0.3500 + 0.35 * (residual_ratio - 1.2) / 0.6
            risk_cluster = 2 # Medium
        else:
            # Low discrepancy -> Low Risk
            anomaly_score = max(0.0100, 0.0500 + 0.25 * (residual_ratio - 1.0) / 0.2) if residual_ratio >= 1.0 else 0.0500
            cf_score = max(0.0100, 0.0500 + 0.20 * (residual_ratio - 1.0) / 0.2) if residual_ratio >= 1.0 else 0.0500
            risk_cluster = 1 # Low

        # expected_claim_cost as ML regression placeholder
        expected_cost = app_cost * (1.0 + (anomaly_score - 0.20) * 0.1)

        # Revision 3 - Materialized Risk Fields
        final_risk = (anomaly_score * 0.6) + (cf_score * 0.4)
        
        if final_risk >= 0.80:
            rec_action = "investigate"
        elif final_risk >= 0.50:
            rec_action = "review"
        else:
            rec_action = "valid"

        processed_record = {
            "claim_id": c_id,
            "expected_claim_cost": float(expected_cost),
            "residual": float(hosp_cost - app_cost),
            "anomaly_score": float(anomaly_score),
            "risk_cluster": int(risk_cluster),
            "cf_score": float(cf_score),
            "final_risk_score": float(final_risk),
            "recommended_action": rec_action
        }
        processed_claims_batch.append(processed_record)

        # Batch insert to processed_claims
        if len(processed_claims_batch) >= 200:
            try:
                if use_materialized_fields:
                    try:
                        supabase.table("processed_claims").insert(processed_claims_batch).execute()
                    except Exception as e:
                        # Fallback check for missing column
                        err_str = str(e)
                        if "final_risk_score" in err_str or "recommended_action" in err_str or "does not exist" in err_str or "42703" in err_str:
                            logger.warning(
                                "⚠️ DATABASE SEEDING WARNING:\n"
                                "The columns 'final_risk_score' and/or 'recommended_action' do not exist in processed_claims!\n"
                                "Falling back to seeding processed_claims without these columns. "
                                "Please run 'backend/db_migrations.sql' in your Supabase SQL Editor to fully support Revision 3."
                            )
                            use_materialized_fields = False
                            # Strip fields from current and future batches
                            stripped_batch = [{k: v for k, v in item.items() if k not in ("final_risk_score", "recommended_action")} for item in processed_claims_batch]
                            supabase.table("processed_claims").insert(stripped_batch).execute()
                        else:
                            raise e
                else:
                    stripped_batch = [{k: v for k, v in item.items() if k not in ("final_risk_score", "recommended_action")} for item in processed_claims_batch]
                    supabase.table("processed_claims").insert(stripped_batch).execute()
                processed_claims_batch = []
            except Exception as e:
                logger.error(f"❌ Batch insertion of processed claims failed: {e}")
                return False

    # Insert remaining records
    if processed_claims_batch:
        try:
            if use_materialized_fields:
                try:
                    supabase.table("processed_claims").insert(processed_claims_batch).execute()
                except Exception as e:
                    err_str = str(e)
                    if "final_risk_score" in err_str or "recommended_action" in err_str or "does not exist" in err_str or "42703" in err_str:
                        logger.warning("⚠️ Warning: Falling back for final batch of processed claims.")
                        stripped_batch = [{k: v for k, v in item.items() if k not in ("final_risk_score", "recommended_action")} for item in processed_claims_batch]
                        supabase.table("processed_claims").insert(stripped_batch).execute()
                    else:
                        raise e
            else:
                stripped_batch = [{k: v for k, v in item.items() if k not in ("final_risk_score", "recommended_action")} for item in processed_claims_batch]
                supabase.table("processed_claims").insert(stripped_batch).execute()
        except Exception as e:
            logger.error(f"❌ Final batch insertion of processed claims failed: {e}")
            return False

    logger.info("🎉 Seeding processed_claims analytical metrics complete!")

    # ==========================================
    # PHASE 4 — SUPPORTING TABLES
    # ==========================================
    logger.info("📦 Phase 4: Seeding supporting operational tables (notifications, audits, reviews, jobs)...")
    
    # 4.1 Ingest prediction_jobs History
    logger.info("  - Seeding historical prediction jobs...")
    prediction_jobs = []
    job_ids = [str(uuid.uuid4()) for _ in range(4)]
    
    # Simulating 4 historical prediction runs
    job_configs = [
        {"status": "completed", "hours_ago": 72, "processed": 4627, "anomalies": 218},
        {"status": "completed", "hours_ago": 48, "processed": 3120, "anomalies": 140},
        {"status": "completed", "hours_ago": 24, "processed": 1500, "anomalies": 72},
        {"status": "failed", "hours_ago": 1, "processed": 0, "anomalies": 0, "err": "File format mismatch: column Count discrepancy"}
    ]
    
    for i, cfg in enumerate(job_configs):
        created = (datetime.utcnow() - timedelta(hours=cfg["hours_ago"])).isoformat() + "Z"
        completed = None
        if cfg["status"] == "completed":
            completed = (datetime.utcnow() - timedelta(hours=cfg["hours_ago"], minutes=-2)).isoformat() + "Z"
            
        pred_record = {
            "job_id": job_ids[i],
            "status": cfg["status"],
            "records_processed": cfg["processed"],
            "anomaly_detected": cfg["anomalies"],
            "error_message": cfg.get("err"),
            "task_id": f"async_task_{uuid.uuid4().hex[:8]}",
            "triggered_by": profile_id,
            "created_at": created,
            "completed_at": completed
        }
        prediction_jobs.append(pred_record)
        
    try:
        supabase.table("prediction_jobs").insert(prediction_jobs).execute()
        logger.info(f"  ✅ Seeded {len(prediction_jobs)} prediction jobs history.")
    except Exception as e:
        logger.warning(f"  ⚠️ Skipping prediction_jobs seeding due to: {e}")

    # Determine high risk and review items for notifications, audit logs, and claim reviews
    # Let's rebuild cost comparisons locally
    high_risk_claims = []
    medium_risk_claims = []
    valid_claims = []

    for c in inserted_claims:
        app_cost = c["approved_claim_cost"]
        hosp_cost = c["hospital_cost"]
        ratio = hosp_cost / app_cost if app_cost > 0 else 1.0
        
        # Calculate local final_risk_score
        if ratio >= 1.8:
            anomaly = min(0.985, 0.8 + 0.18 * (ratio - 1.8) / 10.0)
            cf = min(0.95, 0.75 + 0.18 * (ratio - 1.8) / 10.0)
            risk = anomaly * 0.6 + cf * 0.4
        elif ratio >= 1.2:
            anomaly = 0.4 + 0.35 * (ratio - 1.2) / 0.6
            cf = 0.35 + 0.35 * (ratio - 1.2) / 0.6
            risk = anomaly * 0.6 + cf * 0.4
        else:
            anomaly = max(0.01, 0.05 + 0.25 * (ratio - 1.0) / 0.2) if ratio >= 1.0 else 0.05
            cf = max(0.01, 0.05 + 0.2 * (ratio - 1.0) / 0.2) if ratio >= 1.0 else 0.05
            risk = anomaly * 0.6 + cf * 0.4

        claim_info = {"id": c["claim_id"], "ratio": ratio, "risk": risk}
        
        if risk >= 0.80:
            high_risk_claims.append(claim_info)
        elif risk >= 0.50:
            medium_risk_claims.append(claim_info)
        else:
            valid_claims.append(claim_info)

    # 4.2 Seed notifications
    logger.info("  - Seeding notifications...")
    notifications = []
    
    # 5 notifications from high risk anomalies
    for idx, hc in enumerate(high_risk_claims[:5]):
        notifications.append({
            "type": "critical_anomaly",
            "severity": "error",
            "title": "Critical Risk Anomaly",
            "message": f"Claim {hc['id']} flagged with extremely high residual variance (ratio: {hc['ratio']:.2f}).",
            "read": False,
            "user_id": profile_id,
            "created_at": (datetime.utcnow() - timedelta(minutes=idx * 20)).isoformat() + "Z"
        })
        
    # 3 notifications from medium risk reviews
    for idx, mc in enumerate(medium_risk_claims[:3]):
        notifications.append({
            "type": "claim_review",
            "severity": "warning",
            "title": "Review Action Required",
            "message": f"Claim {mc['id']} has elevated discrepancy score of {mc['risk']:.2f}.",
            "read": False,
            "user_id": profile_id,
            "created_at": (datetime.utcnow() - timedelta(hours=idx * 2)).isoformat() + "Z"
        })
        
    # Global broadcast notification
    notifications.append({
        "type": "system_announcement",
        "severity": "success",
        "title": "AXA PRISM Seeding Complete",
        "message": f"Database successfully populated with historical records ({len(inserted_claims)} rows ingested).",
        "read": False,
        "user_id": None, # Global alert
        "created_at": datetime.utcnow().isoformat() + "Z"
    })
    
    try:
        supabase.table("notifications").insert(notifications).execute()
        logger.info(f"  ✅ Seeded {len(notifications)} notifications.")
    except Exception as e:
        logger.warning(f"  ⚠️ Skipping notifications seeding due to: {e}")

    # 4.3 Seed claim_reviews
    logger.info("  - Seeding active auditor collaborative reviews...")
    reviews = []
    
    # Generate active reviews for medium risk claims
    for idx, mc in enumerate(medium_risk_claims[:10]):
        reviews.append({
            "claim_id": mc["id"],
            "reviewer_id": profile_id,
            "notes": f"Under active analyst review. Initial diagnostic cost analysis reveals a residual cost multiplier of {mc['ratio']:.2f}x.",
            "suggested_status": "pending",
            "updated_at": (datetime.utcnow() - timedelta(hours=idx * 3)).isoformat() + "Z"
        })
        
    try:
        supabase.table("claim_reviews").insert(reviews).execute()
        logger.info(f"  ✅ Seeded {len(reviews)} active claims reviews.")
    except Exception as e:
        logger.warning(f"  ⚠️ Skipping claim_reviews seeding due to: {e}")

    # 4.4 Seed audit_logs
    logger.info("  - Seeding historical audit logs...")
    audit_logs = []
    
    # Seed 20 valid verified audit records
    for idx, vc in enumerate(valid_claims[:20]):
        audit_logs.append({
            "claim_id": vc["id"],
            "auditor_id": profile_id,
            "final_label": "valid",
            "auditor_notes": "Claim verified. Cost structure aligns with diagnosis ICD-10 description.",
            "retrain_ai_flag": False,
            "audited_at": (datetime.utcnow() - timedelta(days=2, hours=idx)).isoformat() + "Z"
        })
        
    # Seed 5 audited frauds
    for idx, hc in enumerate(high_risk_claims[5:10]):
        audit_logs.append({
            "claim_id": hc["id"],
            "auditor_id": profile_id,
            "final_label": "fraud",
            "auditor_notes": f"Verified fraud: Treatment fees were heavily inflated beyond maximum parameters (ratio {hc['ratio']:.2f}).",
            "retrain_ai_flag": True,
            "audited_at": (datetime.utcnow() - timedelta(days=1, hours=idx * 2)).isoformat() + "Z"
        })
        
    try:
        supabase.table("audit_logs").insert(audit_logs).execute()
        logger.info(f"  ✅ Seeded {len(audit_logs)} historical audit logs.")
    except Exception as e:
        logger.warning(f"  ⚠️ Skipping audit_logs seeding due to: {e}")

    logger.info("🎉 Database seeding complete! Run validation script next to inspect.")
    return True

if __name__ == "__main__":
    success = seed_database()
    if success:
        logger.info("🚀 Database Seeding Sprint completed successfully!")
        sys.exit(0)
    else:
        logger.error("❌ Database Seeding Sprint failed.")
        sys.exit(1)
