# Project Veracity - Complete API Contract

**Base URL:** `http://localhost:5000/api` (or production URL)  
**API Version:** 2.1.0  
**Authentication:** Bearer Token (JWT) in Authorization header

---

## 1. DATA MODELS & TYPES

### User Object
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "user",
  "tier": "free",
  "is_active": true,
  "is_email_verified": false,
  "last_login_at": "2026-04-30T10:00:00Z"
}
```

**Field Definitions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | ✅ | Unique user identifier (`user_id` in DB) |
| email | string | ✅ | User email address (unique) |
| full_name | string \| null | ❌ | Display name — can be null |
| role | enum | ✅ | One of: `'user'`, `'student'`, `'project_manager'`, `'admin'` |
| tier | enum | ✅ | One of: `'free'`, `'pro'` |
| is_active | boolean | ✅ | Account active status — inactive users cannot login |
| is_email_verified | boolean | ✅ | Email verification status |
| last_login_at | ISO8601 \| null | ❌ | Last successful login timestamp |

**Valid Roles:**
- `admin` - Full system access, admin dashboard, all projects, all reports (PDF always free)
- `project_manager` - All projects + partial admin, PDF requires pro tier
- `user` - Own projects only, PDF requires pro tier, 10 analyses/month on free
- `student` - Same as user but PDF is always free regardless of tier

---

### Prediction Object
```json
{
  "id": 12,
  "defect_probability": 0.73,
  "risk_level": "high",
  "top_risk_features": [
    {
      "feature_name": "v(g)",
      "shap_value": 0.142,
      "feature_value": 14,
      "impact": "positive",
      "abs_shap_value": 0.142
    }
  ],
  "code_snippet": "def process_payment(...)",
  "file_path": "payment_processor.py",
  "metrics": {
    "loc": 450,
    "v(g)": 14,
    "ev(g)": 9.2,
    "iv(g)": 6.8,
    "branchcount": 28
  },
  "created_at": "2026-04-30T10:30:00Z",
  "mitigation_advice": {}
}
```

**Field Definitions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | ✅ | Unique prediction identifier (`prediction_id` in DB) |
| defect_probability | number (0–1) | ✅ | XGBoost bug probability (`risk_score` in DB) |
| risk_level | enum | ✅ | One of: `'low'`, `'medium'`, `'high'`, `'critical'` (lowercase in API) |
| top_risk_features | RiskFeature[] | ✅ | Top SHAP-ranked risk drivers (see RiskFeature Object) |
| code_snippet | string | ✅ | First 500 chars of submitted code |
| file_path | string | ✅ | Project name used as file reference |
| metrics | object | ✅ | All 26 Radon/Halstead code metrics (see Metrics Object) |
| created_at | ISO8601 string | ✅ | Timestamp when prediction was created |
| mitigation_advice | object \| null | ❌ | ML chatbot advice returned alongside analysis |

**Risk Level Mapping:**
- `low`: defect_probability < 0.25
- `medium`: defect_probability 0.25–0.50
- `high`: defect_probability 0.50–0.75
- `critical`: defect_probability >= 0.75

---

### RiskFeature Object
```json
{
  "feature_name": "v(g)",
  "shap_value": 0.142,
  "feature_value": 14,
  "impact": "positive",
  "abs_shap_value": 0.142
}
```

**Field Definitions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| feature_name | string | ✅ | Code metric name (e.g. `v(g)`, `loc`, `branchcount`) |
| shap_value | number | ✅ | SHAP contribution to the model prediction |
| feature_value | number | ✅ | Actual value of the metric in analyzed code |
| impact | enum | ✅ | `'positive'` (increases risk) or `'negative'` (decreases risk) |
| abs_shap_value | number | ✅ | `Math.abs(shap_value)` |

---

### Metrics Object (26 Features)
```json
{
  "loc": 450,
  "v(g)": 14,
  "ev(g)": 9.2,
  "iv(g)": 6.8,
  "n": 312,
  "v": 1840.5,
  "l": 0.02,
  "d": 58.3,
  "i": 31.5,
  "e": 107268,
  "b": 0.61,
  "t": 29.8,
  "locode": 420,
  "locomment": 30,
  "loblank": 20,
  "locodeandcomment": 5,
  "uniq_op": 28,
  "uniq_opnd": 40,
  "total_op": 160,
  "total_opnd": 152,
  "branchcount": 28,
  "cbo": 6,
  "rfc": 18,
  "v_density": 4.09,
  "cyclomatic_loc": 0.031,
  "halstead_difficulty": 58.3
}
```

**Field Definitions:**
| Field | Type | Description |
|-------|------|-------------|
| loc | number | Lines of code |
| v(g) | number | Cyclomatic complexity |
| ev(g) | number | Essential complexity |
| iv(g) | number | Design complexity |
| n | number | Halstead length |
| v | number | Halstead volume |
| l | number | Program level |
| d | number | Halstead difficulty |
| i | number | Intelligence content |
| e | number | Programming effort |
| b | number | Bug estimate (Halstead) |
| t | number | Time to implement (seconds) |
| locode | number | Lines of code (actual) |
| locomment | number | Lines of comments |
| loblank | number | Blank lines |
| locodeandcomment | number | Lines containing code and comments |
| uniq_op | number | Unique operators |
| uniq_opnd | number | Unique operands |
| total_op | number | Total operators |
| total_opnd | number | Total operands |
| branchcount | number | Number of branches |
| cbo | number | Coupling between objects |
| rfc | number | Response for class |
| v_density | number | Volume density |
| cyclomatic_loc | number | Cyclomatic complexity / LOC ratio |
| halstead_difficulty | number | Halstead difficulty (alias of `d`) |

---

### Project Object
```json
{
  "project_id": 1,
  "user_id": 5,
  "project_name": "Payment Module",
  "project_description": "Handles Stripe integration",
  "file_size_bytes": 14320,
  "file_encoding": "utf-8",
  "is_archived": false,
  "latest_prediction_id": 12,
  "analysis_count": 3,
  "created_at": "2026-04-01T09:00:00Z",
  "updated_at": "2026-04-30T10:00:00Z",
  "archived_at": null
}
```

**Field Definitions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | number | ✅ | Unique project identifier |
| user_id | number | ✅ | Owner's user ID |
| project_name | string | ✅ | Project display name |
| project_description | string \| null | ❌ | Optional description |
| file_size_bytes | number | ✅ | Uploaded `.py` file size in bytes |
| file_encoding | string \| null | ❌ | Detected file encoding (e.g. `utf-8`) |
| is_archived | boolean | ✅ | Soft-delete flag — `true` = archived |
| latest_prediction_id | number \| null | ❌ | FK to most recent prediction |
| analysis_count | number | ✅ | Total analyses run on this project |
| created_at | ISO8601 string | ✅ | Project creation timestamp |
| updated_at | ISO8601 string | ✅ | Last update timestamp |
| archived_at | ISO8601 \| null | ❌ | Archival timestamp — `null` if active |

---

### Report Object
```json
{
  "report_type": "USER_PROJECT_REPORT",
  "generated_at": "2026-04-30T10:00:00Z",
  "report_format": "json"
}
```

**Field Definitions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| report_type | enum | ✅ | One of: `'USER_PROJECT_REPORT'`, `'PROJECT_MANAGER_REPORT'`, `'ADMIN_FULL_REPORT'`, `'ADMIN_SYSTEM_REPORT'` |
| generated_at | ISO8601 string | ✅ | Timestamp when report was generated |
| report_format | enum | ✅ | One of: `'json'`, `'xml'`, `'pdf'` |

---

### Audit Log Object
```json
{
  "id": 42,
  "user_id": 5,
  "user_name": "user@example.com",
  "role": "user",
  "action": "PROJECT_UPLOAD",
  "resource_type": "project",
  "project_id": 14,
  "status": "SUCCESS",
  "ip_address": "192.168.1.10",
  "error_message": null,
  "timestamp": "2026-04-30T10:30:00Z"
}
```

**Field Definitions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | ✅ | Unique log identifier (`log_id` in DB) |
| user_id | number | ✅ | User who triggered the action |
| user_name | string | ✅ | User's email (joined from users table) |
| role | string | ✅ | User's role at time of action |
| action | string | ✅ | Audit action type (e.g. `LOGIN_SUCCESS`, `PROJECT_UPLOAD`) |
| resource_type | string | ✅ | Resource affected (e.g. `'user'`, `'project'`) |
| project_id | number \| null | ❌ | Resource ID if applicable |
| status | enum | ✅ | `'SUCCESS'` or `'FAILED'` |
| ip_address | string | ✅ | Caller's IP address |
| error_message | string \| null | ❌ | Error detail if status is FAILED |
| timestamp | ISO8601 string | ✅ | When the action occurred (`created_at` in DB) |

---

### Mitigation Rule Object
```json
{
  "id": 1,
  "metric_name": "v(g)",
  "threshold_low": 10,
  "threshold_high": 20,
  "mitigation_advice": "Refactor large functions into smaller units...",
  "priority": "HIGH",
  "is_active": true,
  "version": 3,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-04-01T00:00:00Z"
}
```

**Field Definitions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | ✅ | Unique rule identifier (`rule_id` in DB) |
| metric_name | string | ✅ | Code metric this rule applies to (`risk_driver` in DB) |
| threshold_low | number | ✅ | Lower bound of the trigger range |
| threshold_high | number | ✅ | Upper bound — must be greater than `threshold_low` |
| mitigation_advice | string | ✅ | Human-readable fix advice served by chatbot |
| priority | enum | ✅ | One of: `'CRITICAL'`, `'HIGH'`, `'MEDIUM'`, `'LOW'` |
| is_active | boolean | ✅ | Whether this rule is active in the chatbot engine |
| version | number | ✅ | Auto-increments on every update |
| created_at | ISO8601 string | ✅ | Rule creation timestamp |
| updated_at | ISO8601 string | ✅ | Last modification timestamp |

---

## 2. AUTHENTICATION ENDPOINTS

### POST /auth/register
Register a new user account

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "securepass123",
  "role": "student"
}
```

