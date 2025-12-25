# AutoApply Testing Guide

This guide will help you test all components of the AutoApply application.

## Prerequisites

Before testing, ensure:

1. ✅ **All backend services are running** (check PowerShell windows)
2. ✅ **PostgreSQL database is running** and `autoapply` database exists
3. ✅ **Frontend is running** (optional, for UI testing)
4. ✅ **Browser extension is installed** (optional, for extension testing)

## Quick Health Check

### 1. Check if services are running

**Windows (PowerShell):**
```powershell
# Check if ports are listening
netstat -ano | findstr "8080 8081 8082 8083 8084 8085"
```

**Linux/Mac:**
```bash
# Check if ports are listening
netstat -tuln | grep -E "8080|8081|8082|8083|8084|8085"
# Or using lsof
lsof -i :8080,8081,8082,8083,8084,8085
```

### 2. Test Gateway Service

```bash
# Using curl
curl http://localhost:8080/actuator/health

# Or using PowerShell
Invoke-WebRequest -Uri http://localhost:8080/actuator/health
```

## Testing via API (Using curl/PowerShell)

### Base URL
- **Gateway (recommended)**: `http://localhost:8080`
- **Direct service access**: 
  - Auth: `http://localhost:8081`
  - Profile: `http://localhost:8082`
  - Job Parser: `http://localhost:8083`
  - Resume Tailor: `http://localhost:8084`
  - Application Tracker: `http://localhost:8085`

---

## Test Scenario 1: User Registration & Authentication

### Step 1: Register a New User

**PowerShell:**
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
    firstName = "John"
    lastName = "Doe"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

Write-Host "Token: $($response.token)"
Write-Host "User ID: $($response.userId)"
Write-Host "Email: $($response.email)"
```

**curl (Linux/Mac/Git Bash):**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "email": "test@example.com"
}
```

**Save the token and userId for subsequent requests!**

### Step 2: Login

**PowerShell:**
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$token = $response.token
$userId = $response.userId
Write-Host "Token: $token"
Write-Host "User ID: $userId"
```

**curl:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## Test Scenario 2: Profile Management

### Step 1: Create/Update Profile

**PowerShell:**
```powershell
# Replace $token and $userId with values from login
$token = "YOUR_TOKEN_HERE"
$userId = 1

$body = @{
    fullName = "John Doe"
    phone = "+1234567890"
    location = "New York, NY"
    linkedinUrl = "https://linkedin.com/in/johndoe"
    portfolioUrl = "https://johndoe.dev"
    summary = "Experienced software engineer with 5+ years in full-stack development"
    experiences = @(
        @{
            company = "Tech Corp"
            position = "Senior Software Engineer"
            startDate = "2020-01-01"
            endDate = "2024-12-31"
            description = "Led development of microservices architecture"
        }
    )
    education = @(
        @{
            institution = "University of Technology"
            degree = "Bachelor of Science"
            field = "Computer Science"
            graduationDate = "2019-05-01"
        }
    )
    skills = @(
        @{
            name = "Java"
            level = "Expert"
        },
        @{
            name = "Spring Boot"
            level = "Expert"
        },
        @{
            name = "React"
            level = "Advanced"
        }
    )
} | ConvertTo-Json -Depth 10

$headers = @{
    Authorization = "Bearer $token"
}

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/profile/$userId" `
    -Method POST `
    -Body $body `
    -Headers $headers `
    -ContentType "application/json"

$response | ConvertTo-Json -Depth 10
```

**curl:**
```bash
curl -X POST http://localhost:8080/api/profile/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "fullName": "John Doe",
    "phone": "+1234567890",
    "location": "New York, NY",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "portfolioUrl": "https://johndoe.dev",
    "summary": "Experienced software engineer with 5+ years in full-stack development",
    "experiences": [
      {
        "company": "Tech Corp",
        "position": "Senior Software Engineer",
        "startDate": "2020-01-01",
        "endDate": "2024-12-31",
        "description": "Led development of microservices architecture"
      }
    ],
    "education": [
      {
        "institution": "University of Technology",
        "degree": "Bachelor of Science",
        "field": "Computer Science",
        "graduationDate": "2019-05-01"
      }
    ],
    "skills": [
      {
        "name": "Java",
        "level": "Expert"
      },
      {
        "name": "Spring Boot",
        "level": "Expert"
      },
      {
        "name": "React",
        "level": "Advanced"
      }
    ]
  }'
```

### Step 2: Get Profile

**PowerShell:**
```powershell
$token = "YOUR_TOKEN_HERE"
$userId = 1

$headers = @{
    Authorization = "Bearer $token"
}

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/profile/$userId" `
    -Method GET `
    -Headers $headers

$response | ConvertTo-Json -Depth 10
```

