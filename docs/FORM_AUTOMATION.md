# Form Automation Feature (Supervised, No Paid AI)

## Overview

The Form Automation feature uses **deterministic heuristics (rules)** to analyze job application pages and automatically fill forms with user profile data. It is **supervised**: the extension fills what it can, you verify, and then it clicks **Next/Submit** only after confirmation.

## How It Works

### 1. Page Analysis (Rules Engine)
When you click "Auto Apply (Supervised)" on a job application page:

1. **Page Structure Extraction**: The browser extension extracts:
   - Page URL and title
   - All form fields (inputs, textareas, selects)
   - Field labels, placeholders, and attributes
   - Page content and job description (if available)

2. **Rules-based Mapping**: The extension classifies fields using:
   - `label`, `placeholder`, `name`, `id`, `aria-label`, `autocomplete`, input `type`
   - simple scoring/pattern matching (password-manager style)

3. **Supervised Execution**:
   - The extension fills what it is confident about
   - Highlights required fields it couldn’t fill
   - Shows an on-page review overlay
   - After you check “I verified”, it clicks the selected **Next/Submit** button

### 2. Field Mapping (Examples)

The rules engine maps common variants. For example:
- `firstName`, `first-name`, `fname`, `given-name` → All map to user's first name
- `email`, `e-mail`, `email-address` → All map to user's email
- Context-aware mapping using labels, placeholders, and nearby text

### 3. Supervised “Proceed”
Before clicking **Next/Submit**, you’ll see:
- Filled fields summary
- Required-but-missing fields (must be handled manually)
- A short list of detected Next/Submit candidates (you pick one)
- A required checkbox confirming you verified the form

## Browser Extension Implementation

This feature is implemented in the extension (no paid AI calls).

**Request Body:**
```json
{
  "pageUrl": "https://example.com/jobs/apply/123",
  "pageTitle": "Application Form",
  "pageContent": "Page text content...",
  "detectedFields": [
    {
      "id": "firstName",
      "name": "firstName",
      "type": "text",
      "tag": "input",
      "label": "First Name",
      "placeholder": "Enter your first name",
      "required": true,
      "selector": "#firstName"
    }
  ],
  "jobDescription": "Job description text..."
}
```

**Query Parameters:**
- `userId` (required): User ID for profile data

**Response:**
```json
{
  "pageType": "job_application",
  "isApplicationForm": true,
  "actions": [
    {
      "actionType": "fill_field",
      "fieldSelector": "#firstName",
      "fieldId": "firstName",
      "fieldName": "firstName",
      "value": "{{firstName}}",
      "order": 1,
      "description": "Fill First Name with firstName"
    }
  ],
  "fieldMappings": {
    "#firstName": "firstName",
    "#lastName": "lastName",
    "#email": "email"
  },
  "confidence": "HIGH",
  "warnings": [],
  "suggestions": [],
  "jobTitle": "Software Engineer",
  "companyName": "Example Corp"
}
```

## Browser Extension

### Auto Apply Button

Click the "🤖 Auto Apply (AI-Powered)" button in the extension popup to:
1. Analyze the current page
2. Generate automation plan
3. Fill form fields automatically
4. Show confidence and warnings

### Usage

1. Navigate to a job application page
2. Click the extension icon
3. Ensure you're logged in
4. Click "🤖 Auto Apply (AI-Powered)"
5. Review the filled fields (especially if confidence is LOW or MEDIUM)
6. Manually fill any unmapped required fields
7. Submit the application

## Enhancements (Still No Paid AI)

- **Per-site adapters** for Workday/Greenhouse/Lever/LinkedIn/etc.
- **Learning from user corrections** (store mappings per site/form fingerprint)
- **Multi-step wizard support** (auto re-run after each Next click)

### Future Enhancements

- **Multi-step Forms**: Handle forms with multiple steps/pages
- **Conditional Fields**: Handle fields that appear based on other field values
- **File Uploads**: Automatically attach resumes and cover letters
- **Auto-submit**: Optionally submit forms automatically (with user confirmation)
- **Site-specific Rules**: Optimized rules for popular job sites (LinkedIn, Indeed, etc.)
- **Learning**: Learn from user corrections to improve field mapping

## Architecture

```
Browser Extension (content.js)
    ↓
Extract Page Structure
    ↓
POST /api/automation/analyze
    ↓
FormAutomationService
    ↓
PageAnalysisService (AI)
    ↓
Generate Automation Plan
    ↓
Browser Extension
    ↓
Execute Actions
    ↓
Fill Form Fields
```

## Configuration

No additional configuration required. The feature uses existing:
- User authentication (JWT)
- Profile service (for user data)
- CORS configuration (for browser extension)

## Troubleshooting

### Low Confidence Warnings

If confidence is LOW or MEDIUM:
- Review all fields before submitting
- Manually fill unmapped required fields
- Check if form structure is unusual

### Fields Not Filled

If fields aren't filled:
- Check browser console for errors
- Verify user profile is complete
- Ensure form fields are standard HTML inputs
- Some sites use custom form components that may not be detected

### AI Integration Issues

If integrating AI models:
- Ensure API keys are configured
- Check rate limits
- Handle API errors gracefully
- Consider caching analysis results

## Security Considerations

- User data is only sent to the backend (not to third-party AI services unless configured)
- JWT tokens are used for authentication
- Form data is only filled, never auto-submitted without user confirmation
- Users should always review filled data before submitting

