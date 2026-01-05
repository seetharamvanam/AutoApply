# AutoApply Browser Extension

## Installation

1. Open Chrome/Edge and navigate to `chrome://extensions/` or `edge://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `browser-extension` folder

## Usage

1. Click the extension icon in your browser toolbar
2. Enter your API token (JWT token from login)
3. Navigate to a job application page
4. Click "Auto Apply (Supervised)" to:
   - Fill detected fields
   - Highlight missing required fields
   - Show an on-page review overlay
   - Click Next/Submit only after your confirmation
5. (Optional) Click "Fill Application Form" to fill only (no Next/Submit)
6. (Optional) Click "Analyze Job Page" to extract and analyze job description

## Development

- `manifest.json`: Extension configuration
- `popup.html/js`: Extension popup UI
- `content.js`: Script injected into web pages
- `background.js`: Service worker for background tasks

## Notes

- The extension requires the backend API to be running on `http://localhost:8080`
- Make sure CORS is properly configured on the backend
- The extension uses JWT tokens for authentication

