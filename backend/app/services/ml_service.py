import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.repositories.claim import ClaimRepository
from app.repositories.policy import PolicyRepository
from app.repositories.settings import SystemSettingsRepository

class MLService:
    def __init__(self):
        self.claim_repo = ClaimRepository()
        self.policy_repo = PolicyRepository()
        self.settings_repo = SystemSettingsRepository()
        
        self.models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "app", "resources", "models")
        self.regressor = None
        self.anomaly_detector = None
        self.scaler = None
        self.encoders = None
        self.plan_costs = None
        
        self.load_models()
        
    def load_models(self):
        try:
            reg_path = os.path.join(self.models_dir, "random_forest_regressor.joblib")
            if os.path.exists(reg_path):
                self.regressor = joblib.load(reg_path)
            
            ifos_path = os.path.join(self.models_dir, "isolation_forest.joblib")
            if os.path.exists(ifos_path):
                self.anomaly_detector = joblib.load(ifos_path)
                
            scaler_path = os.path.join(self.models_dir, "feature_scaler.joblib")
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
                
            enc_path = os.path.join(self.models_dir, "categorical_encoders.joblib")
            if os.path.exists(enc_path):
                self.encoders = joblib.load(enc_path)
                
            plan_path = os.path.join(self.models_dir, "plan_cost_benchmarks.joblib")
            if os.path.exists(plan_path):
                self.plan_costs = joblib.load(plan_path)
        except Exception as e:
            print(f"Error loading model artifacts: {e}")

    def parse_date(self, date_str: str) -> Optional[datetime]:
        if not date_str:
            return None
        try:
            return datetime.strptime(str(date_str).strip(), "%Y-%m-%d")
        except Exception:
            try:
                # Handle M/D/YYYY
                return datetime.strptime(str(date_str).strip(), "%m/%d/%Y")
            except Exception:
                return None

    def _encode_val(self, encoder_name: str, val: str) -> int:
        if not self.encoders or encoder_name not in self.encoders:
            return 0
        le = self.encoders[encoder_name]
        val_str = str(val).strip()
        try:
            if val_str in le.classes_:
                return int(le.transform([val_str])[0])
            else:
                return 0
        except Exception:
            return 0

    def get_policy_level_history(self, policy_number: str, all_claims: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculates historical claim counts and statistics for a given policy number.
        """
        matching = [c for c in all_claims if c.get("policy_number") == policy_number]
        count = len(matching)
        repeated = 1 if count > 1 else 0
        return {
            "count": count,
            "repeated": repeated
        }

    def measure_of_belief(self, evidence: float, high_thresh: float = 0.70, med_thresh: float = 0.40) -> float:
        if evidence >= high_thresh:
            return 0.80
        elif evidence >= med_thresh:
            return 0.50
        else:
            return 0.20

    def measure_of_disbelief(self, evidence: float, high_thresh: float = 0.70, med_thresh: float = 0.40) -> float:
        if evidence >= high_thresh:
            return 0.10
        elif evidence >= med_thresh:
            return 0.25
        else:
            return 0.50

    def cf_single(self, evidence: float, high_thresh: float = 0.70, med_thresh: float = 0.40) -> float:
        mb = self.measure_of_belief(evidence, high_thresh, med_thresh)
        md = self.measure_of_disbelief(evidence, high_thresh, med_thresh)
        return round(mb - md, 4)

    def combine_cf(self, cf1: float, cf2: float) -> float:
        if cf1 >= 0 and cf2 >= 0:
            return cf1 + cf2 * (1.0 - cf1)
        elif cf1 < 0 and cf2 < 0:
            return cf1 + cf2 * (1.0 + cf1)
        else:
            denom = 1.0 - min(abs(cf1), abs(cf2))
            return (cf1 + cf2) / denom if denom != 0 else 0.0

    def compute_cf_score(self, anomaly_score: float, hospital_location: str, approved_claim_cost: float, claim_velocity: float, repeated: int, residual: float, max_approved_cost: float, max_residual: float) -> float:
        # CF Anomaly Score (from IF)
        cf_anomaly = self.cf_single(anomaly_score)
        
        # CF Location Risk (overseas flag)
        is_overseas = 1.0 if hospital_location != "Indonesia" else 0.0
        cf_location = self.cf_single(is_overseas, high_thresh=0.5, med_thresh=0.0)
        
        # CF Severity Risk (normalised approved cost)
        norm_severity = approved_claim_cost / max_approved_cost if max_approved_cost > 0 else 0.0
        cf_severity = self.cf_single(norm_severity)
        
        # CF Behavioral Risk (velocity & repeated indicators)
        vel_norm = min(1.0, claim_velocity / 2.0) # threshold at 2 claims per month
        behavioral_risk = (repeated * 0.50) + (vel_norm * 0.50)
        cf_behavioral = self.cf_single(behavioral_risk)
        
        # CF Residual Risk (normalised residual cost)
        norm_residual = residual / max_residual if max_residual > 0 else 0.0
        cf_residual = self.cf_single(norm_residual)
        
        # Sequentially combine the CF rules
        combined = cf_anomaly
        for next_cf in [cf_location, cf_severity, cf_behavioral, cf_residual]:
            combined = self.combine_cf(combined, next_cf)
            
        # Normalise to [0, 1] range assuming combined bounds between -0.9 and 0.99
        norm_cf = (combined + 0.9) / 1.89
        return float(np.clip(norm_cf, 0.0, 1.0))

    def run_edas_dss(self, processed_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Applies EDAS algorithm to rank the claims by priority.
        """
        if not processed_records:
            return []
            
        df_edas = pd.DataFrame(processed_records)
        
        # Criteria & Weights
        criteria = ['approved_claim_cost', 'residual', 'anomaly_score', 'cf_score', 'final_risk_score']
        weights = {
            'approved_claim_cost': 0.25,
            'residual': 0.20,
            'anomaly_score': 0.20,
            'cf_score': 0.20,
            'final_risk_score': 0.15
        }
        
        # Fill nulls with 0
        for col in criteria:
            if col not in df_edas.columns:
                df_edas[col] = 0.0
            else:
                df_edas[col] = df_edas[col].fillna(0.0).astype(float)
                
        # 1. Average Solution (AV)
        AV = df_edas[criteria].mean()
        
        # 2. PDA / NDA Calculations
        PDA = pd.DataFrame(index=df_edas.index, columns=criteria, dtype=float)
        NDA = pd.DataFrame(index=df_edas.index, columns=criteria, dtype=float)
        
        for col in criteria:
            av_val = AV[col] if AV[col] != 0 else 1e-9
            PDA[col] = ((df_edas[col] - av_val) / av_val).clip(lower=0)
            NDA[col] = ((av_val - df_edas[col]) / av_val).clip(lower=0)
            
        # 3. Weighted Sums
        SP = sum(weights[c] * PDA[c] for c in criteria)
        SN = sum(weights[c] * NDA[c] for c in criteria)
        
        # 4. Normalise NSP and NSN
        max_sp = SP.max()
        max_sn = SN.max()
        NSP = SP / max_sp if max_sp > 0 else SP
        NSN = SN / max_sn if max_sn > 0 else SN
        
        # 5. Calculate EDAS score and DSS Rank
        df_edas['edas_score'] = ((NSP + (1.0 - NSN)) / 2.0).round(4)
        df_edas['dss_rank'] = df_edas['edas_score'].rank(ascending=False, method='first').astype(int)
        
        # Classify prioritization levels
        def get_priority(score):
            if score >= 0.75: return "Fraud Investigation Priority"
            elif score >= 0.55: return "Suspicious Claim"
            elif score >= 0.35: return "Review Required"
            else: return "Valid Claim"
            
        df_edas['investigation_priority'] = df_edas['edas_score'].apply(get_priority)
        
        return df_edas.to_dict(orient="records")

    def execute_inference_batch(self, claim_ids: List[str], age_weight: float = 0.2, bmi_weight: float = 0.3, smoker_weight: float = 0.5, anomaly_threshold: float = 85.0) -> List[Dict[str, Any]]:
        """
        Executes feature engineering and real model inference for a batch of claim IDs.
        """
        # Load all claims and policies to do historical calculations in-memory
        all_claims = self.claim_repo.list_claims_with_ml(limit=10000)
        
        processed_outputs = []
        
        # Compute dynamic maxes for scaling
        max_approved = max([float(c.get("approved_claim_cost", 0.0)) for c in all_claims] or [50000000.0])
        max_residual = max([float(c.get("hospital_cost", 0.0)) - float(c.get("approved_claim_cost", 0.0)) for c in all_claims] or [10000000.0])
        
        for cid in claim_ids:
            claim = self.claim_repo.get_by_id(cid, id_field="claim_id")
            if not claim:
                continue
                
            p_num = claim.get("policy_number")
            policy = self.policy_repo.get_by_id(p_num, id_field="policy_number") if p_num else None
            
            # Resolve age
            age = 45
            birth_date_str = policy.get("birth_date") if policy else None
            if birth_date_str:
                try:
                    birth_year = int(str(birth_date_str).split("-")[0])
                    age = 2026 - birth_year
                except Exception:
                    pass
            norm_age = age / 100.0
            
            # Resolve demographics
            gender = policy.get("gender") if policy else "M"
            domicile = policy.get("domicile") if policy else "JAKARTA"
            
            # Simulate BMI/Smoker if not in policy (following setup rules)
            cid_hash = hash(cid)
            bmi = (cid_hash % 15) + 18
            norm_bmi = (bmi - 18.0) / 15.0
            
            smoker = 1.0 if (cid_hash % 5 == 0) else 0.0
            
            # Compute Certainty Factor Score inputs
            total_w = age_weight + bmi_weight + smoker_weight
            cf_expert = (age_weight * norm_age + bmi_weight * norm_bmi + smoker_weight * smoker) / total_w if total_w > 0 else 0.5
            
            # Feature calculations
            app_cost = float(claim.get("approved_claim_cost", 0.0))
            hosp_cost = float(claim.get("hospital_cost", 0.0))
            
            t_masuk = self.parse_date(claim.get("admission_date"))
            t_keluar = self.parse_date(claim.get("discharge_date"))
            t_efektif = self.parse_date(policy.get("effective_date")) if policy else None
            
            length_of_stay = (t_keluar - t_masuk).days if t_keluar and t_masuk else 1
            length_of_stay = max(0, length_of_stay)
            
            policy_age_days = (t_masuk - t_efektif).days if t_masuk and t_efektif else 365
            policy_age_days = max(0, policy_age_days)
            
            high_risk_region_indicator = 1 if claim.get("hospital_location") != "Indonesia" else 0
            
            # Historical policy features
            history = self.get_policy_level_history(p_num, all_claims)
            claim_frequency = history["count"]
            repeated = history["repeated"]
            claim_velocity = claim_frequency / max(1.0, policy_age_days / 30.44)
            
            # ─── Model Inference ───
            expected_cost = app_cost * 0.4 # Default heuristic fallback
            anomaly_score = 0.1 # Default heuristic fallback
            
            if self.regressor and self.anomaly_detector and self.scaler:
                try:
                    # Regressor Feature engineering
                    gender_enc = self._encode_val("gender", gender)
                    claim_type_enc = self._encode_val("claim_type", claim.get("claim_type", "R"))
                    patient_type_enc = self._encode_val("patient_type", claim.get("patient_type", "OP"))
                    domicile_enc = self._encode_val("domicile", domicile)
                    location_enc = self._encode_val("hospital_location", claim.get("hospital_location", "Indonesia"))
                    icd_enc = self._encode_val("icd_diagnosis", claim.get("icd_diagnosis", "Unknown"))
                    
                    is_cashless = 1 if claim.get("claim_type") == "C" else 0
                    is_inpatient = 1 if claim.get("patient_type") == "IP" else 0
                    
                    # Regressor prediction
                    reg_input = pd.DataFrame([{
                        "usia_nasabah": float(age),
                        "gender_enc": gender_enc,
                        "is_cashless": is_cashless,
                        "is_inpatient": is_inpatient,
                        "domicile_enc": domicile_enc,
                        "hospital_location_enc": location_enc,
                        "icd_diagnosis_enc": icd_enc
                    }])
                    
                    expected_cost = float(self.regressor.predict(reg_input)[0])
                    
                    # Residual Calculations
                    residual = max(0.0, hosp_cost - expected_cost)
                    ratio = app_cost / expected_cost if expected_cost > 0 else 1.0
                    diff = abs(hosp_cost - expected_cost)
                    
                    # Isolation Forest prediction
                    iso_input = pd.DataFrame([{
                        "approved_claim_cost": app_cost,
                        "residual_cost": residual,
                        "claim_to_expected_ratio": ratio,
                        "actual_vs_expected_diff": diff,
                        "claim_frequency": float(claim_frequency),
                        "claim_velocity": float(claim_velocity),
                        "high_risk_region_indicator": high_risk_region_indicator,
                        "length_of_stay": float(length_of_stay)
                    }])
                    
                    iso_scaled = self.scaler.transform(iso_input)
                    raw_anomaly = float(self.anomaly_detector.score_samples(iso_scaled)[0])
                    
                    # Normalise raw_anomaly to [0, 1] range using bounds: min=-0.7660, max=-0.3388
                    # higher anomaly_score means more anomalous
                    norm_anomaly = (-0.3388 - raw_anomaly) / 0.4272
                    anomaly_score = float(np.clip(norm_anomaly, 0.0, 1.0))
                except Exception as ex:
                    print(f"Prediction failed for claim {cid}: {ex}")
                    # Fallback to cost ratio heuristic
                    ratio = hosp_cost / app_cost if app_cost > 0 else 1.0
                    anomaly_score = 0.8 if ratio >= 1.8 else (0.4 if ratio >= 1.2 else 0.05)
                    expected_cost = app_cost * 0.4
            else:
                # Fallback heuristic calculation if models are not loaded
                ratio = hosp_cost / app_cost if app_cost > 0 else 1.0
                anomaly_score = 0.8 if ratio >= 1.8 else (0.4 if ratio >= 1.2 else 0.05)
                expected_cost = app_cost * 0.4
                
            residual = hosp_cost - expected_cost
            
            # Combine Certainty Factors
            cf_score = self.compute_cf_score(
                anomaly_score=anomaly_score,
                hospital_location=claim.get("hospital_location", "Indonesia"),
                approved_claim_cost=app_cost,
                claim_velocity=claim_velocity,
                repeated=repeated,
                residual=residual,
                max_approved_cost=max_approved,
                max_residual=max_residual
            )
            
            # Final Risk Score = (anomaly_score * 0.6) + (cf_expert * 0.4)
            # Calibration applies anomaly_threshold
            final_risk_score = (anomaly_score * 0.6) + (cf_expert * 0.4)
            is_anomaly = final_risk_score >= (anomaly_threshold / 100.0)
            
            rec = {
                "claim_id": cid,
                "expected_claim_cost": float(expected_cost),
                "residual": float(residual),
                "anomaly_score": float(anomaly_score),
                "risk_cluster": 3 if is_anomaly else (2 if final_risk_score >= 0.5 else 1),
                "cf_score": float(cf_score),
                "final_risk_score": float(final_risk_score),
                "recommended_action": "audit_claim" if is_anomaly else "approve"
            }
            processed_outputs.append(rec)
            
        # Run EDAS prioritized ranking on processed outputs
        ranked_outputs = self.run_edas_dss(processed_outputs)
        return ranked_outputs
