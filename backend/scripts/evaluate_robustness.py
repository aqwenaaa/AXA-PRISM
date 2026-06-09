import os
import sys
import numpy as np
import pandas as pd
import joblib
from datetime import datetime
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.metrics import r2_score

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.scripts.seed_utils import setup_logging, get_supabase_client
from backend.scripts.validate_seed import fetch_all_paginated
from backend.scripts.train_models import parse_date

logger = setup_logging("ml_robustness")

def run_robustness():
    logger.info("🔬 Starting ML Model Robustness Audit...")
    
    # 1. Connect and Fetch Data
    try:
        supabase = get_supabase_client()
        logger.info("✅ Supabase client connected.")
    except Exception as e:
        logger.error(f"❌ Connection failed: {e}")
        return False
        
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
    
    # Conversions
    df['is_cashless'] = (df['claim_type'] == 'C').astype(int)
    df['is_inpatient'] = (df['patient_type'] == 'IP').astype(int)
    
    # Categoricals
    encoders = {}
    categorical_cols = ['gender', 'claim_type', 'patient_type', 'domicile', 'hospital_location', 'icd_diagnosis']
    for col in categorical_cols:
        le = LabelEncoder()
        df[f'{col}_enc'] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        
    reg_features = [
        'usia_nasabah', 'gender_enc', 'is_cashless', 'is_inpatient', 
        'domicile_enc', 'hospital_location_enc', 'icd_diagnosis_enc'
    ]
    
    X = df[reg_features]
    y = df['approved_claim_cost']
    
    # Train / Test split
    split_idx = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    # ─── 1. Target Distribution Analysis ───
    logger.info("📊 Section A: Distribution Analysis...")
    y_mean = y.mean()
    y_med = y.median()
    y_std = y.std()
    y_p50 = np.percentile(y, 50)
    y_p75 = np.percentile(y, 75)
    y_p90 = np.percentile(y, 90)
    y_p95 = np.percentile(y, 95)
    y_p99 = np.percentile(y, 99)
    
    logger.info(f"   - Approved Claim Cost Mean:   IDR {y_mean:,.2f}")
    logger.info(f"   - Approved Claim Cost Median: IDR {y_med:,.2f}")
    logger.info(f"   - Approved Claim Cost StdDev: IDR {y_std:,.2f}")
    logger.info(f"   - Percentiles: P50={y_p50:,.0f} | P75={y_p75:,.0f} | P90={y_p90:,.0f} | P95={y_p95:,.0f} | P99={y_p99:,.0f}")
    
    # ─── 2. Error Analysis (On Baseline Model) ───
    logger.info("📊 Section B: Error Analysis...")
    models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "resources", "models")
    reg_model = joblib.load(os.path.join(models_dir, "random_forest_regressor.joblib"))
    
    df['preds_base'] = reg_model.predict(X)
    df['error_base'] = (df['approved_claim_cost'] - df['preds_base']).abs()
    
    # Top 50 largest errors
    top_50_errs = df.sort_values(by="error_base", ascending=False).head(50)
    logger.info(f"   - Top 50 Mean Error: IDR {top_50_errs['error_base'].mean():,.2f}")
    
    # Error by diagnosis category
    diag_errors = df.groupby('icd_diagnosis')['error_base'].mean().sort_values(ascending=False).head(5)
    logger.info("   - Top 5 Mean Error by Diagnosis:")
    for diag, val in diag_errors.items():
        logger.info(f"     * {diag:15s}: IDR {val:,.2f}")
        
    # Error by hospital location
    loc_errors = df.groupby('hospital_location')['error_base'].mean().sort_values(ascending=False)
    logger.info("   - Mean Error by Hospital Location:")
    for loc, val in loc_errors.items():
        logger.info(f"     * {loc:15s}: IDR {val:,.2f}")
        
    # Error by inpatient/outpatient
    pat_errors = df.groupby('patient_type')['error_base'].mean().sort_values(ascending=False)
    logger.info("   - Mean Error by Patient Status:")
    for pat, val in pat_errors.items():
        logger.info(f"     * {pat:15s}: IDR {val:,.2f}")
        
    # ─── 3. Log Transformation Experiment ───
    logger.info("📊 Section C: Log Transformation Experiment...")
    y_train_log = np.log1p(y_train)
    
    log_reg = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1)
    log_reg.fit(X_train, y_train_log)
    
    # Exponentiate back
    train_preds_log = np.expm1(log_reg.predict(X_train))
    test_preds_log = np.expm1(log_reg.predict(X_test))
    
    mae_train_log = np.mean(np.abs(y_train - train_preds_log))
    mae_test_log = np.mean(np.abs(y_test - test_preds_log))
    rmse_train_log = np.sqrt(np.mean((y_train - train_preds_log)**2))
    rmse_test_log = np.sqrt(np.mean((y_test - test_preds_log)**2))
    r2_train_log = r2_score(y_train, train_preds_log)
    r2_test_log = r2_score(y_test, test_preds_log)
    
    # Baseline comparison
    train_preds_base = reg_model.predict(X_train)
    test_preds_base = reg_model.predict(X_test)
    mae_train_base = np.mean(np.abs(y_train - train_preds_base))
    mae_test_base = np.mean(np.abs(y_test - test_preds_base))
    rmse_train_base = np.sqrt(np.mean((y_train - train_preds_base)**2))
    rmse_test_base = np.sqrt(np.mean((y_test - test_preds_base)**2))
    r2_train_base = r2_score(y_train, train_preds_base)
    r2_test_base = r2_score(y_test, test_preds_base)
    
    logger.info("--- Log Transform vs Baseline ---")
    logger.info(f"   - Train MAE  Base: IDR {mae_train_base:,.2f} | Log: IDR {mae_train_log:,.2f}")
    logger.info(f"   - Test MAE   Base: IDR {mae_test_base:,.2f} | Log: IDR {mae_test_log:,.2f}")
    logger.info(f"   - Train RMSE Base: IDR {rmse_train_base:,.2f} | Log: IDR {rmse_train_log:,.2f}")
    logger.info(f"   - Test RMSE  Base: IDR {rmse_test_base:,.2f} | Log: IDR {rmse_test_log:,.2f}")
    logger.info(f"   - Train R2   Base: {r2_train_base:.4f}  | Log: {r2_train_log:.4f}")
    logger.info(f"   - Test R2    Base: {r2_test_base:.4f} | Log: {r2_test_log:.4f}")
    
    # ─── 4. Gradient Boosting Benchmark ───
    logger.info("📊 Section D: Gradient Boosting Benchmark...")
    
    gbr = HistGradientBoostingRegressor(max_iter=100, max_depth=10, random_state=42)
    # Fit on log target as well for fair comparison
    gbr.fit(X_train, y_train_log)
    
    train_preds_gbr = np.expm1(gbr.predict(X_train))
    test_preds_gbr = np.expm1(gbr.predict(X_test))
    
    mae_train_gbr = np.mean(np.abs(y_train - train_preds_gbr))
    mae_test_gbr = np.mean(np.abs(y_test - test_preds_gbr))
    rmse_train_gbr = np.sqrt(np.mean((y_train - train_preds_gbr)**2))
    rmse_test_gbr = np.sqrt(np.mean((y_test - test_preds_gbr)**2))
    r2_train_gbr = r2_score(y_train, train_preds_gbr)
    r2_test_gbr = r2_score(y_test, test_preds_gbr)
    
    logger.info("--- HistGradientBoostingRegressor (Log) ---")
    logger.info(f"   - Train MAE : IDR {mae_train_gbr:,.2f}  |  Test MAE : IDR {mae_test_gbr:,.2f}")
    logger.info(f"   - Train RMSE: IDR {rmse_train_gbr:,.2f}  |  Test RMSE: IDR {rmse_test_gbr:,.2f}")
    logger.info(f"   - Train R2  : {r2_train_gbr:.4f}        |  Test R2  : {r2_test_gbr:.4f}")
    
    logger.info("[FINISHED] Robustness audit finished.")
    return True

if __name__ == "__main__":
    run_robustness()
