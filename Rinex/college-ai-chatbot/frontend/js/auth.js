/**
 * auth.js — Login & Registration Logic
 * ======================================
 * Handles form submission for:
 *   - login.html  (student login)
 *   - register.html (student registration)
 *   - admin-login.html (admin login)
 */

// ----------------------------------------------------------------
// STUDENT / ADMIN LOGIN
// ----------------------------------------------------------------

/**
 * initLoginPage()
 * ----------------
 * Sets up the login form on login.html and admin-login.html.
 * Sends POST /api/login to the Java backend.
 */
function initLoginPage() {
  const form    = document.getElementById('login-form');
  const alertEl = document.getElementById('login-alert');
  const btnEl   = document.getElementById('login-btn');

  if (!form) return; // Not on the login page

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page reload

    const email    = form.email.value.trim();
    const password = form.password.value;
    const isAdmin  = form.dataset.admin === 'true'; // Flag for admin login page

    // Basic client-side validation
    if (!email || !password) {
      showAlert(alertEl, 'Please enter your email and password.', 'error');
      return;
    }

    // Show loading state
    setButtonLoading(btnEl, true, 'Logging in...');
    hideAlert(alertEl);

    // ----- Try Backend API first -----
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    let loginSuccess = false;
    let userData = null;

    // Try the Java API
    const result = await apiFetch('/login', { method: 'POST', body: formData });

    if (result && result.success) {
      // --- API login succeeded ---
      if (isAdmin && result.role !== 'admin') {
        showAlert(alertEl, 'This account does not have admin privileges.', 'error');
        setButtonLoading(btnEl, false, isAdmin ? 'Admin Login' : 'Login');
        return;
      }
      userData = { name: result.name, email: result.email, role: result.role };
      loginSuccess = true;

    } else if (result && !result.success) {
      // API responded but credentials wrong
      showAlert(alertEl, result.message || 'Invalid email or password.', 'error');
      setButtonLoading(btnEl, false, isAdmin ? 'Admin Login' : 'Login');
      return;

    } else {
      // --- API unavailable — use built-in demo credentials ---
      userData = tryDemoLogin(email, password, isAdmin);
      if (userData) {
        loginSuccess = true;
      }
    }

    setButtonLoading(btnEl, false, isAdmin ? 'Admin Login' : 'Login');

    if (loginSuccess) {
      // Save user session
      setUser(userData);
      showToast(`Welcome back, ${userData.name}! 👋`, 'success');

      // Redirect based on role
      setTimeout(() => {
        if (userData.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'chatbot.html';
        }
      }, 500);
    } else {
      showAlert(alertEl, 'Invalid email or password. Please try again.', 'error');
    }
  });
}

/**
 * tryDemoLogin — Offline fallback using hard-coded demo credentials.
 * This lets the project work even without a running Java backend.
 */
function tryDemoLogin(email, password, isAdmin) {
  // Demo credentials (matches database sample data)
  const demoUsers = [
    { email: 'admin@sit.edu',  password: 'admin123',   name: 'Admin',       role: 'admin'   },
    { email: 'rahul@sit.edu',  password: 'student123', name: 'Rahul Sharma', role: 'student' },
    { email: 'priya@sit.edu',  password: 'student123', name: 'Priya Menon',  role: 'student' },
    { email: 'arjun@sit.edu',  password: 'student123', name: 'Arjun Patel',  role: 'student' },
  ];

  const user = demoUsers.find(u =>
    u.email === email.toLowerCase() && u.password === password
  );

  if (!user) return null;
  if (isAdmin && user.role !== 'admin') return null;
  return { name: user.name, email: user.email, role: user.role };
}

// ----------------------------------------------------------------
// STUDENT REGISTRATION
// ----------------------------------------------------------------

/**
 * initRegisterPage()
 * -------------------
 * Sets up the registration form on register.html.
 * Sends POST /api/register to the Java backend.
 */
function initRegisterPage() {
  const form    = document.getElementById('register-form');
  const alertEl = document.getElementById('register-alert');
  const btnEl   = document.getElementById('register-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name     = form.fullname.value.trim();
    const email    = form.email.value.trim();
    const password = form.password.value;
    const confirm  = form.confirm_password.value;

    // Validation
    if (!name || !email || !password || !confirm) {
      showAlert(alertEl, 'All fields are required.', 'error');
      return;
    }

    if (password.length < 6) {
      showAlert(alertEl, 'Password must be at least 6 characters long.', 'error');
      return;
    }

    if (password !== confirm) {
      showAlert(alertEl, 'Passwords do not match.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showAlert(alertEl, 'Please enter a valid email address.', 'error');
      return;
    }

    setButtonLoading(btnEl, true, 'Creating account...');
    hideAlert(alertEl);

    // Call the API
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);

    const result = await apiFetch('/register', { method: 'POST', body: formData });

    setButtonLoading(btnEl, false, 'Create Account');

    if (result && result.success) {
      showAlert(alertEl, 'Account created successfully! Redirecting to login...', 'success');
      showToast('Registration successful! 🎉', 'success');
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);

    } else if (result && !result.success) {
      showAlert(alertEl, result.message || 'Registration failed.', 'error');

    } else {
      // Backend unavailable
      showAlert(alertEl,
        'Backend is not running. Please start the Java server. ' +
        'For demo purposes, use the existing student credentials.',
        'info'
      );
    }
  });
}

// ----------------------------------------------------------------
// SHARED HELPERS
// ----------------------------------------------------------------

/** Shows an alert box with a message */
function showAlert(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert-${type} show`;
}

/** Hides the alert box */
function hideAlert(el) {
  if (!el) return;
  el.classList.remove('show');
}

/** Sets a button to a loading/disabled state */
function setButtonLoading(btn, loading, text) {
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span class="spinner"></span> ${text}`
    : text;
}

/** Simple email format validation */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ----------------------------------------------------------------
// AUTO-INIT
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initLoginPage();
  initRegisterPage();

  // If already logged in and on an auth page, redirect away
  const authPages = ['login.html', 'register.html', 'admin-login.html'];
  const currentPage = window.location.pathname.split('/').pop();
  if (authPages.includes(currentPage) && getUser()) {
    const user = getUser();
    window.location.href = user.role === 'admin' ? 'admin.html' : 'chatbot.html';
  }
});
