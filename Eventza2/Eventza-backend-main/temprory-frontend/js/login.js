document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('error');
  
    try {
      console.log('Attempting login...');
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      const data = await res.json();
      console.log('Login response:', data);
  
      if (!res.ok) throw new Error(data.message || 'Login failed');
      if (!data.token) throw new Error('No token received from server');
      if (!data.user) throw new Error('No user data received from server');
  
      // Store user data
      console.log('Storing user data...');
      localStorage.clear(); // Clear any old data first
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user._id);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', data.user.name);

      console.log('Stored user data:', {
        token: localStorage.getItem('token'),
        userId: localStorage.getItem('userId'),
        userRole: localStorage.getItem('userRole'),
        userName: localStorage.getItem('userName')
      });
      
      // If user is a club member, get their club data
      if (data.user.role === 'club') {
        console.log('User is a club member, fetching club data...');
        const clubRes = await fetch(`http://localhost:5000/api/clubmemberships/user/${data.user._id}`, {
          headers: {
            'Authorization': data.token,
            'Content-Type': 'application/json'
          }
        });
        
        const clubData = await clubRes.json();
        console.log('Club data response:', clubData);
        
        if (clubRes.ok && clubData && clubData.length > 0) {
          localStorage.setItem('clubId', clubData[0].club_id._id);
          localStorage.setItem('clubName', clubData[0].club_id.club_name);
          console.log('Stored club data:', {
            clubId: localStorage.getItem('clubId'),
            clubName: localStorage.getItem('clubName')
          });
        } else {
          throw new Error('Failed to fetch club data or no club memberships found');
        }
      }
  
      // Verify all required data is stored before redirecting
      const requiredData = data.user.role === 'club' 
        ? ['token', 'userId', 'userRole', 'clubId'] 
        : ['token', 'userId', 'userRole'];
      
      const missingData = requiredData.filter(key => !localStorage.getItem(key));
      if (missingData.length > 0) {
        throw new Error(`Missing required data: ${missingData.join(', ')}`);
      }

      console.log('All data stored successfully, redirecting...');
  
      // Redirect based on role
      if (data.user.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else if (data.user.role === 'faculty') {
        window.location.href = 'faculty-dashboard.html';
      } else if (data.user.role === 'club') {
        window.location.href = 'club-member-dashboard.html';
      } else {
        window.location.href = 'student-dashboard.html';
      }
      
    } catch (err) {
      console.error('Login error:', err);
      errorMsg.textContent = err.message;
      errorMsg.classList.remove('hidden');
    }
});
  
  