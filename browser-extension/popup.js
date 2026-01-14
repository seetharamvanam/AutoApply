const API_BASE_URL = 'http://localhost:8080/api';

// DOM elements
const loginContainer = document.getElementById('login-container');
const mainContainer = document.getElementById('main-container');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const jobsList = document.getElementById('jobs-list');
const loginError = document.getElementById('login-error');

// Check authentication on load
document.addEventListener('DOMContentLoaded', async () => {
    const token = await getToken();
    if (token) {
        showMainContainer();
        loadJobs();
    } else {
        showLoginContainer();
    }
});

// Login form handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        await saveToken(data.accessToken);
        showMainContainer();
        loadJobs();
    } catch (error) {
        loginError.textContent = error.message;
    }
});

// Logout handler
logoutBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove('token');
    showLoginContainer();
    loginForm.reset();
});

// Load jobs
async function loadJobs() {
    const token = await getToken();
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/jobs`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to load jobs');
        }

        const jobs = await response.json();
        displayJobs(jobs);
    } catch (error) {
        jobsList.innerHTML = `<div class="error">Failed to load jobs: ${error.message}</div>`;
    }
}

// Display jobs
function displayJobs(jobs) {
    if (jobs.length === 0) {
        jobsList.innerHTML = '<div>No job applications yet.</div>';
        return;
    }

    jobsList.innerHTML = jobs.map(job => `
        <div class="job-item">
            <div class="job-title">${job.title}</div>
            <div class="job-company">${job.company}</div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">${job.status}</div>
        </div>
    `).join('');
}

// Show/hide containers
function showLoginContainer() {
    loginContainer.classList.add('active');
    mainContainer.classList.remove('active');
}

function showMainContainer() {
    loginContainer.classList.remove('active');
    mainContainer.classList.add('active');
}

// Token management
async function getToken() {
    const result = await chrome.storage.local.get('token');
    return result.token;
}

async function saveToken(token) {
    await chrome.storage.local.set({ token });
}
