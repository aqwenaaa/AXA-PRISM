import os
import sys
import numpy as np
import pandas as pd
import joblib
from datetime import datetime

# Ensure backend directory is in path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
backend_path = os.path.dirname(os.path.dirname(__file__))
sys.path.append(project_root)
sys.path.append(backend_path)

from backend.scripts.seed_utils import setup_logging, get_supabase_client
from backend.scripts.validate_seed import fetch_all_paginated
from backend.scripts.train_models import parse_date

logger = setup_logging("ml_validator")

def run_ml_audit():
    logger.info("🔬 Starting ML Pipeline Validation Audit...")
    
    # 1. Connect
    try:
        supabase = get_supabase_client()
        logger.info("✅ Supabase client connected.")
    except Exception as e:
        logger.error(f"❌ Failed to connect: {e}")
        return False
        
    models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "resources", "models")
    
    # Check if artifacts exist
    artifacts = [
        "random_forest_regressor.joblib",
        "isolation_forest.joblib",
        "feature_scaler.joblib",
        "categorical_encoders.joblib",
        "plan_cost_benchmarks.joblib"
    ]
    
    for art in artifacts:
        path = os.path.join(models_dir, art)
        if not os.path.exists(path):
            logger.error(f"❌ Artifact missing: {path}")
            return False
            
    logger.info("✅ All ML artifacts verified on disk. Loading models...")
    
    reg_model = joblib.load(os.path.join(models_dir, "random_forest_regressor.joblib"))
    iso_model = joblib.load(os.path.join(models_dir, "isolation_forest.joblib"))
    scaler = joblib.load(os.path.join(models_dir, "feature_scaler.joblib"))
    encoders = joblib.load(os.path.join(models_dir, "categorical_encoders.joblib"))
    plan_costs = joblib.load(os.path.join(models_dir, "plan_cost_benchmarks.joblib"))
    
    # 2. Fetch dataset
    logger.info("📦 Loading claims and policies data from database...")
    policies = fetch_all_paginated(supabase, "policies")
    claims = fetch_all_paginated(supabase, "claims")
    
    df_policies = pd.DataFrame(policies)
    df_claims = pd.DataFrame(claims)
    df = df_claims.merge(df_policies, on="policy_number", how="left")
    
    # Fill missing values
    df['gender'] = df['gender'].fillna('M')
    df['domicile'] = df['domicile'].fillna('JAKARTA')
    df['hospital_location'] = df['hospital_location'].fillna('Indonesia')
    df['patient_type'] = df['patient_type'].fillna('OP')
    df['claim_type'] = df['claim_type'].fillna('R')
    df['icd_diagnosis'] = df['icd_diagnosis'].fillna('Unknown')
    
    # Preprocess
    df['t_lahir'] = df['birth_date'].apply(parse_date)
    df['t_efektif'] = df['effective_date'].apply(parse_date)
    df['t_masuk'] = df['admission_date'].apply(parse_date)
    df['t_keluar'] = df['discharge_date'].apply(parse_date)
    
    REF_DATE = datetime(2026, 1, 1)
    df['usia_nasabah'] = df['t_lahir'].apply(lambda x: (REF_DATE - x).days / 365.25 if x else 45.0)
    df['usia_nasabah'] = df['usia_nasabah'].round(1).clip(lower=0, upper=100)
    df['length_of_stay'] = df.apply(lambda r: (r['t_keluar'] - r['t_masuk']).days if r['t_keluar'] and r['t_masuk'] else 1, axis=1)
    df['length_of_stay'] = df['length_of_stay'].clip(lower=0)
    df['policy_age_days'] = df.apply(lambda r: (r['t_masuk'] - r['t_efektif']).days if r['t_masuk'] and r['t_efektif'] else 365, axis=1)
    df['policy_age_days'] = df['policy_age_days'].clip(lower=0)
    df['high_risk_region_indicator'] = (df['hospital_location'] != 'Indonesia').astype(int)
    
    # Historical aggregates
    policy_counts = df.groupby('policy_number')['claim_id'].count().to_dict()
    df['claim_frequency'] = df['policy_number'].map(policy_counts)
    df['repeated_claim_indicator'] = (df['claim_frequency'] > 1).astype(int)
    df['claim_velocity'] = df.apply(lambda r: r['claim_frequency'] / max(1.0, r['policy_age_days'] / 30.44), axis=1)
    df['is_cashless'] = (df['claim_type'] == 'C').astype(int)
    df['is_inpatient'] = (df['patient_type'] == 'IP').astype(int)
    
    # Encode categorical variables
    for col in encoders:
        le = encoders[col]
        df[f'{col}_enc'] = df[col].apply(lambda x: int(le.transform([str(x)])[0]) if str(x) in le.classes_ else 0)
        
    # RandomForest Evaluation
    logger.info("🌲 Auditing RandomForestRegressor performance...")
    reg_features = [
        'usia_nasabah', 'gender_enc', 'is_cashless', 'is_inpatient', 
        'domicile_enc', 'hospital_location_enc', 'icd_diagnosis_enc'
    ]
    X_reg = df[reg_features]
    y_reg = df['approved_claim_cost']
    
    # Chronological Split (Train 80%, Test 20%)
    split_idx = int(len(df) * 0.8)
    X_train_reg, X_test_reg = X_reg.iloc[:split_idx], X_reg.iloc[split_idx:]
    y_train_reg, y_test_reg = y_reg.iloc[:split_idx], y_reg.iloc[split_idx:]
    
    train_preds = reg_model.predict(X_train_reg)
    test_preds = reg_model.predict(X_test_reg)
    
    # Metrics
    mae_train = np.mean(np.abs(y_train_reg - train_preds))
    mae_test = np.mean(np.abs(y_test_reg - test_preds))
    rmse_train = np.sqrt(np.mean((y_train_reg - train_preds)**2))
    rmse_test = np.sqrt(np.mean((y_test_reg - test_preds)**2))
    
    # R2 scores
    from sklearn.metrics import r2_score
    r2_train = r2_score(y_train_reg, train_preds)
    r2_test = r2_score(y_test_reg, test_preds)
    
    logger.info("--- RandomForest Metrics ---")
    logger.info(f"   - Dataset Total Size: {len(df)}")
    logger.info(f"   - Train / Test Samples: {len(y_train_reg)} / {len(y_test_reg)}")
    logger.info(f"   - Target Approved Claim Cost - Mean:   IDR {y_reg.mean():,.2f}")
    logger.info(f"   - Target Approved Claim Cost - Median: IDR {y_reg.median():,.2f}")
    logger.info(f"   - Target Approved Claim Cost - Range:  IDR {y_reg.min():,.2f} to IDR {y_reg.max():,.2f}")
    logger.info(f"   - Train MAE:  IDR {mae_train:,.2f}  |  Test MAE:  IDR {mae_test:,.2f}")
    logger.info(f"   - Train RMSE: IDR {rmse_train:,.2f}  |  Test RMSE: IDR {rmse_test:,.2f}")
    logger.info(f"   - Train R2:   {r2_train:.4f}       |  Test R2:   {r2_test:.4f}")
    
    # Feature Importance
    importances = reg_model.feature_importances_
    indices = np.argsort(importances)[::-1]
    logger.info("--- Feature Importance Ranking ---")
    for rank, idx in enumerate(indices):
        logger.info(f"   {rank+1}. {reg_features[idx]:25s}: {importances[idx]*100:.2f}%")
        
    # IsolationForest Evaluation
    logger.info("🌲 Auditing IsolationForest anomaly detection...")
    iso_features = [
        'approved_claim_cost', 'residual_cost', 'claim_to_expected_ratio',
        'actual_vs_expected_diff', 'claim_frequency', 'claim_velocity',
        'high_risk_region_indicator', 'length_of_stay'
    ]
    
    # Calculate residuals
    df['expected_claim_cost'] = reg_model.predict(X_reg)
    df['residual_cost'] = (df['hospital_cost'] - df['expected_claim_cost']).clip(lower=0)
    df['claim_to_expected_ratio'] = df['approved_claim_cost'] / df['expected_claim_cost'].replace(0, 1e-9)
    df['actual_vs_expected_diff'] = (df['hospital_cost'] - df['expected_claim_cost']).abs()
    
    X_iso = df[iso_features].fillna(0)
    X_iso_scaled = scaler.transform(X_iso)
    
    raw_scores = iso_model.score_samples(X_iso_scaled)
    preds = iso_model.predict(X_iso_scaled)
    
    # Scale anomaly scores to [0, 1] range: min=-0.7660, max=-0.3388
    # higher anomaly_score means more anomalous
    norm_anomaly = (-0.3388 - raw_scores) / 0.4272
    anomaly_scores = np.clip(norm_anomaly, 0.0, 1.0)
    
    anomalies = np.sum(preds == -1)
    anomaly_pct = anomalies / len(df) * 100
    
    logger.info("--- IsolationForest Metrics ---")
    logger.info(f"   - Total records scored: {len(df)}")
    logger.info(f"   - Raw Anomaly Score - Mean:   {raw_scores.mean():.4f}")
    logger.info(f"   - Raw Anomaly Score - Range:  {raw_scores.min():.4f} to {raw_scores.max():.4f}")
    logger.info(f"   - Normalised Anomaly - Mean:  {anomaly_scores.mean():.4f}")
    logger.info(f"   - Normalised Anomaly - Range: {anomaly_scores.min():.4f} to {anomaly_scores.max():.4f}")
    logger.info(f"   - Anomalies Detected Count:   {anomalies}")
    logger.info(f"   - Anomalies Percentage:       {anomaly_pct:.2f}%")
    
    # Top anomalies
    df['anomaly_score_calc'] = anomaly_scores
    top_anoms = df.sort_values(by="anomaly_score_calc", ascending=False).head(5)
    logger.info("--- Top Anomaly Examples ---")
    for idx, row in top_anoms.iterrows():
        logger.info(f"   - Claim {row['claim_id']}: Billed: IDR {row['hospital_cost']:,.0f} | Approved: IDR {row['approved_claim_cost']:,.0f} | Normalised Score: {row['anomaly_score_calc']:.4f}")
        
    # Certainty Factor & EDAS Verification
    logger.info("🌲 Checking Certainty Factor Engine and EDAS prioritization...")
    
    # Instantiate MLService directly to audit live outputs
    from app.services.ml_service import MLService
    ml_svc = MLService()
    
    # Run dynamic batch execution on top 20 claims
    claim_ids = list(df.sort_values(by="anomaly_score_calc", ascending=False).head(20)['claim_id'])
    
    # Executing ML batch inference
    results = ml_svc.execute_inference_batch(claim_ids)
    df_results = pd.DataFrame(results)
    
    logger.info("--- EDAS Top 10 Ranked Claims ---")
    for idx, row in df_results.sort_values(by="dss_rank").head(10).iterrows():
        logger.info(f"   - Rank {row['dss_rank']:2d} | Claim: {row['claim_id']} | Risk Score: {row['final_risk_score']:.4f} | EDAS Score: {row['edas_score']:.4f} | Priority: {row['investigation_priority']}")
        
    logger.info("[FINISHED] ML Pipeline Validation Audit successfully completed!")
    return True

if __name__ == "__main__":
    run_ml_audit()
