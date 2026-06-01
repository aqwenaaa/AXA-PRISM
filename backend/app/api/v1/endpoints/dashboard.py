from fastapi import APIRouter, Depends
from app.schemas.schemas import (
    AdminDashboardResponse,
    OperatorDashboardResponse,
    AnalystDashboardResponse,
    AuditorDashboardResponse,
    ManagerDashboardResponse
)
from app.services.analytics import AnalyticsService
from app.middleware.auth import RoleChecker

router = APIRouter()
analytics_svc = AnalyticsService()

@router.get("/admin", response_model=AdminDashboardResponse, dependencies=[Depends(RoleChecker(["admin"]))])
def get_admin_dashboard():
    """
    Consolidated administrative statistics.
    """
    return analytics_svc.get_admin_metrics()

@router.get("/operator", response_model=OperatorDashboardResponse, dependencies=[Depends(RoleChecker(["data_operator", "admin"]))])
def get_operator_dashboard():
    """
    Data operations and validation indicators.
    """
    return analytics_svc.get_operator_metrics()

@router.get("/analyst", response_model=AnalystDashboardResponse, dependencies=[Depends(RoleChecker(["risk_analyst", "admin"]))])
def get_analyst_dashboard():
    """
    Analytical diagnostics and model cluster states.
    """
    return analytics_svc.get_analyst_metrics()

@router.get("/auditor", response_model=AuditorDashboardResponse, dependencies=[Depends(RoleChecker(["medical_auditor", "admin"]))])
def get_auditor_dashboard():
    """
    Anomalous master verification list.
    """
    return analytics_svc.get_auditor_metrics()

@router.get("/manager", response_model=ManagerDashboardResponse, dependencies=[Depends(RoleChecker(["strategic_manager", "admin"]))])
def get_manager_dashboard():
    """
    Forecasting projections and risk action proposals.
    """
    return analytics_svc.get_manager_metrics()