**curl:**
```bash
curl -X GET http://localhost:8080/api/profile/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Test Scenario 3: Job Parsing

**PowerShell:**
```powershell
$body = @{
    jobDescription = "We are looking for a Senior Software Engineer with experience in Java, Spring Boot, and microservices. The ideal candidate should have 5+ years of experience and be familiar with React and PostgreSQL."
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/jobs/parse" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$response | ConvertTo-Json -Depth 10
```

**curl:**
```bash
curl -X POST http://localhost:8080/api/jobs/parse \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "We are looking for a Senior Software Engineer with experience in Java, Spring Boot, and microservices. The ideal candidate should have 5+ years of experience and be familiar with React and PostgreSQL."
  }'
```

**Note:** This endpoint currently returns stubbed data (AI integration pending).

---

## Test Scenario 4: Resume Tailoring

**PowerShell:**
```powershell
$body = @{
    userId = 1
    jobDescription = "We are looking for a Senior Software Engineer with experience in Java, Spring Boot, and microservices."
    originalResume = "John Doe\nSoftware Engineer\n5 years of experience in Java development."
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/resumes/tailor" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$response | ConvertTo-Json -Depth 10
```

**curl:**
```bash
curl -X POST http://localhost:8080/api/resumes/tailor \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "jobDescription": "We are looking for a Senior Software Engineer with experience in Java, Spring Boot, and microservices.",
    "originalResume": "John Doe\nSoftware Engineer\n5 years of experience in Java development."
  }'
```

**Note:** This endpoint currently returns stubbed data (AI integration pending).

---

## Test Scenario 5: Application Tracking

### Step 1: Create Application

**PowerShell:**
```powershell
$body = @{
    userId = 1
    companyName = "Tech Corp"
    position = "Senior Software Engineer"
    jobUrl = "https://techcorp.com/jobs/senior-software-engineer"
    applicationDate = "2024-01-15"
    status = "APPLIED"
    notes = "Applied through company website"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/applications" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$applicationId = $response.id
Write-Host "Application ID: $applicationId"
$response | ConvertTo-Json -Depth 10
```

**curl:**
```bash
curl -X POST http://localhost:8080/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "companyName": "Tech Corp",
    "position": "Senior Software Engineer",
    "jobUrl": "https://techcorp.com/jobs/senior-software-engineer",
    "applicationDate": "2024-01-15",
    "status": "APPLIED",
    "notes": "Applied through company website"
  }'
```

### Step 2: Get All Applications for User

**PowerShell:**
```powershell
$userId = 1

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/applications/user/$userId" `
    -Method GET

$response | ConvertTo-Json -Depth 10
```

**curl:**
```bash
curl -X GET http://localhost:8080/api/applications/user/1
```

### Step 3: Get Applications by Status

**PowerShell:**
```powershell
$userId = 1
$status = "APPLIED"  # Options: APPLIED, INTERVIEW, REJECTED, OFFER, ACCEPTED

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/applications/user/$userId/status/$status" `
    -Method GET

$response | ConvertTo-Json -Depth 10
```

**curl:**
```bash
curl -X GET http://localhost:8080/api/applications/user/1/status/APPLIED
```

### Step 4: Update Application

**PowerShell:**
```powershell
$applicationId = 1  # Replace with actual ID from create

$body = @{
    userId = 1
    companyName = "Tech Corp"
    position = "Senior Software Engineer"
    jobUrl = "https://techcorp.com/jobs/senior-software-engineer"
    applicationDate = "2024-01-15"
    status = "INTERVIEW"
    notes = "Interview scheduled for next week"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/applications/$applicationId" `
    -Method PUT `
    -Body $body `
    -ContentType "application/json"

$response | ConvertTo-Json -Depth 10
```

**curl:**
```bash
curl -X PUT http://localhost:8080/api/applications/1 \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "companyName": "Tech Corp",
    "position": "Senior Software Engineer",
    "jobUrl": "https://techcorp.com/jobs/senior-software-engineer",
    "applicationDate": "2024-01-15",
    "status": "INTERVIEW",
    "notes": "Interview scheduled for next week"
  }'
```

### Step 5: Delete Application

**PowerShell:**
```powershell
$applicationId = 1  # Replace with actual ID

Invoke-RestMethod -Uri "http://localhost:8080/api/applications/$applicationId" `
    -Method DELETE

Write-Host "Application deleted successfully"
```

**curl:**
```bash
curl -X DELETE http://localhost:8080/api/applications/1
```

---

## Testing via Frontend

### 1. Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 2. Test Pages

