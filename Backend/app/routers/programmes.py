from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.firebase.repository import FirestoreRepository
from app.auth.dependencies import get_admin_user
from app.schemas.programme import ProgrammeCreate, ProgrammeResponse, ProgrammeSummaryResponse

router = APIRouter(
    prefix="/api/programmes",
    tags=["Programmes"],
    dependencies=[Depends(get_admin_user)]
)

@router.get("", response_model=List[ProgrammeSummaryResponse])
def get_programmes():
    programmes = FirestoreRepository.get_programmes()
    trainees = FirestoreRepository.get_trainees()
    
    summaries = []
    for prog in programmes:
        p_id = prog["id"]
        # Filter trainees in this program
        p_trainees = [t for t in trainees if t.get("programme_id") == p_id]
        
        # Calculate rates
        total_count = len(p_trainees)
        if total_count > 0:
            certified_trainees = [t for t in p_trainees if t.get("status") == "Certified"]
            total_certified = len(certified_trainees)
            
            if total_certified > 0:
                employed_count = len([t for t in certified_trainees if t.get("outcome") in ["Employed", "Self-Employed", "Apprentice"]])
                emp_rate = int((employed_count / total_certified) * 100)
                employment_str = f"{emp_rate}%"
            else:
                employment_str = "0%"
                
            # Retention rate (6M) calculation
            retention_count = 0
            has_6m_followup = 0
            for t in certified_trainees:
                timeline = t.get("outcomes_timeline", [])
                for chk in timeline:
                    if chk.get("checkpoint") == "6 Month Follow-up" and chk.get("status") == "Recorded":
                        has_6m_followup += 1
                        if chk.get("employment_status") in ["Employed", "Self-Employed", "Apprentice"]:
                            retention_count += 1
            
            if has_6m_followup > 0:
                ret_rate = int((retention_count / has_6m_followup) * 100)
                retention_str = f"{ret_rate}%"
            else:
                # Fallback based on database defaults
                retention_str = "0%"
        else:
            employment_str = "0%"
            retention_str = "0%"
            
        # Scale trainees count to match frontend prototype presentation style if desired
        # but here we return actual database counts to be accurate.
        # Let's return actual count, but if it is empty return a fallback or actual DB count.
        # Seed has 4, 3, 3 trainees. Let's return the actual DB count.
        summaries.append(ProgrammeSummaryResponse(
            id=prog["id"],
            name=prog["name"],
            provider=prog["provider"],
            status=prog["status"],
            trainees=total_count,
            employment=employment_str,
            retention=retention_str
        ))
        
    return summaries

@router.get("/{id}", response_model=ProgrammeResponse)
def get_programme(id: str):
    prog = FirestoreRepository.get_programme(id)
    if not prog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Programme with ID {id} not found"
        )
    
    trainees = FirestoreRepository.get_trainees()
    p_trainees = [t for t in trainees if t.get("programme_id") == id]
    total_count = len(p_trainees)
    
    if total_count > 0:
        certified = [t for t in p_trainees if t.get("status") == "Certified"]
        total_certified = len(certified)
        if total_certified > 0:
            employed = len([t for t in certified if t.get("outcome") in ["Employed", "Self-Employed", "Apprentice"]])
            employment_str = f"{int((employed / total_certified) * 100)}%"
        else:
            employment_str = None
            
        retention_count = 0
        has_6m_followup = 0
        for t in certified:
            for chk in t.get("outcomes_timeline", []):
                if chk.get("checkpoint") == "6 Month Follow-up" and chk.get("status") == "Recorded":
                    has_6m_followup += 1
                    if chk.get("employment_status") in ["Employed", "Self-Employed", "Apprentice"]:
                        retention_count += 1
        if has_6m_followup > 0:
            retention_str = f"{int((retention_count / has_6m_followup) * 100)}%"
        else:
            retention_str = None
    else:
            employment_str = None
            retention_str = None
        
    prog["trainees"] = total_count
    prog["employment"] = employment_str
    prog["retention"] = retention_str
    return prog


@router.post("", response_model=ProgrammeResponse, status_code=status.HTTP_201_CREATED)
def create_programme(programme: ProgrammeCreate):
    # Check if exists
    existing = FirestoreRepository.get_programme(programme.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Programme with ID {programme.id} already exists"
        )
    return FirestoreRepository.create_programme(programme)
