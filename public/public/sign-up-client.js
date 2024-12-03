const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); 

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const clientData = { name, email, password };

  try {
    // Send data to the correct route, 
    const response = await fetch('http://localhost:5000/api/v1/auth/register/client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });

    const data = await response.json(); 
    console.log("♨️♨️ Response Data:", data); 

    if (response.ok) {

      //storing the id in local storage for future access in differnt page or functions
      const userId = data.newClient.id; 
      localStorage.setItem('swiftWork_ID', userId);

      alert(data.msg); // Show the success message

      // Redirect to client-portfolio.html or any other page after successful signup
      window.location.href = 'client-portfolio.html';
    } else {
      alert(data.msg); // Handle errors from the server
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
});
