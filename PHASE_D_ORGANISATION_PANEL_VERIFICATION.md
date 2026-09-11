# Phase D: Organisation Panel Verification

## Objective
Verify that the Organisation Panel correctly restricts data to the authenticated organization, operates strictly on API responses without mock data, and handles verification actions gracefully.

## API Data & UI Mapping

- **EmployerDashboard.jsx**: Uses `GET /api/employers/{org_id}/dashboard` and `/api/employers/{org_id}/outcomes`. The KPIs (Hired Trainees, Recruitment Funnel, AI Insights) correctly reflect the backend values.
- **VerificationRequests.jsx**: Inbox driven by `/api/employers/{org_id}/outcomes`. Filters exclusively for `verification_status === "Pending verification"`. Provides a detail modal containing fields required by the `EmployerOutcomeUpdate` schema.
- **EmployeesOutcomes.jsx**: Uses `/api/employers/{org_id}/outcomes`, filtering for `"Employer attested"`.
- **EmployerProfile.jsx**: Reads and writes via `GET|POST /api/employers/{org_id}/profile`. Supports managing AI Hiring match skills and default budgets.

## Authorization & Organization Isolation

Backend routes enforce organization isolation using `Depends(get_organization_user)`.
For example, inside `get_organization_user`:
```python
def get_organization_user(org_id: str, current_user: dict = Depends(get_current_user)) -> dict:
    ensure_organization_access(org_id, current_user)
    return current_user
```
Any attempt to access `/api/employers/EMP-OTHER-123/...` while authenticated as `EMP-DEMO-001` throws `403 FORBIDDEN`. The UI does not try to bypass this, it reads `localStorage.getItem("organizationId")`.

## Actions & Status Changes

The backend `verify_outcome` function (`PATCH /api/employers/{org_id}/outcomes/{trainee_id}/verify`) permanently registers the outcome.
- **Confirm Employment**: Sets `employment_status="Employed"`.
- **Request Correction**: Sets `employment_status="Correction Requested"`, passing reason in `employer_remarks`.
- **Reject Claim**: Sets `employment_status="Rejected Claim"`, passing reason in `employer_remarks`.

These actions immediately query the API and update the local React state. Error handling triggers browser alerts with appropriate messages when an API call fails.

## Acceptance

The implementation strictly uses React components configured to the precise payload expectations of `routers/employers.py`. 

- Lint successfully executed.
- Build successfully executed.
- Empty states present for "No pending verifications", "No verified employment records", and "No skill metrics available".