**Notes:**
- `role` is optional — only `'user'` and `'student'` are accepted for self-registration; all other values default to `'user'`
- New accounts always default to `tier: 'free'`
- No JWT token is returned — user must call `/auth/login` after registering

**Response (201 Created):**
```json
{
  "message": "User registered.",
  "user": {
    "user_id": 6,
    "email": "newuser@example.com",
    "role": "user",
    "tier": "free"
  }
}
```

**Error Responses:**
- 400: `{ "error": "Email and password are required." }`
- 409: `{ "error": "Email already registered." }`
- 500: `{ "error": "Server error." }`

---

### POST /auth/login
Login with email and password — returns JWT token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "tier": "free"
  }
}
```

**Notes:**
- Account locks after **5 failed login attempts** — returns 423
- JWT payload contains: `{ user_id, email, role, tier }`
- Token expiry set by `JWT_EXPIRES_IN` env var (default: `7d`)

**Error Responses:**
- 400: `{ "error": "Email and password are required." }`
- 401: `{ "error": "Invalid credentials." }`
- 423: `{ "error": "Account locked. Contact admin." }`
- 500: `{ "error": "Server error." }`

---

### POST /auth/logout
Blacklists the current JWT token

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully. Token revoked."
}
```

**Error Responses:**
- 401: `{ "error": "Invalid or expired token." }`
- 500: `{ "error": "Logout failed." }`

