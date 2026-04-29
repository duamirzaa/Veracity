# Project Veracity - Complete API Contract

**Base URL:** `http://localhost:8000/api` (or production URL)  
**API Version:** 1.0.0  
**Authentication:** Bearer Token (JWT) in Authorization header

---

## 1. DATA MODELS & TYPES

### User Object
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "john_doe",
  "full_name": "John Doe",
  "role": "user",
  "tier": "pro",
  "is_active": true
}
```

**Field Definitions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | ✅ | Unique user identifier |
| email | string | ✅ | User email address |
| username | string | ✅ | Unique username |
| full_name | string \| null | ✅ | User's full name (can be null) |
| role | enum | ✅ | One of: `'user'`, `'project_manager'`, `'admin'`, `'student'` |
| tier | enum | ✅ | Subscription tier: `'free'` or `'pro'` |
| is_active | boolean | ✅ | Account active status |

**Valid Roles:**
- `user` - Regular user access (dashboard, projects, analysis, reports)
- `project_manager` - Project management and project oversight
- `admin` - Full admin access to all features and admin dashboard
- `student` - Student tier with full feature access for educational purposes

**Tier Levels:**
- `free` - Free tier with limited report formats (JSON, XML only)
- `pro` - Pro tier with all report formats (JSON, XML, PDF)

---

### Prediction Object
```json
{
  "id": 1,
  "defect_probability": 0.75,
  "risk_level": "high",
  "top_risk_features": [
    {
      "feature_name": "v(g)",
      "shap_value": 0.15,
      "feature_value": 12,
      "impact": "positive",
      "abs_shap_value": 0.15
    }
  ],
  "code_snippet": "def process_payment(...)",
  "file_path": "payment_processor.py",
  "metrics": {
    "loc": 450,
    "v(g)": 12,
    "ev(g)": 8.5,
    "iv(g)": 6.2,
    "branchCount": 25,
    "num_functions": 15,
    "num_classes": 3,
    "num_imports": 8,
    "maintainability_index": 45,
    "lOCode": 420,
    "lOComment": 30,
    "lOBlank": 20
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Field Definitions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | ✅ | Unique prediction identifier |
| defect_probability | number (0-1) | ✅ | Probability of defect (0.0 to 1.0) |
| risk_level | enum | ✅ | One of: `'low'`, `'medium'`, `'high'`, `'critical'` |
| top_risk_features | RiskFeature[] | ✅ | Array of top contributing risk features (min 3-5) |
| code_snippet | string | ✅ | The actual code analyzed |
| file_path | string | ✅ | Path to the analyzed file |
| metrics | object | ✅ | Code metrics object (see below) |
| created_at | ISO8601 string | ✅ | Timestamp when analysis was created |

**Risk Level Mapping (Suggested):**
- `low`: defect_probability < 0.25
- `medium`: defect_probability 0.25-0.5
- `high`: defect_probability 0.5-0.75
- `critical`: defect_probability >= 0.75

### RiskFeature Object
```json
{
  "feature_name": "v(g)",
  "shap_value": 0.15,
  "feature_value": 12,
  "impact": "positive",
  "abs_shap_value": 0.15
}
```

**Field Definitions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| feature_name | string | ✅ | Name of code metric (v(g), loc, branchCount, etc.) |
| shap_value | number | ✅ | SHAP value (contribution to model prediction) |
| feature_value | number | ✅ | Actual value of the metric in code |
| impact | enum | ✅ | `'positive'` (increases risk) or `'negative'` (decreases risk) |
| abs_shap_value | number | ❌ | Absolute SHAP value (optional) |

### Metrics Object
```json
{
  "loc": 450,
  "v(g)": 12,
  "ev(g)": 8.5,
  "iv(g)": 6.2,
  "branchCount": 25,
  "num_functions": 15,
  "num_classes": 3,
  "num_imports": 8,
  "maintainability_index": 45,
  "lOCode": 420,
  "lOComment": 30,
  "lOBlank": 20
}
```

**Field Definitions:**
| Field | Type | Description |
|-------|------|-------------|
| loc | number | Lines of code |
| v(g) | number | Cyclomatic complexity |
| ev(g) | number | Essential complexity |
| iv(g) | number | Design complexity |
| branchCount | number | Number of branches |
| num_functions | number | Number of functions |
| num_classes | number | Number of classes |
| num_imports | number | Number of imports |
| maintainability_index | number | Code maintainability score (0-100) |
| lOCode | number | Lines of code (actual) |
| lOComment | number | Lines of comments |
| lOBlank | number | Blank lines |

### Project Object
```json
{
  "id": 1,
  "name": "E-commerce Platform",
  "description": "Main e-commerce application with payment integration",
  "repository_url": "https://github.com/user/ecommerce",
  "repository_type": "github",
  "files_analyzed": 45,
  "last_analyzed": "2024-01-15",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "is_archived": false,
  "archived_at": null
}
```

**Field Definitions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | ✅ | Unique project identifier |
| name | string | ✅ | Project name |
| description | string | ✅ | Project description |
| repository_url | string \| null | ❌ | Git repository URL |
| repository_type | string \| null | ❌ | One of: `'github'`, `'gitlab'`, `'bitbucket'` |
| files_analyzed | number | ✅ | Count of files analyzed |
| last_analyzed | ISO8601 string \| date | ✅ | Last analysis timestamp |
| created_at | ISO8601 string | ✅ | Project creation timestamp |
| updated_at | ISO8601 string | ✅ | Last update timestamp |
| is_archived | boolean | ✅ | Whether the project is archived |
| archived_at | ISO8601 string \| null | ❌ | Timestamp when project was archived (null if not archived) |

### Report Object
```json
{
  "id": 1,
  "title": "Daily Risk Report - January 15",
  "report_type": "daily",
  "report_format": "pdf",
  "created_at": "2024-01-15T10:00:00Z"
}
```

**Field Definitions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | ✅ | Unique report identifier |
| title | string | ✅ | Report title |
| report_type | enum | ✅ | One of: `'daily'`, `'monthly'`, `'custom'` |
| report_format | enum | ✅ | One of: `'json'`, `'xml'`, `'pdf'` |
| created_at | ISO8601 string | ✅ | Report creation timestamp |

---

## 2. AUTHENTICATION ENDPOINTS

### POST /auth/login
Login with email and password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe",
    "full_name": "John Doe",
    "role": "user",
    "tier": "pro",
    "is_active": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- 400: `{ "error": "Email and password required" }`
- 401: `{ "error": "Invalid email or password" }`

---

### POST /auth/register
Register new user

**Request:**
```json
{
  "email": "newuser@example.com",
  "username": "new_user",
  "password": "password123",
  "full_name": "New User"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 6,
    "email": "newuser@example.com",
    "username": "new_user",
    "full_name": "New User",
    "role": "user",
    "tier": "free",
    "is_active": true
  }
}
```

**Notes:**
- New users default to `role: 'user'` and `tier: 'free'`
- No token is returned on register - token is only provided on login
- Email and username must be unique
- Password minimum requirements: suggest 8+ characters

**Error Responses:**
- 400: `{ "error": "Email already exists" }`
- 400: `{ "error": "Username already exists" }`
- 400: `{ "error": "All fields are required" }`

---

### POST /auth/oauth/{provider}
OAuth login (GitHub, Google, Microsoft)

**Parameters:**
- `provider`: `'github'` | `'google'` | `'microsoft'`

**Request Body:** (optional, provider-specific token)
```json
{
  "code": "oauth_authorization_code",
  "redirect_uri": "http://localhost:3000/auth/callback"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 7,
    "email": "user@github.com",
    "username": "github_user",
    "full_name": "GitHub User",
    "role": "user",
    "tier": "free",
    "is_active": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- 400: `{ "error": "Invalid OAuth code" }`
- 401: `{ "error": "OAuth provider error" }`

---

### GET /auth/verify
Verify token and get current user

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "john_doe",
  "full_name": "John Doe",
  "role": "user",
  "tier": "pro",
  "is_active": true
}
```

**Error Responses:**
- 401: `{ "error": "Invalid or expired token" }`

---

## 3. PREDICTIONS & ANALYSIS ENDPOINTS

### POST /analysis
Submit code for defect analysis

**Request:**
```json
{
  "code": "def process_payment(user_id, amount, currency):\n    if amount <= 0:\n        raise ValueError(...)",
  "file_path": "payment_processor.py",
  "project_id": 1
}
```

**Response (201 Created):**
```json
{
  "prediction": {
    "id": 1,
    "defect_probability": 0.75,
    "risk_level": "high",
    "top_risk_features": [...],
    "code_snippet": "def process_payment(...)",
    "file_path": "payment_processor.py",
    "metrics": {...},
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- 400: `{ "error": "Code and file_path are required" }`
- 500: `{ "error": "Analysis failed" }`

---

### GET /predictions
Get all predictions (paginated)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `risk_level` (optional): 'low' | 'medium' | 'high' | 'critical'

**Response (200 OK):**
```json
{
  "predictions": [...],
  "total": 1234,
  "page": 1,
  "limit": 10
}
```

---

### GET /predictions/{id}
Get single prediction by ID

**Response (200 OK):**
```json
{
  "id": 1,
  "defect_probability": 0.75,
  "risk_level": "high",
  "top_risk_features": [...],
  "code_snippet": "...",
  "file_path": "payment_processor.py",
  "metrics": {...},
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- 404: `{ "error": "Prediction not found" }`

---

### GET /projects/{projectId}/predictions
Get predictions for specific project

**Response (200 OK):**
```json
{
  "predictions": [...],
  "total": 45,
  "page": 1,
  "limit": 10
}
```

---

## 4. PROJECTS ENDPOINTS

### GET /projects
Get all projects (paginated) - Returns only active (non-archived) projects by default

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `include_archived` (boolean, default: false) - Set to true to include archived projects

**Response (200 OK):**
```json
{
  "projects": [...],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

---

### GET /projects/{id}
Get single project

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "E-commerce Platform",
  "description": "Main e-commerce application with payment integration",
  "repository_url": "https://github.com/user/ecommerce",
  "repository_type": "github",
  "files_analyzed": 45,
  "last_analyzed": "2024-01-15",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### POST /projects
Create new project

**Request:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "repository_url": "https://github.com/user/new-project",
  "repository_type": "github"
}
```

**Response (201 Created):**
```json
{
  "id": 16,
  "name": "New Project",
  "description": "Project description",
  "repository_url": "https://github.com/user/new-project",
  "repository_type": "github",
  "files_analyzed": 0,
  "last_analyzed": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### PUT /projects/{id}
Update project

**Request:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Updated Project Name",
  "description": "Updated description",
  ...
}
```

---

### DELETE /projects/{id}
Archive project (Soft Delete)

Archives a project without removing it from the database. The project will be marked as archived and can be recovered if needed.

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Project Name",
  "description": "Project description",
  "is_archived": true,
  "archived_at": "2024-01-15T10:30:00Z",
  ...
}
```

---

## 5. REPORTS ENDPOINTS

### GET /reports
Get all reports (paginated)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Response (200 OK):**
```json
{
  "reports": [...],
  "total": 32,
  "page": 1,
  "limit": 10
}
```

---

### GET /reports/{id}
Get single report

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Daily Risk Report - January 15",
  "report_type": "daily",
  "report_format": "pdf",
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

### POST /reports/generate
Generate new report with role-based format restrictions

**Request:**
```json
{
  "title": "January Risk Analysis",
  "report_type": "monthly",
  "report_format": "pdf",
  "project_id": 1,
  "filters": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "risk_level": "high"
  }
}
```

**Response (201 Created):**
```json
{
  "id": 33,
  "title": "January Risk Analysis",
  "report_type": "monthly",
  "report_format": "pdf",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Role-Based Format Permissions:**

| User Role | Tier | Allowed Formats | Notes |
|-----------|------|-----------------|-------|
| `student` | free/pro | JSON, XML, PDF | Students can generate all formats regardless of tier |
| `user` | pro | JSON, XML, PDF | Pro tier users can generate all formats |
| `user` | free | JSON, XML | Free tier users limited to JSON and XML |
| `project_manager` | free/pro | JSON, XML, PDF | Project managers can generate all formats |
| `admin` | free/pro | JSON, XML, PDF | Admins can generate all formats |

**Error Responses:**
- 400: `{ "error": "Format not allowed for your user tier. Allowed formats: json, xml" }`
- 401: `{ "error": "Authentication required" }`
- 403: `{ "error": "Insufficient permissions" }`
- 500: `{ "error": "Report generation failed" }`

---

### GET /reports/{id}/download
Download report file with role-based format restrictions

**Query Parameters:**
- `format`: 'json' | 'xml' | 'pdf' (subject to user's role and tier)

**Response (200 OK):**
Binary file (Content-Type: application/pdf or application/json or application/xml)

**Role-Based Format Permissions:**

| User Role | Tier | Allowed Formats |
|-----------|------|-----------------|
| `student` | free/pro | JSON, XML, PDF |
| `user` | pro | JSON, XML, PDF |
| `user` | free | JSON, XML |
| `project_manager` | free/pro | JSON, XML, PDF |
| `admin` | free/pro | JSON, XML, PDF |

**Error Responses:**
- 400: `{ "error": "Format not allowed for your user tier. Allowed formats: json, xml" }`
- 404: `{ "error": "Report not found" }`
- 401: `{ "error": "Authentication required" }`

---

### DELETE /reports/{id}
Delete report

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Report deleted"
}
```

---

## 6. ADMIN ENDPOINTS (Admin Only)

### GET /dashboard/stats
Get user dashboard statistics

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "totalPredictions": 1234,
  "highRiskCount": 89,
  "mediumRiskCount": 234,
  "lowRiskCount": 567,
  "criticalRiskCount": 23,
  "averageDefectProbability": 0.45,
  "riskTrends": [
    {
      "date": "2024-01-01",
      "low": 45,
      "medium": 30,
      "high": 15,
      "critical": 10
    }
  ],
  "defectStats": [...]
}
```

---

### GET /admin/dashboard
Get admin analytics dashboard (Admin only)

**Response (200 OK):**
```json
{
  "avgRisk": 0.65,
  "totalScans": 12450,
  "successfulScans": 11800,
  "failedScans": 650,
  "riskDistribution": [
    {"name": "Low", "value": 45, "color": "#14a085"},
    {"name": "Medium", "value": 30, "color": "#1abba1"},
    {"name": "High", "value": 20, "color": "#ff9500"},
    {"name": "Critical", "value": 5, "color": "#ff4444"}
  ],
  "scanTrends": [
    {"date": "Jan", "scans": 1200, "avgRisk": 0.62}
  ]
}
```

**Error Responses:**
- 403: `{ "error": "Admin access required" }`

---

### GET /admin/users
Get all users (Admin only, paginated)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "user",
      "projects": ["E-commerce Platform", "API Gateway"],
      "access": "write"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10
}
```

---

### GET /admin/users/{id}
Get user details (Admin only)

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "role": "user",
  "projects": ["E-commerce Platform", "API Gateway"],
  "access": "write"
}
```

---

### PUT /admin/users/{id}
Update user (Admin only)

**Request:**
```json
{
  "role": "project_manager",
  "access": "admin"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "role": "project_manager",
  "projects": ["E-commerce Platform"],
  "access": "admin"
}
```

---

### DELETE /admin/users/{id}
Delete user (Admin only)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted"
}
```

---

### GET /admin/projects
Get all projects (Admin view, paginated)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Response (200 OK):**
```json
{
  "projects": [...],
  "total": 20,
  "page": 1,
  "limit": 10
}
```

---

### GET /admin/logs
Get scan logs (Admin only, paginated)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Response (200 OK):**
```json
{
  "logs": [
    {
      "id": 1,
      "project_id": 1,
      "project_name": "E-commerce Platform",
      "user_id": 5,
      "user_name": "John Doe",
      "status": "success",
      "files_scanned": 45,
      "predictions_generated": 89,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10
}
```

---

### GET /admin/logs/{id}
Get scan log details (Admin only)

**Response (200 OK):**
```json
{
  "id": 1,
  "project_id": 1,
  "project_name": "E-commerce Platform",
  "user_id": 5,
  "user_name": "John Doe",
  "status": "success",
  "files_scanned": 45,
  "predictions_generated": 89,
  "timestamp": "2024-01-15T10:30:00Z",
  "error_message": null
}
```

---

### GET /admin/metrics
Get metric configurations (Admin only)

**Response (200 OK):**
```json
{
  "metrics": [
    {
      "id": 1,
      "name": "v(g)",
      "description": "Cyclomatic Complexity",
      "enabled": true,
      "threshold": 15
    },
    {
      "id": 2,
      "name": "loc",
      "description": "Lines of Code",
      "enabled": true,
      "threshold": 500
    }
  ]
}
```

---

### PUT /admin/metrics/{id}
Update metric configuration (Admin only)

**Request:**
```json
{
  "enabled": true,
  "threshold": 20
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "v(g)",
  "description": "Cyclomatic Complexity",
  "enabled": true,
  "threshold": 20
}
```

---

## 7. COMMON ERROR RESPONSES

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

**Common Errors:**
```json
{
  "error": "Invalid or expired token",
  "code": "AUTH_INVALID_TOKEN"
}
```

```json
{
  "error": "User not authorized for this action",
  "code": "AUTH_INSUFFICIENT_PERMISSIONS"
}
```

```json
{
  "error": "Resource not found",
  "code": "NOT_FOUND"
}
```

---

## 8. AUTHENTICATION HEADER

All authenticated endpoints require:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token stored in: `auth_token` cookie  
User data stored in: `auth_user` cookie

---

## 9. PAGINATION

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
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

---

## 10. FEATURE FLAGS

**Pro Features (requires `is_pro: true`):**
- ✅ PDF report generation
- ✅ Unlimited predictions
- ✅ Unlimited analysis
- ✅ Advanced analytics
- ✅ Chatbot support
- ✅ Priority support

**Free Features (available to all):**
- ✅ Basic code analysis (limited per month)
- ✅ JSON/XML reports
- ✅ Community support
- ✅ Dashboard access

---

This is the **complete API contract** to send to your backend developer!
