/**
 * BOB SafePay AI — Client-side Login & Authentication Handler
 * Handles input validation, password toggle, demo autofill, and session creation.
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const submitBtn = document.getElementById('submitBtn');
  const alertBox = document.getElementById('alertBox');
  const fillUserDemoBtn = document.getElementById('fillUserDemoBtn');
  const fillAdminDemoBtn = document.getElementById('fillAdminDemoBtn');

  // 1. Password Visibility Toggle (Show / Hide)
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
  });

  // 2. Demo Autofill Helpers (Hackathon Quick Access)
  fillUserDemoBtn.addEventListener('click', () => {
    emailInput.value = 'analyst@safepay.bob.in';
    passwordInput.value = 'SafePay2026!';
    showAlert('Analyst demo credentials loaded.', 'success');
  });

  fillAdminDemoBtn.addEventListener('click', () => {
    emailInput.value = 'admin@safepay.bob.in';
    passwordInput.value = 'AdminSecure#99';
    showAlert('Admin demo credentials loaded.', 'success');
  });

  // 3. Helper to Display Alert Messages
  function showAlert(message, type = 'error') {
    alertBox.textContent = message;
    alertBox.className = `alert-message alert-${type}`;
    alertBox.style.display = 'block';

    if (type === 'success') {
      setTimeout(() => {
        alertBox.style.display = 'none';
      }, 4000);
    }
  }

  // 4. Form Submission & Validation
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Client-side Validation Checks
    if (!email) {
      showAlert('Please enter your authorized email address.');
      emailInput.focus();
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showAlert('Please enter a valid email format (e.g. analyst@safepay.bob.in).');
      emailInput.focus();
      return;
    }

    if (!password) {
      showAlert('Please enter your security passcode.');
      passwordInput.focus();
      return;
    }

    if (password.length < 6) {
      showAlert('Passcode must be at least 6 characters long.');
      passwordInput.focus();
      return;
    }

    // Activate Loading State on the Button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳ Verifying Security Credentials...</span>';

    // Simulate Network Handshake (800ms) before redirecting
    setTimeout(() => {
      // Save session info to browser localStorage
      const userSession = {
        email: email,
        role: email.includes('admin') ? 'Administrator' : 'Security Analyst',
        loginTime: new Date().toLocaleTimeString(),
        deviceFingerprint: 'DEV_HW_' + Math.random().toString(36).substring(2, 8).toUpperCase()
      };
      localStorage.setItem('safepay_session', JSON.stringify(userSession));

      showAlert('✓ Session authenticated! Loading dashboard...', 'success');

      // Redirect to the Dashboard (Step 6) or Design System preview
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 900);

    }, 800);
  });
});