const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); 

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const profilePic = document.getElementById('profilePic').files[0]; // Get the file from the input field

  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', password);
  if (profilePic) {
    formData.append('profilePic', profilePic); // Append profilePic to FormData
  }

  try {
    // Send the FormData to the server, which will automatically handle the file upload
    const response = await fetch('http://localhost:5000/api/v1/auth/register/client', {
      method: 'POST',
      body: formData, // Send FormData instead of JSON
    });

    const data = await response.json(); 
    console.log("♨️♨️ Response Data:", data); 

    if (response.ok) {
      // Store the client ID in localStorage for future access
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
