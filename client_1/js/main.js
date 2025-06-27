// client/js/main.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorMsg = document.getElementById('error');

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'home.html'; // Redirect after login
    } else {
      errorMsg.textContent = data.message || 'Login failed';
    }
  } catch (err) {
    errorMsg.textContent = 'Network error';
  }
});
