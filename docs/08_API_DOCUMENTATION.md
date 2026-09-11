# API Documentation

The Skilling Impact Intelligence platform utilizes a RESTful API powered by FastAPI. This document outlines the primary API endpoints exposed to the frontend applications.

*(Note: In the current prototype, endpoints rely on the in-memory `DemoRepository` rather than a persistent database. Authentication requires a mock JWT token issued by the `/auth/login` endpoint).*

## 1. Authentication APIs (`/auth`)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/auth/login` | Authenticates a user based on their mock credentials and returns a JWT access token and user role. |
| `GET`  | `/auth/me` | Returns the currently authenticated user's profile based on their token. |

## 2. Analytics APIs (`/api/analytics`)

Used exclusively by the **Admin Dashboard**.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/analytics/dashboard` | Returns aggregate KPIs (Total Trainees, Placed, In Training, Placement Rate). Accepts `district`, `course` (programme), and `cohort` query parameters for cross-filtering. |
| `GET` | `/api/analytics/intelligence` | Returns the AI-driven impact intelligence payload, including the computed `priority` score (High/Medium/Low Risk), localized skill gaps, and intervention recommendations. |

## 3. Trainee Portal APIs (`/api/trainee-portal`)

Used exclusively by the **Trainee Dashboard**.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/trainee-portal/dashboard` | Returns a specific trainee's personalized dashboard data (skill matrix, recent applications, recommendations). |
| `GET` | `/api/trainee-portal/jobs` | Returns open job requisitions ranked by match percentage against the trainee's specific skills. |
| `POST`| `/api/trainee-portal/jobs/{job_id}/apply` | Submits an application from the trainee to a specific job. |

## 4. Employer APIs (`/api/employers`)

Used exclusively by the **Employer Dashboard**.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/employers/dashboard` | Returns aggregate metrics for an employer (Total open jobs, Total applicants, Matched candidates). |
| `GET` | `/api/employers/candidates` | Returns a list of all trainees whose skill profiles match the employer's active job requisitions, sorted by algorithmic match score. |

## 5. System Data APIs (`/api/trainees`, `/api/programmes`, `/api/skills`)

Used for administrative CRUD operations and dropdown population.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/trainees` | Returns a paginated list of all system trainees. |
| `GET` | `/api/trainees/{trainee_id}` | Returns a specific trainee's detailed PII and outcome data. |
| `POST`| `/api/trainees` | Creates a new trainee record. |
| `GET` | `/api/programmes` | Returns a list of all active skilling programmes (used to populate filters). |
| `GET` | `/api/skills` | Returns a master list of all trackable skills. |

---

## Example Request/Response payload

### `GET /api/analytics/intelligence?district=Hyderabad&course=Data Analytics`

**Request:**
```http
GET /api/analytics/intelligence?district=Hyderabad&course=Data Analytics HTTP/1.1
Authorization: Bearer [MOCK_ADMIN_TOKEN]
```

**Response (200 OK):**
```json
{
  "district": "Hyderabad",
  "course": "Data Analytics",
  "cohort": null,
  "priority": "High Risk",
  "priorityScore": 72.5,
  "skillGaps": [
    { "skill": "Python", "gap": "High" },
    { "skill": "SQL", "gap": "Medium" }
  ],
  "recommendations": [
    "Deploy targeted Python bootcamp in Hyderabad.",
    "Review Data Analytics curriculum alignment with local employer demands."
  ]
}
```
