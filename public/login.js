const loginForm = document.querySelector('#login-form');
const API_BASE_URL =
  window.location.hostname === "localhost" // If on localhost
    ? "http://localhost:5000"
    : "https://swiftwork.onrender.com";
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent default form submission

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    if (email === 'admin@admin.com' && password === 'admin123123') {
      // Redirect to admin page if admin credentials are used
      window.location.href = 'admin.html';
      return;
    }

    // Send the login request to the server for normal users
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store the user ID and role in localStorage
      const userId = data.userId;
      const userType = data.userType;

      localStorage.setItem('swiftWork_ID', userId);
      localStorage.setItem('swiftWork_role', userType);

      // Redirect based on user type
      if (userType === 'freelancer') {
        window.location.href = 'freelancer-profile.html';
      } else if (userType === 'client') {
        window.location.href = 'client-portfolio.html';
      }
    } else {
      alert(data.message); // Show error message if login failed
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
});