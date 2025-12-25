const API_BASE_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', async () => {
  const token = await getStoredToken();
  
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
  document.getElementById('logoutBtn').addEventListener('click', logout);
  
  // Allow Enter key to submit login
  document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      login();
    }
  });
});

async function getStoredToken() {
  const result = await chrome.storage.local.get(['authToken']);
  return result.authToken;
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
      await chrome.storage.local.set({ authToken: token });
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
    
    await chrome.storage.local.set({ authToken: token });
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
  const token = await getStoredToken();
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
  const token = await getStoredToken();
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

async function logout() {
  await chrome.storage.local.remove(['authToken']);
  showLoginSection();
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  showStatus('Signed out successfully', 'success');
}

