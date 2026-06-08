import os
import sys
import logging
import pandas as pd
import numpy as np
import joblib
from datetime import datetime
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import IsolationForest
from sklearn.ensemble import RandomForestRegressor

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.scripts.seed_utils import setup_logging, get_supabase_client
from backend.scripts.validate_seed import fetch_all_paginated

logger = setup_logging("train_models")

def parse_date(date_str):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except Exception:
        try:
            return datetime.strptime(date_str, "%m/%d/%Y")
        except Exception:
            return None

def train():
    logger.info("🎬 Starting model training pipeline...")
    
    # 1. Initialize connection
    try:
        supabase = get_supabase_client()
        logger.info("✅ Supabase client connected successfully.")
    except Exception as e:
        logger.error(f"❌ Failed to connect to Supabase: {e}")
        return False

    # 2. Fetch datasets
    logger.info("📦 Fetching policies and claims tables from database...")
    policies = fetch_all_paginated(supabase, "policies")
    claims = fetch_all_paginated(supabase, "claims")
    
    if not policies or not claims:
        logger.error("❌ Failed to retrieve dataset. Make sure tables are seeded.")
        return False
        
    logger.info(f"📄 Retrieved {len(policies)} policies and {len(claims)} claims.")
    
    df_policies = pd.DataFrame(policies)
    df_claims = pd.DataFrame(claims)
    
    # Left join claims with policies on policy_number
    df = df_claims.merge(df_policies, on="policy_number", how="left")
    logger.info(f"🔗 Merged dataset size: {df.shape}")
    
    # Fill missing values
    df['gender'] = df['gender'].fillna('M')
    df['domicile'] = df['domicile'].fillna('JAKARTA')
    df['hospital_location'] = df['hospital_location'].fillna('Indonesia')
    df['patient_type'] = df['patient_type'].fillna('OP')
    df['claim_type'] = df['claim_type'].fillna('R')
    df['icd_diagnosis'] = df['icd_diagnosis'].fillna('Unknown')
    
    # 3. Date Processing & Derived variables
    logger.info("🛠️ Processing dates and engineering features...")
    df['t_lahir'] = df['birth_date'].apply(parse_date)
    df['t_efektif'] = df['effective_date'].apply(parse_date)
    df['t_masuk'] = df['admission_date'].apply(parse_date)
    df['t_keluar'] = df['discharge_date'].apply(parse_date)
    
    REF_DATE = datetime(2026, 1, 1)
    
    # usia_nasabah
    df['usia_nasabah'] = df['t_lahir'].apply(lambda x: (REF_DATE - x).days / 365.25 if x else 45.0)
    df['usia_nasabah'] = df['usia_nasabah'].round(1).clip(lower=0, upper=100)
    
    # length_of_stay
    df['length_of_stay'] = df.apply(lambda r: (r['t_keluar'] - r['t_masuk']).days if r['t_keluar'] and r['t_masuk'] else 1, axis=1)
    df['length_of_stay'] = df['length_of_stay'].clip(lower=0)
    
    # policy_age_days
    df['policy_age_days'] = df.apply(lambda r: (r['t_masuk'] - r['t_efektif']).days if r['t_masuk'] and r['t_efektif'] else 365, axis=1)
    df['policy_age_days'] = df['policy_age_days'].clip(lower=0)
    
    # high_risk_region_indicator
    df['high_risk_region_indicator'] = (df['hospital_location'] != 'Indonesia').astype(int)
    
    # 4. Historical Feature Engineering (Policy-Level)
    logger.info("📊 Aggregating historical claim features per policy...")
    policy_counts = df.groupby('policy_number')['claim_id'].count().to_dict()
    df['claim_frequency'] = df['policy_number'].map(policy_counts)
    df['repeated_claim_indicator'] = (df['claim_frequency'] > 1).astype(int)
    
    # Claim velocity (claims per month of policy age)
    df['claim_velocity'] = df.apply(lambda r: r['claim_frequency'] / max(1.0, r['policy_age_days'] / 30.44), axis=1)
    
    # Conversions
    df['is_cashless'] = (df['claim_type'] == 'C').astype(int)
    df['is_inpatient'] = (df['patient_type'] == 'IP').astype(int)
    
    # Calculate Plan Expected Cost Benchmark (median claim cost per plan code)
    plan_expected_cost = df.groupby('plan_code')['approved_claim_cost'].median().to_dict()
    df['expected_claim_cost_benchmark'] = df['plan_code'].map(plan_expected_cost).fillna(df['approved_claim_cost'].median())
    
    # 5. Label Encoding Categorical Variables
    logger.info("🏷️ Encoding categorical variables...")
    categorical_cols = ['gender', 'claim_type', 'patient_type', 'domicile', 'hospital_location', 'icd_diagnosis']
    encoders = {}
    
    for col in categorical_cols:
        le = LabelEncoder()
        df[f'{col}_enc'] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        
    # 6. RandomForestRegressor Training (Predict approved claim cost)
    logger.info("🌲 Training RandomForestRegressor model...")
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
    
    reg_model = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1)
    reg_model.fit(X_train_reg, y_train_reg)
    
    # Evaluation
    train_preds = reg_model.predict(X_train_reg)
    test_preds = reg_model.predict(X_test_reg)
    logger.info(f"   - Regressor Train MAE: IDR {np.mean(np.abs(y_train_reg - train_preds)):,.2f}")
    logger.info(f"   - Regressor Test MAE : IDR {np.mean(np.abs(y_test_reg - test_preds)):,.2f}")
    
    # Attach expectations to calculate residuals
    df['expected_claim_cost'] = reg_model.predict(X_reg)
    df['residual_cost'] = (df['hospital_cost'] - df['expected_claim_cost']).clip(lower=0)
    df['claim_to_expected_ratio'] = df['approved_claim_cost'] / df['expected_claim_cost'].replace(0, 1e-9)
    df['actual_vs_expected_diff'] = (df['hospital_cost'] - df['expected_claim_cost']).abs()
    
    # 7. IsolationForest Training
    logger.info("🌲 Training IsolationForest anomaly detection model...")
    iso_features = [
        'approved_claim_cost', 'residual_cost', 'claim_to_expected_ratio',
        'actual_vs_expected_diff', 'claim_frequency', 'claim_velocity',
        'high_risk_region_indicator', 'length_of_stay'
    ]
    
    X_iso = df[iso_features].fillna(0)
    
    # Scale features for Isolation Forest
    scaler = StandardScaler()
    X_iso_scaled = scaler.fit_transform(X_iso)
    
    iso_model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42, n_jobs=-1)
    iso_model.fit(X_iso_scaled)
    
    raw_scores = iso_model.score_samples(X_iso_scaled)
    # Scale anomaly scores to [0, 1] range (where higher is more anomalous)
    min_score, max_score = raw_scores.min(), raw_scores.max()
    logger.info(f"   - Raw anomaly score bounds: [{min_score:.4f} to {max_score:.4f}]")
    
    # 8. Save Artifacts
    logger.info("💾 Serializing model artifacts to disk...")
    models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "resources", "models")
    os.makedirs(models_dir, exist_ok=True)
    
    joblib.dump(reg_model, os.path.join(models_dir, "random_forest_regressor.joblib"))
    joblib.dump(iso_model, os.path.join(models_dir, "isolation_forest.joblib"))
    joblib.dump(scaler, os.path.join(models_dir, "feature_scaler.joblib"))
    joblib.dump(encoders, os.path.join(models_dir, "categorical_encoders.joblib"))
    joblib.dump(plan_expected_cost, os.path.join(models_dir, "plan_cost_benchmarks.joblib"))
    
    logger.info("🎉 Model training completed successfully! Saved models in: " + models_dir)
    return True

if __name__ == "__main__":
    success = train()
    sys.exit(0 if success else 1)
