from fastapi import APIRouter, HTTPException, Query, status, Depends
from typing import Optional
from fastapi.responses import PlainTextResponse
from app.auth.dependencies import get_admin_user
from app.schemas.analytics import (
    DashboardResponse, SkillGapResponse, FunnelResponse, 
    LongitudinalTrackingResponse, WageProgressionResponse, 
    AttritionResponse, NonPlacementResponse, AccountabilityResponse, 
    DistrictAnalyticsResponse
)
from app.services.analytics_service import AnalyticsService

router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"],
    dependencies=[Depends(get_admin_user)]
)

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    district: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    provider: Optional[str] = Query(None),
    cohort: Optional[str] = Query(None),
    current_user: dict = Depends(get_admin_user)
):
    """
    Returns high-level outcomes, aggregated securely using Minimum Cohort Thresholds.
    """
    return AnalyticsService.calculate_overview(district, course, provider, cohort, current_user.get("uid"))

@router.get("/skill-gaps", response_model=SkillGapResponse)
def get_skill_gaps(programme_id: Optional[str] = Query(None)):
    """
    Returns aggregated skill gaps based strictly on Phase 2D outputs.
    """
    res = AnalyticsService.calculate_skill_gaps_for_programme(programme_id)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Programme {programme_id} not found"
        )
    return res

@router.get("/export")
def export_analytics(
    district: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    provider: Optional[str] = Query(None),
    cohort: Optional[str] = Query(None)
):
    """
    Secure backend-driven CSV export, enforcing minimum cohort thresholds.
    """
    csv_str = AnalyticsService.generate_export_csv(district, course, provider, cohort)
    return PlainTextResponse(content=csv_str, media_type="text/csv")

@router.get("/outcomes/funnel", response_model=FunnelResponse)
def get_outcomes_funnel(
    district: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    provider: Optional[str] = Query(None),
    cohort: Optional[str] = Query(None),
    current_user: dict = Depends(get_admin_user)
):
    return AnalyticsService.calculate_outcomes_funnel(district, course, provider, cohort, current_user.get("uid"))

@router.get("/outcomes/longitudinal", response_model=LongitudinalTrackingResponse)
def get_longitudinal_tracking(
    district: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    provider: Optional[str] = Query(None),
    cohort: Optional[str] = Query(None),
    current_user: dict = Depends(get_admin_user)
):
    return AnalyticsService.calculate_longitudinal_tracking(district, course, provider, cohort, current_user.get("uid"))

@router.get("/wage-progression", response_model=WageProgressionResponse)
def get_wage_progression(
    district: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    provider: Optional[str] = Query(None),
    cohort: Optional[str] = Query(None),
    current_user: dict = Depends(get_admin_user)
):
    return AnalyticsService.calculate_wage_progression(district, course, provider, cohort, current_user.get("uid"))

@router.get("/attrition", response_model=AttritionResponse)
def get_attrition(
    district: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    provider: Optional[str] = Query(None),
    cohort: Optional[str] = Query(None),
    current_user: dict = Depends(get_admin_user)
):
    return AnalyticsService.calculate_attrition_analysis(district, course, provider, cohort, current_user.get("uid"))

@router.get("/non-placement", response_model=NonPlacementResponse)
def get_non_placement(
    district: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    provider: Optional[str] = Query(None),
    cohort: Optional[str] = Query(None),
    current_user: dict = Depends(get_admin_user)
):
    return AnalyticsService.calculate_non_placement_analysis(district, course, provider, cohort, current_user.get("uid"))

@router.get("/providers", response_model=AccountabilityResponse)
def get_provider_accountability(
    district: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    cohort: Optional[str] = Query(None),
    current_user: dict = Depends(get_admin_user)
):
    return AnalyticsService.calculate_provider_accountability(district, course, cohort, current_user.get("uid"))

@router.get("/districts", response_model=DistrictAnalyticsResponse)
def get_district_analytics(
    course: Optional[str] = Query(None),
    provider: Optional[str] = Query(None),
    cohort: Optional[str] = Query(None),
    current_user: dict = Depends(get_admin_user)
):
    return AnalyticsService.calculate_district_analytics(course, provider, cohort, current_user.get("uid"))

