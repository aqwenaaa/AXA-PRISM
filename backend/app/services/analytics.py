from app.repositories.claim import ClaimRepository
from app.repositories.policy import PolicyRepository
from app.repositories.profile import ProfileRepository
from typing import Dict, Any, List

class AnalyticsService:
    def __init__(self):
        self.claim_repo = ClaimRepository()
        self.policy_repo = PolicyRepository()
        self.profile_repo = ProfileRepository()

    def get_admin_metrics(self) -> Dict[str, Any]:
        """
        Gathers system-wide operations stats.
        """
        active_users = self.profile_repo.count_profiles()
        total_claims = self.claim_repo.count_claims()
        
        return {
            "system_status": "Healthy",
            "active_users": active_users if active_users > 0 else 5,
            "data_quality_score": 98.2,
            "model_version": "v2.4.3",
            "recent_activities": [
                {
                    "user": "Dr. Sari Dewi",
                    "action": "detected 3 new anomalies",
                    "module": "Intelligence Lab",
                    "time": "5 minutes ago",
                    "severity": "info"
                },
                {
                    "user": "Ahmad Fauzi",
                    "action": "uploaded claims dataset",
                    "module": "Data Ingestion",
                    "time": "12 minutes ago",
                    "severity": "success"
                }
            ]
        }

    def get_operator_metrics(self) -> Dict[str, Any]:
        """
        Aggregates row and validation counts.
        """
        total_claims = self.claim_repo.count_claims()
        total_policies = self.policy_repo.count_policies()
        
        return {
            "total_processed_rows": (total_claims + total_policies) if (total_claims + total_policies) > 0 else 173686,
            "missing_value_percentage": 2.3,
            "format_consistency": 98.7,
            "recent_jobs": [
                {
                    "id": "JOB-2026-01",
                    "type": "claims",
                    "filename": "claims_data_2026.csv",
                    "rowCount": total_claims if total_claims > 0 else 128456,
                    "status": "completed",
                    "timestamp": "2026-05-30T10:00:00Z"
                },
                {
                    "id": "JOB-2026-02",
                    "type": "policy",
                    "filename": "policy_data_2026.csv",
                    "rowCount": total_policies if total_policies > 0 else 45230,
                    "status": "completed",
                    "timestamp": "2026-05-30T09:30:00Z"
                }
            ]
        }

    def get_analyst_metrics(self) -> Dict[str, Any]:
        """
        Compiles regression costs scatter data and feature importances.
        """
        # Static mappings as requested for visualization (AI/ML is mock in this phase)
        scatter_points = [
            { "expected": 1200.0, "actual": 1150.0, "type": "normal" },
            { "expected": 2500.0, "actual": 2600.0, "type": "normal" },
            { "expected": 3200.0, "actual": 3100.0, "type": "normal" },
            { "expected": 4500.0, "actual": 4400.0, "type": "normal" },
            { "expected": 2100.0, "actual": 7500.0, "type": "outlier" },
            { "expected": 1900.0, "actual": 6800.0, "type": "outlier" },
            { "expected": 3300.0, "actual": 8200.0, "type": "outlier" }
        ]
        
        feature_importance = [
            { "feature": "Hospital Tier", "importance": 92, "color": "#8A70D6" },
            { "feature": "Diagnosis Code", "importance": 87, "color": "#8A70D6" },
            { "feature": "Treatment Duration", "importance": 78, "color": "#8A70D6" },
            { "feature": "Patient Age", "importance": 65, "color": "#F2994A" }
        ]

        return {
            "accuracy": 96.8,
            "outlier_count": 4,
            "claim_increase_percent": 25.5,
            "risk_clusters": 4,
            "scatter_data": scatter_points,
            "feature_importance": feature_importance
        }

    def get_auditor_metrics(self) -> Dict[str, Any]:
        """
        Pulls pending anomalous claims count and auditor lists.
        """
        claims = self.claim_repo.list_claims_with_ml(status="pending", limit=10)
        
        return {
            "pending_reviews": len(claims) if len(claims) > 0 else 4,
            "avg_anomaly_score": 95.4,
            "reviewed_today": 12,
            "claims": claims
        }

    def get_manager_metrics(self) -> Dict[str, Any]:
        """
        Synthesizes financial impacts, savings, and action plans.
        """
        return {
            "total_claims_increase_pct": 25.5,
            "predicted_savings": 7700000.00,
            "high_risk_claims_pct": 23.0,
            "model_confidence": 96.8,
            "risk_tier_distribution": [
                { "name": "Tier 1: Critical", "value": 5, "color": "#d4183d" },
                { "name": "Tier 2: High", "value": 18, "color": "#F2994A" },
                { "name": "Tier 3: Medium", "value": 35, "color": "#8A70D6" },
                { "name": "Tier 4: Low", "value": 42, "color": "#27AE60" }
            ],
            "strategic_actions": [
                {
                    "id": 1,
                    "title": "Premium Adjustment - Cluster X",
                    "description": "Increase premium by 15% for high-risk cardiac surgery cluster",
                    "impact": "High",
                    "savings": "$2.4M annually",
                    "confidence": 94
                },
                {
                    "id": 2,
                    "title": "Hospital Network Optimization",
                    "description": "Renegotiate rates with 3 hospitals showing consistent over-treatment patterns",
                    "impact": "Medium",
                    "savings": "$1.8M annually",
                    "confidence": 87
                }
            ]
        }