- **Login/Register**: `http://localhost:3000`
- **Profile**: `http://localhost:3000/profile`
- **Job Analyzer**: `http://localhost:3000/job-analyzer`
- **Resume Tailor**: `http://localhost:3000/resume-tailor`
- **Application Tracker**: `http://localhost:3000/application-tracker`

### 3. Test Flow

1. Register a new account
2. Login with credentials
3. Create/update your profile
4. Parse a job description
5. Tailor your resume to a job
6. Track job applications

---

## Testing Browser Extension

### 1. Load Extension

1. Open Chrome/Edge and go to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `browser-extension` folder

### 2. Get JWT Token

1. Login via API or frontend
2. Copy the JWT token from the response

### 3. Configure Extension

1. Click the extension icon
2. Paste your JWT token
3. Click "Save Token"

### 4. Test Auto-Fill

1. Navigate to a job application form (e.g., LinkedIn, company career pages)
2. Click the extension icon
3. Click "Auto-Fill Form"
4. The extension should populate form fields with your profile data

---

## Complete Test Script (PowerShell)

We include this script already at `scripts/test-api.ps1` (run it with `.\scripts\test-api.ps1`). Full contents below if you want to copy/modify:

```powershell
# AutoApply API Test Script
$baseUrl = "http://localhost:8080"

Write-Host "=== AutoApply API Testing ===" -ForegroundColor Cyan
Write-Host ""

# 1. Register User
Write-Host "1. Registering user..." -ForegroundColor Yellow
$registerBody = @{
    email = "test@example.com"
    password = "password123"
    firstName = "John"
    lastName = "Doe"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -Body $registerBody `
        -ContentType "application/json"
    
    $token = $registerResponse.token
    $userId = $registerResponse.userId
    
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "   User ID: $userId" -ForegroundColor Gray
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Login
Write-Host "2. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json"
    
    $token = $loginResponse.token
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Create Profile
Write-Host "3. Creating profile..." -ForegroundColor Yellow
$profileBody = @{
    fullName = "John Doe"
    phone = "+1234567890"
    location = "New York, NY"
    summary = "Experienced software engineer"
    skills = @(
        @{ name = "Java"; level = "Expert" },
        @{ name = "Spring Boot"; level = "Expert" }
    )
} | ConvertTo-Json -Depth 10

$headers = @{
    Authorization = "Bearer $token"
}

try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/api/profile/$userId" `
        -Method POST `
        -Body $profileBody `
        -Headers $headers `
        -ContentType "application/json"
    
    Write-Host "✅ Profile created!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Profile creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Parse Job
Write-Host "4. Parsing job description..." -ForegroundColor Yellow
$jobBody = @{
    jobDescription = "Looking for a Java developer with Spring Boot experience."
} | ConvertTo-Json

try {
    $jobResponse = Invoke-RestMethod -Uri "$baseUrl/api/jobs/parse" `
        -Method POST `
        -Body $jobBody `
        -ContentType "application/json"
    
    Write-Host "✅ Job parsed!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Job parsing failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Create Application
Write-Host "5. Creating job application..." -ForegroundColor Yellow
$appBody = @{
    userId = $userId
    companyName = "Tech Corp"
    position = "Senior Software Engineer"
    jobUrl = "https://techcorp.com/jobs"
    applicationDate = "2024-01-15"
    status = "APPLIED"
} | ConvertTo-Json

try {
    $appResponse = Invoke-RestMethod -Uri "$baseUrl/api/applications" `
        -Method POST `
        -Body $appBody `
        -ContentType "application/json"
    
    Write-Host "✅ Application created!" -ForegroundColor Green
    Write-Host "   Application ID: $($appResponse.id)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Application creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=== Testing Complete ===" -ForegroundColor Cyan
```

Run it with:
```powershell
.\scripts\test-api.ps1
```

---

## Troubleshooting

### Services Not Starting
- Check if ports 8080-8085 are already in use
- Verify PostgreSQL is running
- Check database connection in `.env` file
- Review service logs in PowerShell windows

### Database Connection Errors
- Verify PostgreSQL is running: `psql -U postgres -l`
- Check database exists: `psql -U postgres -c "\l" | grep autoapply`
- Verify credentials in `.env` match PostgreSQL setup
- Run database setup: `.\database\setup-database.ps1`

### Authentication Errors
- Ensure token is included in `Authorization: Bearer <token>` header
- Check token hasn't expired (default: 24 hours)
- Verify user exists in database

### CORS Errors
- Ensure requests are made to `http://localhost:8080` (gateway)
- Frontend should be running on `http://localhost:3000`
- Check gateway service is running

---

## Next Steps

- Integrate AI models for job parsing and resume tailoring
- Add unit and integration tests
- Set up CI/CD pipeline
- Add API documentation (Swagger/OpenAPI)
- Implement rate limiting and security enhancements




