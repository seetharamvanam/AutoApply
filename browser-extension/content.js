// Content script for AutoApply browser extension

(function() {
  'use strict';

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fillForm') {
      fillForm(request.token, request.apiUrl).then(result => {
        sendResponse(result);
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true; // Keep channel open for async response
    } else if (request.action === 'analyzePage') {
      analyzePage(request.token, request.apiUrl).then(result => {
        sendResponse(result);
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
    }
  });

  async function fillForm(token, apiUrl) {
    try {
      // Fetch user profile from backend
      const userId = await getUserIdFromToken(token, apiUrl);
      if (!userId) {
        throw new Error('Failed to get user ID');
      }

      const profileResponse = await fetch(`${apiUrl}/api/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profile = await profileResponse.json();

      // Detect and fill form fields
      fillFormFields(profile);

      return { success: true };
    } catch (error) {
      console.error('Error filling form:', error);
      return { success: false, error: error.message };
    }
  }

  async function getUserIdFromToken(token, apiUrl) {
    // In a real implementation, decode JWT or call an endpoint to get user ID
    // For now, this is a placeholder
    try {
      // Decode JWT token (simplified - in production use a proper JWT library)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  function fillFormFields(profile) {
    // Common field mappings
    const fieldMappings = {
      firstName: ['firstName', 'first-name', 'first_name', 'fname', 'given-name'],
      lastName: ['lastName', 'last-name', 'last_name', 'lname', 'family-name'],
      fullName: ['fullName', 'full-name', 'full_name', 'name', 'applicant-name'],
      email: ['email', 'e-mail', 'email-address', 'email_address'],
      phone: ['phone', 'phone-number', 'phone_number', 'tel', 'telephone'],
      location: ['location', 'city', 'address', 'address-line'],
      linkedin: ['linkedin', 'linkedin-url', 'linkedin_url', 'linkedin-profile'],
      portfolio: ['portfolio', 'portfolio-url', 'portfolio_url', 'website', 'personal-website']
    };

    // Fill text inputs
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach(input => {
      const name = (input.name || input.id || '').toLowerCase();
      const placeholder = (input.placeholder || '').toLowerCase();

      // Try to match field
      for (const [key, patterns] of Object.entries(fieldMappings)) {
        if (patterns.some(pattern => name.includes(pattern) || placeholder.includes(pattern))) {
          let value = '';
          switch (key) {
            case 'firstName':
              value = profile.fullName?.split(' ')[0] || '';
              break;
            case 'lastName':
              value = profile.fullName?.split(' ').slice(1).join(' ') || '';
              break;
            case 'fullName':
              value = profile.fullName || '';
              break;
            case 'phone':
              value = profile.phone || '';
              break;
            case 'location':
              value = profile.location || '';
              break;
            case 'linkedin':
              value = profile.linkedinUrl || '';
              break;
            case 'portfolio':
              value = profile.portfolioUrl || '';
              break;
          }
          if (value) {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }
    });

    // Fill textareas (for summary/cover letter sections)
    document.querySelectorAll('textarea').forEach(textarea => {
      const name = (textarea.name || textarea.id || '').toLowerCase();
      if (name.includes('summary') || name.includes('about') || name.includes('bio')) {
        if (profile.summary) {
          textarea.value = profile.summary;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });

    console.log('Form fields filled with profile data');
  }

  async function analyzePage(token, apiUrl) {
    try {
      // Extract job description from page
      const jobDescription = extractJobDescription();
      
      if (!jobDescription) {
        return { success: false, error: 'No job description found on page' };
      }

      // Send to backend for parsing
      const response = await fetch(`${apiUrl}/api/jobs/parse`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobDescription: jobDescription,
          jobUrl: window.location.href
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze job');
      }

      const result = await response.json();
      console.log('Job Analysis Result:', result);

      return { success: true, result: result };
    } catch (error) {
      console.error('Error analyzing page:', error);
      return { success: false, error: error.message };
    }
  }

  function extractJobDescription() {
    // Try to find job description in common selectors
    const selectors = [
      '[data-job-description]',
      '.job-description',
      '.job-description-text',
      '#job-description',
      '[class*="description"]',
      '[id*="description"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim().length > 100) {
        return element.textContent.trim();
      }
    }

    // Fallback: try to find main content
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
    if (mainContent) {
      return mainContent.textContent.trim();
    }

    return document.body.textContent.trim();
  }
})();

