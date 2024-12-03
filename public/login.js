document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get form data
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    // Send data to backend API
    const response = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // Handle the response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Login failed');
    }

    const result = await response.json();
    console.log('Login successful:', result);

    // Redirect or show success message
    window.location.href = '/dashboard.html';
  } catch (error) {
    console.error('Error:', error.message);
    alert('Login failed: ' + error.message);
  }
});
