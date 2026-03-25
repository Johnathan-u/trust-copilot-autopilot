"""SIE-105: Job board adapter tests."""

import pytest

from workers.discovery.job_boards import (
    _detect_seniority,
    _is_security_role,
    JobPosting,
    JOB_BOARD_FETCHERS,
)


class TestSeniorityDetection:
    def test_vp_detected(self):
        assert _detect_seniority("VP of Engineering") == "senior_leadership"

    def test_senior_detected(self):
        assert _detect_seniority("Senior Security Engineer") == "senior"

    def test_manager_detected(self):
        assert _detect_seniority("Engineering Manager") == "manager"

    def test_junior_detected(self):
        assert _detect_seniority("Junior Developer") == "junior"

    def test_no_seniority(self):
        assert _detect_seniority("Software Engineer") is None

    def test_director_is_leadership(self):
        assert _detect_seniority("Director of Compliance") == "senior_leadership"


class TestSecurityRoleDetection:
    def test_security_engineer_detected(self):
        assert _is_security_role("Security Engineer", None) is True

    def test_compliance_manager(self):
        assert _is_security_role("Compliance Manager", "Legal & Compliance") is True

    def test_grc_analyst(self):
        assert _is_security_role("GRC Analyst", None) is True

    def test_soc2_in_title(self):
        assert _is_security_role("SOC 2 Program Lead", None) is True

    def test_generic_engineer_not_detected(self):
        assert _is_security_role("Software Engineer", "Engineering") is False

    def test_sales_not_detected(self):
        assert _is_security_role("Account Executive", "Sales") is False


class TestJobBoardRegistry:
    def test_three_adapters_registered(self):
        assert "greenhouse" in JOB_BOARD_FETCHERS
        assert "lever" in JOB_BOARD_FETCHERS
        assert "ashby" in JOB_BOARD_FETCHERS

    def test_all_are_callable(self):
        for name, fn in JOB_BOARD_FETCHERS.items():
            assert callable(fn), f"{name} adapter is not callable"
