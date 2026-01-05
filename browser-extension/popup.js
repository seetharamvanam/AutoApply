const API_BASE_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', async () => {
  const { token } = await getStoredAuth();
  
  if (token) {
    showMainSection();
  } else {
    showLoginSection();
  }

  document.getElementById('loginBtn').addEventListener('click', login);
  document.getElementById('toggleTokenMode').addEventListener('click', toggleTokenMode);
  document.getElementById('saveToken').addEventListener('click', saveToken);
  document.getElementById('fillForm').addEventListener('click', fillForm);
  document.getElementById('analyzePage').addEventListener('click', analyzePage);
  const autoApplyBtn = document.getElementById('autoApply');
  if (autoApplyBtn) {
    autoApplyBtn.addEventListener('click', autoApply);
  }
  const demoBtn = document.getElementById('demoAutoApply');
  if (demoBtn) {
    demoBtn.addEventListener('click', demoAutoApply);
  }
  document.getElementById('logoutBtn').addEventListener('click', logout);
  
  // Allow Enter key to submit login
  document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      login();
    }
  });
});

async function getStoredAuth() {
  const result = await chrome.storage.local.get(['authToken', 'authUserId', 'authEmail']);
  return {
    token: result.authToken || null,
    userId: result.authUserId || null,
    email: result.authEmail || null
  };
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    showStatus('Please enter email and password', 'error');
    return;
  }

  try {
    showStatus('Signing in...', 'info');
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Invalid email or password');
    }

    const data = await response.json();
    const token = data.token;
    
    if (token) {
      const userId = data.userId || getUserIdFromToken(token);
      const storedEmail = data.email || getEmailFromToken(token) || email;
      await chrome.storage.local.set({ authToken: token, authUserId: userId, authEmail: storedEmail });
      showMainSection();
      showStatus('Signed in successfully!', 'success');
      // Clear password field for security
      document.getElementById('password').value = '';
    } else {
      throw new Error('No token received from server');
    }
  } catch (error) {
    console.error('Login error:', error);
    showStatus(error.message || 'Login failed. Check if backend is running.', 'error');
  }
}

function toggleTokenMode() {
  const tokenSection = document.getElementById('tokenSection');
  const isHidden = tokenSection.classList.contains('hidden');
  tokenSection.classList.toggle('hidden');
  document.getElementById('toggleTokenMode').textContent = 
    isHidden ? 'Or use email/password' : 'Or use API token';
}

async function saveToken() {
  const token = document.getElementById('apiToken').value;
  if (!token) {
    showStatus('Please enter a token', 'error');
    return;
  }
  
  try {
    // Validate token by making a test request
    const response = await fetch(`${API_BASE_URL}/api/profile/1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Even if profile doesn't exist, 401 means invalid token, 404 means valid token but no profile
    if (response.status === 401) {
      throw new Error('Invalid token');
    }
    
    await chrome.storage.local.set({ 
      authToken: token, 
      authUserId: getUserIdFromToken(token),
      authEmail: getEmailFromToken(token)
    });
    showMainSection();
    showStatus('Token saved successfully', 'success');
    document.getElementById('apiToken').value = '';
  } catch (error) {
    showStatus(error.message || 'Invalid token', 'error');
  }
}

function showLoginSection() {
  document.getElementById('loginSection').classList.remove('hidden');
  document.getElementById('mainSection').classList.add('hidden');
}

function showMainSection() {
  document.getElementById('loginSection').classList.add('hidden');
  document.getElementById('mainSection').classList.remove('hidden');
}

function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.classList.remove('hidden');
  setTimeout(() => {
    statusDiv.classList.add('hidden');
  }, 3000);
}

async function fillForm() {
  const { token } = await getStoredAuth();
  if (!token) {
    showStatus('Please sign in first', 'error');
    showLoginSection();
    return;
  }

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, {
      action: 'fillForm',
      token: token,
      apiUrl: API_BASE_URL
    }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
      } else if (response && response.success) {
        showStatus('Form filled successfully!', 'success');
      } else {
        showStatus('Failed to fill form', 'error');
      }
    });
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  }
}

async function analyzePage() {
  const { token } = await getStoredAuth();
  if (!token) {
    showStatus('Please sign in first', 'error');
    showLoginSection();
    return;
  }

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, {
      action: 'analyzePage',
      token: token,
      apiUrl: API_BASE_URL
    }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
      } else if (response && response.success) {
        showStatus('Page analyzed! Check console for details.', 'success');
      } else {
        showStatus('Failed to analyze page', 'error');
      }
    });
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  }
}

async function autoApply() {
  const { token, userId: storedUserId, email: storedEmail } = await getStoredAuth();
  if (!token) {
    showStatus('Please sign in first', 'error');
    showLoginSection();
    return;
  }

  try {
    showStatus('Filling fields (supervised)...', 'info');
    
    // Get user ID from storage or token
    const userId = storedUserId || getUserIdFromToken(token);
    if (!userId) {
      throw new Error('Failed to get user ID from token');
    }
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, {
      action: 'autoApplySupervised',
      token: token,
      apiUrl: API_BASE_URL,
      userId: userId,
      userEmail: storedEmail || getEmailFromToken(token)
    }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
      } else if (response && response.success) {
        showStatus('Review overlay opened on the page. Verify fields, then click Proceed.', 'success');
      } else {
        showStatus(response?.error || 'Failed to auto-apply', 'error');
      }
    });
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  }
}

async function demoAutoApply() {
  try {
    showStatus('Running demo fill (no backend)...', 'info');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const mockProfile = {
      fullName: 'Jane Doe',
      phone: '+1 (555) 555-1234',
      location: 'San Francisco, CA',
      linkedinUrl: 'https://linkedin.com/in/janedoe',
      portfolioUrl: 'https://janedoe.dev',
      summary: 'Full-stack engineer with experience in React, Java, and system design.'
    };

    chrome.tabs.sendMessage(tab.id, {
      action: 'autoApplySupervised',
      token: null,
      apiUrl: API_BASE_URL,
      userId: null,
      userEmail: 'jane.doe@example.com',
      mockProfile
    }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
      } else if (response && response.success) {
        showStatus('Demo overlay opened on the page. Verify fields, then click Proceed.', 'success');
      } else {
        showStatus(response?.error || 'Demo auto-apply failed', 'error');
      }
    });
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  }
}

function getUserIdFromToken(token) {
  try {
    // Decode JWT token (simplified - in production use a proper JWT library)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.sub || payload.id;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

function getEmailFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.email || payload.sub || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

async function logout() {
  await chrome.storage.local.remove(['authToken', 'authUserId', 'authEmail']);
  showLoginSection();
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  showStatus('Signed out successfully', 'success');
}

