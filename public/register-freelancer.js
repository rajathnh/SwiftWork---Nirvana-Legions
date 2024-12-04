const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent default form submission

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const skills = document.getElementById('skills').value; // Capture skills
  const bio = document.getElementById('bio').value; // Capture bio
  const portfolio = document.getElementById('portfolio').value; // Capture portfolio URL
  const profilePic = document.getElementById('profilePic').files[0]; // Get the profile picture
  const image1 = document.getElementById('image1').files[0]; // Get showcase image 1
  const image2 = document.getElementById('image2').files[0]; // Get showcase image 2
  const image3 = document.getElementById('image3').files[0]; // Get showcase image 3
  const image4 = document.getElementById('image4').files[0]; // Get showcase image 4

  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', password);
  formData.append('skills', skills);
  formData.append('bio', bio);
  formData.append('portfolio', portfolio);

  if (profilePic) {
    formData.append('profilePic', profilePic); // Append profilePic to FormData
  }
  if (image1) {
    formData.append('image1', image1); // Append image1
  }
  if (image2) {
    formData.append('image2', image2); // Append image2
  }
  if (image3) {
    formData.append('image3', image3); // Append image3
  }
  if (image4) {
    formData.append('image4', image4); // Append image4
  }

  try {
    // Send the FormData to the server for Freelancer registration
    const response = await fetch('http://localhost:5000/api/v1/auth/register/freelancer', {
      method: 'POST',
      body: formData, // Send FormData instead of JSON
    });

    const data = await response.json();
    console.log("♨️♨️ Response Data:", data);

    if (response.ok) {
      // Store the freelancer ID in localStorage for future access
      const userId = data.newFreelancer.id;
      localStorage.setItem('swiftWork_ID', userId);

      alert(data.msg); // Show the success message

      // Redirect to freelancer-dashboard.html or any other page after successful signup
      window.location.href = 'freelancer-profile.html';
    } else {
      alert(data.msg); // Handle errors from the server
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
});
