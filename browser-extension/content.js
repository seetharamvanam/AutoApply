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
    } else if (request.action === 'autoApply') {
      // Backward-compatible: treat as supervised auto-apply
      autoApplySupervised(request.token, request.apiUrl, request.userId, request.userEmail).then(result => {
        sendResponse(result);
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
    } else if (request.action === 'autoApplySupervised') {
      autoApplySupervised(request.token, request.apiUrl, request.userId, request.userEmail, request.mockProfile).then(result => {
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

  /**
   * Supervised auto-apply (no paid AI):
   * - Detect fields via heuristics
   * - Fill what we can
   * - Show a review overlay for human verification
   * - Then (only after confirmation) click Next/Submit
   */
  async function autoApplySupervised(token, apiUrl, userId, userEmail, mockProfile) {
    try {
      console.log('[AutoApply] Starting supervised auto-apply...');

      let profile = null;

      // Demo / test path: allow passing a mock profile (no backend needed)
      if (!userId && mockProfile) {
        profile = mockProfile;
      } else {
        // Normal path: fetch profile from backend
        const profileResponse = await fetch(`${apiUrl}/api/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile');
        }

        profile = await profileResponse.json();
      }

      // Detect and fill via heuristics
      clearAutoApplyHighlights();
      const fillResult = fillByHeuristics(profile, { email: userEmail });
      const candidates = findNextOrSubmitCandidates();

      showSupervisedOverlay({
        filled: fillResult.filled,
        skipped: fillResult.skipped,
        requiredUnfilled: fillResult.requiredUnfilled,
        candidates
      });

      return {
        success: true,
        mode: 'supervised',
        summary: {
          filledCount: fillResult.filled.length,
          requiredUnfilledCount: fillResult.requiredUnfilled.length,
          nextSubmitCandidates: candidates.length
        },
        message: 'Filled fields and opened review overlay. Please verify and click Proceed to continue.'
      };
    } catch (error) {
      console.error('[AutoApply] Error during supervised auto-apply:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Extracts page structure for analysis
   */
  function extractPageStructure() {
    return {
      title: document.title,
      url: window.location.href,
      forms: Array.from(document.querySelectorAll('form')).map(form => ({
        id: form.id,
        action: form.action,
        method: form.method
      }))
    };
  }

  /**
   * Detects form fields on the page
   */
  function detectFormFields() {
    const fields = [];
    
    // Detect input fields
    document.querySelectorAll('input, textarea, select').forEach(element => {
      const field = {
        id: element.id || null,
        name: element.name || null,
        type: element.type || element.tagName.toLowerCase(),
        tag: element.tagName.toLowerCase(),
        label: getFieldLabel(element),
        placeholder: element.placeholder || null,
        value: element.value || null,
        required: element.hasAttribute('required'),
        selector: generateSelector(element),
        attributes: {}
      };
      
      // Extract relevant attributes
      Array.from(element.attributes).forEach(attr => {
        if (['id', 'name', 'type', 'class', 'placeholder', 'aria-label'].includes(attr.name)) {
          field.attributes[attr.name] = attr.value;
        }
      });
      
      fields.push(field);
    });
    
    return fields;
  }

  /**
   * Gets the label for a form field
   */
  function getFieldLabel(element) {
    // Try to find associated label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent.trim();
    }
    
    // Try to find parent label
    const parentLabel = element.closest('label');
    if (parentLabel) return parentLabel.textContent.trim();
    
    // Try aria-label
    if (element.getAttribute('aria-label')) {
      return element.getAttribute('aria-label');
    }
    
    return null;
  }

  /**
   * Generates a CSS selector for an element
   */
  function generateSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.name) return `[name="${element.name}"]`;
    
    // Generate path-based selector
    const path = [];
    let current = element;
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector += `#${current.id}`;
        path.unshift(selector);
        break;
      }
      if (current.className) {
        selector += `.${Array.from(current.classList).join('.')}`;
      }
      const index = Array.from(current.parentNode.children).indexOf(current);
      selector += `:nth-child(${index + 1})`;
      path.unshift(selector);
      current = current.parentElement;
    }
    
    return path.join(' > ');
  }

  /**
   * ===== Rules-based (no AI) supervised automation helpers =====
   */
  function buildProfileData(profile, overrides) {
    const fullName = profile.fullName || '';
    const parts = fullName.trim().split(/\s+/).filter(Boolean);

    // Note: email is on User entity, not Profile in current backend model. We still try a few common shapes.
    const email = (overrides && overrides.email) || profile.email || profile.userEmail || profile.username || '';

    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      fullName: fullName,
      email: email,
      phone: profile.phone || '',
      location: profile.location || '',
      linkedinUrl: profile.linkedinUrl || '',
      portfolioUrl: profile.portfolioUrl || '',
      summary: profile.summary || ''
    };
  }

  function normalizeText(s) {
    return (s || '')
      .toString()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getFieldContextText(el) {
    const label = getFieldLabel(el) || '';
    const placeholder = el.placeholder || '';
    const name = el.name || '';
    const id = el.id || '';
    const aria = el.getAttribute('aria-label') || '';
    const autocomplete = el.getAttribute('autocomplete') || '';
    return normalizeText([label, placeholder, name, id, aria, autocomplete].join(' '));
  }

  function inferProfileKeyForElement(el) {
    const type = (el.type || '').toLowerCase();
    const tag = (el.tagName || '').toLowerCase();
    const ctx = getFieldContextText(el);

    // Skip things we should not touch
    if (type === 'password' || type === 'hidden') return null;
    if (tag === 'input' && ['checkbox', 'radio', 'button', 'submit', 'reset', 'image'].includes(type)) return null;

    // Autocomplete is a strong signal
    const ac = normalizeText(el.getAttribute('autocomplete') || '');
    if (ac.includes('given-name')) return 'firstName';
    if (ac.includes('family-name')) return 'lastName';
    if (ac.includes('name')) return 'fullName';
    if (ac.includes('email')) return 'email';
    if (ac.includes('tel')) return 'phone';
    if (ac.includes('address') || ac.includes('country') || ac.includes('region') || ac.includes('locality')) return 'location';

    // Pattern scoring (simple + explainable)
    const match = (re) => re.test(ctx);

    if (match(/\b(first|given|fname|forename)\b/) && !match(/\blast\b/)) return 'firstName';
    if (match(/\b(last|family|lname|surname)\b/)) return 'lastName';
    if (match(/\b(full name|your name|applicant name)\b/) || (match(/\bname\b/) && !match(/\bcompany\b/))) return 'fullName';
    if (match(/\b(e-?mail|email address)\b/)) return 'email';
    if (match(/\b(phone|mobile|telephone|tel)\b/)) return 'phone';
    if (match(/\b(linkedin|linked-in)\b/)) return 'linkedinUrl';
    if (match(/\b(portfolio|website|personal site|github|gitlab)\b/)) return 'portfolioUrl';
    if (tag === 'textarea' && match(/\b(summary|about|bio|cover letter|why (us|you)|motivation)\b/)) return 'summary';
    if (match(/\b(city|location|address|where are you located)\b/)) return 'location';

    // File uploads are special (resume/cover letter) -> supervised only
    if (type === 'file' || match(/\b(resume|cv|cover letter)\b/)) return '__file_upload__';

    return null;
  }

  function isVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
  }

  function setFieldValue(el, value) {
    try {
      el.focus();
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (e) {
      // ignore
    }
  }

  function highlightField(el, kind) {
    if (!el) return;
    el.classList.add('__autoapply_highlight__');
    el.setAttribute('data-autoapply-highlight', kind || 'info');
  }

  function clearAutoApplyHighlights() {
    document.querySelectorAll('.__autoapply_highlight__').forEach(el => {
      el.classList.remove('__autoapply_highlight__');
      el.removeAttribute('data-autoapply-highlight');
    });
  }

  function fillByHeuristics(profile, overrides) {
    const profileData = buildProfileData(profile, overrides);
    const filled = [];
    const skipped = [];
    const requiredUnfilled = [];

    const fields = Array.from(document.querySelectorAll('input, textarea, select'))
      .filter(isVisible)
      .filter(el => !el.disabled && !el.readOnly);

    for (const el of fields) {
      const key = inferProfileKeyForElement(el);
      const label = getFieldLabel(el) || el.name || el.id || el.tagName.toLowerCase();
      const selector = generateSelector(el);
      const required = el.hasAttribute('required') || el.getAttribute('aria-required') === 'true';

      if (key === '__file_upload__') {
        // We do not auto-upload files. Flag it.
        highlightField(el, 'file');
        skipped.push({ selector, label: label, reason: 'File upload requires manual selection' });
        if (required) requiredUnfilled.push({ selector, label: label, reason: 'File upload required' });
        continue;
      }

      if (!key) {
        if (required && !el.value) {
          highlightField(el, 'required');
          requiredUnfilled.push({ selector, label: label, reason: 'Required field not recognized' });
        }
        continue;
      }

      const value = profileData[key] || '';
      if (!value) {
        if (required && !el.value) {
          highlightField(el, 'required');
          requiredUnfilled.push({ selector, label: label, reason: `Missing value for ${key}` });
        } else {
          skipped.push({ selector, label: label, reason: `No profile value for ${key}` });
        }
        continue;
      }

      // Don’t overwrite user-filled values unless empty
      if (el.value && el.value.toString().trim().length > 0) {
        skipped.push({ selector, label: label, reason: 'Already has a value' });
        continue;
      }

      setFieldValue(el, value);
      highlightField(el, 'filled');
      filled.push({ selector, label: label, profileKey: key });
    }

    // Small style injection for highlights
    ensureAutoApplyStyle();

    return { filled, skipped, requiredUnfilled };
  }

  function ensureAutoApplyStyle() {
    if (document.getElementById('__autoapply_style__')) return;
    const style = document.createElement('style');
    style.id = '__autoapply_style__';
    style.textContent = `
      .__autoapply_highlight__[data-autoapply-highlight="filled"] { outline: 2px solid #10b981 !important; outline-offset: 2px !important; }
      .__autoapply_highlight__[data-autoapply-highlight="required"] { outline: 2px solid #ef4444 !important; outline-offset: 2px !important; }
      .__autoapply_highlight__[data-autoapply-highlight="file"] { outline: 2px solid #f59e0b !important; outline-offset: 2px !important; }
      #__autoapply_overlay__ { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 2147483647; display: flex; align-items: center; justify-content: center; }
      #__autoapply_overlay__ .card { width: min(720px, calc(100vw - 24px)); max-height: min(80vh, 800px); overflow: auto; background: #ffffff; border-radius: 12px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.35); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      #__autoapply_overlay__ h3 { margin: 0 0 8px 0; font-size: 18px; color: #111827; }
      #__autoapply_overlay__ .meta { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
      #__autoapply_overlay__ .section { margin-top: 12px; }
      #__autoapply_overlay__ .section h4 { margin: 0 0 6px 0; font-size: 13px; color: #111827; }
      #__autoapply_overlay__ ul { margin: 0; padding-left: 18px; }
      #__autoapply_overlay__ li { margin: 4px 0; font-size: 13px; color: #374151; }
      #__autoapply_overlay__ .warning { color: #b45309; }
      #__autoapply_overlay__ .danger { color: #b91c1c; }
      #__autoapply_overlay__ .actions { display: flex; gap: 8px; margin-top: 14px; }
      #__autoapply_overlay__ button { cursor: pointer; border: 0; border-radius: 8px; padding: 10px 12px; font-weight: 600; }
      #__autoapply_overlay__ .btn-cancel { background: #e5e7eb; color: #111827; }
      #__autoapply_overlay__ .btn-proceed { background: #2563eb; color: white; }
      #__autoapply_overlay__ .btn-proceed:disabled { background: #9ca3af; cursor: not-allowed; }
      #__autoapply_overlay__ .btn-close { float: right; background: transparent; color: #6b7280; font-weight: 700; padding: 6px 8px; }
      #__autoapply_overlay__ .radio { display: flex; gap: 8px; align-items: center; margin: 6px 0; font-size: 13px; }
      #__autoapply_overlay__ .checkbox { display: flex; gap: 8px; align-items: flex-start; margin-top: 10px; font-size: 13px; color: #111827; }
      #__autoapply_overlay__ code { background: #f3f4f6; padding: 1px 6px; border-radius: 6px; }
    `;
    document.documentElement.appendChild(style);
  }

  function findNextOrSubmitCandidates() {
    const nodes = [];
    const selectors = [
      'button',
      'input[type="submit"]',
      '[role="button"]',
      'a[role="button"]'
    ];

    document.querySelectorAll(selectors.join(',')).forEach(el => {
      if (!isVisible(el) || el.disabled) return;
      const text = normalizeText(el.textContent || el.value || el.getAttribute('aria-label') || '');
      if (!text) return;

      // Exclude common negatives
      if (/(cancel|back|previous|close|discard)/.test(text)) return;

      const score = scoreActionButtonText(text);
      if (score <= 0) return;

      nodes.push({
        selector: generateSelector(el),
        text: text,
        score: score
      });
    });

    nodes.sort((a, b) => b.score - a.score);
    return nodes.slice(0, 6);
  }

  function scoreActionButtonText(text) {
    let score = 0;
    if (/(submit|apply|send application|finish)/.test(text)) score += 10;
    if (/(next|continue|review|proceed|save and continue)/.test(text)) score += 7;
    if (/(save)/.test(text)) score += 2;
    if (/(sign in|login)/.test(text)) score -= 5;
    return score;
  }

  function showSupervisedOverlay({ filled, skipped, requiredUnfilled, candidates }) {
    // Remove existing overlay
    const existing = document.getElementById('__autoapply_overlay__');
    if (existing) existing.remove();

    ensureAutoApplyStyle();

    const overlay = document.createElement('div');
    overlay.id = '__autoapply_overlay__';

    const card = document.createElement('div');
    card.className = 'card';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-close';
    closeBtn.textContent = '✕';
    closeBtn.onclick = () => overlay.remove();

    const title = document.createElement('h3');
    title.textContent = 'AutoApply — Review before Next/Submit';

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `Filled: ${filled.length} · Required missing: ${requiredUnfilled.length} · Next/Submit candidates: ${candidates.length}`;

    const sectionFilled = document.createElement('div');
    sectionFilled.className = 'section';
    sectionFilled.innerHTML = `<h4>Filled fields</h4>`;
    const ulFilled = document.createElement('ul');
    (filled.slice(0, 12)).forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.label}  →  ${item.profileKey}`;
      ulFilled.appendChild(li);
    });
    if (filled.length > 12) {
      const li = document.createElement('li');
      li.textContent = `...and ${filled.length - 12} more`;
      ulFilled.appendChild(li);
    }
    sectionFilled.appendChild(ulFilled);

    const sectionMissing = document.createElement('div');
    sectionMissing.className = 'section';
    sectionMissing.innerHTML = `<h4 class="danger">Required fields still missing</h4>`;
    const ulMissing = document.createElement('ul');
    if (requiredUnfilled.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'None detected.';
      ulMissing.appendChild(li);
    } else {
      requiredUnfilled.slice(0, 10).forEach(item => {
        const li = document.createElement('li');
        li.className = 'danger';
        li.textContent = `${item.label} — ${item.reason}`;
        ulMissing.appendChild(li);
      });
      if (requiredUnfilled.length > 10) {
        const li = document.createElement('li');
        li.className = 'danger';
        li.textContent = `...and ${requiredUnfilled.length - 10} more`;
        ulMissing.appendChild(li);
      }
    }
    sectionMissing.appendChild(ulMissing);

    const sectionButtons = document.createElement('div');
    sectionButtons.className = 'section';
    sectionButtons.innerHTML = `<h4>Choose Next/Submit button to click</h4>`;

    const buttonList = document.createElement('div');
    let selectedSelector = candidates[0]?.selector || null;

    if (candidates.length === 0) {
      const p = document.createElement('div');
      p.className = 'warning';
      p.textContent = 'No Next/Submit button found automatically. You can close this and click manually.';
      sectionButtons.appendChild(p);
    } else {
      candidates.forEach((c, idx) => {
        const row = document.createElement('label');
        row.className = 'radio';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = '__autoapply_btnpick__';
        radio.checked = idx === 0;
        radio.onchange = () => { selectedSelector = c.selector; };

        const text = document.createElement('span');
        text.innerHTML = `<strong>${escapeHtml(c.text)}</strong> <span class="meta">(${escapeHtml(c.selector)})</span>`;

        row.appendChild(radio);
        row.appendChild(text);
        buttonList.appendChild(row);
      });
      sectionButtons.appendChild(buttonList);
    }

    const verifyRow = document.createElement('label');
    verifyRow.className = 'checkbox';
    const verify = document.createElement('input');
    verify.type = 'checkbox';
    const verifyText = document.createElement('span');
    verifyText.innerHTML = `I reviewed the highlighted fields on the page and want AutoApply to click <code>Next/Submit</code>.`;
    verifyRow.appendChild(verify);
    verifyRow.appendChild(verifyText);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => overlay.remove();

    const proceedBtn = document.createElement('button');
    proceedBtn.className = 'btn-proceed';
    proceedBtn.textContent = 'Proceed (click Next/Submit)';
    proceedBtn.disabled = true;
    verify.onchange = () => { proceedBtn.disabled = !verify.checked; };

    proceedBtn.onclick = () => {
      try {
        // Re-check required fields at the moment of proceeding (prevents mistakes)
        const stillMissing = [];
        for (const item of (requiredUnfilled || [])) {
          const el = item.selector ? document.querySelector(item.selector) : null;
          if (!el) continue;

          const type = (el.type || '').toLowerCase();
          if (type === 'file') {
            if (!el.files || el.files.length === 0) {
              stillMissing.push(item.label || item.selector);
            }
          } else {
            const v = (el.value || '').toString().trim();
            if (!v) {
              stillMissing.push(item.label || item.selector);
            }
          }
        }

        if (stillMissing.length > 0) {
          alert('Please complete required fields before proceeding:\n- ' + stillMissing.slice(0, 8).join('\n- ') + (stillMissing.length > 8 ? '\n- ...' : ''));
          return;
        }

        if (!selectedSelector) {
          alert('No Next/Submit button selected.');
          return;
        }
        const el = document.querySelector(selectedSelector);
        if (!el) {
          alert('Selected button not found on the page anymore.');
          return;
        }
        overlay.remove();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => el.click(), 350);
      } catch (e) {
        console.error('[AutoApply] Proceed click failed', e);
      }
    };

    actions.appendChild(cancelBtn);
    actions.appendChild(proceedBtn);

    card.appendChild(closeBtn);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(sectionFilled);
    card.appendChild(sectionMissing);
    card.appendChild(sectionButtons);
    card.appendChild(verifyRow);
    card.appendChild(actions);

    overlay.appendChild(card);
    document.body.appendChild(overlay);
  }

  function escapeHtml(s) {
    return (s || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();

