from unittest.mock import patch, MagicMock
import pytest
from app.services.analytics_service import AnalyticsService

def test_cohort_threshold_below_5():
    # If trainees < 5, it should return INSUFFICIENT_DATA for sensitive fields
    trainees = [{"id": "t1"}, {"id": "t2"}]
    with patch("app.services.analytics_service.FirestoreRepository.get_trainees", return_value=trainees):
        with patch("app.services.analytics_service.FirestoreRepository.get_employer_feedback", return_value=[]):
            res = AnalyticsService.calculate_overview(None, None, None, None)
            
            # Since total is 2, it shouldn't show metrics
            assert res.stats[1].value == "INSUFFICIENT_DATA" # Employment
            assert res.stats[2].value == "INSUFFICIENT_DATA" # Retention
            assert res.stats[3].value == "INSUFFICIENT_DATA" # Wage

def test_missing_wage_data():
    # If trainees > 5 but no wage data, wage stat is NO_DATA
    trainees = [{"id": f"t{i}", "status": "Certified", "outcome": "Employed"} for i in range(6)]
    with patch("app.services.analytics_service.FirestoreRepository.get_trainees", return_value=trainees):
        with patch("app.services.analytics_service.FirestoreRepository.get_employer_feedback", return_value=[]):
            with patch("app.services.analytics_service.RetentionIntelligenceEngine") as MockEngine:
                mock_engine_instance = MockEngine.return_value
                mock_engine_instance.analyze_retention_risks.return_value = {
                    "meta": {"global_rate_3m": 1.0, "global_rate_6m": 1.0, "global_rate_12m": 1.0, "insufficient_data": False}
                }
                res = AnalyticsService.calculate_overview(None, None, None, None)
                
                assert res.stats[1].value == "100%" # Employment
                assert res.stats[2].value == "100%" # Retention 6M
                assert res.stats[3].value == "INSUFFICIENT_DATA" # Wage

def test_export_privacy():
    # If cohort < 5, export returns an empty CSV string
    trainees = [{"id": "t1"}, {"id": "t2"}]
    with patch("app.services.analytics_service.FirestoreRepository.get_trainees", return_value=trainees):
        csv = AnalyticsService.generate_export_csv(None, None, None, None)
        assert "INSUFFICIENT_DATA" in csv

def test_export_success():
    # If cohort >= 5, export returns the header and rows
    trainees = [{"id": f"t{i}", "status": "Certified", "outcome": "Employed"} for i in range(6)]
    with patch("app.services.analytics_service.FirestoreRepository.get_trainees", return_value=trainees):
        with patch("app.services.analytics_service.FirestoreRepository.get_employer_feedback", return_value=[]):
            with patch("app.services.analytics_service.RetentionIntelligenceEngine") as MockEngine:
                mock_engine_instance = MockEngine.return_value
                mock_engine_instance.analyze_retention_risks.return_value = {
                    "meta": {"global_rate_3m": 1.0, "global_rate_6m": 1.0, "global_rate_12m": 1.0, "insufficient_data": False}
                }
                csv = AnalyticsService.generate_export_csv(None, None, None, None)
                assert "Total Trainees" in csv
                assert "6" in csv
