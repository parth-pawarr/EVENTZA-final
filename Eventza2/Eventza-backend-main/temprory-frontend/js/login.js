document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('error');
  
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.message || 'Login failed');
  
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
  
      // Redirect based on role
      if (data.role === 'admin') window.location.href = '/admin-dashboard.html';
      else if (data.role === 'faculty') window.location.href = '/faculty-dashboard.html';
      else window.location.href = '/student-dashboard.html';
      
    } catch (err) {
      errorMsg.textContent = err.message;
      errorMsg.classList.remove('hidden');
    }
  });

  if (res.ok && data.user && data.token) {
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token); // Save the raw token
    window.location.href = 'student-dashboard.html'; // or based on role
  }
  
  