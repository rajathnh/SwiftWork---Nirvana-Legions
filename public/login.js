const loginForm = document.querySelector('#login-form');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent default form submission

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    // Send the login request to the server
    const response = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store the user ID in localStorage
      const userId = data.userId;
      localStorage.setItem('swiftWork_ID', userId);

      // Store the userType to handle redirection
      const userType = data.userType;

      // Redirect based on user type
      if (userType === 'freelancer') {
        window.location.href = 'freelancer-profile.html'; // Redirect to freelancer profile page
      } else if (userType === 'client') {
        window.location.href = 'client-portfolio.html'; // Redirect to client portfolio page
      }
    } else {
      alert(data.message); // Show error message if login failed
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
});