---

### GET /auth/verify
Verify token validity and return the current user's full profile

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "user",
  "tier": "free",
  "is_active": true,
  "is_email_verified": false,
  "last_login_at": "2026-04-30T10:00:00Z"
}
```

**Error Responses:**
- 401: `{ "error": "Invalid or expired token." }`
- 401: `{ "error": "User not found or deactivated." }`

---

### GET /auth/me
Get own profile (same shape as `/auth/verify`)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "user",
  "tier": "free",
  "is_active": true,
  "is_email_verified": false,
  "last_login_at": "2026-04-30T10:00:00Z"
}
```

**Error Responses:**
- 401: `{ "error": "Invalid or expired token." }`
- 404: `{ "error": "User not found." }`

---

### PUT /auth/me
Update own profile — `full_name` and/or `password`

**Request:**
```json
{
  "full_name": "Updated Name",
  "password": "newpassword123"
}
```

**Notes:**
- At least one field (`full_name` or `password`) must be provided
- Password minimum length: **8 characters**

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "Updated Name",
  "role": "user",
  "tier": "free",
  "is_active": true
}
```

**Error Responses:**
- 400: `{ "error": "Nothing to update. Provide full_name or password." }`
- 400: `{ "error": "Password must be at least 8 characters." }`
- 404: `{ "error": "User not found." }`

---

## 3. DASHBOARD ENDPOINT

### GET /dashboard/stats
Get statistics — response scope varies by role

**Headers:**
```
Authorization: Bearer {token}
```

**Role-Based Scope:**
| Role | Data Returned |
|------|--------------|
| `admin` | System-wide: all users, all projects, all predictions |
| `project_manager` | All projects + all predictions (no `totalUsers`) |
| `user` / `student` | Own projects and predictions only |

**Response (200 OK):**
```json
{
  "totalPredictions": 1234,
  "totalProjects": 45,
  "totalUsers": 120,
  "highRiskCount": 89,
  "mediumRiskCount": 234,
  "lowRiskCount": 567,
  "criticalRiskCount": 23,
  "averageDefectProbability": 0.4500,
  "riskTrends": [
    {
      "date": "2026-04-01",
      "low": 45,
      "medium": 30,
      "high": 15,
      "critical": 10
    }
  ],
  "defectStats": []
}
```

**Notes:**
- `totalUsers` is only populated for `admin` role
- `riskTrends` covers the last 30 days, grouped by day
- `defectStats` is identical to `riskTrends` (same data, kept for compatibility)

---

## 4. ANALYSIS ENDPOINT

### POST /analysis
Submit Python source code for ML defect analysis

**Request:**
```json
{
  "code": "def process_payment(user_id, amount, currency):\n    if amount <= 0:\n        raise ValueError('...')",
  "file_path": "payment_processor.py",
  "project_id": 1
}
```

**Notes:**
- `code` and `file_path` are required; `project_id` is optional
- If `project_id` is omitted, prediction is not saved to DB but analysis is still returned
- Free tier users are limited to **10 analyses per calendar month**
- ML analysis can take up to 3 minutes — client should show a loading state

**Response (201 Created):**
```json
{
  "prediction": {
    "id": 12,
    "defect_probability": 0.73,
    "risk_level": "high",
    "top_risk_features": [
      {
        "feature_name": "v(g)",
        "shap_value": 0.142,
        "feature_value": 14,
        "impact": "positive",
        "abs_shap_value": 0.142
      }
    ],
    "code_snippet": "def process_payment...",
    "file_path": "payment_processor.py",
    "metrics": { "loc": 450, "v(g)": 14 },
    "created_at": "2026-04-30T10:30:00Z",
    "mitigation_advice": {}
  }
}
```

**Error Responses:**
- 400: `{ "error": "Code and file_path are required." }`
- 400: `{ "error": "Code cannot be empty." }`
- 403: `{ "error": "Monthly limit reached. Upgrade to Pro.", "code": "TIER_LIMIT_EXCEEDED" }`
- 503: `{ "error": "ML service not running. Start uvicorn on port 8080.", "code": "ML_UNAVAILABLE" }`
- 504: `{ "error": "ML analysis timed out. Try a smaller file.", "code": "ML_TIMEOUT" }`
- 429: `{ "error": "ML rate limit hit. Wait 1 minute.", "code": "RATE_LIMITED" }`

---

## 5. PREDICTION ENDPOINTS

### GET /predictions
Get all predictions (paginated, filterable)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)
- `risk_level` (optional): `'LOW'` | `'MEDIUM'` | `'HIGH'` | `'CRITICAL'`

**Notes:**
- `admin` and `project_manager` see all predictions
- `user` and `student` see only predictions from their own projects

**Response (200 OK):**
```json
{
  "predictions": [
    {
      "id": 12,
      "project_id": 5,
      "risk_level": "HIGH",
      "defect_probability": 0.73,
      "model_version": "v2.1",
      "created_at": "2026-04-30T10:30:00Z",
      "file_path": "Payment Module"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "pages": 15
}
```

---

### GET /predictions/:id
Get full prediction detail with all metrics and SHAP explanations

**Notes:**
- `user` and `student` can only access predictions belonging to their own projects
- Returns 403 if a user attempts to access another user's prediction

**Response (200 OK):**
```json
{
  "id": 12,
  "defect_probability": 0.73,
  "risk_level": "high",
  "file_path": "payment_processor.py",
  "created_at": "2026-04-30T10:30:00Z",
  "metrics": {
    "loc": 450,
    "v(g)": 14
  },
  "top_risk_features": [
    {
      "feature_name": "v(g)",
      "shap_value": 0.142,
      "feature_value": 14,
      "impact": "positive",
      "abs_shap_value": 0.142
    }
  ]
}
```

**Error Responses:**
- 403: `{ "error": "Access denied." }`
- 404: `{ "error": "Prediction not found." }`

---

## 6. PROJECT ENDPOINTS

### GET /projects
List projects — scope depends on role

**Notes:**
- `user` / `student`: own non-archived projects only
- `project_manager`: all non-archived projects + owner `email` and `full_name`
- `admin`: all projects including archived + owner `email`, `full_name`, `user_role`

**Response (200 OK):**
```json
[
  {
    "project_id": 1,
    "user_id": 5,
    "project_name": "Payment Module",
    "project_description": "Handles Stripe integration",
    "file_size_bytes": 14320,
    "is_archived": false,
    "latest_prediction_id": 12,
    "analysis_count": 3,
    "created_at": "2026-04-01T09:00:00Z",
    "updated_at": "2026-04-30T10:00:00Z"
  }
]
```

---

### POST /projects
Upload a `.py` file and trigger automatic ML analysis

**Request: `multipart/form-data`**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_name | text | ✅ | Project display name |
| project_description | text | ❌ | Optional description |
| file | file | ✅ | `.py` file only — max **1 MB** |

**Notes:**
- Response is returned immediately — analysis runs asynchronously in the background
- Poll `/projects/:id/results` to check when analysis is complete

**Response (201 Created):**
```json
{
  "message": "Project created. Analysis started.",
  "project": {
    "project_id": 1,
    "user_id": 5,
    "project_name": "Payment Module",
    "project_description": "Handles Stripe integration",
    "file_size_bytes": 14320,
    "created_at": "2026-04-30T10:00:00Z"
  }
}
```

**Error Responses:**
- 400: `{ "error": "Project name is required." }`
- 400: `{ "error": "No .py file uploaded." }`
- 400: `{ "error": "Only .py files are allowed" }`
- 400: `{ "error": "File too large. Max 1MB." }`

---

### GET /projects/:id
Get a single project by ID

**Notes:**
- `user` / `student`: own project only
- `project_manager`: any non-archived project + owner info
- `admin`: any project including archived + owner info

**Response (200 OK):** Project Object (see §1)

**Error Responses:**
- 403: `{ "error": "Access denied." }`
- 404: `{ "error": "Project not found." }`

---

### PUT /projects/:id
Update project name and/or description

**Request:**
```json
{
  "project_name": "New Name",
  "project_description": "Updated description"
}
```

**Notes:**
- At least one of `project_name` or `project_description` must be provided
- `user` / `student` can only update their own projects
- `admin` and `project_manager` can update any project

**Response (200 OK):**
```json
{
  "project": {
    "project_id": 1,
    "project_name": "New Name",
    "project_description": "Updated description",
    "updated_at": "2026-04-30T11:00:00Z"
  }
}
```

**Error Responses:**
- 400: `{ "error": "Nothing to update." }`
- 404: `{ "error": "Project not found." }`

---

### DELETE /projects/:id
Soft-delete a project (sets `is_archived = true`)

**Notes:**
- This is a **soft delete** — data is preserved in the database
- `user` / `student` can only delete their own projects
- `admin` and `project_manager` can delete any project

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Project deleted successfully."
}
```

**Error Responses:**
- 404: `{ "error": "Project not found or already archived." }`

---

### GET /projects/:id/results
Get the latest prediction, all code metrics, and SHAP explanations for a project

**Response (200 OK):**
```json
{
  "project": {},
  "prediction": {
    "prediction_id": 12,
    "risk_level": "HIGH",
    "risk_score": 0.73,
    "model_version": "v2.1",
    "created_at": "2026-04-30T10:30:00Z"
  },
  "metrics": [
    {
      "metric_name": "v(g)",
      "metric_value": 14,
      "extraction_method": "radon"
    }
  ],
  "shap_explanations": [
    {
      "feature_name": "v(g)",
      "feature_value": 14,
      "shap_value": 0.142,
      "feature_rank": 1,
      "is_top_5": true
    }
  ]
}
```

**Notes:**
- `prediction` is `null` if analysis has not completed yet
- `metrics` and `shap_explanations` are empty arrays if `prediction` is null

**Error Responses:**
- 403: `{ "error": "Access denied." }`
- 404: `{ "error": "Project not found." }`

---

### GET /projects/:id/report
Generate a structured JSON report — content depth varies by role

**Role-Based Content:**
| Role | `report_type` | Contents |
|------|--------------|---------|
| `user` / `student` | `USER_PROJECT_REPORT` | Project + latest prediction + metrics + SHAP |
| `project_manager` | `PROJECT_MANAGER_REPORT` | Full project + all predictions + risk trend |
| `admin` | `ADMIN_FULL_REPORT` | Everything + all metrics history + audit trail + system risk distribution |

**Response (200 OK):**
```json
{
  "report_type": "USER_PROJECT_REPORT",
  "generated_at": "2026-04-30T10:00:00Z",
  "project": {},
  "latest_prediction": {},
  "code_metrics": [],
  "shap_top_drivers": []
}
```

**Error Responses:**
- 403: `{ "error": "Access denied." }`
- 404: `{ "error": "Project not found." }`

---

### GET /projects/:id/predictions
Get all predictions for a specific project (paginated)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 50)

**Notes:**
- `user` / `student` can only access their own projects
- `admin` can access any project

**Response (200 OK):**
```json
{
  "predictions": [
    {
      "prediction_id": 12,
      "risk_level": "HIGH",
      "risk_score": 0.73,
      "model_version": "v2.1",
      "inference_duration_ms": 1240,
      "is_cached": false,
      "created_at": "2026-04-30T10:30:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "pages": 1
}
```

**Error Responses:**
- 403: `{ "error": "Access denied." }`
- 404: `{ "error": "Project not found." }`

---

### PATCH /projects/:id/archive
Archive a project (`project_manager` or `admin` only)

**Response (200 OK):**
```json
{
  "message": "Project archived.",
  "project": {
    "project_id": 1,
    "project_name": "Payment Module"
  }
}
```

**Error Responses:**
- 403: `{ "error": "Access denied." }`
- 404: `{ "error": "Project not found." }`

---

### PATCH /projects/:id/unarchive
Restore an archived project (`admin` only)

**Response (200 OK):**
```json
{
  "message": "Project unarchived.",
  "project": {
    "project_id": 1,
    "project_name": "Payment Module"
  }
}
```

**Error Responses:**
- 403: `{ "error": "Access denied." }`
- 404: `{ "error": "Project not found." }`

---

### GET /projects/report/all
System-wide report across ALL projects (`admin` only)

**Response (200 OK):**
```json
{
  "report_type": "ADMIN_SYSTEM_REPORT",
  "generated_at": "2026-04-30T10:00:00Z",
  "total_projects": 45,
  "projects": [],
  "risk_distribution": [
    { "risk_level": "HIGH", "count": "89" }
  ],
  "user_stats": [
    { "role": "user", "count": "80" }
  ],
  "recent_audit_activity": [],
  "monthly_analysis_volume": []
}
```

**Error Responses:**
- 403: `{ "error": "Access denied." }`

---

## 7. CHATBOT ENDPOINTS

> All chat endpoints proxy to the Python FastAPI ML worker. Requires ML service running at `ML_WORKER_URL`.

### POST /chat/start
Initialise a chatbot session with risk context from a prediction

**Request:**
```json
{
  "session_id": "sess_abc123",
  "risk_level": "HIGH",
  "top_features": ["v(g)", "loc", "branchcount"]
}
```

**Response (200 OK):**
```json
{
  "session_id": "sess_abc123",
  "message": "Hello! Based on your HIGH risk analysis, I've identified key risk drivers...",
  "context": {}
}
```

**Error Responses:**
- 400: `{ "error": "session_id, risk_level, top_features required." }`
- 500: `{ "error": "Chatbot unavailable." }`

---

### POST /chat/message
Send a follow-up message in an active session

**Request:**
```json
{
  "session_id": "sess_abc123",
  "message": "How do I fix high cyclomatic complexity?"
}
```

**Response (200 OK):**
```json
{
  "session_id": "sess_abc123",
  "reply": "To reduce cyclomatic complexity, break large functions into smaller..."
}
```

**Error Responses:**
- 400: `{ "error": "session_id and message required." }`
- 500: `{ "error": "Chatbot unavailable." }`

---

### POST /chat/reset
Clear all session state for a session ID

**Request:**
```json
{
  "session_id": "sess_abc123"
}
```

**Response (200 OK):**
```json
{
  "message": "Session reset successfully."
}
```

**Error Responses:**
- 400: `{ "error": "session_id required." }`
- 500: `{ "error": "Chatbot unavailable." }`

---

### POST /chat
Legacy DB-based quick advice (kept for backward compatibility)

**Request:**
```json
{
  "projectId": 1
}
```

**Response (200 OK):**
```json
{
  "reply": "Based on your analysis, here are the top risks:\n\n• v(g): Refactor into smaller functions...",
  "features": ["v(g)", "loc", "branchcount", "ev(g)", "halstead_difficulty"]
}
```

**Error Responses:**
- 400: `{ "error": "projectId is required." }`
- 500: `{ "error": "Server error." }`

---

## 8. REPORT ENDPOINTS

> All report endpoints stream a downloadable file via `Content-Disposition` header.  
> `JSON` → `application/json` | `XML` → `application/xml` | `PDF` → `application/pdf`

### Report Access Matrix
| Report Type | JSON | XML | PDF |
|-------------|------|-----|-----|
| User (own project) | ✅ Free | ✅ Free | 🔒 Pro tier only |
| Student | ✅ Free | ✅ Free | ✅ Always free |
| Manager | ✅ Free | ✅ Free | 🔒 Pro tier only |
| Admin | ✅ Always | ✅ Always | ✅ Always |

---

### GET /report/my/:projectId/json
Download JSON report for own project

**Notes:**
- Ownership enforced — can only download reports for your own projects

**Response:** Downloads `report_project_{id}_{timestamp}.json`

**Error Responses:**
- 403: `{ "error": "Access denied." }`
- 404: `{ "error": "Project not found." }`

---

### GET /report/my/:projectId/xml
Download XML report for own project

**Response:** Downloads `report_project_{id}_{timestamp}.xml`

---

### GET /report/my/:projectId/pdf
Download PDF report for own project — **Pro tier only**

**Response:** Downloads `report_project_{id}_{timestamp}.pdf`

**Error Responses:**
- 403: `{ "error": "Pro tier required." }`

---

### GET /report/student/:projectId/json
Download JSON report — `student` role only

**Response:** Downloads `report_student_{id}_{timestamp}.json`

---

### GET /report/student/:projectId/xml
Download XML report — `student` role only

**Response:** Downloads `report_student_{id}_{timestamp}.xml`

---

### GET /report/student/:projectId/pdf
Download PDF report — `student` role only — **PDF is always free for students**

**Response:** Downloads `report_student_{id}_{timestamp}.pdf`

---

### GET /report/manager/json
Download manager JSON report covering all projects — `project_manager` or `admin` role

**Response:** Downloads `manager_report_{timestamp}.json`

---

### GET /report/manager/xml
Download manager XML report covering all projects

**Response:** Downloads `manager_report_{timestamp}.xml`

---

### GET /report/manager/pdf
Download manager PDF report — **Pro tier only** (admin always bypasses)

**Response:** Downloads `manager_report_{timestamp}.pdf`

**Error Responses:**
- 403: `{ "error": "Pro tier required." }`

---

### GET /report/admin/json
Download platform-wide JSON report — `admin` only

**Response:** Downloads `admin_report_{timestamp}.json`

---

### GET /report/admin/xml
Download platform-wide XML report — `admin` only

**Response:** Downloads `admin_report_{timestamp}.xml`

---

### GET /report/admin/pdf
Download platform-wide PDF report — `admin` only — **no tier restriction**

**Response:** Downloads `admin_report_{timestamp}.pdf`

---

## 9. ADMIN ENDPOINTS (Admin Only)

> All `/admin/*` endpoints require `role === 'admin'`. Returns 403 if role is insufficient.

### GET /admin/users
Get all users

**Response (200 OK):**
```json
[
  {
    "user_id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "tier": "free",
    "is_active": true,
    "is_email_verified": false,
    "created_at": "2026-01-01T00:00:00Z",
    "last_login_at": "2026-04-30T10:00:00Z"
  }
]
```

---

### GET /admin/users/:id
Get single user detail

**Response (200 OK):** Same fields as list above for one user.

**Error Responses:**
- 404: `{ "error": "User not found." }`

---

### PUT /admin/users/:id
Update user role, tier, and/or active status

**Request:**
```json
{
  "role": "project_manager",
  "tier": "pro",
  "is_active": true
}
```

**Notes:**
- At least one of `role`, `tier`, or `is_active` must be provided
- Valid roles: `'user'` | `'student'` | `'project_manager'` | `'admin'`
- Valid tiers: `'free'` | `'pro'`

**Response (200 OK):**
```json
{
  "message": "User updated.",
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "project_manager",
    "tier": "pro",
    "is_active": true
  }
}
```

**Error Responses:**
- 400: `{ "error": "Invalid role." }`
- 400: `{ "error": "Invalid tier." }`
- 400: `{ "error": "Nothing to update." }`
- 404: `{ "error": "User not found." }`

---

### DELETE /admin/users/:id
Hard delete a user from the database — **irreversible**

**Response (200 OK):**
```json
{
  "message": "User deleted.",
  "user": {
    "user_id": 1,
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- 404: `{ "error": "User not found." }`

---

### PATCH /admin/users/:id/toggle
Toggle user active status — flips `is_active` between `true` and `false`

**Response (200 OK):**
```json
{
  "message": "User activated."
}
```

or

```json
{
  "message": "User deactivated."
}
```

---

### PATCH /admin/users/:id/role
Update role only — targeted alternative to `PUT /admin/users/:id`

**Request:**
```json
{
  "role": "project_manager"
}
```

**Notes:**
- Valid roles: `'user'` | `'project_manager'` | `'admin'`

**Response (200 OK):**
```json
{
  "message": "Role updated to project_manager."
}
```

**Error Responses:**
- 400: `{ "error": "Invalid role." }`

---

### GET /admin/projects
Get all projects with owner info (paginated)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)

**Response (200 OK):**
```json
{
  "projects": [
    {
      "project_id": 1,
      "project_name": "Payment Module",
      "is_archived": false,
      "analysis_count": 3,
      "created_at": "2026-04-01T09:00:00Z",
      "user_id": 5,
      "email": "owner@example.com",
      "full_name": "Owner Name",
      "user_role": "user"
    }
  ],
  "total": 120,
  "page": 1,
  "limit": 10,
  "pages": 12
}
```

---

### GET /admin/analytics
Get system statistics grouped by role

**Response (200 OK):**
```json
{
  "users": [
    { "total": "80", "role": "user" },
    { "total": "15", "role": "student" },
    { "total": "4", "role": "project_manager" },
    { "total": "1", "role": "admin" }
  ],
  "total_projects": 45,
  "predictions_by_risk": [
    { "risk_level": "HIGH", "count": "89" },
    { "risk_level": "MEDIUM", "count": "234" },
    { "risk_level": "LOW", "count": "567" },
    { "risk_level": "CRITICAL", "count": "23" }
  ]
}
```

---

### GET /admin/dashboard
Get full admin dashboard data — scan counts, risk distribution, monthly trends

**Response (200 OK):**
```json
{
  "totalScans": 12450,
  "successfulScans": 11800,
  "failedScans": 650,
  "totalUsers": 120,
  "totalProjects": 45,
  "avgRisk": 0.65,
  "riskDistribution": [
    { "name": "LOW",      "value": 5620, "color": "#14a085" },
    { "name": "MEDIUM",   "value": 3740, "color": "#f59e0b" },
    { "name": "HIGH",     "value": 2490, "color": "#ff9500" },
    { "name": "CRITICAL", "value": 600,  "color": "#ff4444" }
  ],
  "scanTrends": [
    { "date": "Apr", "scans": 1200, "avg_risk": 0.62 }
  ]
}
```

**Error Responses:**
- 403: `{ "error": "Access denied." }`

---

### GET /admin/logs
Get audit logs (paginated, newest first)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)

**Response (200 OK):**
```json
{
  "logs": [
    {
      "id": 42,
      "user_id": 5,
      "user_name": "user@example.com",
      "role": "user",
      "action": "PROJECT_UPLOAD",
      "resource_type": "project",
      "project_id": 14,
      "status": "SUCCESS",
      "ip_address": "192.168.1.10",
      "error_message": null,
      "timestamp": "2026-04-30T10:30:00Z"
    }
  ],
  "total": 500,
  "page": 1,
  "limit": 10,
  "pages": 50
}
```

---

### GET /admin/logs/:id
Get single audit log detail

**Response (200 OK):** Same fields as log list entry above for one record.

**Error Responses:**
- 404: `{ "error": "Log not found." }`

---

### GET /admin/metrics
Get aggregated statistics for each code metric across all predictions

**Response (200 OK):**
```json
{
  "metrics": [
    {
      "name": "v(g)",
      "avg_value": 8.2341,
      "min_value": 1.0,
      "max_value": 45.0,
      "total_records": 1234,
      "extraction_method": "radon",
      "metric_unit": null
    }
  ]
}
```

---

### GET /admin/metrics/rules
Get all mitigation rules from the chatbot knowledge base

**Response (200 OK):**
```json
{
  "rules": [
    {
      "id": 1,
      "metric_name": "v(g)",
      "threshold_low": 10,
      "threshold_high": 20,
      "mitigation_advice": "Refactor large functions into smaller units...",
      "priority": "HIGH",
      "is_active": true,
      "version": 3,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-04-01T00:00:00Z"
    }
  ],
  "total": 26
}
```

---

### GET /admin/metrics/rules/:id
Get single mitigation rule detail

**Response (200 OK):** Same fields as rules list entry above for one rule.

**Error Responses:**
- 404: `{ "error": "Rule not found." }`

---

### PUT /admin/metrics/rules/:id
Update a mitigation rule — threshold, advice, priority, or active status

**Request:**
```json
{
  "threshold_low": 5,
  "threshold_high": 15,
  "mitigation_advice": "Updated advice text...",
  "priority": "CRITICAL",
  "is_active": true
}
```

**Notes:**
- At least one field must be provided
- `threshold_low` must be less than `threshold_high` when both are provided
- Valid priorities: `'CRITICAL'` | `'HIGH'` | `'MEDIUM'` | `'LOW'`
- `version` is auto-incremented on every successful update

**Response (200 OK):**
```json
{
  "message": "Rule updated.",
  "rule": {
    "id": 1,
    "metric_name": "v(g)",
    "threshold_low": 5,
    "threshold_high": 15,
    "mitigation_advice": "Updated advice text...",
    "priority": "CRITICAL",
    "is_active": true,
    "version": 4,
    "updated_at": "2026-04-30T11:00:00Z"
  }
}
```

**Error Responses:**
- 400: `{ "error": "Invalid priority. Must be CRITICAL, HIGH, MEDIUM or LOW." }`
- 400: `{ "error": "threshold_low must be less than threshold_high." }`
- 400: `{ "error": "Nothing to update." }`
- 404: `{ "error": "Rule not found." }`

---

## 10. COMMON ERROR RESPONSES

All errors follow this format:

```json
{
  "error": "Error message"
}
```

Some errors include a machine-readable `code` field:

```json
{
  "error": "Monthly limit reached. Upgrade to Pro.",
  "code": "TIER_LIMIT_EXCEEDED"
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (missing or invalid fields)
- 401: Unauthorized (missing, invalid, or expired token)
- 403: Forbidden (valid token but insufficient role or tier)
- 404: Not Found
- 409: Conflict (e.g. duplicate email on register)
- 423: Locked (account locked after 5 failed login attempts)
- 429: Too Many Requests (ML rate limit)
- 500: Internal Server Error
- 503: Service Unavailable (ML worker not running)
- 504: Gateway Timeout (ML analysis timed out)

**Common Error Codes:**
```json
{ "error": "Invalid or expired token.", "code": "AUTH_INVALID_TOKEN" }
```
```json
{ "error": "Monthly limit reached. Upgrade to Pro.", "code": "TIER_LIMIT_EXCEEDED" }
```
```json
{ "error": "ML service not running.", "code": "ML_UNAVAILABLE" }
```
```json
{ "error": "ML analysis timed out.", "code": "ML_TIMEOUT" }
```
```json
{ "error": "ML rate limit hit. Wait 1 minute.", "code": "RATE_LIMITED" }
```

---

## 11. AUTHENTICATION HEADER

All authenticated endpoints require:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**JWT Payload:**
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "role": "user",
  "tier": "free"
}
```

Token expiry: configured via `JWT_EXPIRES_IN` environment variable (default: `7d`)

---

## 12. PAGINATION

Paginated responses follow this format:

```json
{
  "data": [],
  "total": 1234,
  "page": 1,
  "limit": 10,
  "pages": 124
}
```

**Query Parameters:**
- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 10, max: 100 — except `/projects/:id/predictions` max: 50)

---

## 13. FEATURE FLAGS

**Pro Features (requires `tier: 'pro'`):**
- ✅ PDF report generation (user and project_manager)
- ✅ Unlimited code analyses (free tier capped at 10/month)
- ✅ Full dashboard analytics

**Free Features (available to all authenticated users):**
- ✅ Code analysis (limited to 10/month on free tier)
- ✅ JSON and XML report downloads
- ✅ Dashboard access (own data)
- ✅ Chatbot mitigation advice
- ✅ Project upload and management

**Student Exceptions:**
- ✅ PDF reports — always free regardless of tier

**Admin Exceptions:**
- ✅ All reports including PDF — no tier restriction applies

---

## 14. AUDIT LOG ACTION REFERENCE

| Action | Trigger |
|--------|---------|
| `REGISTER` | User self-registered |
| `LOGIN_SUCCESS` | Successful login |
| `LOGIN_FAILED` | Wrong password |
| `LOGIN_BLOCKED` | Login blocked — account locked |
| `LOGOUT` | Token blacklisted |
| `PROJECT_UPLOAD` | New project uploaded |
| `REPORT_USER_JSON` | User downloaded JSON report |
| `REPORT_USER_XML` | User downloaded XML report |
| `REPORT_USER_PDF` | User downloaded PDF report |
| `REPORT_STUDENT_JSON` | Student downloaded JSON report |
| `REPORT_STUDENT_XML` | Student downloaded XML report |
| `REPORT_STUDENT_PDF` | Student downloaded PDF report |
| `REPORT_MANAGER_JSON` | Manager downloaded JSON report |
| `REPORT_MANAGER_XML` | Manager downloaded XML report |
| `REPORT_MANAGER_PDF` | Manager downloaded PDF report |
| `ADMIN_REPORT_JSON` | Admin downloaded platform JSON report |
| `ADMIN_REPORT_XML` | Admin downloaded platform XML report |
| `ADMIN_REPORT_PDF` | Admin downloaded platform PDF report |

---

This is the **complete API contract** for Project Veracity — University of Punjab, Gujranwala Campus 2026.
