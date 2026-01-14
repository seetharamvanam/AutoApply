// Content script for job sites
// This is a placeholder for future auto-fill functionality

console.log('AutoApply extension loaded on:', window.location.href);

// Detect job posting pages
function detectJobPage() {
    const url = window.location.href;
    const hostname = window.location.hostname;
    
    // Placeholder: detect if we're on a job posting page
    // Future: implement page analysis and form detection
    if (hostname.includes('linkedin.com') || hostname.includes('indeed.com')) {
        console.log('Job site detected:', hostname);
    }
}

// Run detection when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', detectJobPage);
} else {
    detectJobPage();
}
