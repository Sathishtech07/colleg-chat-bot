/**
 * app.js — Shared Utilities
 * ==========================
 * This file is included on every page.
 * It provides:
 *   1. API helper function (apiFetch)
 *   2. Session / auth management (login, logout, getUser)
 *   3. Navigation active link highlighting
 *   4. Mobile nav toggle
 *   5. Toast notification system
 */

// ----------------------------------------------------------------
// 1. CONFIGURATION
// ----------------------------------------------------------------

/**
 * Base URL for the Java backend API.
 * Change this if your Tomcat runs on a different port or path.
 */
const API_BASE = 'http://localhost:8080/college-chatbot/api';

// ----------------------------------------------------------------
// 2. API FETCH HELPER
// ----------------------------------------------------------------

/**
 * apiFetch — A simple wrapper around fetch() for API calls.
 *
 * @param {string} endpoint  - API path (e.g., '/departments')
 * @param {object} options   - Optional fetch options (method, body, etc.)
 * @returns {Promise<any>}   - Parsed JSON response
 *
 * Usage:
 *   const data = await apiFetch('/departments');
 *   const result = await apiFetch('/login', { method:'POST', body: formData });
 */
async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(API_BASE + endpoint, options);

    // If server returns non-OK status, throw an error
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    // Parse and return JSON
    return await response.json();

  } catch (err) {
    // Network error or server is down
    console.warn('[apiFetch] API call failed:', err.message);
    return null; // Return null so callers can handle gracefully
  }
}

// ----------------------------------------------------------------
// 3. SESSION / AUTH MANAGEMENT
// ----------------------------------------------------------------

/**
 * Session keys stored in sessionStorage (cleared when browser tab closes).
 * In a production app, use HTTP-only cookies with server sessions.
 */
const SESSION_KEY = 'sit_user';

/**
 * Saves the logged-in user info to sessionStorage.
 * @param {object} user  - { name, email, role }
 */
function setUser(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

/**
 * Returns the currently logged-in user object, or null if not logged in.
 * @returns {object|null}
 */
function getUser() {
  const data = sessionStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Logs the user out by clearing session storage.
 * Optionally redirects to the home page.
 */
function logout(redirect = true) {
  sessionStorage.removeItem(SESSION_KEY);
  if (redirect) {
    window.location.href = 'index.html';
  }
}

/**
 * Auth guard: Call this at the top of protected pages.
 * Redirects to login if the user is not authenticated.
 * @param {string} [requiredRole] - Optional: 'student' or 'admin'
 */
function requireAuth(requiredRole = null) {
  const user = getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  if (requiredRole && user.role !== requiredRole) {
    showToast('Access denied. Insufficient permissions.', 'error');
    window.location.href = 'index.html';
  }
}

// ----------------------------------------------------------------
// 4. NAVIGATION — Active Link & User State
// ----------------------------------------------------------------

/**
 * updateNavState()
 * ----------------
 * Called on every page load.
 * - Highlights the active nav link based on current page filename.
 * - Shows/hides Login button vs user name based on session.
 */
function updateNavState() {
  // Highlight active link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Update auth area in nav if elements exist
  const navAuth = document.getElementById('nav-auth');
  if (navAuth) {
    const user = getUser();
    if (user) {
      navAuth.innerHTML = `
        <span class="nav-link" style="color: var(--gold); gap: 6px;">
          👤 ${escapeHtml(user.name)}
        </span>
        <a href="#" onclick="logout()" class="nav-link btn-nav">Logout</a>
      `;
    } else {
      navAuth.innerHTML = `
        <a href="login.html" class="nav-link">Login</a>
        <a href="register.html" class="nav-link btn-nav">Register</a>
      `;
    }
  }
}

// ----------------------------------------------------------------
// 5. MOBILE NAV TOGGLE
// ----------------------------------------------------------------

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    // Animate hamburger to X
    toggle.classList.toggle('active');
  });

  // Close mobile nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ----------------------------------------------------------------
// 6. TOAST NOTIFICATION SYSTEM
// ----------------------------------------------------------------

/**
 * showToast — Displays a brief popup notification.
 *
 * @param {string} message  - Message to display
 * @param {string} type     - 'success' | 'error' | 'info' | 'warning'
 * @param {number} duration - How long to show it in ms (default 3000)
 *
 * Usage:
 *   showToast('Logged in successfully!', 'success');
 *   showToast('Invalid credentials.', 'error');
 */
function showToast(message, type = 'info', duration = 3500) {
  // Create toast container if it doesn't exist
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      display: flex; flex-direction: column; gap: 10px;
    `;
    document.body.appendChild(container);
  }

  // Icon for each type
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const colors = {
    success: '#22c55e',
    error:   '#ef4444',
    info:    '#3b82f6',
    warning: '#f59e0b'
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: white;
    border-left: 4px solid ${colors[type] || colors.info};
    border-radius: 8px;
    padding: 12px 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    display: flex; align-items: center; gap: 10px;
    font-family: 'Inter', sans-serif; font-size: 0.875rem;
    color: #1e2746; min-width: 240px; max-width: 380px;
    animation: slideInRight 0.3s ease;
    cursor: pointer;
  `;

  toast.innerHTML = `
    <span style="font-size: 1.1rem;">${icons[type] || '💬'}</span>
    <span style="flex:1;">${escapeHtml(message)}</span>
    <span style="color: #9aa3b8; font-size: 1rem;">✕</span>
  `;

  // Click to dismiss
  toast.addEventListener('click', () => removeToast(toast));
  container.appendChild(toast);

  // Auto-dismiss after duration
  setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(100%)';
  toast.style.transition = '0.3s ease';
  setTimeout(() => toast.remove(), 300);
}

// ----------------------------------------------------------------
// 7. UTILITY HELPERS
// ----------------------------------------------------------------

/**
 * escapeHtml — Prevents XSS by escaping HTML special characters.
 * Always use this when inserting user-provided text into the DOM.
 *
 * @param {string} text
 * @returns {string} - Safe HTML string
 */
function escapeHtml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * formatDate — Formats an ISO date string into a readable format.
 * @param {string} dateStr - e.g. '2026-10-15'
 * @returns {string}       - e.g. '15 Oct 2026'
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * getMonthName — Returns short month name from a date string.
 * @param {string} dateStr
 * @returns {string} - e.g. 'OCT'
 */
function getMonthName(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
}

/**
 * getDayNumber — Returns day of month from a date string.
 * @param {string} dateStr
 * @returns {string} - e.g. '15'
 */
function getDayNumber(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').getDate().toString();
}

// ----------------------------------------------------------------
// 8. AUTO-INIT ON DOM READY
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  updateNavState();
  initMobileNav();
});

// Add toast animation style to page
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: none; opacity: 1; }
  }
`;
document.head.appendChild(style);
