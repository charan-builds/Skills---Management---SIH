from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from datetime import datetime

router = APIRouter(
    prefix="/api/verification",
    tags=["3-Tier Verification Engine"]
)

# Mock Datasets representing the 3 Tiered Repositories
EMPLOYER_INTEGRATIONS = [
    {"id": 1, "employer_name": "Tata Consultancy Services", "system_name": "Workday HCM", "connection_status": "Connected", "last_sync": "2026-09-21 10:00"},
    {"id": 2, "employer_name": "Apollo Hospitals", "system_name": "BambooHR Connect", "connection_status": "Connected", "last_sync": "2026-09-21 09:30"},
    {"id": 3, "employer_name": "Mahindra & Mahindra Automotive", "system_name": "Darwinbox", "connection_status": "Connected", "last_sync": "2026-09-20 18:45"}
]

HRIS_RECORDS = [
    {"id": 1, "aadhaar_number": "666677778888", "employer_name": "Tata Consultancy Services", "full_name": "Rahul Verma", "job_status": "Active", "joining_date": "2023-05-01"},
    {"id": 2, "aadhaar_number": "999900001111", "employer_name": "Apollo Hospitals", "full_name": "Sneha Patil", "job_status": "Active", "joining_date": "2023-06-15"}
]

EPFO_RECORDS = [
    {"id": 1, "aadhaar_number": "555566667777", "company_name": "Wipro Technologies", "full_name": "Deepika Sharma", "joining_date": "2023-03-15", "pf_uan": "100912384912"},
    {"id": 2, "aadhaar_number": "111122223333", "company_name": "Infosys Ltd", "full_name": "Rohan Deshmukh", "joining_date": "2023-04-10", "pf_uan": "100877654321"}
]

# Demo Trainees representing the 3 distinct verification outcomes
DEMO_TRAINEES = [
    {
        "id": "TR-EPFO-01",
        "full_name": "Deepika Sharma",
        "aadhaar_number": "555566667777",
        "claimed_employer": "Wipro Technologies",
        "status": "pending",
        "verification_tier": "UNVERIFIED",
        "verification_badge": "Pending Check"
    },
    {
        "id": "TR-HRIS-02",
        "full_name": "Rahul Verma",
        "aadhaar_number": "666677778888",
        "claimed_employer": "Tata Consultancy Services",
        "status": "pending",
        "verification_tier": "UNVERIFIED",
        "verification_badge": "Pending Check"
    },
    {
        "id": "TR-MAN-03",
        "full_name": "Amit Kumar",
        "aadhaar_number": "888899990000",
        "claimed_employer": "Local Auto Workshop Pvt Ltd",
        "status": "pending",
        "verification_tier": "UNVERIFIED",
        "verification_badge": "Pending Check"
    }
]

@router.get("/integrations")
def get_employer_integrations():
    return {"status": "success", "integrations": EMPLOYER_INTEGRATIONS}

@router.get("/epfo-records")
def get_epfo_records():
    return {"status": "success", "records": EPFO_RECORDS}

@router.get("/hris-records")
def get_hris_records():
    return {"status": "success", "records": HRIS_RECORDS}

@router.get("/demo-trainees")
def get_demo_trainees():
    return {"status": "success", "trainees": DEMO_TRAINEES}

@router.post("/run-check")
def run_3tier_verification_check():
    """
    Executes 3-Tier Verification Cascade:
    - TIER 1 (EPFO): Matches government PF records (Broad auto coverage)
    - TIER 3 (Partner HRIS): Checks connected partner HR systems (Fast API integration)
    - TIER 2 (Direct Employer): Falls back to direct 2-tap employer request (Universal fallback)
    """
    tier1_count = 0
    tier3_count = 0
    tier2_count = 0
    processed_results = []
    today = datetime.now().strftime("%Y-%m-%d")

    for trainee in DEMO_TRAINEES:
        t_copy = dict(trainee)
        aadhaar = t_copy["aadhaar_number"]
        claimed_emp = t_copy["claimed_employer"]

        # TIER 1 — EPFO Check
        epfo_match = next((e for e in EPFO_RECORDS if e["aadhaar_number"] == aadhaar), None)
        if epfo_match:
            t_copy["status"] = "employed"
            t_copy["company_name"] = epfo_match["company_name"]
            t_copy["verified_on"] = today
            t_copy["verification_tier"] = "EPFO"
            t_copy["verification_badge"] = "Verified via EPFO (Tier 1)"
            t_copy["notes"] = f"Matched UAN {epfo_match['pf_uan']} in EPFO statutory employer database."
            tier1_count += 1
            processed_results.append(t_copy)
            continue

        # TIER 3 — Partner HRIS Check
        partner = next((p for p in EMPLOYER_INTEGRATIONS if p["employer_name"].lower() == claimed_emp.lower() and p["connection_status"] == "Connected"), None)
        if partner:
            hris_match = next((h for h in HRIS_RECORDS if h["aadhaar_number"] == aadhaar and h["employer_name"].lower() == claimed_emp.lower() and h["job_status"] == "Active"), None)
            if hris_match:
                t_copy["status"] = "employed"
                t_copy["company_name"] = claimed_emp
                t_copy["verified_on"] = today
                t_copy["verification_tier"] = "HRIS"
                t_copy["verification_badge"] = "Verified via HRIS (Tier 3)"
                t_copy["notes"] = f"Matched active employee record in partner system ({partner['system_name']})."
                tier3_count += 1
                processed_results.append(t_copy)
                continue

        # TIER 2 — Direct Employer Confirmation Request (Fallback)
        t_copy["status"] = "awaiting_employer_confirmation"
        t_copy["company_name"] = claimed_emp
        t_copy["verification_tier"] = "MANUAL_REQUEST"
        t_copy["verification_badge"] = "Awaiting Employer Confirmation (Tier 2)"
        t_copy["notes"] = "Sent 2-tap confirmation link directly to employer contact."
        tier2_count += 1
        processed_results.append(t_copy)

    return {
        "status": "success",
        "message": "3-Tier verification pipeline executed",
        "tier1_epfo": tier1_count,
        "tier3_hris": tier3_count,
        "tier2_manual": tier2_count,
        "total_processed": len(processed_results),
        "results": processed_results
    }
